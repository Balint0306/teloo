# Security Specification - S24 Virtual OS & Flame Game

## Data Invariants
1. A user profile is private and can only be read or modified by the owner (uid matches the document ID).
2. The `email` and `uid` fields are immutable after creation.
3. Settings like `is18Verified` are stored within the user's settings object.
4. Timestamps (if added later) must be server-validated.

## The "Dirty Dozen" Payloads

1. **Payload 1: Identity Spoofing** - Attempting to create a user profile with a `uid` that doesn't match the auth UID.
2. **Payload 2: Unauthorized Read** - Authenticated user A trying to read user B's profile.
3. **Payload 3: Unauthorized Update** - Authenticated user A trying to modify user B's profile.
4. **Payload 4: Field Injection** - Trying to add a "isSystemAdmin" field to a profile.
5. **Payload 5: PII Leak** - Querying for all profiles with a specific email.
6. **Payload 6: Immutable Field Modification** - Attempting to change the `uid` of an existing profile.
7. **Payload 7: Large Payload Attack** - Sending an extremely large `displayName` string.
8. **Payload 8: Type Poisoning** - Sending a number instead of a string for `theme`.
9. **Payload 9: Enum Violation** - Sending "blue" as a theme.
10. **Payload 10: Orphaned Write** - (Not applicable here as we don't have subcollections yet, but if we did, trying to write to a subcollection without a parent).
11. **Payload 11: Dirty List Query** - Attempting a `list` query without a `where` clause that filters by `uid`.
12. **Payload 12: Invalid ID Ingress** - Using a document ID with special characters that aren't allowed.

## The Test Runner (firestore.rules.test.ts)

*Tests will verify PERMISSION_DENIED for above scenarios.*
