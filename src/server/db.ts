import { Redis } from '@upstash/redis';
import { resolveRedisConfigFromEnv } from '../lib/paymentLogic';
import { DbPersistenceMode, Order, Product, User, UserRole } from '../types';
import {
  StoredSession,
  StoredUser,
  createSeedOrders,
  createSeedProducts,
  createSeedUsers,
} from './seedData';

const CATALOG_VERSION = 4;
const DEPRECATED_LEGACY_IDS = new Set([
  'prod_vip_method_group',
  'prod_hotstar_4k',
  'prod_prime_all_benefits',
  'prod_aha_gold',
  'prod_apple_tv',
  'prod_f1tv_prem',
  'prod_sonyliv_prem',
  'prod_hungama_play',
  'prod_zee5_hd',
]);

// Dedicated Redis namespace prefix so shared Upstash KV instances stay isolated
const REDIS_KEYS = {
  catalogVersion: 'ottsub:meta:catalog_version',
  ordersSeeded: 'ottsub:meta:orders_seeded',
  productOrder: 'ottsub:meta:product_order',
  usersHash: 'ottsub:h:users',
  productsHash: 'ottsub:h:products',
  ordersHash: 'ottsub:h:orders',
  sessionPrefix: 'ottsub:sess:',
} as const;

let redisClient: Redis | null = null;
let initPromise: Promise<void> | null = null;

function getRedis(): Redis {
  if (!redisClient) {
    const creds = resolveRedisConfigFromEnv(process.env);
    if (!creds) {
      throw new Error(
        'Vercel Redis is required. Set KV_REST_API_URL + KV_REST_API_TOKEN (or KV_URL / REDIS_URL) in environment variables.'
      );
    }
    redisClient = new Redis({ url: creds.url, token: creds.token });
  }
  return redisClient;
}

function parseRedisValue<T>(raw: unknown): T | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }
  return raw as T;
}

function parseRedisHashMap<T>(rawMap: Record<string, unknown> | null | undefined): T[] {
  if (!rawMap) return [];
  const items: T[] = [];
  for (const val of Object.values(rawMap)) {
    const parsed = parseRedisValue<T>(val);
    if (parsed) items.push(parsed);
  }
  return items;
}

function mergeCatalogProducts(existingProducts: Product[]): Product[] {
  const seedProducts = createSeedProducts();
  const seedMap = new Map(seedProducts.map((p) => [p.id, p]));
  const seedSlugs = new Set(seedProducts.map((p) => p.slug));

  const merged: Product[] = [];
  for (const seedProd of seedProducts) {
    const existing = existingProducts.find((p) => p.id === seedProd.id);
    if (existing) {
      merged.push({
        ...seedProd,
        availableSlots: existing.availableSlots,
        active: existing.active,
      });
    } else {
      merged.push(seedProd);
    }
  }

  for (const custom of existingProducts) {
    if (
      !seedMap.has(custom.id) &&
      !seedSlugs.has(custom.slug) &&
      !DEPRECATED_LEGACY_IDS.has(custom.id) &&
      custom.name !== 'QA Test Custom Pass'
    ) {
      merged.unshift(custom);
    }
  }

  return merged;
}

async function initRedis(): Promise<void> {
  const redis = getRedis();

  const [userCount, remoteVersion, rawExistingProducts, ordersSeededFlag] = await Promise.all([
    redis.hlen(REDIS_KEYS.usersHash),
    redis.get<number | string>(REDIS_KEYS.catalogVersion),
    redis.hgetall<Record<string, unknown>>(REDIS_KEYS.productsHash),
    redis.get<string | number>(REDIS_KEYS.ordersSeeded),
  ]);

  if (userCount === 0) {
    const seedUsers = createSeedUsers();
    const userRecord: Record<string, string> = {};
    for (const u of seedUsers) {
      userRecord[u.id] = JSON.stringify(u);
    }
    await redis.hset(REDIS_KEYS.usersHash, userRecord);
  }

  const existingProducts = parseRedisHashMap<Product>(rawExistingProducts);
  if (Number(remoteVersion) !== CATALOG_VERSION || existingProducts.length === 0) {
    const mergedProducts =
      existingProducts.length > 0 ? mergeCatalogProducts(existingProducts) : createSeedProducts();

    const obsoleteIds = existingProducts
      .map((p) => p.id)
      .filter((id) => !mergedProducts.some((m) => m.id === id));

    if (obsoleteIds.length > 0) {
      await redis.hdel(REDIS_KEYS.productsHash, ...obsoleteIds);
    }

    const chunkSize = 35;
    for (let i = 0; i < mergedProducts.length; i += chunkSize) {
      const slice = mergedProducts.slice(i, i + chunkSize);
      const batch: Record<string, string> = {};
      for (const p of slice) {
        batch[p.id] = JSON.stringify(p);
      }
      await redis.hset(REDIS_KEYS.productsHash, batch);
    }

    await Promise.all([
      redis.set(REDIS_KEYS.productOrder, JSON.stringify(mergedProducts.map((p) => p.id))),
      redis.set(REDIS_KEYS.catalogVersion, CATALOG_VERSION),
    ]);
  }

  if (!ordersSeededFlag) {
    const orderCount = await redis.hlen(REDIS_KEYS.ordersHash);
    if (orderCount === 0) {
      const seedOrders = createSeedOrders();
      if (seedOrders.length > 0) {
        const ordRecord: Record<string, string> = {};
        for (const o of seedOrders) {
          ordRecord[o.id] = JSON.stringify(o);
        }
        await redis.hset(REDIS_KEYS.ordersHash, ordRecord);
      }
    }
    await redis.set(REDIS_KEYS.ordersSeeded, '1');
  }
}

