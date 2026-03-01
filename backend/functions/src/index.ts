
import {setGlobalOptions} from "firebase-functions";

// Import all functions
export {validateElderlyKey} from "./auth/validateElderlyKey";

setGlobalOptions({maxInstances: 10});