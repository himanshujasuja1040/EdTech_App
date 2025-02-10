import { router, useNavigation } from 'expo-router';
import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import { AuthContext } from "../AuthContext/AuthContext";

const LoadingPage = () => {
  const navigation = useNavigation();
  const [userDataFromLP, setUserDataFromLP] = useState(null);
  const { setUserData,selectedStandard,setSelectedStandard ,setUserPhoneNumber,setUserParentPhoneNumber} = useContext(AuthContext);

  // Hide the header and set an empty title.
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      title: '',
    });
  }, [navigation]);

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

  // Run the fetch function only once on mount.
  useEffect(() => {
    fetchUserDataFromLP();
  }, [fetchUserDataFromLP]);
  // Memoize the JSON string conversion to avoid unnecessary recalculations.
  const memoizedUserData = useMemo(() => {
    return userDataFromLP ? JSON.stringify(userDataFromLP) : null;
  }, [userDataFromLP]);

  useEffect(() => {
    if (memoizedUserData) {
      // Optionally, update your AuthContext.
      setUserData(userDataFromLP);
      setSelectedStandard(userDataFromLP?.selectedStandard)
      setUserPhoneNumber(userDataFromLP?.userPhoneNumber)
      setUserParentPhoneNumber(userDataFromLP?.userParentPhoneNumber)
      console.log(selectedStandard)
      router.replace({
        pathname: '/NoAccess',
        params: { userDataFromLP: memoizedUserData },
      });
    }
  }, [memoizedUserData, setUserData, userDataFromLP]);

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
