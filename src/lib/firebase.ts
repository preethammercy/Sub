import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, GoogleAuthProvider, User as FirebaseUser, getAuth, signInWithPopup, signOut } from 'firebase/auth';
import { Firestore, doc, getDocFromServer, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const resolvedConfig = {
  ...firebaseConfig,
  databaseURL: 'https://dhru-3d8e4-default-rtdb.firebaseio.com',
  measurementId: firebaseConfig.measurementId || 'G-7E6C5EL4QK',
};

let app: FirebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(resolvedConfig);
export let auth: Auth = getAuth(app);
export let firestoreDb: Firestore = getFirestore(app, resolvedConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

let configBootstrapPromise: Promise<void> | null = null;

export function ensureFirebaseInitializedFromApi(): Promise<void> {
  if (!configBootstrapPromise) {
    configBootstrapPromise = fetch('/api/config/firebase')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const remote = data?.firebase;
        if (remote && remote.apiKey && remote.projectId && remote.apiKey !== resolvedConfig.apiKey) {
          app = initializeApp(remote, `ottsub-${remote.projectId}`);
          auth = getAuth(app);
          firestoreDb = getFirestore(app, remote.firestoreDatabaseId || undefined);
        }
      })
      .catch(() => {
        // Keep bundled Firebase project configuration
      });
  }
  return configBootstrapPromise;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: Array<{ providerId?: string | null; email?: string | null }>;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<void> {
  try {
    await ensureFirebaseInitializedFromApi();
    await getDocFromServer(doc(firestoreDb, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

export async function syncFirebaseUserToFirestore(fbUser: FirebaseUser): Promise<void> {
  const uid = fbUser.uid;
  const profilePath = `users/${uid}`;
  const privatePath = `users/${uid}/private/info`;

  try {
    await setDoc(
      doc(firestoreDb, 'users', uid),
      {
        uid,
        displayName: (fbUser.displayName || fbUser.email?.split('@')[0] || 'ottsub User').slice(0, 120),
        ...(fbUser.photoURL ? { photoUrl: fbUser.photoURL.slice(0, 512) } : {}),
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    // Non-blocking if profile already exists with immutable createdAt
    if (error instanceof Error && !error.message.includes('PERMISSION_DENIED')) {
      handleFirestoreError(error, OperationType.WRITE, profilePath);
    }
  }

  if (fbUser.email) {
    try {
      await setDoc(
        doc(firestoreDb, 'users', uid, 'private', 'info'),
        {
          uid,
          email: fbUser.email.slice(0, 254),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      if (error instanceof Error && !error.message.includes('PERMISSION_DENIED')) {
        handleFirestoreError(error, OperationType.WRITE, privatePath);
      }
    }
  }
}

export async function signInWithGooglePopup() {
  await ensureFirebaseInitializedFromApi();
  const credential = await signInWithPopup(auth, googleProvider);
  const idToken = await credential.user.getIdToken();
  await syncFirebaseUserToFirestore(credential.user).catch(() => {});
  return { user: credential.user, idToken };
}

export async function signOutFirebase() {
  await signOut(auth).catch(() => {});
}
