import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Dimensions, 
  Image 
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PremiumCourse = () => {
  const { selectedStandard } = useContext(AuthContext);
  const [premiumCourses, setPremiumCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Premium Courses',
    });
  }, [navigation]);

  // Fetch premium courses from Firestore's "PremiumCourse" collection.
  useEffect(() => {
    const fetchPremiumCourses = async () => {
      try {
        const coursesCollectionRef = collection(db, 'PremiumCourse');
        const querySnapshot = await getDocs(coursesCollectionRef);
        const courses = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPremiumCourses(courses);
        setError(null);
      } catch (err) {
        console.error('Error fetching Premium Courses:', err);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumCourses();
  }, [selectedStandard]);

  // Filter courses based on the selected standard.
  const filteredCourses = premiumCourses.filter(
    course => course.class.toLowerCase() === selectedStandard.toLowerCase()
  );

  // Render each course item.
  const renderCourseItem = useCallback(({ item }) => {
    // Convert price and discount from string to number.
    const price = parseFloat(item.price);
    const discount = parseFloat(item.discount);
    const discountedPrice = price - (price * discount / 100);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        
      >
        <View style={styles.cardHeader}>
          <Text style={styles.classBadge}>🏫 Class {item.class}</Text>
          <Text style={styles.courseTag}>⭐ Premium</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Display course image if available */}
        {item.image && (
          <Image
            source={{ uri: item.image }}
            style={styles.courseImage}
            resizeMode="cover"
          />
        )}

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
      </TouchableOpacity>
    );
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Courses...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Premium Courses</Text>
        <Text style={styles.subHeader}>
          {selectedStandard} Exclusive Content
        </Text>
      </View>

      <FlatList
        data={filteredCourses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 16,
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  classBadge: {
    backgroundColor: '#4CAF5020',
    color: '#2D3436',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  courseTag: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 16,
    lineHeight: 24,
  },
  courseImage: {
    width: SCREEN_WIDTH - 64,
    height: (SCREEN_WIDTH - 64) * 0.5,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  originalPrice: {
    fontSize: 16,
    color: '#636E72',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountedPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#FF408120',
    color: '#D32F2F',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2D3436',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#4CAF50',
    fontSize: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#D32F2F',
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
    color: '#636E72',
    textAlign: 'center',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default React.memo(PremiumCourse);
