// Check for overdue tasks and escalate via Cloud Scheduler
// Endpoint: checkAndEscalateOverdue (pubsub trigger)

import {onSchedule} from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Task data structure from Firestore
interface TaskData {
  status: string;
  dueDate: admin.firestore.Timestamp | Date | string;
  priority: "low" | "medium" | "high";
  title: string;
  caregiverId: string;
  completedAt?: admin.firestore.Timestamp | null;
}

// Elderly profile data structure
interface ElderlyData {
  name: string;
  caregiverId: string;
  fcmToken?: string;
}

// Task to escalate structure
interface TaskToEscalate {
  taskId: string;
  title: string;
  caregiverId: string;
}

// Cloud Function: Checks for overdue tasks and escalates notifications
export const checkAndEscalateOverdue = onSchedule(
  {
    schedule: "every 15 minutes",
    region: "us-west1",
    memory: "256MiB",
  },
  async () => {
    const now = new Date();
    const overdueCount = {total: 0, escalated: 0};

    try {
      // Get all elderly profiles
      const elderlySnapshot = await admin.firestore()
        .collection("elderly")
        .get();

      for (const elderlyDoc of elderlySnapshot.docs) {
        const elderlyId = elderlyDoc.id;
        const elderly = elderlyDoc.data() as ElderlyData;

        // Skip if elderly profile missing required fields
        if (!elderly.caregiverId || !elderly.name) {
          console.warn(`Elderly ${elderlyId} missing caregiverId or name`);
          continue;
        }

        // Get all pending tasks for this elderly
        const tasksSnapshot = await admin.firestore()
          .collection("elderly")
          .doc(elderlyId)
          .collection("tasks")
          .where("status", "==", "pending")
          .get();

        const overdueTaskIds: string[] = [];
        const tasksToEscalate: TaskToEscalate[] = [];

        // Check each task for overdue status
        for (const taskDoc of tasksSnapshot.docs) {
          const taskData = taskDoc.data() as TaskData;

          // Skip tasks without due dates
          if (!taskData.dueDate) {
            continue;
          }

          // Parse dueDate and check if overdue
          let dueDate: Date;
          if (taskData.dueDate instanceof admin.firestore.Timestamp) {
            dueDate = taskData.dueDate.toDate();
          } else if (taskData.dueDate instanceof Date) {
            dueDate = taskData.dueDate;
          } else {
            dueDate = new Date(taskData.dueDate);
          }

          if (dueDate < now && taskData.status === "pending") {
            overdueTaskIds.push(taskDoc.id);

            // Collect high-priority tasks for SMS escalation
            if (taskData.priority === "high") {
              tasksToEscalate.push({
                taskId: taskDoc.id,
                title: taskData.title,
                caregiverId: taskData.caregiverId,
              });
            }
          }
        }

        // Batch update overdue tasks (atomic)
        if (overdueTaskIds.length > 0) {
          const batch = admin.firestore().batch();

          for (const taskId of overdueTaskIds) {
            const taskRef = admin.firestore()
              .collection("elderly")
              .doc(elderlyId)
              .collection("tasks")
              .doc(taskId);

            batch.update(taskRef, {
              status: "overdue",
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }

          await batch.commit();
          overdueCount.total += overdueTaskIds.length;

          // Send FCM notification to caregiver
          const caregiver = await admin.firestore()
            .collection("users")
            .doc(elderly.caregiverId)
            .get();

          if (caregiver.data()?.fcmToken) {
            await admin.messaging().send({
              token: caregiver.data()?.fcmToken,
              notification: {
                title: "⚠️ Overdue Tasks",
                body:
                  `${elderly.name} has ${overdueTaskIds.length} overdue tasks`,
              },
              data: {
                type: "overdue_alert",
                count: String(overdueTaskIds.length),
                elderlyId,
              },
            });
          }

          // Escalate high-priority overdue tasks via SMS
          for (const task of tasksToEscalate) {
            await escalateOverdueTaskViaSMS(
              task.caregiverId,
              elderly.name,
              task.title
            );
            overdueCount.escalated++;
          }
        }
      }

      console.log(
        `Overdue check completed: ${overdueCount.total} overdue, ` +
        `${overdueCount.escalated} escalated to SMS`
      );
    } catch (error) {
      console.error("Error checking overdue tasks:", error);
    }
  }
);

/**
 * Helper function: Escalate overdue high-priority task via Twilio SMS
 *
 * Sends SMS alert to caregiver when high-priority task becomes overdue.
 * Requires Twilio credentials in environment variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER
 *
 * @param {string} caregiverId - Firestore UID of caregiver
 * @param {string} elderlyName - Name of elderly person
 * @param {string} taskTitle - Title of overdue task
 * @return {Promise<void>} Resolves when SMS sent or skipped
 */
async function escalateOverdueTaskViaSMS(
  caregiverId: string,
  elderlyName: string,
  taskTitle: string
): Promise<void> {
  try {
    // Get caregiver phone number from Firestore
    const caregiver = await admin.firestore()
      .collection("users")
      .doc(caregiverId)
      .get();

    const phone = caregiver.data()?.phone;
    if (!phone) {
      console.warn(`No phone number for caregiver ${caregiverId}`);
      return;
    }

    // Get Twilio credentials from environment
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error("Twilio credentials not configured");
      return;
    }

    // Initialize Twilio client
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const twilio = require("twilio");
    const client = twilio(accountSid, authToken);

    // Send SMS
    await client.messages.create({
      body: `ALERT: ${elderlyName} has not completed task: "${taskTitle}". ` +
        "Log in to EchoCare app for details.",
      from: fromNumber,
      to: phone,
    });

    console.log(`SMS sent to ${phone} for overdue task: ${taskTitle}`);
  } catch (error) {
    console.error(
      `Failed to send SMS escalation for ${taskTitle}:`,
      error
    );
    // Don't throw - SMS failure shouldn't block FCM notification
  }
}
