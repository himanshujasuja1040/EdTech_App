import React, { createContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, doc, updateDoc,GeoPoint } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // State variables
  const [userData, setUserData] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState("12th Class");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [userPhoneNumber, setUserPhoneNumber] = useState();
  const [userParentPhoneNumber, setUserParentPhoneNumber] = useState();
  const [selectedStandardColor, setselectedStandardColor] = useState('#fff');
  const [name, setName] = useState("Guest");
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  // Category Colors 
  const categoryColors = {
    'JEE MAINS': '#fce4ec', // light pink
    'NEET': '#e3f2fd',      // light blue
    '12th Class': '#e8f5e9', // light green
    '11th Class': '#fff3e0', // light orange
    '10th Class': '#ede7f6', // light purple
    '9th Class': '#f3e5f5',  // light violet
    '8th Class': '#e0f7fa',  // light cyan
    '7th Class': '#fbe9e7',  // light red-orange
    '6th Class': '#f1f8e9',  // light greenish-yellow
  };

  // When userData changes, update selectedStandard and name accordingly.
  useEffect(() => {
    if (userData) {
      setSelectedStandard(userData.selectedStandard || "12th Class");
      setName(userData.fullName || "Guest");
    }
  }, [userData]);

  // Update selectedStandard when it changes (and if userData exists)
  useEffect(() => {
    if (userData) {
      setSelectedStandard(selectedStandard);
      setselectedStandardColor(categoryColors[selectedStandard]);
    }
  }, [selectedStandard, userData]);

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


  
  

  // Prepare the context value with the correct dependencies.
  const contextValue = useMemo(() => ({
    selectedStandard,
    setSelectedStandard,
    selectedCategory,
    setSelectedCategory,
    name,
    setName,
    notifications,
    setNotifications,
    userData,
    setUserData,
    error,
    userPhoneNumber,
    setUserPhoneNumber,
    userParentPhoneNumber,
    setUserParentPhoneNumber,
    selectedStandardColor,
    setselectedStandardColor,
    userLocation,
    setUserLocation
  }), [
    selectedStandard,
    selectedCategory,
    name,
    notifications,
    userData,
    error,
    userPhoneNumber,
    userParentPhoneNumber,
    selectedStandardColor,
    userLocation
  ]);

  // Create a key based on userData.
  const providerKey = userData ? (userData.id || JSON.stringify(userData)) : 'default';

  return (
    <AuthContext.Provider key={providerKey} value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
