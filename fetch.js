import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            console.log("User is logged in with email: " + user.email); // Log user email for debugging
            fetchOrders(); // Fetch and display orders if logged in
        } else {
            console.log("No user is logged in");
        }
    });

    async function fetchOrders() {
        if (!auth.currentUser) {
            alert("You need to be logged in to view orders.");
            window.location.href = "login.html";
            return;
        }

        const ordersList = document.getElementById("orders-list");

        try {
            // Log the user's email to confirm it's being passed correctly
            console.log("Fetching orders for email: " + auth.currentUser.email);

            // Query the orders collection in Firestore for the current user's orders
            const ordersQuery = query(
                collection(db, "orders"),
                where("username", "==", auth.currentUser.email)
            );
            const querySnapshot = await getDocs(ordersQuery);

            console.log("Orders found: " + querySnapshot.size); // Log the number of orders returned

            if (querySnapshot.empty) {
                ordersList.innerHTML = "<li>No orders found.</li>";
                return;
            }

            // Clear the list before displaying new orders
            ordersList.innerHTML = "";

            querySnapshot.forEach((docSnapshot) => {
                const orderData = docSnapshot.data();
                const listItem = document.createElement("li");
                listItem.classList.add("order-item");

                // Format order details as desired
                listItem.innerHTML = `
                    <div class="order-details">
                        <strong>Name:</strong> ${orderData.name}<br>
                        <strong>Email:</strong> ${orderData.email}<br>
                        <strong>Service:</strong> ${orderData.service}<br>
                        <strong>Status:</strong> <span class="order-status">${orderData.status}</span><br>
                    </div>
                `;

                // Add a cancel button if the status is "Unconfirmed"
                if (orderData.status === "Unconfirmed") {
                    const cancelButton = document.createElement("button");
                    cancelButton.textContent = "Cancel Order";
                    cancelButton.classList.add("cancel-button");

                    // Add event listener to handle cancellation
                    cancelButton.addEventListener("click", async () => {
                        const confirmation = window.confirm("Are you sure you want to cancel this order?");
                        if (confirmation) {
                            try {
                                // Update order status in Firestore
                                const orderRef = doc(db, "orders", docSnapshot.id);
                                await updateDoc(orderRef, { status: "Canceled" });

                                alert("Order canceled successfully!");
                                fetchOrders(); // Refresh the list
                            } catch (error) {
                                console.error("Error canceling order:", error);
                                alert("Failed to cancel order. Please try again.");
                            }
                        }
                    });

                    listItem.querySelector(".order-details").appendChild(cancelButton);
                }

                // Append to the order list
                ordersList.appendChild(listItem);
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            alert("Failed to load orders. Please try again.");
        }
    }
});