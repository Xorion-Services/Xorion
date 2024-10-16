// Import Firebase functionalities
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

// Function to fetch user orders
async function getUserOrders(username) {
    const q = query(collection(db, 'orders'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Ensure the DOM is fully loaded before running any code
document.addEventListener('DOMContentLoaded', function() {
    // Login form event listener
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log('Login successful:', userCredential.user);
                    window.location.href = 'orders.html'; // Redirect to orders page
                })
                .catch((error) => {
                    console.error('Login error:', error.message);
                    alert('Login failed: ' + error.message);
                });
        });
    }

    // Signup form event listener
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Check if password is at least 8 characters long
            if (password.length < 8) {
                alert("Password must be at least 8 characters long.");
                return;
            }

            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    console.log('Signup successful:', userCredential.user);
                    alert('Account created successfully! Redirecting to login...');
                    window.location.href = 'login.html'; // Redirect to login page
                })
                .catch((error) => {
                    console.error('Signup error:', error.message);
                    alert('Signup failed: ' + error.message);
                });
        });
    }

    // Event listeners for password visibility toggles
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

    // New order form event listener
    const newOrderForm = document.getElementById('orderForm');
    if (newOrderForm) {
        newOrderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const service = document.getElementById('service').value;
            const price = document.getElementById('price').value;

            if (!name || !email || !service || !price) {
                alert('Please fill in all fields.');
                return;
            }

            try {
                const docRef = await addDoc(collection(db, 'orders'), {
                    username: auth.currentUser.email,
                    name: name,
                    email: email,
                    service: service,
                    price: price,
                    currency: 'INR',
                    status: 'Unconfirmed' // Setting the default status
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

    // Fetch and display previous orders
    async function fetchOrders() {
        if (!auth.currentUser) {
            alert("You need to be logged in to view orders.");
            window.location.href = "login.html";
            return;
        }

        const orders = await getUserOrders(auth.currentUser.email);
        const ordersList = document.getElementById('orders-list');

        if (orders.length === 0) {
            ordersList.innerHTML = '<p>No previous orders found.</p>';
            return;
        }

        orders.forEach(order => {
            const orderItem = document.createElement('li');
            orderItem.textContent = `Name: ${order.name}, Email: ${order.email}, Service: ${order.service}, Price: ${order.price} INR, Status: ${order.status || 'Unconfirmed'}`;
            ordersList.appendChild(orderItem);
        });
    }

    // Check the authentication state before fetching orders
    if (window.location.pathname.endsWith('orders.html')) {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                await fetchOrders();
            } else {
                window.location.href = 'login.html'; // Redirect to login if not authenticated
            }
        });
    }
});
