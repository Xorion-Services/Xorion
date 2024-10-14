// Firebase configuration and initialization here...
// Place your Firebase configuration code that you've shared with me here

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Get references to form elements and handle sign up and login
const auth = getAuth();
const db = getFirestore();

// Login form submission
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = 'orders.html';
    })
    .catch(error => {
      alert(error.message);
    });
});

// Signup form submission
document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert('Account created successfully!');
      window.location.href = 'login.html';
    })
    .catch(error => {
      alert(error.message);
    });
});

// New order form submission
document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const service = document.getElementById('service').value;
  const price = document.getElementById('price').value;

  try {
    await addDoc(collection(db, 'orders'), {
      username: auth.currentUser.displayName,
      name,
      email,
      service,
      price
    });
    alert('Order placed successfully!');
    window.location.href = 'orders.html';
  } catch (error) {
    alert(error.message);
  }
});
