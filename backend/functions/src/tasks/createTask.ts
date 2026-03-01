// Create task for elderly profile
// Endpoint: createTask

import {onCall, HttpsError, CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp();
}

// Request payload for creating a task
interface CreateTaskRequest {
  elderlyId: string;
  title: string;
  textContent?: string;
  description?: string;
  dueDate?: string; // ISO 8601 format
  priority: "low" | "medium" | "high";
  category: "medication" | "appointment" | "daily_task" | "other";
  medicationId?: string;
  mediaUrl?: string; // Video/audio URL
  mediaType?: "video" | "audio" | "text";
  responseTimeLimit?: number; // Hours until escalation
  schedule?: {
    type: "once" | "daily" | "weekly" | "monthly";
    time?: string;
    daysOfWeek?: number[];
  };
  translatedText?: string;
}

/**
 * Cloud Function: Creates task for elderly profile (caregiver-only)
 * Task creation workflow:
 * 1. Verify caregiver authentication
 * 2. Validate all input fields
 * 3. Verify caregiver owns the elderly profile
 * 4. Create task document in elderly/{id}/tasks subcollection
 * 5. Return taskId for confirmation
 * Elderly app listens to elderly/{id}/tasks collection and updates in real-time
 */
export const createTask = onCall(
  {region: "us-west1"},
  async (request: CallableRequest<CreateTaskRequest>) => {
    // Verify caregiver is authenticated
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }

    const {
      elderlyId,
      title,
      textContent = "",
      description = "",
      dueDate,
      priority,
      category,
      medicationId,
      mediaUrl,
      mediaType = "text",
      responseTimeLimit = 24,
      schedule,
      translatedText,
    } = request.data;

    const caregiverId = request.auth.uid;

    // Validate required fields
    if (!elderlyId || !title) {
      throw new HttpsError(
        "invalid-argument",
        "elderlyId and title are required"
      );
    }

    // Validate priority enum
    if (!["low", "medium", "high"].includes(priority)) {
      throw new HttpsError("invalid-argument", "Invalid priority");
    }

    // Validate category enum
    const validCategories = [
      "medication",
      "appointment",
      "daily_task",
      "other",
    ];
    if (!validCategories.includes(category)) {
      throw new HttpsError("invalid-argument", "Invalid category");
    }

    try {
      // Verify caregiver owns this elderly profile (authorization check)
      const elderlyDoc = await admin.firestore()
        .collection("elderly")
        .doc(elderlyId)
        .get();

      if (!elderlyDoc.exists) {
        throw new HttpsError("not-found", "Elderly profile not found");
      }

      if (elderlyDoc.data()?.caregiverId !== caregiverId) {
        throw new HttpsError(
          "permission-denied",
          "Not your elderly profile"
        );
      }
      // Create task document in elderly's tasks subcollection
      // Status defaults to 'pending'; elderly app updates via listeners
      const taskRef = await admin.firestore()
        .collection("elderly")
        .doc(elderlyId)
        .collection("tasks")
        .add({
          elderId: elderlyId,
          title,
          textContent: textContent || description,
          description,
          priority,
          category,
          mediaUrl: mediaUrl || null,
          mediaType,
          medicationId: medicationId || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          status: "pending", // Task initial state
          completedAt: null,
          acknowledgedAt: null,
          escalatedAt: null,
          caregiverId,
          responseTimeLimit,
          schedule: schedule || null,
          translatedText: translatedText || null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        taskId: taskRef.id,
        message: "Task created successfully",
      };
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Failed to create task");
    }
  }
);
