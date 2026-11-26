# Security Specification & Hardened Rules Audit

## 1. Data Invariants
1. Public visitors can only read `projects` where `published == true`, `services` where `active == true`, `skills`, and `siteSettings`. Unpublished projects and inactive services are accessible exclusively to verified admins.
2. Public visitors can create `messages` with `read: false` and `createdAt == request.time`, but can NEVER list, get, update, or delete any document in `messages` (strict PII isolation).
3. `users/{userId}` documents contain PII (`email`) and RBAC (`role`); reads are restricted to `isOwner(userId) || isAdmin()`, and public users cannot register or self-assign `role: 'admin'`.
4. All admin checks require `request.auth != null && request.auth.token.email_verified == true` and either the bootstrapped verified admin email or presence in `/admins/{uid}`.
5. Every document ID path variable is validated with `isValidId(id)` (`^[a-zA-Z0-9_\-]+$`, max 128 chars).
6. Every write operation passes a standalone `isValid[Entity]` helper enforcing `hasAll`/`hasOnly` keys, exact field types, bounded string lengths, and bounded array lengths.
7. `createdAt` is immutable on update and equals `request.time` on create; `updatedAt` equals `request.time` on create and update.

## 2. The "Dirty Dozen" Attack Payloads
1. **Unauthenticated Project Create**: `{ title: "Hack", ... }` without auth -> `PERMISSION_DENIED`.
2. **Unverified Admin Email Spoof**: Auth token with `email: "tehminatanveer91@gmail.com"` and `email_verified: false` -> `PERMISSION_DENIED`.
3. **Public Privilege Escalation in `/users/{uid}`**: Signed-in non-admin writes `{ role: "admin" }` -> `PERMISSION_DENIED`.
4. **Shadow Field Injection on Project**: Admin/user sends `{ ...validProject, shadowFlag: true }` -> `PERMISSION_DENIED` (`hasOnly`).
5. **Unpublished Project Scraping**: Public visitor queries `projects` without `published == true` filter -> `PERMISSION_DENIED`.
6. **Public Message Read / PII Leak**: Unauthenticated or non-admin reads `/messages/{id}` or lists `/messages` -> `PERMISSION_DENIED`.
7. **Pre-Marked Read Message Spam**: Public visitor creates message with `{ ..., read: true }` -> `PERMISSION_DENIED`.
8. **Timestamp Tampering**: Message or project create with backdated `createdAt` (`!= request.time`) -> `PERMISSION_DENIED`.
9. **Resource Poisoning / Oversized String**: Project with 5,000-char title or 500-char ID -> `PERMISSION_DENIED`.
10. **Array Overflow**: Project with 20 technology items (`> 12`) or invalid first element type -> `PERMISSION_DENIED`.
11. **Immutable Field Tampering**: Updating `createdAt` or `uid` on an existing document -> `PERMISSION_DENIED`.
12. **User Profile PII Read by Non-Owner**: Signed-in non-admin reads `/users/otherUid` -> `PERMISSION_DENIED`.
