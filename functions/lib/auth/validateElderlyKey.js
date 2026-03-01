"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateElderlyKey = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
/**
 * Validates an elderly person's 6-character access key and returns a custom
 * Firebase Auth token so they can sign in without email/password.
 *
 * Called by: src/services/authService.ts → loginElderly()
 */
exports.validateElderlyKey = functions.https.onCall(async (data) => {
    var _a, _b, _c, _d;
    const accessKey = ((_a = data === null || data === void 0 ? void 0 : data.accessKey) !== null && _a !== void 0 ? _a : '').toString().toUpperCase().trim();
    if (!accessKey || accessKey.length !== 6) {
        throw new functions.https.HttpsError('invalid-argument', 'Access key must be exactly 6 characters');
    }
    // Look up the elderly document by access key
    const snapshot = await admin.firestore()
        .collection('elderly')
        .where('accessKey', '==', accessKey)
        .where('isActive', '==', true)
        .limit(1)
        .get();
    if (snapshot.empty) {
        throw new functions.https.HttpsError('not-found', 'Invalid access key. Please check with your caregiver.');
    }
    const elderlyDoc = snapshot.docs[0];
    const elderly = elderlyDoc.data();
    const elderlyId = elderlyDoc.id;
    // Fetch caregiver's name for display
    let caregiverName = 'Your caregiver';
    try {
        const caregiverDoc = await admin.firestore()
            .collection('users')
            .doc(elderly.caregiverId)
            .get();
        caregiverName = (_c = (_b = caregiverDoc.data()) === null || _b === void 0 ? void 0 : _b.name) !== null && _c !== void 0 ? _c : caregiverName;
    }
    catch (_e) {
        // Non-critical — proceed without caregiver name
    }
    // Create a custom auth token for this elderly person.
    // UID is stable: "elderly-{elderlyId}" so they stay signed in.
    const uid = `elderly-${elderlyId}`;
    const customToken = await admin.auth().createCustomToken(uid, {
        role: 'elderly',
        elderlyId,
        caregiverId: elderly.caregiverId,
    });
    // Mark as active with last sign-in time
    await admin.firestore().collection('elderly').doc(elderlyId).update({
        lastActive: admin.firestore.FieldValue.serverTimestamp(),
    });
    functions.logger.info(`Elderly ${elderlyId} signed in via access key`);
    return {
        customToken,
        elderlyId,
        name: (_d = elderly.name) !== null && _d !== void 0 ? _d : 'Friend',
        caregiverName,
    };
});
//# sourceMappingURL=validateElderlyKey.js.map