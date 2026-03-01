/**
 * scheduler.js — checks Firestore every minute for reminders whose scheduled
 * time has arrived and flips their status from 'scheduled' → 'sent'.
 *
 * Uses the Firebase client SDK (no service-account key required).
 */
const cron = require('node-cron');
const { initializeApp, getApps } = require('firebase/app');
const {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} = require('firebase/firestore');

// ── Firebase config (same project as the front-end) ───────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyA5xUY1_IRkFfK9fIK7GdYa0YmGMgO_hQI',
  authDomain:        'echocare-h4h2026.firebaseapp.com',
  projectId:         'echocare-h4h2026',
  storageBucket:     'echocare-h4h2026.firebasestorage.app',
  messagingSenderId: '859616638064',
  appId:             '1:859616638064:web:9d00ee6c5e3674e03e30b5',
};

// Avoid re-initializing on hot reloads
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
const db = getFirestore(firebaseApp);

// ── Core delivery logic ────────────────────────────────────────────────────────
async function deliverDueReminders() {
  const now = new Date();

  try {
    // Fetch every reminder still waiting to be sent
    const snap = await getDocs(
      query(collection(db, 'reminders'), where('status', '==', 'scheduled'))
    );

    if (snap.empty) return;

    const updates = [];

    snap.forEach((docSnap) => {
      const data     = docSnap.data();
      const schedule = data.schedule;
      if (!schedule) return;

      let isDue = false;

      // 'once' schedule with an exact startDate timestamp
      if (schedule.startDate) {
        // Firestore Timestamps have .toDate(); plain objects/strings need Date()
        const fireAt = schedule.startDate.toDate
          ? schedule.startDate.toDate()
          : new Date(schedule.startDate.seconds
              ? schedule.startDate.seconds * 1000
              : schedule.startDate);
        isDue = fireAt <= now;
      }

      // Fallback: 'immediate' flag (shouldn't reach here, but just in case)
      if (schedule.sendNow || schedule.type === 'immediate') {
        isDue = true;
      }

      if (isDue) {
        updates.push({ id: docSnap.id, title: data.title });
      }
    });

    if (updates.length === 0) return;

    // Update all due reminders in parallel
    await Promise.all(
      updates.map(({ id }) =>
        updateDoc(doc(db, 'reminders', id), {
          status: 'sent',
          sentAt: now,
        })
      )
    );

    console.log(
      `[Scheduler ${now.toLocaleTimeString()}] 🔔 Delivered ${updates.length} reminder(s):`,
      updates.map((u) => `"${u.title}"`).join(', ')
    );
  } catch (err) {
    console.error('[Scheduler] ❌ Error checking reminders:', err.message);
  }
}

// ── Start the cron job ─────────────────────────────────────────────────────────
function startScheduler() {
  console.log('⏰  Reminder scheduler active — checking every minute');
  console.log('   (Scheduler requires Firestore rules to allow server reads/writes)');

  // Run at the top of every minute
  cron.schedule('* * * * *', deliverDueReminders);
}

module.exports = { startScheduler };
