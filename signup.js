import {
    auth,createUserWithEmailAndPassword,
    signInWithEmailAndPassword, onAuthStateChanged,
    GoogleAuthProvider,signInWithPopup,provider,doc, setDoc, collection, addDoc,
    updateDoc,deleteDoc,db
} from "./firebase.js";

document.addEventListener("DOMContentLoaded", () => {
    ////////////////////////////------signup----------////////////////////
    let signup = () => {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;
        let name = document.getElementById("name").value; // Capture the name field

        if (!name.trim()) {
            console.log("Name is required");
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User created successfully", user);

                // Save the name to localStorage
                localStorage.setItem("userName", name);

                // Redirect to dashboard
                window.location.href = "/dashboard.html";
            })
            .catch((error) => {
                console.log(error.message);
            });
    };

    ////////////////////////////------login----------////////////////////
    let login = () => {
        let email = document.getElementById("email").value;
        let password = document.getElementById("password").value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log("User login successful", user);

                // Set the profile photo if available
                const profilePhotoUrl = user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"; // Default to a placeholder if no photoURL
                const profilePhotoImg = document.getElementById("profilePhotoImg");
                if (profilePhotoImg) {
                    profilePhotoImg.src = profilePhotoUrl;
                }

                // Redirect to dashboard
                window.location.href = "/dashboard.html";
            })
            .catch((error) => {
                console.log(error.message);
            });
    };

    //////////////////---------- onAuthStateChanged---------------///////
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = user.uid;
            console.log("User signed in", user);

            // Set profile photo on page load if user is signed in
            const profilePhotoUrl = user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png";
            const profilePhotoImg = document.getElementById("profilePhotoImg");
            if (profilePhotoImg) {
                profilePhotoImg.src = profilePhotoUrl;
            }
        } else {
            console.log("User signed out");
        }
    });

    //////////////////----------  signOut ---------------///////
    let logOut = () => {
        auth.signOut()
            .then(() => {
                console.log("Sign-out successful");
                window.location.href = "/index.html";
            })
            .catch((error) => {
                console.log(error.message);
            });
    };

    
    let signUpWithGoogle = () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                console.log("User created successfully", user);
    
                // Set the profile photo
                const profilePhotoUrl = user.photoURL || "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png"; // Default to a placeholder if no photoURL
                const profilePhotoImg = document.getElementById("profilePhotoImg");
                if (profilePhotoImg) {
                    profilePhotoImg.src = profilePhotoUrl; // Update profile photo
                }
    
                // Save profile photo URL and display name to localStorage
                const displayName = user.displayName || user.email.split('@')[0]; // Use email name as fallback
                localStorage.setItem("userName", displayName);
                localStorage.setItem("profilePhoto", profilePhotoUrl); // Save the photo URL
    
                // Redirect to dashboard
                window.location.href = "/dashboard.html";
            })
            .catch((error) => {
                console.log(error.message);
            });
    };
    

    // Get elements and attach event listeners
    let signupBtn = document.getElementById("signupBtn");
    if (signupBtn) signupBtn.addEventListener("click", signup);

    let loginBtn = document.getElementById("loginBtn");
    if (loginBtn) loginBtn.addEventListener("click", login);

    let logOutbtn = document.getElementById("logOutbtn");
    if (logOutbtn) logOutbtn.addEventListener("click", logOut);

    let signUpWithGooglebtn = document.getElementById("signUpWithGoogle");
    let LoginWithGoogle = document.getElementById("LoginWithGoogle");
    if (signUpWithGooglebtn) signUpWithGooglebtn.addEventListener("click", signUpWithGoogle);
    if (LoginWithGoogle) LoginWithGoogle.addEventListener("click", signUpWithGoogle);
});