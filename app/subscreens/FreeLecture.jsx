import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from 'expo-router';
import YoutubePlayer from "react-native-youtube-iframe";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function to extract a YouTube video ID from a URL.
const getYoutubeId = (url) => {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]+)/,
  );
  return match?.[1] || null;
};

const FreeLecture = () => {
  const { selectedStandard } = useContext(AuthContext);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true); // Start loading as true
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: 'Lectures' });
  }, [navigation]);

  // Fetch lectures from the "FreeLecture" collection using the modular Firestore SDK.
  const fetchLectures = useCallback(async () => {
    try {
      const lecturesCollectionRef = collection(db, 'FreeLecture');
      const querySnapshot = await getDocs(lecturesCollectionRef);
      const fetchedLectures = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLectures(fetchedLectures);
      setError(null);
    } catch (err) {
      console.error('Error fetching lectures:', err);
      setError('Failed to load lectures. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  // Filter lectures based on the selected standard.
  const filteredLectures = useMemo(() => {
    const lowerStd = selectedStandard.toLowerCase();
    return lectures.filter((lecture) => lecture.class.toLowerCase() === lowerStd);
  }, [lectures, selectedStandard]);

  // Lecture card component to display each lecture.
  const LectureCard = ({ item }) => {
    return (
      <View style={styles.lectureCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.classBadge}>{item.class}</Text>
          <Text style={styles.duration}>🎥 Video Lecture</Text>
        </View>
        <Text style={styles.topTitle} numberOfLines={2}>
          {item.title}
        </Text>
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
    );
  };

  const renderLecture = useCallback(({ item }) => <LectureCard item={item} />, []);
  const keyExtractor = useCallback(item => item.id, []);

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#1e90ff" />
        <Text style={styles.loadingText}>Loading Lectures...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchLectures} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📚 Free Lectures</Text>
      <FlatList
        data={filteredLectures}
        renderItem={renderLecture}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No lectures available for {selectedStandard}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 5,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    color: '#2d3436',
    textAlign: 'center',
    marginVertical: 8,
    letterSpacing: 0.5,
  },
  lectureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
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
    backgroundColor: '#1e90ff',
    color: 'white',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  duration: {
    color: '#636e72',
    fontSize: 14,
    fontWeight: '500',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3436',
    marginBottom: 8,
    lineHeight: 22,
  },
  videoPlayer: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  noVideoText: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    marginVertical: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#636e72',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d63031',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    paddingHorizontal: 32,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
  },
});

export default React.memo(FreeLecture);
