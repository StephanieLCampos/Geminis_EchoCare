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
exports.registerFCMToken = exports.checkEscalations = exports.sendScheduledReminders = exports.validateElderlyKey = void 0;
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
var validateElderlyKey_1 = require("./auth/validateElderlyKey");
Object.defineProperty(exports, "validateElderlyKey", { enumerable: true, get: function () { return validateElderlyKey_1.validateElderlyKey; } });
var sendReminder_1 = require("./notifications/sendReminder");
Object.defineProperty(exports, "sendScheduledReminders", { enumerable: true, get: function () { return sendReminder_1.sendScheduledReminders; } });
var checkEscalations_1 = require("./notifications/checkEscalations");
Object.defineProperty(exports, "checkEscalations", { enumerable: true, get: function () { return checkEscalations_1.checkEscalations; } });
var registerToken_1 = require("./notifications/registerToken");
Object.defineProperty(exports, "registerFCMToken", { enumerable: true, get: function () { return registerToken_1.registerFCMToken; } });
//# sourceMappingURL=index.js.map