# AMD Cloud Integration (Member 6 - Ray)

**Status: Placeholder – AMD Cloud is currently shut down.**

When AMD Cloud becomes available, this folder will contain:

- Any compute-heavy tasks offloaded to AMD infrastructure
- Integration with AMD Developer Cloud for AI inference (if applicable)
- Configuration and deployment scripts for AMD resources

Until then, scheduled reminders and escalation run on Firebase Cloud Functions.

## Setup (when AMD Cloud is available)

1. Configure AMD Cloud credentials
2. Add `firebase functions:config:set amd.api_key="..."` (or equivalent)
3. Implement offload logic in a new `runOnAmdCloud` helper
4. Wire into `sendReminder.ts` or `checkEscalations.ts` if needed
