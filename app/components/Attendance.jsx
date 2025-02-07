import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal,
  ActivityIndicator,
  TextInput,
  Platform,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { db } from '../../configs/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import {useNavigation} from 'expo-router'

// Define Colors locally (or import from your constants file)
const Colors = {
  WHITE: '#FFFFFF',
  PRIMARY: '#000',
  DARK: '#212121',
  SECONDARY: '#757575',
  BACKGROUND: '#F8F9FA',
  LIGHT_GRAY: '#f0f0f0',
};

// Status configurations for attendance cards
const statusIcons = {
  Present: 'check-circle',
  Absent: 'cancel',
  Late: 'access-time'
};

const statusColors = {
  Present: '#4CAF50',
  Absent: '#F44336',
  Late: '#FFC107'
};

const Attendance = () => {
  const { selectedStandard } = useContext(AuthContext);
  const navigation=useNavigation();
  useEffect(()=>{
    navigation.setOptions({
        title:''
    })
  })
//   You can also use useWindowDimensions() if you want a responsive approach
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(true);

  // Firebase data fetching
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamp to a JavaScript Date object
        date: new Date(doc.data().date.seconds * 1000)
      }));
      setAttendanceData(data);
      setFilteredData(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  console.log(attendanceData)

  // Filtering logic
  useEffect(() => {
    const filtered = attendanceData.filter(item => {
      const matchesMonth = item.date.getMonth() === selectedMonth.getMonth();
      const matchesSearch = item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.teacher.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
      return matchesMonth && matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
  }, [searchQuery, selectedStatus, selectedMonth, attendanceData]);

  // Statistics calculations
  const presentCount = filteredData.filter(item => item.status === 'Present').length;
  const LateCount = filteredData.filter(item => item.status === 'Late').length;

  const attendancePercentage = (presentCount / filteredData.length) * 100 || 0;

//   Render each attendance card
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{item.date.toDateString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status] }]}>
          <MaterialIcons 
            name={statusIcons[item.status]} 
            size={16} 
            color="white" 
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <MaterialIcons name="class" size={18} color={Colors.PRIMARY} />
          <Text style={styles.subject}>{item.subject}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={18} color={Colors.PRIMARY} />
          <Text style={styles.teacher}>{item.teacher}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{selectedStandard} Attendance</Text>
        <Text style={styles.headerSubtitle}>Overall Attendance: {attendancePercentage.toFixed(1)}%</Text>
      </View>

      {/* Statistics Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{presentCount}</Text>
          <Text style={styles.statLabel}>Present</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredData.length - presentCount}</Text>
          <Text style={styles.statLabel}>Absent</Text>
        </View>
        <View style={styles.statCard}>
        <Text style={styles.statNumber}>{LateCount}</Text>
        <Text style={styles.statLabel}>Late</Text>
 
        </View>
      </View>

      {/* Controls Section */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowCalendar(true)}
        >
          <MaterialIcons name="calendar-today" size={18} color="white" />
          <Text style={styles.filterButtonText}>
            {selectedMonth.toLocaleString('default', { month: 'long' })}
          </Text>
        </TouchableOpacity>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by subject or teacher..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        <View style={styles.statusFilter}>
          {['all', 'Present', 'Absent', 'Late'].map(status => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                selectedStatus === status && styles.selectedStatusButton
              ]}
              onPress={() => setSelectedStatus(status)}
            >
              <Text style={[
                styles.statusButtonText,
                selectedStatus === status && styles.selectedStatusText
              ]}>
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Attendance List */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="info-outline" size={40} color="#cccccc" />
              <Text style={styles.emptyText}>No attendance records found</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Calendar Modal */}
      {showCalendar &&

          <Modal visible={showCalendar} animationType="slide">
        <View style={styles.modalContainer}>
          <Calendar
            current={selectedMonth.toISOString()}
            onDayPress={(day) => {
                setSelectedMonth(new Date(day.dateString));
              setShowCalendar(false);
            }}
            markedDates={{
                [selectedMonth.toISOString().split('T')[0]]: { selected: true }
            }}
            />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowCalendar(false)}
            >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
        }
    </SafeAreaView>
  );
};

 


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'outfit-bold',
    color: Colors.PRIMARY,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.PRIMARY,
    marginTop: 8,
    fontFamily: 'outfit-regular',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 15,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: '30%',
    alignItems: 'center',
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
  statNumber: {
    fontSize: 24,
    fontFamily: 'outfit-bold',
    color: Colors.PRIMARY,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.PRIMARY,
    fontFamily: 'outfit-regular',
  },
  controls: {
    marginVertical: 10,
  },
  filterButton: {
    flexDirection: 'row',
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    // Remove "gap" if not supported; you can use margin instead.
    // gap: 8,
  },
  filterButtonText: {
    color: 'white',
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontFamily: 'outfit-regular',
    fontSize: 16,
    color: Colors.DARK,
  },
  statusFilter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Remove gap if not supported; use margin instead.
    // gap: 8,
    marginBottom: 15,
  },
  statusButton: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  selectedStatusButton: {
    backgroundColor: Colors.PRIMARY,
  },
  statusButtonText: {
    color: Colors.PRIMARY,
    fontFamily: 'outfit-medium',
    fontSize: 14,
  },
  selectedStatusText: {
    color: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  date: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: Colors.PRIMARY,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    // Remove gap if not supported.
    // gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'outfit-medium',
    color: 'white',
  },
  cardBody: {
    // Remove gap if not supported.
    // gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // Remove gap if not supported.
    // gap: 8,
    marginBottom: 4,
  },
  subject: {
    fontSize: 16,
    fontFamily: 'outfit-medium',
    color: Colors.PRIMARY,
  },
  teacher: {
    fontSize: 14,
    fontFamily: 'outfit-regular',
    color: Colors.SECONDARY,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.LIGHT_GRAY,
    marginVertical: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classText: {
    fontSize: 14,
    fontFamily: 'outfit-medium',
    color: Colors.PRIMARY,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.SECONDARY,
    fontFamily: 'outfit-regular',
    marginTop: 16,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  closeButton: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontFamily: 'outfit-medium',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default Attendance;
