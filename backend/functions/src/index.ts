/**
 * EchoCare Cloud Functions Entry Point
 *
 * This file exports all Cloud Functions for EchoCare elder care platform.
 * Functions are organized by domain:
 */


import {setGlobalOptions} from "firebase-functions";

// AUTHENTICATION FUNCTIONS

/** Register new caregiver (email/password) */
export {registerCaregiver} from "./auth/registerCaregiver";

/** Caregiver creates new elderly profile with auto-generated access key */
export {createElderlyProfile} from "./auth/createElderlyProfile";

/** Caregiver rotate/generate new access key for existing elderly profile */
export {generateElderlyAccessKey} from "./auth/generateElderlyAccessKey";

/** Elderly login via 6-character access key - returns custom Firebase token */
export {validateElderlyKey} from "./auth/validateElderlyKey";

// TASK/REMINDER MANAGEMENT FUNCTIONS

/** Caregiver creates task/reminder for elderly profile */
export {createTask} from "./tasks/createTask";

/** Elderly marks task complete - triggers FCM notification to caregiver */
export {completeTask} from "./tasks/completeTask";

/** Caregiver edits task details or status */
export {updateTask} from "./tasks/updateTask";

/** Caregiver removes task from elderly profile */
export {deleteTask} from "./tasks/deleteTask";

/** Cloud Scheduler: Check for overdue tasks & escalate via FCM/SMS (15 min) */
export {checkAndEscalateOverdue} from "./tasks/checkAndEscalateOverdue";

// NOTIFICATION FUNCTIONS

/** Register FCM token for caregiver or elderly device */
export {registerFCMToken} from "./notifications/registerFCMToken";

/** Set global options for all functions (max 10 concurrent instances) */
setGlobalOptions({maxInstances: 10});
