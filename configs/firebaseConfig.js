import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA163yBQWyhQl1y9we8tU2kuzO1sZ9w9z8",
  authDomain: "abclasses-9b6ae.firebaseapp.com",
  projectId: "abclasses-9b6ae",
  storageBucket: "abclasses-9b6ae.appspot.com",
  messagingSenderId: "1022712909109",
  appId: "1:1022712909109:android:84ca04195b4d9573abd07c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export { app, auth, db, storage };
