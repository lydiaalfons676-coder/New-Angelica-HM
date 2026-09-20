import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB_znwz4xxYzk65zYxlOnaL4zRQKIlip8M",
    authDomain: "angelica-handmade.firebaseapp.com",
    projectId: "angelica-handmade",
    storageBucket: "angelica-handmade.firebasestorage.app",
    messagingSenderId: "144102986676",
    appId: "1:144102986676:web:30b52e8d34c8ad1bc6d8e1",
    measurementId: "G-0TJ3CTWKRM"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
