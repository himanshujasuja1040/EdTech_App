import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation, useRouter, useLocalSearchParams } from 'expo-router';

const NoAccess = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const searchParams = useLocalSearchParams();
  const [accessGranted, setAccessGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hide header
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Parse access status from URL params
  useEffect(() => {
    const parseAccessStatus = () => {
      try {
        if (!searchParams.userDataFromLP) {
          setIsLoading(false);
          return;
        }

        const data = typeof searchParams.userDataFromLP === 'string' 
          ? JSON.parse(searchParams.userDataFromLP)
          : searchParams.userDataFromLP;

        setAccessGranted(data.accessGranted ?? false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setAccessGranted(false);
      } finally {
        setIsLoading(false);
      }
    };

    parseAccessStatus();
  }, [searchParams.userDataFromLP]);

  // Handle redirection logic
  useEffect(() => {
    if (accessGranted) {
      router.replace({
        pathname: '/(tabs)/home',
        params: { _href: '/(tabs)/home' }
      });
    }
  }, [accessGranted]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2A4D69" />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.header}>Access Pending</Text>
      <Text style={styles.infoText}>
        RADHE RADHE BETA , ABHI PURI DETAIL CHECK NAHI HUYI HAI TERI 
      </Text>
    </View>
  );
};

export default NoAccess;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2A4D69',
    textAlign: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});
