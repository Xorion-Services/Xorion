import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration
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

// SPA navigation handler
function navigateTo(route) {
    window.history.pushState({}, '', `#${route}`);  // Update the URL without reloading
    loadPage();  // Dynamically load the corresponding page content
}

// Load the correct content based on the route
function loadPage() {
    const appContainer = document.getElementById('app');
    if (!appContainer) {
        console.error("App container not found.");
        return;
    }
    
    const path = window.location.hash.substring(1);  // Get the current hash route
    const route = routes[path] || showLoginForm;  // Default to login page if route is invalid
    route();  // Load the corresponding page content
}

// Display login form
function showLoginForm() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    `;
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigateTo('orders');  // Navigate to orders after login
            })
            .catch((error) => {
                alert('Login failed: ' + error.message);
            });
    });
}

// Display signup form
function showSignupForm() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <h2>Signup</h2>
        <form id="signupForm">
            <input type="email" id="email" placeholder="Email" required>
            <input type="password" id="password" placeholder="Password" required>
            <button type="submit">Signup</button>
        </form>
    `;
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert('Account created successfully!');
                navigateTo('login');  // Navigate to login after successful signup
            })
            .catch((error) => {
                alert('Signup failed: ' + error.message);
            });
    });
}

// Display orders
async function showOrders() {
    const appContainer = document.getElementById('app');
    if (!auth.currentUser) {
        alert("You need to be logged in to view orders.");
        navigateTo('login');
        return;
    }

    appContainer.innerHTML = `<h2>Orders</h2><ul id="orders-list"></ul>`;
    const q = query(collection(db, 'orders'), where('username', '==', auth.currentUser.email));
    const querySnapshot = await getDocs(q);
    const ordersList = document.getElementById('orders-list');

    if (querySnapshot.empty) {
        ordersList.innerHTML = '<p>No previous orders found.</p>';
        return;
    }

    querySnapshot.forEach((doc) => {
        const orderData = doc.data();
        const orderItem = document.createElement('li');
        orderItem.textContent = `Name: ${orderData.name}, Email: ${orderData.email}, Service: ${orderData.service}, Price: ${orderData.price} INR, Status: ${orderData.status}`;
        ordersList.appendChild(orderItem);

        const separator = document.createElement('hr');
        ordersList.appendChild(separator);
    });
}

// Route definitions
const routes = {
    'login': showLoginForm,
    'signup': showSignupForm,
    'orders': showOrders,
};

// Ensure the DOM is fully loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
    loadPage();  // Load the initial page based on the current URL hash

    // Check the authentication state when the page loads
    onAuthStateChanged(auth, (user) => {
        if (!user && window.location.hash !== '#signup') {
            navigateTo('login');  // Redirect to login if not authenticated
        }
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', loadPage);
});
