import React, { createContext, useState, useEffect } from 'react';
import { Text } from 'react-native';
import { doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // State variables with default values to avoid null during initial render
  const [userData, setUserData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedStandard, setSelectedStandard] = useState("12th Class");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [name, setName] = useState("Guest");
  const [error, setError] = useState(null);

  // Fetch user data once on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            setIsLoggedIn(true);
            setSelectedStandard(data.selectedStandard || "12th Class");
            setName(data.fullName || "Guest");
          } else {
            setIsLoggedIn(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  },[]);

  // Subscribe to notifications for the selected standard.
  useEffect(() => {
    const notificationsRef = collection(db, 'notifications');
    const unsubscribe = onSnapshot(
      notificationsRef,
      (querySnapshot) => {
        const fetchedNotifications = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Filter notifications based on the class (case-insensitive)
        const filteredNotifications = fetchedNotifications.filter(
          (notification) =>
            notification.class &&
            notification.class.toLowerCase() === selectedStandard.toLowerCase()
        );
        setNotifications(filteredNotifications);
        setError(null);

      },
      (err) => {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications.');
      }
    );
    return () => unsubscribe();
  }, [selectedStandard]);



  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        selectedStandard,
        setSelectedStandard,
        selectedCategory,
        setSelectedCategory,
        name,
        setName,
        notifications,
        setNotifications,
        userData,
        setUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
