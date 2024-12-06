import { initializeApp,   } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth,
   createUserWithEmailAndPassword,
   signInWithEmailAndPassword ,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
  } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore ,doc, setDoc, collection, addDoc,
  updateDoc,deleteDoc
}  from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";


  const firebaseConfig = {
    apiKey: "AIzaSyAmkUVm234YbPLiioYt6vUKfwZ_MTIRR7U",
    authDomain: "post-app-edc9f.firebaseapp.com",
    projectId: "post-app-edc9f",
    storageBucket: "post-app-edc9f.firebasestorage.app",
    messagingSenderId: "423245629827",
    appId: "1:423245629827:web:99d6fae6fffa220a1e0eb6"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export{auth,createUserWithEmailAndPassword,
  signInWithEmailAndPassword, onAuthStateChanged,
  GoogleAuthProvider,signInWithPopup,provider,doc, setDoc, collection, addDoc,
  updateDoc,deleteDoc,db
}