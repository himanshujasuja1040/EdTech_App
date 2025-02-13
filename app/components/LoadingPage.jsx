import { useNavigation } from 'expo-router';
import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet, BackHandler } from 'react-native';
import { doc, getDoc, updateDoc, GeoPoint } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import { AuthContext } from "../AuthContext/AuthContext";
import * as Location from 'expo-location';

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

  // Fetch location with permission handling.
  const fetchLocation = useCallback(async () => {
    try {
      console.log('Requesting foreground permissions...');
      let { status } = await Location.getForegroundPermissionsAsync();
      console.log('Initial status:', status);

      if (status !== 'granted') {
        console.log('Requesting permissions...');
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        status = newStatus;
        console.log('Updated status:', status);
      }

      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        return null;
      }

      console.log('Fetching current location...');
      const currentLocation = await Location.getCurrentPositionAsync({});
      setUserLocation(currentLocation);
      console.log('Current location:', currentLocation);
      return currentLocation;
    } catch (error) {
      console.error('Error fetching location:', error);
      return null;
    }
  }, [setUserLocation]);

  // Call fetchLocation on mount.
  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

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
      // Update the user's document with the new location as a GeoPoint.
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        location: new GeoPoint(
          userLocation.coords.latitude,
          userLocation.coords.longitude
        ),
      });
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
      <ActivityIndicator size="large" color="#0000ff" />
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
});

export default LoadingPage;
