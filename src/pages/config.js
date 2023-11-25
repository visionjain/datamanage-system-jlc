// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDjngbwHsA33V1wcsWLTu1xcWOvxK-Sak0",
  authDomain: "jailime-rohit.firebaseapp.com",
  projectId: "jailime-rohit",
  storageBucket: "jailime-rohit.appspot.com",
  messagingSenderId: "351405839349",
  appId: "1:351405839349:web:d6e3df0ea15bbbfa8cc6bc",
  measurementId: "G-287XRW3X0L"
};


const app = initializeApp(firebaseConfig);
export {app};