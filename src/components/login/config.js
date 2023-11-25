// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCaIjIA9mL2TabdM4_DesMA4JChxzmt63I",
  authDomain: "visionjain.firebaseapp.com",
  projectId: "visionjain",
  storageBucket: "visionjain.appspot.com",
  messagingSenderId: "220276851421",
  appId: "1:220276851421:web:410eb3e9a43737aa8fd134",
  measurementId: "G-R21WS3CJ8Q"
};



const app = initializeApp(firebaseConfig);
export {app};