import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyAHpPMzuEcW68z85AfH9hesTc1u9T2kmCQ", // from google-services.json :contentReference[oaicite:0]{index=0}
  authDomain: "abclasses-7e82d.firebaseapp.com",
  projectId: "abclasses-7e82d",
  storageBucket: "abclasses-7e82d.firebasestorage.app", // provided in your config file
  messagingSenderId: "849564886558",
  appId: "1:849564886558:android:f9ff11c1d94e61d264b00f"
};

const app = initializeApp(firebaseConfig);

const persistence = Platform.OS === 'web'
  ? browserLocalPersistence
  : getReactNativePersistence(AsyncStorage);

const auth = initializeAuth(app, { persistence });

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
