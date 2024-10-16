// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Firebase configuration from your project
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
const db = getFirestore(app);
const auth = getAuth(app);

// User Registration Function
export const registerUser = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error during registration:', error);
        alert(error.message);
    }
};

// User Login Function
export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        console.error('Error during login:', error);
        alert(error.message);
    }
};

// User Logout Function
export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Error during logout:', error);
        alert(error.message);
    }
};

// Place New Order Function
export const placeOrder = async (order) => {
    try {
        // Add user ID to the order
        order.userId = auth.currentUser.uid; // Make sure user is logged in
        order.status = 'Unconfirmed'; // Set default status
        await addDoc(collection(db, 'orders'), order);
        alert('Order placed successfully!');
    } catch (error) {
        console.error('Error placing order:', error);
        alert(error.message);
    }
};

// Get User Orders Function
export const getUserOrders = (userId, callback) => {
    const ordersQuery = query(collection(db, 'orders'));
    onSnapshot(ordersQuery, (querySnapshot) => {
        const orders = [];
        querySnapshot.forEach((doc) => {
            const order = doc.data();
            if (order.userId === userId) { // Filter orders for the logged-in user
                orders.push(order);
            }
        });
        callback(orders);
    });
};

// Check Authentication State
export const checkAuthState = (callback) => {
    onAuthStateChanged(auth, (user) => {
        callback(user);
    });
};

// Example of using these functions in your HTML files
// Make sure to call these functions in your respective HTML files.
// import these functions where necessary, e.g., in login.html or new-order.html
