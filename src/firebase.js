// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // 인증(로그인)을 위해 추가
import { getFirestore } from "firebase/firestore"; // 데이터베이스(일기 저장)를 위해 추가

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC-ZrxB1smVlPAw2JecBH4pM4jJKcDDmNU",
  authDomain: "todaydiary-1f572.firebaseapp.com",
  projectId: "todaydiary-1f572",
  storageBucket: "todaydiary-1f572.firebasestorage.app",
  messagingSenderId: "594088675698",
  appId: "1:594088675698:web:52f420d2a094f51404f5eb",
  measurementId: "G-084NQFKMP5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // 인증 객체 생성
const db = getFirestore(app); // DB 객체 생성

export { app, analytics, auth, db };
