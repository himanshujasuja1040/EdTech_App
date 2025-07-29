import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Image,
  TextInput,
  Share,
  SafeAreaView,
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PREMIUM_COURSE_CACHE_KEY = 'premiumCourseCache';
const PREMIUM_COURSE_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

const PremiumCourse = () => {
  const { selectedStandard, selectedStandardColor } = useContext(AuthContext);
  const [premiumCourses, setPremiumCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Premium Courses',
    });
  }, [navigation]);

  // Function to fetch courses with caching
  useEffect(() => {
    const fetchPremiumCourses = async () => {
      try {
        setLoading(true);

        // Check AsyncStorage for cached premium courses data
        const cachedDataString = await AsyncStorage.getItem(PREMIUM_COURSE_CACHE_KEY);
        if (cachedDataString) {
          const cachedData = JSON.parse(cachedDataString);
          if (cachedData?.timestamp && Date.now() - cachedData.timestamp < PREMIUM_COURSE_CACHE_EXPIRY) {
            console.log('Using cached premium courses data');
            setPremiumCourses(cachedData.data);
            setError(null);
            return;
          }
        }

        // If no valid cache, fetch from Firestore
        const coursesCollectionRef = collection(db, 'PremiumCourse');
        const querySnapshot = await getDocs(coursesCollectionRef);
        const courses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPremiumCourses(courses);
        setError(null);

        // Save the fresh data in cache with current timestamp
        await AsyncStorage.setItem(
          PREMIUM_COURSE_CACHE_KEY,
          JSON.stringify({ data: courses, timestamp: Date.now() })
        );
      } catch (err) {
        console.error('Error fetching Premium Courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumCourses();
  }, [selectedStandard]);

  // Filter courses based on selected standard and search query.
  const filteredCourses = premiumCourses.filter(
    course =>
      course.class.toLowerCase() === selectedStandard.toLowerCase() &&
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render each course item
  const renderCourseItem = useCallback(({ item }) => {
    const price = parseFloat(item.price);
    const discount = parseFloat(item.discount);
    const discountedPrice = price - (price * discount / 100);

    const handleShare = async () => {
      try {
        await Share.share({
          message: `Abhishek Bhaiya Classes \n Check out this premium course:\n\n${item.title}\nClass: ${item.class}\nPrice: ₹${discount > 0 ? discountedPrice.toFixed(0) : price.toFixed(0)}`,
        });
      } catch (error) {
        console.error('Error sharing course:', error);
      }
    };

    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <View style={styles.cardRow}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.courseImage}
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('../../assets/images/placeholder.jpeg')}
              style={styles.courseImage}
              resizeMode="cover"
            />
          )}
          <View style={styles.cardContent}>
            <View style={styles.badgesContainer}>
              <Text style={styles.classBadge}>🏫 Class {item.class}</Text>
            </View>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.priceContainer}>
              {discount > 0 ? (
                <>
                  <Text style={styles.originalPrice}>₹{price.toFixed(0)}</Text>
                  <Text style={styles.discountedPrice}>₹{discountedPrice.toFixed(0)}</Text>
                  <Text style={styles.discountBadge}>{discount}% OFF</Text>
                </>
              ) : (
                <Text style={styles.currentPrice}>₹{price.toFixed(0)}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: selectedStandardColor }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Courses...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: selectedStandardColor }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: selectedStandardColor }]}>
      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.header}>Exclusive Content : {selectedStandard}</Text>
            </View>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Courses..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>
              No premium courses available for {selectedStandard}
            </Text>
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
    height: '100%',
    backgroundColor: '#f0f4f8',
    paddingBottom: 30,
    paddingTop: 10,
  },
  headerContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 0.25,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row',
  },
  courseImage: {
    width: 120,
    height: 120,
    marginTop: 10,
    marginLeft: 10,
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  classBadge: {
    backgroundColor: '#e0f7fa',
    color: '#00796b',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 4,
    flexShrink: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e91e63',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#ffebee',
    color: '#e91e63',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    fontSize: 12,
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  shareButton: {
    marginTop: 8,
    backgroundColor: '#4caf50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#4caf50',
    fontSize: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#e91e63',
    textAlign: 'center',
    fontSize: 16,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#777',
    textAlign: 'center',
    fontSize: 16,
  },
});

export default React.memo(PremiumCourse);
