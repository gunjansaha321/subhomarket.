// Firebase configuration
const firebaseConfig = {
    apiKey: "আপনার_API_KEY",
    authDomain: "subho-market.firebaseapp.com",
    projectId: "subho-market",
    storageBucket: "subho-market.appspot.com",
    messagingSenderId: "আপনার_SENDER_ID",
    appId: "আপনার_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage(); 