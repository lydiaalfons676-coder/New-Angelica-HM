// Firebase Configuration - Replace with your own Firebase project details
// Go to https://console.firebase.google.com/ → Create Project → Project Settings → Your Apps → Config

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase (ES Modules CDN)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Collection reference
const productsCollection = collection(db, 'products');

// Export for use in other modules
export { db, storage, productsCollection, addDoc, getDocs, query, orderBy, deleteDoc, doc, ref, uploadBytes, getDownloadURL, deleteObject };
