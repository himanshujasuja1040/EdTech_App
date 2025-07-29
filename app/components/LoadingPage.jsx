import { useNavigation } from 'expo-router';
import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import { doc, getDoc, updateDoc, GeoPoint } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import { AuthContext } from "../AuthContext/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';

const LoadingPage = () => {
  const navigation = useNavigation();
  const [userDataFromLP, setUserDataFromLP] = useState(null);
  const {
    setUserData,
    selectedStandard,
    setSelectedStandard,
    setUserLocation,
    setUserPhoneNumber,
    setUserParentPhoneNumber,
    userLocation,
  } = useContext(AuthContext);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      title: '',
    });
  }, [navigation]);

  // Prevent hardware back button on Android from navigating back.
  useEffect(() => {
    const backAction = () => true;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  // Memoized fetch function to get user data only once.
  const fetchUserDataFromLP = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          console.log('User data fetched:', data);
          setUserDataFromLP(data);
        } else {
          console.log('User document does not exist');
        }
      } else {
        console.log('No current user');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      console.log('Fetch user data completed');
    }
  }, []);

  // Set a static default location instead of fetching it.
  useEffect(() => {
    const staticLocation = {
      coords: {
        latitude: 37.78825,   // Default latitude
        longitude: -122.4324, // Default longitude
      },
      timestamp: Date.now(),
    };
    setUserLocation(staticLocation);
    console.log('Static user location set:', staticLocation);
  }, [setUserLocation]);

  // Removed the fetchLocation function and its useEffect.

  // Store or update the location in Firestore.
  const storeLocation = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log('No current user');
        return;
      }
      if (!userLocation) {
        console.warn('User location is not available');
        return;
      }
      
      // Get the last update timestamp from AsyncStorage
      const lastUpdateStr = await AsyncStorage.getItem('lastLocationUpdate');
      const now = Date.now();
      
      // For a random threshold between 5 and 6 hours:
      const minThreshold = 5 * 60 * 60 * 1000; // 5 hours in ms
      const randomExtra = Math.floor(Math.random() * (60 * 60 * 1000)); // up to 1 hour in ms
      const threshold = minThreshold + randomExtra;
      
      if (lastUpdateStr) {
        const lastUpdate = parseInt(lastUpdateStr, 10);
        const diff = now - lastUpdate;
        if (diff < threshold) {
          console.log(`Location was updated ${Math.floor(diff/3600000)} hour(s) ago. Next update in ${Math.ceil((threshold - diff) / 3600000)} hour(s).`);
          return;
        }
      }
      
      // Update the user's document with the new location as a GeoPoint.
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        location: new GeoPoint(
          userLocation.coords.latitude,
          userLocation.coords.longitude
        ),
      });
      // Save the current time as the last update time.
      await AsyncStorage.setItem('lastLocationUpdate', now.toString());
      console.log('Location updated in Firestore successfully!');
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // When userLocation is updated, call storeLocation to update Firestore.
  useEffect(() => {
    if (userLocation) {
      storeLocation();
    }
  }, [userLocation]);

  // Run the fetch user data function once on mount.
  useEffect(() => {
    fetchUserDataFromLP();
  }, [fetchUserDataFromLP]);

  // Memoize the JSON string conversion to avoid unnecessary recalculations.
  const memoizedUserData = useMemo(() => {
    return userDataFromLP ? JSON.stringify(userDataFromLP) : null;
  }, [userDataFromLP]);

  // Update AuthContext and navigate once user data is available.
  useEffect(() => {
    if (memoizedUserData) {
      setUserData(userDataFromLP);
      setSelectedStandard(userDataFromLP?.selectedStandard);
      setUserPhoneNumber(userDataFromLP?.userPhoneNumber);
      setUserParentPhoneNumber(userDataFromLP?.userParentPhoneNumber);

      navigation.reset({
        index: 0,
        routes: [{ name: 'NoAccess', params: { userDataFromLP: memoizedUserData } }],
      });
    }
  }, [memoizedUserData, setUserData, userDataFromLP, setSelectedStandard, setUserPhoneNumber, setUserParentPhoneNumber, navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animation/loading-animation.json')}
        autoPlay
        loop
        style={styles.lottie}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  lottie: {
    width: 150,  // adjust as needed
    height: 150, // adjust as needed
  },
});

export default LoadingPage;
