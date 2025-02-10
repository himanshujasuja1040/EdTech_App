import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Redirect } from 'expo-router';
import { AuthContext } from './AuthContext/AuthContext';
import { View } from 'react-native';
import { auth } from '@/configs/firebaseConfig';
import Login from "./components/Login"
export default function Index() {
  const { userData } = useContext(AuthContext);
  const [user, setUser] = useState(auth.currentUser);

  const shouldRedirect = useMemo(() => {
    return user && userData?.accessGranted;
  }, [user, userData?.accessGranted]); 

  const content = useMemo(() => {
    return shouldRedirect ? <Redirect href="/(tabs)/home" /> : <Login />;
  }, [shouldRedirect]);

  return <View style={{ flex: 1 }}>{content}</View>;
}