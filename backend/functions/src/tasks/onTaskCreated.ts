// Firestore trigger: Send notification when task is created
// Trigger path: elderly/{elderlyId}/tasks/{taskId}


import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Task data structure from Firestore
interface TaskData {
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  category: "medication" | "appointment" | "daily_task" | "other";
  caregiverId: string;
  mediaUrl?: string;
  mediaType?: "video" | "audio" | "text";
  status: string;
}

// Firestore Trigger: Send push notification when new task is created
export const onTaskCreated = onDocumentCreated(
  {
    document: "elderly/{elderlyId}/tasks/{taskId}",
    region: "us-west1",
  },
  async (event) => {
    const taskData = event.data?.data() as TaskData;
    const taskId = event.params.taskId;
    const elderlyId = event.params.elderlyId;

    if (!taskData) {
      logger.warn("No task data found in created document");
      return;
    }

    try {
      // Get elderly document to retrieve FCM token
      const elderlyDoc = await admin.firestore()
        .collection("elderly")
        .doc(elderlyId)
        .get();

      if (!elderlyDoc.exists) {
        logger.error(`Elderly profile not found: ${elderlyId}`);
        return;
      }

      const elderlyData = elderlyDoc.data();
      const fcmToken = elderlyData?.fcmToken;

      // Skip if no FCM token registered (elderly hasn't logged in yet)
      if (!fcmToken) {
        logger.warn(
          `No FCM token for elderly ${elderlyId}, notification skipped`
        );
        return;
      }

      // Get caregiver info for notification context
      const caregiverDoc = await admin.firestore()
        .collection("users")
        .doc(taskData.caregiverId)
        .get();

      const caregiverName = caregiverDoc.data()?.name || "Your caregiver";

      // Determine notification priority based on task priority
      const isUrgent = taskData.priority === "high";
      const soundName = isUrgent ? "urgent" : "default";

      // Construct notification message body
      const categoryText = taskData.category.replace("_", " ");
      const notificationBody =
        `${caregiverName} sent you a new ${categoryText} reminder`;

      // Build FCM message with platform-specific options
      const message: admin.messaging.Message = {
        token: fcmToken,
        notification: {
          title: taskData.title,
          body: notificationBody,
        },
        data: {
          taskId,
          elderlyId,
          type: "new_task",
          priority: taskData.priority,
          category: taskData.category,
          mediaType: taskData.mediaType || "text",
          mediaUrl: taskData.mediaUrl || "",
        },
        // Android-specific configuration
        android: {
          priority: isUrgent ? "high" : "normal",
          notification: {
            sound: soundName,
            channelId: isUrgent ? "urgent_tasks" : "tasks",
            clickAction: "FLUTTER_NOTIFICATION_CLICK",
            color: isUrgent ? "#C62828" : "#1565C0",
            tag: taskId,
          },
        },
        // iOS-specific configuration (APNs)
        apns: {
          payload: {
            aps: {
              sound: `${soundName}.wav`,
              badge: 1,
              contentAvailable: true,
              category: "TASK_NOTIFICATION",
            },
          },
        },
      };

      // Send the notification via FCM
      await admin.messaging().send(message);

      logger.info(
        `Notification sent to elderly ${elderlyId} for task ${taskId}`
      );

      // Update task with notification sent timestamp
      await admin.firestore()
        .collection("elderly")
        .doc(elderlyId)
        .collection("tasks")
        .doc(taskId)
        .update({
          notificationSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      // Log error but don't throw - notification failure shouldn't block task
      logger.error("Failed to send task notification:", error);
    }
  }
);
