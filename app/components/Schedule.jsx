import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import Colors from '../../constants/Colors';
import { useNavigation } from 'expo-router';

// --- Constants that don't change between renders ---
const DAY_MAPPING = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Schedule = () => {
  const { selectedStandard, selectedStandardColor } = useContext(AuthContext);
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const navigation = useNavigation();

  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize today's full day name (e.g., "Monday")
  const todayFull = useMemo(
    () => new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    []
  );
  const [selectedDay, setSelectedDay] = useState(todayFull);

  // Dynamically set header options (adjusts title font size based on screen width)
  useEffect(() => {
    navigation.setOptions({
      title: 'Schedule',
      headerTitle: () => (
        <Text style={{ fontSize: SCREEN_WIDTH > 500 ? 26 : 24, fontFamily: 'outfit-medium' }}>
          Schedule
        </Text>
      ),
    });
  }, [navigation, SCREEN_WIDTH]);

  // Listen to Firestore for real-time schedule updates.
  useEffect(() => {
    setLoading(true);
    const schedulesRef = collection(db, 'Schedules');
    const unsubscribe = onSnapshot(
      schedulesRef,
      (querySnapshot) => {
        const schedules = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setScheduleData(schedules);
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching schedules:', err);
        setError('Failed to load schedule');
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [selectedStandard]);

  // Memoize filtered schedules based on the selected day and standard.
  const filteredSchedules = useMemo(
    () =>
      scheduleData.filter(
        (schedule) =>
          schedule.day.toLowerCase() === selectedDay.toLowerCase() &&
          schedule.class.toLowerCase() === selectedStandard.toLowerCase()
      ),
    [scheduleData, selectedDay, selectedStandard]
  );

  // Memoize dynamic button width based on screen width.
  const dayButtonWidth = useMemo(() => SCREEN_WIDTH / 7.5, [SCREEN_WIDTH]);

  // Render each day button.
  const renderDayItem = useCallback(
    ({ item }) => {
      const fullDayName = DAY_MAPPING[item];
      const isSelected = selectedDay.toLowerCase() === fullDayName.toLowerCase();

      return (
        <TouchableOpacity
          style={[
            styles.dayButton,
            isSelected && styles.selectedDay,
            { width: dayButtonWidth },
          ]}
          onPress={() => setSelectedDay(fullDayName)}
        >
          <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
            {item}
          </Text>
          {isSelected && <View style={styles.dayIndicator} />}
        </TouchableOpacity>
      );
    },
    [dayButtonWidth, selectedDay]
  );

  // Render each schedule card.
  const renderScheduleItem = useCallback(
    ({ item }) => {
      // Format Firestore Timestamps to "HH:MM" format.
      const formatTime = (timestamp) =>
        timestamp && typeof timestamp.toDate === 'function'
          ? timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : timestamp;

      return (
        <View
          style={[
            styles.scheduleCard,
            {
              marginHorizontal: SCREEN_WIDTH > 500 ? 20 : 8,
              padding: SCREEN_WIDTH > 500 ? 24 : 16,
            },
          ]}
        >
          <View style={styles.timeContainer}>
            <Text style={styles.emoji}>⏰</Text>
            <Text style={styles.timeText}>
              {formatTime(item.startTime)} - {formatTime(item.endTime)}
            </Text>
          </View>
          <Text style={styles.subjectText}>{item.subject}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailEmoji}>👤</Text>
            <Text style={styles.detailText}>{item.teacher}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailEmoji}>📍</Text>
            <Text style={styles.detailText}>{item.venue}</Text>
          </View>
        </View>
      );
    },
    [SCREEN_WIDTH]
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: selectedStandardColor }]}>
        <ActivityIndicator size="large" color="#5E35B1" />
        <Text style={styles.loadingText}>Loading Schedule...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: selectedStandardColor }]}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: selectedStandardColor }]}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{selectedStandard} Schedule</Text>
        <Text style={styles.subHeader}>{selectedDay}</Text>
      </View>

      {/* Horizontal Day List */}
      <FlatList
        horizontal
        data={DAYS_OF_WEEK}
        renderItem={renderDayItem}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.daysContainer}
        showsHorizontalScrollIndicator={false}
        style={styles.daysList}
      />

      {/* Schedule List */}
      <FlatList
        data={filteredSchedules}
        renderItem={renderScheduleItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: SCREEN_HEIGHT * 0.1 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No classes today</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    margin: 16,
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY || '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'outfit-medium',
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  subHeader: {
    fontSize: 18,
    fontFamily: 'outfit-medium',
    color: Colors.GRAY,
    fontWeight: '500',
  },
  daysList: {
    maxHeight: 80,
    paddingHorizontal: 12,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  dayButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.LIGHT_GRAY || '#E0E0E0',
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: Colors.PRIMARY,
  },
  dayText: {
    color: Colors.PRIMARY,
    fontSize: 15,
    fontWeight: '600',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  dayIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  scheduleCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 20,
    color: '#5E35B1',
  },
  timeText: {
    color: '#5E35B1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  subjectText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailEmoji: {
    fontSize: 16,
    color: '#757575',
  },
  detailText: {
    color: '#616161',
    fontSize: 16,
    marginLeft: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#5E35B1',
    fontSize: 16,
    fontWeight: '500',
  },
  errorEmoji: {
    fontSize: 48,
    color: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 16,
    marginTop: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyEmoji: {
    fontSize: 48,
    color: '#BDBDBD',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    fontFamily: 'outfit-regular',
    color: Colors.GRAY,
    fontSize: 18,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});

export default React.memo(Schedule);
