import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUuK-7DNf8dNijkxg78MmJAXuVcPWN-pk",
    authDomain: "xorion-2403.firebaseapp.com",
    projectId: "xorion-2403",
    storageBucket: "xorion-2403.appspot.com",
    messagingSenderId: "553221192525",
    appId: "1:553221192525:web:486e0b738988edfc2a9504",
    measurementId: "G-BL2WDYJYT6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function getUsername(uid) {
    try {
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            return userDocSnap.data().username;
        } else {
            console.warn("No user document found for UID:", uid);
            return null;
        }
    } catch (error) {
        console.error("Error fetching username:", error);
        return null;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    const userIcon = document.getElementById('user-icon');
    const popupMenu = document.getElementById('popupMenu');
    const overlay = document.getElementById('overlay');
    const closeButton = document.getElementById('closeButton');
    const logoutButton = document.getElementById('logoutButton');
    const userGreeting = document.getElementById('userGreeting');

    if (userIcon) { 
        userIcon.addEventListener('click', () => {
            if (popupMenu.style.display === 'block') {
                popupMenu.style.display = 'none';
                overlay.style.display = 'none';
            } else {
                popupMenu.style.display = 'block';
                overlay.style.display = 'block';
            }
        });
    }
    if (closeButton) {
    closeButton.addEventListener('click', () => {
        popupMenu.style.display = 'none';
        overlay.style.display = 'none';
    });
    }
    if (overlay) {
    overlay.addEventListener('click', () => {
        popupMenu.style.display = 'none';
        overlay.style.display = 'none';
    });
    }

    if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                alert('Logged out successfully')
                window.location.href = "index.html";
        })  .catch((error) => {
                console.error("Signout error", error);
                alert("Error logging out" + error.message);
        });
    });
    }

    // Login button functionality
    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = "login.html"; // Redirect to login page
        });
    }

    onAuthStateChanged(auth, async (user) => {
        if (user && userGreeting) { // Check if user and userGreeting exist
            const username = await getUsername(user.uid);
            userGreeting.textContent = username ? `Hi, ${username}` : `Hi, ${user.email}`;
        } else if (userGreeting) {
            userGreeting.textContent = "User Menu";
        }
        if (user) {
            // User is logged in
            if (logoutButton) logoutButton.style.display = 'block';
            if (loginButton) loginButton.style.display = 'none';
        } else {
            // User is not logged in
            if (logoutButton) logoutButton.style.display = 'none';
            if (loginButton) loginButton.style.display = 'block';
        }
    });
});