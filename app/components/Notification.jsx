import React, { useEffect, useState, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useNavigation } from 'expo-router';
import { db } from '../../configs/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';

const Notification = () => {
  const { selectedStandard ,notifications,setNotifications} = useContext(AuthContext);
  const navigation = useNavigation();
  // const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: 'Notification',
      headerTitle: () => (
        <Text style={{ fontSize: 24, fontFamily: 'outfit-medium' }}>Notification</Text>
      ),
    });
  }, [navigation]);

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
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No notifications available.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 20,
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.GRAY,
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
