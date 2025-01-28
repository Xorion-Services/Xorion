import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

// Function to toggle password visibility
function togglePasswordVisibility(inputFieldId, toggleButtonId) {
    const inputField = document.getElementById(inputFieldId);
    const toggleButton = document.getElementById(toggleButtonId);

    if (inputField.type === "password") {
        inputField.type = "text";
        toggleButton.textContent = "Hide";
    } else {
        inputField.type = "password";
        toggleButton.textContent = "Show";
    }
}

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
    const profileButton = document.getElementById('profileButton');
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

    onAuthStateChanged(auth, async (user) => {
        if (user && userGreeting) { // Check if user and userGreeting exist
            const username = await getUsername(user.uid);
            userGreeting.textContent = username ? `Hi, ${username}` : `Hi, ${user.email}`;
        } else if (userGreeting) {
            userGreeting.textContent = "User Menu";
        }
    });

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (password.length < 8) {
                alert("Password must be at least 8 characters long.");
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const userData = {
                        username: username,
                        email: email,
                    };
                    return setDoc(doc(db, "users", userCredential.user.uid), userData);
                })
                .then(() => {
                    alert('Account created successfully! Redirecting to login...');
                    window.location.href = 'login.html';
                })
                .catch((error) => {
                    console.error('Signup error:', error);
                    alert('Signup failed: ' + error.message);
                });
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert("Logged in successfully");
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            signInWithEmailAndPassword(auth, email, password)
                .then(async (userCredential) => {
                    const userDocRef = doc(db, "users", userCredential.user.uid);
                    try {
                        const userDocSnap = await getDoc(userDocRef);
                        if (userDocSnap.exists()) {
                            window.location.href = 'orders.html';
                        } else {
                            console.error("User document not found! This should not happen.");
                            alert("Login failed: User data is missing. Please contact support.");
                            signOut(auth);
                        }
                    } catch (error) {
                        console.error("Error validating username:", error);
                        alert("Login failed: Error validating user data. Please try again.");
                        signOut(auth);
                    }
                })
                .catch((error) => {
                    console.error('Login error:', error);
                    alert('Login failed: ' + error.message);
                });
        });
    }

    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            togglePasswordVisibility('password', 'togglePassword');
        });
    }

    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    if (toggleConfirmPassword) {
        toggleConfirmPassword.addEventListener('click', () => {
            togglePasswordVisibility('confirmPassword', 'toggleConfirmPassword');
        });
    }

    const newOrderForm = document.getElementById('orderForm');
    if (newOrderForm) {
        newOrderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const service = document.getElementById('service').value;
            const number = document.getElementById('number').value;

            if (!name || !email || !service || !number) {
                alert('Please fill in all fields.');
                return;
            }

            try {
                const docRef = await addDoc(collection(db, 'orders'), {
                    username: auth.currentUser.email,
                    name: name,
                    email: email,
                    service: service,
                    number: number,
                    status: 'Unconfirmed'
                });
                console.log('Order placed with ID:', docRef.id);
                alert('Order placed successfully!');
                window.location.href = 'orders.html';
            } catch (error) {
                console.error('Error placing order:', error);
                alert('Failed to place order: ' + error.message);
            }
        });
    }
});
