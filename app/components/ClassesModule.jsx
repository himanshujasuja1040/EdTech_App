import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../configs/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Colors } from "../../constants/Colors"


const parseTime = (timeStr) => {
  // Expecting format "hh:mm AM/PM"
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (modifier === 'PM' && hours < 12) {
    hours += 12;
  }
  if (modifier === 'AM' && hours === 12) {
    hours = 0;
  }
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
};

const ClassesModule = () => {
  const { selectedStandard } = useContext(AuthContext);
  const navigation = useNavigation();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
 

  // Get today's full day name (e.g., "Thursday")
  const todayFull = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Subscribe to the Schedules collection in Firestore for real-time updates.
  useEffect(() => {
    const schedulesRef = collection(db, 'Schedules');
    const unsubscribe = onSnapshot(
      schedulesRef,
      (querySnapshot) => {
        const schedules = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        // Filter schedules to include only those that match the selected standard
        // and the current day.
        const filtered = schedules.filter(
          (schedule) =>
            schedule.class.toLowerCase() === selectedStandard.toLowerCase() &&
            schedule.day.toLowerCase() === todayFull.toLowerCase()
        );
        setScheduleData(filtered);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching schedules:', err);
        setError('Failed to load schedules.');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [selectedStandard, todayFull]);

  const currentTime = new Date();

  // Split schedules into ongoing and upcoming based on current time.
  const ongoingClasses = scheduleData.filter((schedule) => {
    const start = parseTime(schedule.startTime);
    const end = parseTime(schedule.endTime);
    return (currentTime >= start && currentTime < end);
  });

  const upcomingClasses = scheduleData.filter((schedule) => {
    const start = parseTime(schedule.startTime);
    return currentTime < start;
  });

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Loading Classes...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Ongoing Classes */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ongoing Classes</Text>
          {ongoingClasses.length > 0 ? (
            ongoingClasses.map((classItem) => (
              <TouchableOpacity key={classItem.id} style={styles.classItem}>
                <View style={styles.classIcon}>
                  <Ionicons name="book" size={20} color={Colors.WHITE} />
                </View>
                <View>
                  <Text style={styles.classSubject}>{classItem.subject}</Text>
                  <Text style={styles.classInfo}>
                    {classItem.startTime} - {classItem.endTime} • {classItem.teacher}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No ongoing classes</Text>
          )}
        </View>

        {/* Upcoming Classes */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming Classes</Text>
          {upcomingClasses.length > 0 ? (
            upcomingClasses.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={styles.classItem}
                onPress={() => navigation.navigate('Schedule')}
              >
                <View style={styles.classIcon}>
                  <Ionicons name="time" size={20} color={Colors.WHITE} />
                </View>
                <View>
                  <Text style={styles.classSubject}>{classItem.subject}</Text>
                  <Text style={styles.classInfo}>
                    {classItem.startTime} - {classItem.endTime} • {classItem.teacher}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No upcoming classes</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  sectionContainer: {
    backgroundColor: Colors.WHITE,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A4D69',
    marginBottom: 12,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  classIcon: {
    backgroundColor: Colors.PRIMARY,
    padding: 10,
    borderRadius: 8,
    marginRight: 15,
  },
  classSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  classInfo: {
    fontSize: 12,
    color: '#666',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.PRIMARY,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginVertical: 8,
  },
  // Ensure Colors.WHITE is defined for styling consistency.
  WHITE: {
    color: '#fff',
  },
});

export default React.memo(ClassesModule);
