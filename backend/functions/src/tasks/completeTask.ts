// Mark task as complete
// Endpoint: completeTask

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Request payload for completing a task
interface CompleteTaskRequest {
  elderlyId: string;
  taskId: string;
}

/**
 * Cloud Function: Marks task as complete (elderly-only)
 *
 * Task completion workflow:
 * 1. Verify elderly authentication and validate custom token claims
 * 2. Ensure elderly can only complete their own tasks
 * 3. Fetch task and verify it exists and is pending
 * 4. Atomically update task status to 'completed' with timestamp
 * 5. Retrieve caregiver info and send FCM notification
 * 6. Return success confirmation
 *
 * Real-time flow:
 * - Elderly app displays "I Did It" button
 * - Button calls completeTask() with taskId
 * - Task status updated in Firestore
 * - Caregiver app receives real-time update via listener
 * - Caregiver receives FCM notification (if FCM token available)
 * */
export const completeTask = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<CompleteTaskRequest>) => {
    // Verify elderly is authenticated with custom token (elderly claims)
    if (!request.auth?.uid || !request.auth.token.elderlyId) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {elderlyId, taskId} = request.data;
    const authenticatedElderlyId = request.auth.token.elderlyId;

    // Verify elderly can only complete their own tasks
    if (elderlyId !== authenticatedElderlyId) {
      throw new HttpsError(
        "permission-denied",
        "Cannot mark other elderly's tasks complete"
      );
    }

    try {
      // Get reference to task and fetch current state
      const taskRef = admin.firestore()
        .collection("elderly")
        .doc(elderlyId)
        .collection("tasks")
        .doc(taskId);

      const taskDoc = await taskRef.get();

      if (!taskDoc.exists) {
        throw new HttpsError("not-found", "Task not found");
      }

      const taskData = taskDoc.data();
      if (!taskData) {
        throw new HttpsError("internal", "Task data empty");
      }

      // Prevent duplicate completion (idempotent)
      if (taskData?.status === "completed") {
        throw new HttpsError(
          "failed-precondition",
          "Task already completed"
        );
      }

      // Atomically update task status with server timestamp
      await taskRef.update({
        status: "completed",
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Fetch elderly and caregiver info for notification
      const [elderlyDoc, caregiverDoc] = await Promise.all([
        admin.firestore().collection("elderly").doc(elderlyId).get(),
        admin.firestore()
          .collection("users")
          .doc(taskData.caregiverId)
          .get(),
      ]);

      const elderly = elderlyDoc.data();
      const caregiver = caregiverDoc.data();

      // Send FCM notification to caregiver if they have a token
      if (caregiver?.fcmToken) {
        await admin.messaging().send({
          token: caregiver.fcmToken,
          notification: {
            title: "Task Completed!",
            body: `${elderly?.name} completed "${taskData.title}"`,
          },
          data: {
            type: "task_completed",
            taskId,
            elderlyId,
          },
        });
      }

      return {
        success: true,
        message: "Task marked as completed",
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to complete task");
    }
  }
);
