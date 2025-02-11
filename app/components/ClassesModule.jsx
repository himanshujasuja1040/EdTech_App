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
import moment from "moment-timezone";
import { router } from 'expo-router';
import  Colors  from '../../constants/Colors';


// Helper function to format a Firestore Timestamp to "hh:mm AM/PM"
const formatTime = (timestamp) => {
  // Convert Firestore Timestamp to a Date object
  const date = timestamp.toDate();
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};


const ClassesModule = () => {
  const { selectedStandard } = useContext(AuthContext);
  const navigation = useNavigation();
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get today's full day name (e.g., "Friday")
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

        // Filter schedules to include only those that match the selected standard and the current day.
        const filtered = schedules.filter((schedule) => {
          // Ensure that schedule.class and schedule.day have a default value if null.
          const scheduleClass = schedule.class || "";
          const scheduleDay = schedule.day || "";
          const standard = selectedStandard || "";
          return (
            scheduleClass.toLowerCase() === standard.toLowerCase() &&
            scheduleDay.toLowerCase() === todayFull.toLowerCase()
          );
        });

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

  // Define the schedule timezone and get the current time in that timezone.
  const scheduleTimeZone = "Asia/Kolkata";
  const currentTime = moment().tz(scheduleTimeZone);

  // Filter schedules into ongoing and upcoming based on the current time.
  const ongoingClasses = scheduleData.filter((schedule) => {
    const start = moment(schedule.startTime.toDate()).tz(scheduleTimeZone);
    const end = moment(schedule.endTime.toDate()).tz(scheduleTimeZone);
    return currentTime.isSameOrAfter(start) && currentTime.isBefore(end);
  });

  const upcomingClasses = scheduleData.filter((schedule) => {
    const start = moment(schedule.startTime.toDate()).tz(scheduleTimeZone);
    return currentTime.isBefore(start);
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
        {/* Ongoing Classes Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Ongoing Classes</Text>
          {ongoingClasses.length > 0 ? (
            ongoingClasses.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={styles.classItem}
                onPress={() => router.push("/components/Schedule")}
              >
                <View style={styles.classIcon}>
                  <Ionicons name="book" size={20} color={Colors.WHITE} />
                </View>
                <View>
                  <Text style={styles.classSubject}>{classItem.subject}</Text>
                  <Text style={styles.classInfo}>
                    {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)} • {classItem.teacher}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No ongoing classes</Text>
          )}
        </View>

        {/* Upcoming Classes Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Upcoming Classes</Text>
          {upcomingClasses.length > 0 ? (
            upcomingClasses.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={styles.classItem}
                onPress={() => router.push('/components/Schedule')}
              >
                <View style={styles.classIcon}>
                  <Ionicons name="time" size={20} color={Colors.WHITE} />
                </View>
                <View>
                  <Text style={styles.classSubject}>{classItem.subject}</Text>
                  <Text style={styles.classInfo}>
                    {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)} • {classItem.teacher}
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
});

export default React.memo(ClassesModule);
