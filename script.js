// Import Firebase functions
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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
        toggleButton.textContent = "Hide"; // Change button text to "Hide"
    } else {
        inputField.type = "password";
        toggleButton.textContent = "Show"; // Change button text to "Show"
    }
}

// Event listeners for password visibility toggles
document.getElementById('toggle-password-visibility-login')?.addEventListener('click', () => {
    togglePasswordVisibility('login-password', 'toggle-password-visibility-login');
});

document.getElementById('toggle-password-visibility-signup')?.addEventListener('click', () => {
    togglePasswordVisibility('signup-password', 'toggle-password-visibility-signup');
});

// Function to handle user signup
document.getElementById('signup-form')?.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    // Check if password is at least 8 characters long
    if (password.length < 8) {
        alert("Password must be at least 8 characters long.");
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Successfully signed up
            console.log('Signup successful:', userCredential.user);
            alert('Account created successfully! Redirecting to login...');
            window.location.href = 'login.html'; // Redirect to login page
        })
        .catch((error) => {
            console.error('Signup error:', error.message);
            alert('Signup failed: ' + error.message);
        });
});

// Function to handle user login
document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Successfully logged in
            console.log('Login successful:', userCredential.user);
            window.location.href = 'orders.html'; // Redirect to orders page
        })
        .catch((error) => {
            console.error('Login error:', error.message);
            alert('Login failed: ' + error.message);
        });
});

// Function to handle new order submission
document.getElementById('new-order-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const name = document.getElementById('name').value; // Adjusted for order form
    const email = document.getElementById('email').value; // Use the logged-in user's email
    const service = document.getElementById('service').value;
    const price = document.getElementById('price').value;

    // Validate form fields
    if (!name || !email || !service || !price) {
        alert('Please fill in all fields.');
        return;
    }

    try {
        // Add new order to Firestore with status field
        const docRef = await addDoc(collection(db, 'orders'), {
            username: auth.currentUser.email, // Assuming username is the logged-in user's email
            name: name,
            email: email,
            service: service,
            price: price,
            status: 'Pending', // Set default status
            currency: 'INR'
        });
        console.log('Order placed with ID:', docRef.id);
        alert('Order placed successfully!');
        window.location.href = 'orders.html'; // Redirect to orders page
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order: ' + error.message);
    }
});

// Function to fetch and display previous orders
async function fetchOrders() {
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
        orderItem.textContent = `Name: ${orderData.name}, Email: ${orderData.email}, Service: ${orderData.service}, Price: ${orderData.price} INR, Status: ${orderData.status}`; // Show status
        ordersList.appendChild(orderItem);
    });
}

// Call fetchOrders when the orders page loads
if (window.location.pathname.endsWith('orders.html')) {
    fetchOrders();
}

// Function to update order status
document.getElementById('update-status-form')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission

    const orderId = document.getElementById('order-id').value;
    const newStatus = document.getElementById('new-status').value;

    try {
        // Update order status in Firestore
        const orderRef = doc(db, 'orders', orderId); // Get document reference
        await updateDoc(orderRef, {
            status: newStatus // Update status field
        });
        alert('Order status updated successfully!');
        window.location.reload(); // Reload to show updated status
    } catch (error) {
        console.error('Error updating order status:', error);
        alert('Failed to update status: ' + error.message);
    }
});
