# SubSplit Firestore Security Specification

## 1. Data Invariants
1. Users can only read/write their own `/users/{userId}` and `/users/{userId}/private/info` documents and cannot escalate themselves to admin.
2. PII (`email`) is isolated in `/users/{userId}/private/info`, accessible only to the document owner (`request.auth.uid == userId`) or verified admin (`santoshmetihubli@gmail.com` or `/admins/{uid}`).
3. Orders in `/orders/{orderId}` must strictly bind `userId == request.auth.uid` on creation, start in `awaiting_payment`, and can only transition to `pending_approval` (with UTR) by the owner or `approved`/`rejected` (with 3 credentials) by an Admin.
4. Products in `/products/{productId}` are readable publicly for catalog display and writable only by verified admins.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated read on `/users/{uid}/private/info` -> DENIED
2. Authenticated non-owner reading another user's `/users/{otherUid}/private/info` -> DENIED
3. Unverified email (`email_verified == false`) attempting to spoof `santoshmetihubli@gmail.com` -> DENIED
4. User attempting to create `/admins/{uid}` -> DENIED
5. User creating `/orders/{id}` with `status: 'approved'` directly -> DENIED
6. User updating `/orders/{id}` to inject `credentials` without admin role -> DENIED
7. User creating `/orders/{id}` with `userId` belonging to another user -> DENIED
8. Oversized ID (>128 chars) or invalid characters in document ID -> DENIED
9. Shadow field injection (`isAdmin: true`) on `/users/{uid}` -> DENIED
10. Client-forged `createdAt` timestamp not equal to `request.time` -> DENIED
11. Unscoped `list` query on `/orders` without owner filter -> DENIED for non-admins
12. Non-admin creating or deleting `/products/{productId}` -> DENIED
