// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWcPAPa34-YCGaUBtsmoINUXwPbXA3Kbc",
  authDomain: "presenca-app-bda9a.firebaseapp.com",
  projectId: "presenca-app-bda9a",
  storageBucket: "presenca-app-bda9a.firebasestorage.app",
  messagingSenderId: "687961372381",
  appId: "1:687961372381:web:b4bc6dc7a6977eabd10d34",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
