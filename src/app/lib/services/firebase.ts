// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported as analyticsSupported } from "firebase/analytics";
import { getMessaging, isSupported as messagingSupported } from "firebase/messaging";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "cheerchampion-de837.firebaseapp.com",
  projectId: "cheerchampion-de837",
  storageBucket: "cheerchampion-de837.firebasestorage.app",
  messagingSenderId: "1092820170244",
  appId: "1:1092820170244:web:db49a8cdd752d484546751",
  measurementId: "G-5B55B25ZN0"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// Guard against SSR
let analytics:any = null;
let messaging:any = null;
if (typeof window !== "undefined") {
  analyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp);
    }
  });

  messagingSupported().then((supported) => {
    console.log(supported,"supported")
    if (supported) {
      messaging = getMessaging(firebaseApp);
      console.log(messaging,"messaging")
    }
  });
}

export { firebaseApp, analytics,messaging };
