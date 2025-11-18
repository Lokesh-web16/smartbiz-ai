import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCLXnWImogVZq1_NAXVA8kfH6tusik0Wm0",
  authDomain: "smartbiz-ai-dc56f.firebaseapp.com",
  projectId: "smartbiz-ai-dc56f",
  storageBucket: "smartbiz-ai-dc56f.firebasestorage.app",
  messagingSenderId: "474412973664",
  appId: "1:474412973664:web:8bd0b3e23aca7a7b6e4d05",
  measurementId: "G-T31R5801B6"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// SET SESSION PERSISTENCE (auto-logout on browser close)
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Session persistence enabled - will logout on browser close");
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });

export default app;