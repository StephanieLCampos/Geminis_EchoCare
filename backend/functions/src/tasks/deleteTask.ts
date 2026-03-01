// Delete task
// Endpoint: deleteTask

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Request payload for deleting a task
interface DeleteTaskRequest {
  elderlyId: string;
  taskId: string;
}

/**
 * Cloud Function: Deletes task from elderly profile (caregiver-only)
 *
 * Delete workflow:
 * 1. Verify caregiver authentication
 * 2. Verify caregiver owns the elderly profile
 * 3. Delete task document from Firestore
 * 4. Elderly app receives real-time deletion via Firestore listener
 *
 */
export const deleteTask = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<DeleteTaskRequest>) => {
    // Verify caregiver authentication
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {elderlyId, taskId} = request.data;
    const caregiverId = request.auth.uid;

    try {
      // Verify caregiver owns this elderly profile
      const elderlyDoc = await admin.firestore()
        .collection("elderly")
        .doc(elderlyId)
        .get();

      if (elderlyDoc.data()?.caregiverId !== caregiverId) {
        throw new HttpsError(
          "permission-denied",
          "Not your elderly profile"
        );
      }

      // Delete task from elderly's subcollection
      await admin.firestore()
        .collection("elderly")
        .doc(elderlyId)
        .collection("tasks")
        .doc(taskId)
        .delete();

      return {
        success: true,
        message: "Task deleted successfully",
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to delete task");
    }
  }
);
