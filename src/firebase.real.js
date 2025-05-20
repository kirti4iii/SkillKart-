// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCTnxk7k8yBBDuHpQaHt_jZOjVnioZhCdI",
  authDomain: "skillkart-74898.firebaseapp.com",
  projectId: "skillkart-74898",
  storageBucket: "skillkart-74898.firebasestorage.app",
  messagingSenderId: "786952258619",
  appId: "1:786952258619:web:13d3e82528bf524c5dc81e",
  measurementId: "G-0PKQLC4VM9"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;