import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import styles from "../styles/Profile.module.scss";

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/products");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const ordersQuery = query(
        collection(db, "orders"),
        where("customerInfo.email", "==", user.email)
      );

      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const fetchedOrders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setOrders(fetchedOrders);
          setIsLoadingOrders(false);
        },
        (err) => {
          console.error("Error fetching orders:", err);
          setIsLoadingOrders(false);
        }
      );

      return () => unsubscribe();
    }
  }, [user]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.profileTitle}>Your Profile</h1>

      <div className={styles.profileContent}>
        <div className={styles.accountInfo}>
          <h2>Account Information</h2>
          <div className={styles.infoCard}>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Name:</strong> {user.displayName || "Not set"}
            </p>
            {/* Add more fields as stored in Firebase */}
          </div>
        </div>

        <div className={styles.orderHistory}>
          <h2>Order History</h2>
          {isLoadingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className={styles.ordersList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.orderCard}>
                  <h3>Order #{order.orderId}</h3>
                  <p>
                    <strong>Date:</strong>{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.orderStatus}
                  </p>
                  <p>
                    <strong>Total:</strong> ₹
                    {order.orderSummary.total.toFixed(2)}
                  </p>
                  <h4>Items:</h4>
                  <ul>
                    {order.items.map((item) => (
                      <li key={item.id} className={styles.orderItem}>
                        <img src={item.image} alt={item.name} />
                        <div>
                          <p>{item.name}</p>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ₹{item.price.toFixed(2)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.additionalInfo}>
          <h2>Preferences</h2>
          <div className={styles.infoCard}>
            <p>
              <strong>Wishlist:</strong> View your saved items (Coming soon)
            </p>
            <p>
              <strong>Address Book:</strong> Manage addresses (Coming soon)
            </p>
            <p>
              <strong>Payment Methods:</strong> Manage saved cards (Coming soon)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