export async function ensureDbReady(): Promise<void> {
  if (!initPromise) {
    initPromise = initRedis().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

export function getDbMode(): DbPersistenceMode {
  return 'vercel-redis';
}

export const db = {
  async expireStaleOrders(): Promise<void> {
    await ensureDbReady();
    const redis = getRedis();
    const rawOrders = await redis.hgetall<Record<string, unknown>>(REDIS_KEYS.ordersHash);
    const orders = parseRedisHashMap<Order>(rawOrders);
    const updates: Record<string, string> = {};
    let count = 0;
    for (const order of orders) {
      if (order.status === 'awaiting_payment' && Date.parse(order.expiresAt) <= Date.now()) {
        updates[order.id] = JSON.stringify({ ...order, status: 'expired' });
        count += 1;
      }
    }
    if (count > 0) {
      await redis.hset(REDIS_KEYS.ordersHash, updates);
    }
  },

  async findUserByEmail(email: string): Promise<StoredUser | null> {
    await ensureDbReady();
    const normalized = email.trim().toLowerCase();
    const rawUsers = await getRedis().hgetall<Record<string, unknown>>(REDIS_KEYS.usersHash);
    const users = parseRedisHashMap<StoredUser>(rawUsers);
    return users.find((u) => u.email.toLowerCase() === normalized) ?? null;
  },

  async findUserById(id: string): Promise<StoredUser | null> {
    await ensureDbReady();
    const raw = await getRedis().hget(REDIS_KEYS.usersHash, id);
    return parseRedisValue<StoredUser>(raw);
  },

  async createUser(user: StoredUser): Promise<User> {
    await ensureDbReady();
    const normalizedUser: StoredUser = { ...user, email: user.email.toLowerCase() };
    await getRedis().hset(REDIS_KEYS.usersHash, {
      [normalizedUser.id]: JSON.stringify(normalizedUser),
    });
    return {
      id: normalizedUser.id,
      name: normalizedUser.name,
      email: normalizedUser.email,
      role: normalizedUser.role,
      photoUrl: normalizedUser.photoUrl,
      createdAt: normalizedUser.createdAt,
    };
  },

  async updateUserRole(userId: string, role: UserRole): Promise<User | null> {
    await ensureDbReady();
    const existing = await this.findUserById(userId);
    if (!existing) return null;
    const nextUser: StoredUser = { ...existing, role };
    await getRedis().hset(REDIS_KEYS.usersHash, {
      [userId]: JSON.stringify(nextUser),
    });
    const { passwordHash: _ph, ...safe } = nextUser;
    return safe;
  },

  async createSession(session: StoredSession): Promise<void> {
    await ensureDbReady();
    const ttlSeconds = Math.max(60, Math.ceil((Date.parse(session.expiresAt) - Date.now()) / 1000));
    await getRedis().set(`${REDIS_KEYS.sessionPrefix}${session.token}`, session.userId, {
      ex: ttlSeconds,
    });
  },

  async getSessionUser(token: string): Promise<User | null> {
    await ensureDbReady();
    const userId = await getRedis().get<string>(`${REDIS_KEYS.sessionPrefix}${token}`);
    if (!userId) return null;
    const u = await this.findUserById(String(userId));
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      photoUrl: u.photoUrl,
      createdAt: u.createdAt,
    };
  },

  async deleteSession(token: string): Promise<void> {
    await ensureDbReady();
    await getRedis().del(`${REDIS_KEYS.sessionPrefix}${token}`);
  },

  async listProducts(includeInactive = false): Promise<Product[]> {
    await ensureDbReady();
    const redis = getRedis();
    const [rawProducts, rawOrder] = await Promise.all([
      redis.hgetall<Record<string, unknown>>(REDIS_KEYS.productsHash),
      redis.get<string | string[]>(REDIS_KEYS.productOrder),
    ]);
    const allProducts = parseRedisHashMap<Product>(rawProducts);
    const orderList = parseRedisValue<string[]>(rawOrder) || [];
    const orderIdx = new Map(orderList.map((id, idx) => [id, idx]));

    allProducts.sort((a, b) => {
      const idxA = orderIdx.has(a.id) ? orderIdx.get(a.id)! : Number.MAX_SAFE_INTEGER;
      const idxB = orderIdx.has(b.id) ? orderIdx.get(b.id)! : Number.MAX_SAFE_INTEGER;
      if (idxA !== idxB) return idxA - idxB;
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });

    return includeInactive ? allProducts : allProducts.filter((p) => p.active);
  },

  async getProductById(id: string): Promise<Product | null> {
    await ensureDbReady();
    const raw = await getRedis().hget(REDIS_KEYS.productsHash, id);
    return parseRedisValue<Product>(raw);
  },

  async createProduct(product: Product): Promise<Product> {
    await ensureDbReady();
    const redis = getRedis();
    await redis.hset(REDIS_KEYS.productsHash, { [product.id]: JSON.stringify(product) });
    const rawOrder = await redis.get<string | string[]>(REDIS_KEYS.productOrder);
    const currentOrder = parseRedisValue<string[]>(rawOrder) || [];
    const nextOrder = [product.id, ...currentOrder.filter((id) => id !== product.id)];
    await redis.set(REDIS_KEYS.productOrder, JSON.stringify(nextOrder));
    return product;
  },

  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
    await ensureDbReady();
    const existing = await this.getProductById(id);
    if (!existing) return null;
    const updated: Product = { ...existing, ...patch, id };
    await getRedis().hset(REDIS_KEYS.productsHash, { [id]: JSON.stringify(updated) });
    return updated;
  },

  async deleteProduct(id: string): Promise<boolean> {
    await ensureDbReady();
    const redis = getRedis();
    const deletedCount = await redis.hdel(REDIS_KEYS.productsHash, id);
    if (deletedCount <= 0) return false;
    const rawOrder = await redis.get<string | string[]>(REDIS_KEYS.productOrder);
    const currentOrder = parseRedisValue<string[]>(rawOrder);
    if (currentOrder) {
      await redis.set(REDIS_KEYS.productOrder, JSON.stringify(currentOrder.filter((pid) => pid !== id)));
    }
    return true;
  },

  async createOrder(order: Order): Promise<Order> {
    await ensureDbReady();
    await getRedis().hset(REDIS_KEYS.ordersHash, { [order.id]: JSON.stringify(order) });
    return order;
  },

  async getOrderById(id: string): Promise<Order | null> {
    await ensureDbReady();
    await this.expireStaleOrders();
    const raw = await getRedis().hget(REDIS_KEYS.ordersHash, id);
    return parseRedisValue<Order>(raw);
  },

  async listOrdersByUser(userId: string): Promise<Order[]> {
    await ensureDbReady();
    await this.expireStaleOrders();
    const rawOrders = await getRedis().hgetall<Record<string, unknown>>(REDIS_KEYS.ordersHash);
    return parseRedisHashMap<Order>(rawOrders)
      .filter((o) => o.userId === userId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async listAllOrders(): Promise<Order[]> {
    await ensureDbReady();
    await this.expireStaleOrders();
    const rawOrders = await getRedis().hgetall<Record<string, unknown>>(REDIS_KEYS.ordersHash);
    return parseRedisHashMap<Order>(rawOrders).sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
    );
  },

  async listAllUsers(): Promise<User[]> {
    await ensureDbReady();
    const rawUsers = await getRedis().hgetall<Record<string, unknown>>(REDIS_KEYS.usersHash);
    return parseRedisHashMap<StoredUser>(rawUsers)
      .map(({ passwordHash: _ph, ...u }) => u)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  },

  async updateOrder(id: string, patch: Partial<Order>): Promise<Order | null> {
    await ensureDbReady();
    const existing = await this.getOrderById(id);
    if (!existing) return null;
    const updated: Order = { ...existing, ...patch, id };
    await getRedis().hset(REDIS_KEYS.ordersHash, { [id]: JSON.stringify(updated) });
    return updated;
  },
};
