import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import styles from "../styles/Profile.module.scss";

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const getInitials = () => {
    if (!user?.displayName) return user?.email?.[0]?.toUpperCase() || "U";
    const names = user.displayName.split(" ");
    return names.length > 1
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  if (loading || !user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <div className={styles.profileHeaderContent}>
          <div className={styles.profileAvatar}>{getInitials()}</div>
          <div className={styles.profileHeaderInfo}>
            <h1 className={styles.profileTitle}>
              Welcome back, {user.displayName || "User"}!
            </h1>
            <p className={styles.profileSubtitle}>
              Manage your account and view your orders
            </p>
          </div>
        </div>
        <button
          className={styles.logoutButton}
          onClick={() => setShowLogoutConfirm(true)}
        >
          <span className={styles.logoutIcon}>🚪</span>
          Logout
        </button>
      </div>

      <div className={styles.profileContent}>
        <div className={styles.leftColumn}>
          <div className={styles.accountInfo}>
            <h2>Account Information</h2>
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email:</span>
                <span className={styles.infoValue}>{user.email}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Name:</span>
                <span className={styles.infoValue}>
                  {user.displayName || "Not set"}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Member since:</span>
                <span className={styles.infoValue}>
                  {user.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.additionalInfo}>
            <h2>Quick Actions</h2>
            <div className={styles.actionsList}>
              <button className={styles.actionButton}>
                <span className={styles.actionIcon}>❤️</span>
                <div>
                  <span className={styles.actionTitle}>Wishlist</span>
                  <span className={styles.actionSubtitle}>
                    View saved items (Coming soon)
                  </span>
                </div>
              </button>
              <button className={styles.actionButton}>
                <span className={styles.actionIcon}>📍</span>
                <div>
                  <span className={styles.actionTitle}>Address Book</span>
                  <span className={styles.actionSubtitle}>
                    Manage addresses (Coming soon)
                  </span>
                </div>
              </button>
              <button className={styles.actionButton}>
                <span className={styles.actionIcon}>💳</span>
                <div>
                  <span className={styles.actionTitle}>Payment Methods</span>
                  <span className={styles.actionSubtitle}>
                    Manage saved cards (Coming soon)
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.orderHistory}>
            <h2>Order History</h2>
            {isLoadingOrders ? (
              <div className={styles.ordersLoading}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <div className={styles.emptyOrdersIcon}>📦</div>
                <h3>No orders yet</h3>
                <p>When you place your first order, it will appear here.</p>
                <button
                  className={styles.shopNowButton}
                  onClick={() => router.push("/products")}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map((order) => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <h3>Order #{order.orderId}</h3>
                      <span
                        className={`${styles.orderStatus} ${
                          styles[order.orderStatus?.toLowerCase()]
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                    <div className={styles.orderDetails}>
                      <p>
                        <strong>Date:</strong>{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Total:</strong> ₹
                        {order.orderSummary.total.toFixed(2)}
                      </p>
                    </div>
                    <div className={styles.orderItems}>
                      <h4>Items ({order.items.length}):</h4>
                      <div className={styles.itemsList}>
                        {order.items.map((item) => (
                          <div key={item.id} className={styles.orderItem}>
                            <img src={item.image} alt={item.name} />
                            <div className={styles.itemDetails}>
                              <p className={styles.itemName}>{item.name}</p>
                              <div className={styles.itemMeta}>
                                <span>Qty: {item.quantity}</span>
                                <span>₹{item.price.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={styles.confirmLogoutButton}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
