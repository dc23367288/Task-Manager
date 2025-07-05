const firebaseConfig = { 
  apiKey: "YOUR_KEY", authDomain: "...", projectId: "..."
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
