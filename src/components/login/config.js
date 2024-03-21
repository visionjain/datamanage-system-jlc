// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDPv6IfqizznvW4DGLrKqWkgZs5EMMsrrY",
  authDomain: "jailime-18b0d.firebaseapp.com",
  projectId: "jailime-18b0d",
  storageBucket: "jailime-18b0d.appspot.com",
  messagingSenderId: "467841153499",
  appId: "1:467841153499:web:cfc6acd544bcc171fd0ffe",
  measurementId: "G-TLT69QSEGY"
};




const app = initializeApp(firebaseConfig);
export {app};