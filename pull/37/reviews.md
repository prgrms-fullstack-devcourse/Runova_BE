AuthService & Token Rotation Review:

**Security & Token Rotation:**
- Token rotation is correctly implemented with refresh token hashing and reuse detection.
- If a refresh token is reused, all sessions are revoked (tokenVersion increment). This is a strong security practice.

**Potential Race Condition:**
- Possible race condition exists if multiple refresh requests for the same user/session arrive at once:
  - Both requests verify the same valid token and hash, issue new tokens, and update the hash in DB. Only the last write persists, making the earlier token invalid.
- **Inline Fix Suggestion:**
  - Use optimistic locking (add a version field to the user/session and check before saving), or DB row locking (`SELECT ... FOR UPDATE`) in transaction. This ensures only one token rotation succeeds at a time.

**Naming Consistency:**
- `TokenPair` vs `AuthTokens` – unify across codebase.
- `tokens` vs `tokensService` – recommend `tokenService` for clarity.
- `replaceRefresh` could be renamed to `updateRefreshToken`.
- `clearRefresh` could be renamed to `invalidateRefreshToken`.

**Unit Test Suggestions:**
- Add tests for `loginWithGoogle` and `rotateRefreshToken`, including error cases and concurrent refresh attempts.

**Overall:**
- Good improvements to security and maintainability. Addressing the race condition will further harden refresh token rotation.