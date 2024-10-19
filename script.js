import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

// Routing setup
const routes = {
    '': showLoginForm,  // Default route for login
    'signup': showSignupForm,
    'orders': showOrdersPage,
    'new-order': showNewOrderForm
};

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

// SPA Navigation Handler
function navigateTo(route) {
    window.history.pushState({}, '', `#${route}`);
    loadPage();
}

// Load content based on the current route
function loadPage() {
    const path = window.location.hash.substring(1);  // Get the current hash route
    const route = routes[path] || showLoginForm;  // Load the corresponding function or default to login
    route();
}

// Display the login form
function showLoginForm() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="password" placeholder="Password">
            <button type="submit">Login</button>
        </form>
    `;
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigateTo('orders');  // Redirect to orders page after login
            })
            .catch((error) => {
                alert('Login failed: ' + error.message);
            });
    });
}

// Display the signup form
function showSignupForm() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <h2>Signup</h2>
        <form id="signupForm">
            <input type="email" id="email" placeholder="Email">
            <input type="password" id="password" placeholder="Password">
            <button type="submit">Sign Up</button>
        </form>
    `;
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                alert('Account created successfully!');
                navigateTo('');  // Redirect to login after signup
            })
            .catch((error) => {
                alert('Signup failed: ' + error.message);
            });
    });
}

// Display the orders page
function showOrdersPage() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <h2>Your Orders</h2>
        <ul id="orders-list"></ul>
    `;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchOrders();
        } else {
            navigateTo('');  // Redirect to login if not authenticated
        }
    });
}

// Fetch orders from Firestore
async function fetchOrders() {
    const q = query(collection(db, 'orders'), where('username', '==', auth.currentUser.email));
    const querySnapshot = await getDocs(q);
    const ordersList = document.getElementById('orders-list');

    if (querySnapshot.empty) {
        ordersList.innerHTML = '<li>No previous orders found.</li>';
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

// Display the new order form
function showNewOrderForm() {
    const appContainer = document.getElementById('app');
    appContainer.innerHTML = `
        <h2>New Order</h2>
        <form id="orderForm">
            <input type="text" id="name" placeholder="Name">
            <input type="email" id="email" placeholder="Email">
            <input type="text" id="service" placeholder="Service">
            <input type="number" id="price" placeholder="Price">
            <button type="submit">Place Order</button>
        </form>
    `;

    document.getElementById('orderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const service = document.getElementById('service').value;
        const price = document.getElementById('price').value;

        try {
            await addDoc(collection(db, 'orders'), {
                username: auth.currentUser.email,
                name: name,
                email: email,
                service: service,
                price: price,
                currency: 'INR',
                status: 'Unconfirmed'
            });
            alert('Order placed successfully!');
            navigateTo('orders');  // Redirect to orders after placing an order
        } catch (error) {
            alert('Failed to place order: ' + error.message);
        }
    });
}

// Load the correct page when the browser navigates
window.addEventListener('popstate', loadPage);

// Initialize the app by loading the first page
document.addEventListener('DOMContentLoaded', loadPage);
