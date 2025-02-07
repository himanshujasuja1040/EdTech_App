import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { Colors } from '../../constants/Colors';
import { useNavigation } from 'expo-router';

const Schedule = () => {
    const { selectedStandard } = useContext(AuthContext);
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();

    // Days of the week (short names)
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    // Get today's full day name (e.g., "Monday")
    const todayFull = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const [selectedDay, setSelectedDay] = useState(todayFull);

    useEffect(() => {
        navigation.setOptions({
            title: 'Schedule',
            headerTitle: () => <Text style={{ fontSize: 24, fontFamily: 'outfit-medium' }}>Schedule</Text>,
        });
    }, [navigation]);

    // Fetch schedules from Firestore using onSnapshot for real-time updates.
    useEffect(() => {
        setLoading(true);
        const schedulesRef = collection(db, 'Schedules');
        const unsubscribe = onSnapshot(
            schedulesRef,
            (querySnapshot) => {
                const schedules = querySnapshot.docs.map(doc => ({
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

    // Filter schedules based on the selected day and selected standard.
    const filteredSchedules = scheduleData.filter(
        schedule =>
            schedule.day.toLowerCase() === selectedDay.toLowerCase() &&
            schedule.class.toLowerCase() === selectedStandard.toLowerCase()
    );

    // Render each day button in the horizontal day list.
    const renderDayItem = ({ item }) => {
        // Map short day names to full day names.
        const fullDayName = {
            Mon: 'Monday',
            Tue: 'Tuesday',
            Wed: 'Wednesday',
            Thu: 'Thursday',
            Fri: 'Friday',
            Sat: 'Saturday',
            Sun: 'Sunday'
        }[item];

        const isSelected = selectedDay.toLowerCase() === fullDayName.toLowerCase();

        return (
            <TouchableOpacity
                style={[
                    styles.dayButton,
                    isSelected && styles.selectedDay,
                    { width: SCREEN_WIDTH / 7.5 }
                ]}
                onPress={() => setSelectedDay(fullDayName)}
            >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>{item}</Text>
                {isSelected && <View style={styles.dayIndicator} />}
            </TouchableOpacity>
        );
    };

    // Render each schedule card.
    const renderScheduleItem = ({ item }) => (
        <View style={[
            styles.scheduleCard,
            { 
                marginHorizontal: SCREEN_WIDTH > 500 ? 20 : 8,
                padding: SCREEN_WIDTH > 500 ? 24 : 16 
            }
        ]}>
            <View style={styles.timeContainer}>
                {/* Using clock emoji instead of an icon */}
                <Text style={{ fontSize: 20, color: "#5E35B1" }}>⏰</Text>
                <Text style={styles.timeText}>
                    {item.startTime} - {item.endTime}
                </Text>
            </View>
            
            <Text style={styles.subjectText}>{item.subject}</Text>
            
            <View style={styles.detailRow}>
                {/* Using person emoji instead of an icon */}
                <Text style={{ fontSize: 16, color: "#757575" }}>👤</Text>
                <Text style={styles.detailText}>{item.teacher}</Text>
            </View>
            
            <View style={styles.detailRow}>
                {/* Using location emoji instead of an icon */}
                <Text style={{ fontSize: 16, color: "#757575" }}>📍</Text>
                <Text style={styles.detailText}>{item.venue}</Text>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#5E35B1" />
                <Text style={styles.loadingText}>Loading Schedule...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={{ fontSize: 48, color: "#D32F2F" }}>⚠️</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>{selectedStandard} Schedule</Text>
                <Text style={styles.subHeader}>{selectedDay}</Text>
            </View>

            <FlatList
                horizontal
                data={daysOfWeek}
                renderItem={renderDayItem}
                keyExtractor={item => item}
                contentContainerStyle={styles.daysContainer}
                showsHorizontalScrollIndicator={false}
                style={styles.daysList}
            />

            <FlatList
                data={filteredSchedules}
                renderItem={renderScheduleItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: SCREEN_HEIGHT * 0.1 }
                ]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {/* Using an empty box emoji */}
                        <Text style={{ fontSize: 48, color: "#BDBDBD" }}>📭</Text>
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
        backgroundColor: Colors.WHITE
    },
    headerContainer: {
        padding: 20,
        backgroundColor: Colors.WHITE,
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
    },
    daysContainer: {
        paddingVertical: 16,
        paddingHorizontal: 8,
    },
    dayButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 16,
        backgroundColor: Colors.LIGHT_GRAY,
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
        backgroundColor: '#FFFFFF',
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
    emptyText: {
        color: '#9E9E9E',
        fontSize: 18,
        marginTop: 16,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
    },
});

export default React.memo(Schedule);
