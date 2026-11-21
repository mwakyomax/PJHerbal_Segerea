# Security Specification & Payload-First TDD — PJHerbal Clinic Segerea

## 1. Data Invariants

1. **Public Catalog Integrity**: `products`, `blogs`, `campaigns`, and `siteSettings` are publicly readable, but ONLY verified administrators (`eliezaeliezer1318@gmail.com` with `email_verified == true` or listed in `/admins/{uid}`) may create, update, or delete them.
2. **Master Gate on Reviews**: A review at `/products/{productId}/reviews/{reviewId}` CANNOT exist without a parent `/products/{productId}` document (`exists(...)`). Every review MUST have `userId == request.auth.uid`, a rating between 1 and 5, and `createdAt == request.time`.
3. **PII Isolation & Anti-Privilege-Escalation**: `/users/{userId}` contains sensitive PII (`email`, `phone`, `address`). Only the owner (`request.auth.uid == userId`) or `isAdmin()` may `get` it; only `isAdmin()` may `list` users. On `create`, `role` MUST be `'customer'` and `uid == request.auth.uid`. Customers cannot alter `uid`, `role`, or `createdAt` on `update`.
4. **Order Integrity & State Machine**:
   - Customers may ONLY create `/orders/{orderId}` with `userId == request.auth.uid`, `status == 'Pending'`, `paymentStatus == 'Pending'`, `createdAt == request.time`, and bounded `items` (`1..25`) and `trackingLogs` (`1..25`).
   - Customers may ONLY `get` or `list` their own orders (`resource.data.userId == request.auth.uid`).
   - Customers may ONLY transition a `'Pending'` order to `'Cancelled'` (touching only `status`, `trackingLogs`, `updatedAt`). Once an order reaches a non-Pending/terminal state, only `isAdmin()` can modify it.
5. **Admin-Only Sensitive Operations**: `/patientNotes/{noteId}`, `/campaignLogs/{logId}`, and `/admins/{adminId}` (read-only for owner/admin) are strictly isolated from non-admin users.
6. **Verified Submissions**: `/contactMessages` and `/newsletterSubscribers` require a verified user (`email_verified == true`) with `userId == request.auth.uid` and `createdAt == request.time` on creation; only `isAdmin()` can list or manage them.
7. **Strict Keys, IDs & Temporal Integrity**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (`size() <= 128`), every write validates `hasAll` + `hasOnly` (on create) and `affectedKeys().hasOnly(...)` (on update), every string has `.size()` bounds, and timestamps match `request.time`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Target Path | Attack Vector | Expected Result |
|---|-------------|---------------|-----------------|
| 1 | `/users/victimUid` | `create` with `{ uid: "victimUid", role: "admin", ... }` by `attackerUid` | `PERMISSION_DENIED` (Identity spoofing & role escalation) |
| 2 | `/users/attackerUid` | `update` adding `{ role: "admin" }` | `PERMISSION_DENIED` (`affectedKeys().hasOnly` blocks `role`) |
| 3 | `/users/victimUid` | `get` or `list` by another signed-in user | `PERMISSION_DENIED` (PII isolation) |
| 4 | `/orders/ord_hack1` | `create` with `status: "Paid"` and `paymentStatus: "Paid"` by customer | `PERMISSION_DENIED` (State shortcutting) |
| 5 | `/orders/ord_1` | `list` all orders without `where("userId", "==", uid)` filter | `PERMISSION_DENIED` (Query enforcer blocks scraping) |
| 6 | `/orders/ord_1` | `update` by customer changing `totalAmount: 1` or `paymentStatus: "Paid"` | `PERMISSION_DENIED` (Action-based update + validation gate) |
| 7 | `/orders/ord_delivered` | `update` by customer on a `Delivered` order | `PERMISSION_DENIED` (Terminal state locking) |
| 8 | `/products/prod_1` | `update` by customer injecting `price: 1` or `isVerified: true` | `PERMISSION_DENIED` (Admin-only write & ghost field rejection) |
| 9 | `/products/nonexistent/reviews/rev_1` | `create` review for non-existent product | `PERMISSION_DENIED` (Master Gate `exists()` fails) |
| 10 | `/products/prod_1/reviews/rev_1` | `create` review with `userId: "someone_else"` or `createdAt: oldDate` | `PERMISSION_DENIED` (Identity & temporal integrity) |
| 11 | `/products/huge_1500_char_id...` | `create` with 1.5KB document ID or 50KB description | `PERMISSION_DENIED` (`isValidId()` and `.size()` limits) |
| 12 | `/orders/ord_spoof` | `create` by user with `email: "eliezaeliezer1318@gmail.com"` and `email_verified: false` attempting admin write | `PERMISSION_DENIED` (`email_verified == true` gate) |

---

## 3. Verification Test Runner (`firestore.rules.test.ts` Blueprint)

```ts
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';

// Reference verification suite for Firebase Emulator
export async function runDirtyDozenTests() {
  const testEnv = await initializeTestEnvironment({
    projectId: 'centered-wavelet-whnbb',
    firestore: { rules: fs.readFileSync('firestore.rules', 'utf8') }
  });

  const alice = testEnv.authenticatedContext('alice', { email: 'alice@example.com', email_verified: true });
  const bob = testEnv.authenticatedContext('bob', { email: 'bob@example.com', email_verified: true });
  const spoofAdmin = testEnv.authenticatedContext('spoof', { email: 'eliezaeliezer1318@gmail.com', email_verified: false });
  const admin = testEnv.authenticatedContext('admin_uid', { email: 'eliezaeliezer1318@gmail.com', email_verified: true });

  // 1-3: User PII & Role Escalation
  await assertFails(setDoc(doc(alice.firestore(), 'users/bob'), { uid: 'bob', role: 'admin', name: 'X', email: 'a@b.com', phone: '', region: 'Dar es Salaam', district: '', address: '', wishlistIds: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() }));
  await assertFails(getDoc(doc(alice.firestore(), 'users/bob')));

  // 4-7: Order State Shortcutting & Scraping
  await assertFails(setDoc(doc(alice.firestore(), 'orders/ord_hack1'), { id: 'ord_hack1', userId: 'alice', status: 'Paid', paymentStatus: 'Paid', totalAmount: 100 }));
  await assertFails(getDocs(collection(alice.firestore(), 'orders')));
  await assertSucceeds(getDocs(query(collection(alice.firestore(), 'orders'), where('userId', '==', 'alice'))));

  // 8-12: Product Tampering, Orphan Reviews, Spoofed Admin
  await assertFails(updateDoc(doc(alice.firestore(), 'products/prod_1'), { price: 1 }));
  await assertFails(setDoc(doc(alice.firestore(), 'products/missing/reviews/rev_1'), { id: 'rev_1', productId: 'missing', userId: 'alice', author: 'Alice', rating: 5, date: '2026-11-21', comment: 'Good', verified: true, createdAt: serverTimestamp() }));
  await assertFails(setDoc(doc(spoofAdmin.firestore(), 'products/prod_spoof'), { id: 'prod_spoof', name: 'Spoof' }));
  await assertSucceeds(getDoc(doc(admin.firestore(), 'test/connection')));

  await testEnv.cleanup();
}
```
