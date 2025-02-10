import React, { createContext, useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // State variables
  const [userData, setUserData] = useState(null);
  const [selectedStandard, setSelectedStandard] = useState("12th Class");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [userPhoneNumber,setUserPhoneNumber]=useState();
  const [userParentPhoneNumber,setUserParentPhoneNumber]=useState();

  const [name, setName] = useState("Guest");
  const [error, setError] = useState(null);

  // When userData changes, update selectedStandard and name accordingly.
  useEffect(() => {
    if (userData) {
      setSelectedStandard(userData.selectedStandard || "12th Class");
      setName(userData.fullName || "Guest");
    }
  }, [userData]);

  // Update selectedCategory when selectedStandard changes (and if userData exists)
  useEffect(() => {
    if (userData) {
      setSelectedStandard(selectedStandard);
    }
  }, [selectedStandard, userData]);

  console.log('AuthContext userData: ', userData);

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


  //Progress
  function randomiseProgress() {
    // Generate a random number between 0.6 and 1.
    const overallProgress = Math.random() * (1 - 0.6) + 0.6;
    // Round to two decimal places.
    const overallProgress1 = Math.round(overallProgress * 100) / 100;
    return overallProgress1;
  }
    // console.log(randomiseProgress())
  const overallProgress=randomiseProgress()
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
    overallProgress,
    userPhoneNumber,
    setUserPhoneNumber,
    userParentPhoneNumber,
    setUserParentPhoneNumber
  }), [selectedStandard, selectedCategory, name, notifications, userData, error]);

  // Create a key based on userData.
  const providerKey = userData ? (userData.id || JSON.stringify(userData)) : 'default';

  return (
    <AuthContext.Provider key={providerKey} value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
