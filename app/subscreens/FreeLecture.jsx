import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from 'expo-router';
import YoutubePlayer from "react-native-youtube-iframe";
import WebView from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function to extract a YouTube video ID from a URL.
const getYoutubeId = (url) => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]+)/,
  );
  return match?.[1] || null;
};

const LECTURE_CACHE_KEY = 'freeLectures';
const LECTURE_CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour

const FreeLecture = () => {
  const { selectedStandard, selectedStandardColor, selectedTopic, selectedSubject } = useContext(AuthContext);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // New search state variables.
  const [subjectQuery, setSubjectQuery] = useState(selectedSubject || '');
  const [globalQuery, setGlobalQuery] = useState(selectedTopic||'');

  useEffect(() => {
    navigation.setOptions({ title: 'Lectures' });
  }, [navigation]);

  // Fetch lectures from the "FreeLecture" collection with caching.
  const fetchLectures = useCallback(async () => {
    try {
      setLoading(true);

      // Check AsyncStorage for cached lectures.
      const cachedDataString = await AsyncStorage.getItem(LECTURE_CACHE_KEY);
      if (cachedDataString) {
        const cachedData = JSON.parse(cachedDataString);
        if (cachedData?.timestamp && (Date.now() - cachedData.timestamp < LECTURE_CACHE_EXPIRY)) {
          console.log('Using cached lectures data');
          setLectures(cachedData.data);
          setError(null);
          return;
        }
      }

      // No valid cache: fetch from Firebase.
      const lecturesCollectionRef = collection(db, 'FreeLecture');
      const querySnapshot = await getDocs(lecturesCollectionRef);
      const fetchedLectures = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLectures(fetchedLectures);
      setError(null);

      // Cache the fetched lectures with a timestamp.
      await AsyncStorage.setItem(
        LECTURE_CACHE_KEY,
        JSON.stringify({ data: fetchedLectures, timestamp: Date.now() })
      );
    } catch (err) {
      console.error('Error fetching lectures:', err);
      setError('Failed to load lectures. Please check your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);
  
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLectures();
  }, [fetchLectures]);

  // Filter lectures based on the selected standard and search queries.
  const filteredLectures = useMemo(() => {
    const lowerStd = (selectedStandard || '').toLowerCase();
    return lectures.filter((lecture) => {
      if ((lecture.class || '').toLowerCase() !== lowerStd) {
        return false;
      }
      if (
        subjectQuery.trim() !== '' &&
        !(lecture.subject || '').toLowerCase().includes(subjectQuery.toLowerCase())
      ) {
        return false;
      }
      if (globalQuery.trim() !== '') {
        const queryLower = globalQuery.toLowerCase();
        if (
          !((lecture.title || '').toLowerCase().includes(queryLower)) &&
          !((lecture.subject || '').toLowerCase().includes(queryLower))
        ) {
          return false;
        }
      }
      return true;
    });
  }, [lectures, selectedStandard, subjectQuery, globalQuery]);
  
  // Lecture card component with YouTube player at the bottom.
  const LectureCard = ({ item }) => {
    return (
      <View style={styles.lectureCard}>
        {/* Header Section */}
        <View style={styles.cardHeader}>
          <Text style={styles.classBadge}>{item.class}</Text>
          <Text style={styles.duration}>🎥 Video Lecture</Text>
        </View>

        {/* Lecture Details */}
        <View style={styles.cardContent}>
          <Text style={styles.topTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.subjectText}>
            Subject: {item.subject}
          </Text>
        </View>

        {/* YouTube Player Section (at the bottom) */}
        <View style={styles.videoContainer}>
          {item.youtubelink ? (
            <YoutubePlayer
              height={SCREEN_WIDTH * 0.56} // Maintain a 16:9 aspect ratio
              width={SCREEN_WIDTH * 0.85}
              videoId={getYoutubeId(item.youtubelink)}
              play={false}
              webViewStyle={styles.videoPlayer}
            />
          ) : (
            <Text style={styles.noVideoText}>No video available.</Text>
          )}
        </View>
      </View>
    );
  };

  const renderLecture = useCallback(({ item }) => <LectureCard item={item} />, []);
  const keyExtractor = useCallback(item => item.id, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.centeredContainer, { backgroundColor: selectedStandardColor }]}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Loading Lectures...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.centeredContainer, { backgroundColor: selectedStandardColor }]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchLectures} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: selectedStandardColor }]}>
      <FlatList
        data={filteredLectures}
        renderItem={renderLecture}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <Text style={styles.header}>📚 Free Lectures</Text>
            {/* Search Bars */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by subject..."
                placeholderTextColor="#888"
                value={subjectQuery}
                onChangeText={setSubjectQuery}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search lectures..."
                placeholderTextColor="#888"
                value={globalQuery}
                onChangeText={setGlobalQuery}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No lectures available for {selectedStandard}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        initialNumToRender={5}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginVertical: 12,
    letterSpacing: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lectureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  classBadge: {
    backgroundColor: '#3498db',
    color: '#ffffff',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 25,
    fontSize: 16,
    fontWeight: '600',
  },
  duration: {
    color: '#7f8c8d',
    fontSize: 15,
    fontWeight: '600',
  },
  cardContent: {
    marginBottom: 18,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 6,
    lineHeight: 24,
  },
  subjectText: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  videoContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  videoPlayer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  noVideoText: {
    fontSize: 15,
    color: '#e74c3c',
    textAlign: 'center',
    marginVertical: 20,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#636e72',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#e74c3c',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 35,
    borderRadius: 25,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#95a5a6',
  },
  emptyText: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 30,
  },
});

export default React.memo(FreeLecture);
