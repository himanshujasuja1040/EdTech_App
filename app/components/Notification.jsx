import React, { useEffect, useState, useContext, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';
import { useNavigation } from 'expo-router';
import { AuthContext } from '../AuthContext/AuthContext';

const Notification = () => {

  const { notifications, selectedStandardColor} = useContext(AuthContext);
  const navigation = useNavigation();
  const [error, setError] = useState(null);

  // Get window dimensions and determine orientation
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  // Dynamic container style based on orientation
  const dynamicContainerStyle = {
    padding: isPortrait ? 20 : 16,
  };

  // Set header options with dynamic font size based on orientation
  useEffect(() => {
    navigation.setOptions({
      title: 'Notification',
      headerTitle: () => (
        <Text style={{ fontSize: isPortrait ? 24 : 20, fontFamily: 'outfit-medium' }}>
          Notification
        </Text>
      ),
    });
  }, [navigation, isPortrait]);

  // Render a single notification item
  const renderNotification = useCallback(({ item }) => (
    <TouchableOpacity style={styles.notificationItem} activeOpacity={0.8}>
      <Ionicons name="notifications" size={24} color={Colors.PRIMARY} />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.description}</Text>
        <Text style={styles.notificationDescription}>{item.title}</Text>
      </View>
    </TouchableOpacity>
  ), []);

  if (error) {
    return (
      <SafeAreaView style={[styles.centerContainer, dynamicContainerStyle,,{backgroundColor:selectedStandardColor}]}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeContainer, dynamicContainerStyle,,{backgroundColor:selectedStandardColor}]}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications available.</Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  listContent: {
    paddingVertical: 10,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: Colors.WHITE,
  },
  notificationContent: {
    marginLeft: 10,
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    color: Colors.DARK,
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    fontFamily: 'outfit-regular',
    color: Colors.GRAY,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.DARK,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'outfit-regular',
    color: Colors.GRAY,
  },
});

export default Notification;
