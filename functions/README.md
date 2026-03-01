# Remind Me – Cloud Functions (Member 6: Ray)

Scheduled reminders, FCM push notifications, and Twilio escalation.

## Functions

| Function | Trigger | Purpose |
|----------|---------|---------|
| `sendScheduledReminders` | Every 1 minute | Sends reminders when `schedule.time` matches current time |
| `checkEscalations` | Every 1 minute | Escalates unacknowledged reminders (SMS + FCM) |
| `registerFCMToken` | HTTPS callable | Registers FCM token for caregiver or elderly |

## Setup

### 1. Install dependencies

```bash
cd functions
npm install
```

### 2. Twilio (for escalation SMS)

```bash
firebase functions:config:set twilio.account_sid="YOUR_SID"
firebase functions:config:set twilio.auth_token="YOUR_TOKEN"
firebase functions:config:set twilio.phone_number="+1234567890"
```

### 3. Firestore index

Create a composite index for `sendScheduledReminders`:

- **Collection**: `reminders`
- **Fields**: `status` (Ascending), `schedule.time` (Ascending)

Or use the Firebase Console → Firestore → Indexes → Add composite index.

### 4. Deploy

```bash
# From project root
firebase deploy --only functions
```

Or deploy specific functions:

```bash
firebase deploy --only functions:sendScheduledReminders,functions:checkEscalations,functions:registerFCMToken
```

## AMD Cloud

AMD Cloud integration is a placeholder (currently shut down). See `src/amd/README.md`.
