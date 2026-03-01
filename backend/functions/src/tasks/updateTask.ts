// Update existing task
// Endpoint: updateTask

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Request payload for updating a task
interface UpdateTaskRequest {
  elderlyId: string;
  taskId: string;
  title?: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  status?: "pending" | "completed" | "overdue";
}

// Cloud Function: Updates task properties (caregiver-only)
export const updateTask = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<UpdateTaskRequest>) => {
    // Verify caregiver authentication
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {
      elderlyId,
      taskId,
      title,
      description,
      priority,
      dueDate,
      status,
    } = request.data;
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

      // Build update object with only provided fields (sparse update)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) {
        updateData.status = status;
        // When marking complete, set completedAt timestamp
        if (status === "completed") {
          updateData.completedAt = admin.firestore
            .FieldValue.serverTimestamp();
        }
      }
      if (dueDate !== undefined) {
        updateData.dueDate = dueDate ? new Date(dueDate) : null;
      }

      // Atomically apply updates
      await admin.firestore()
        .collection("elderly")
        .doc(elderlyId)
        .collection("tasks")
        .doc(taskId)
        .update(updateData);

      return {
        success: true,
        message: "Task updated successfully",
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to update task");
    }
  }
);
