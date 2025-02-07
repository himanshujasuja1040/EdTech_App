import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions } from 'react-native';
import { db } from '../../configs/firebaseConfig'; // Your Firestore instance
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from 'expo-router';
import YoutubePlayer from "react-native-youtube-iframe";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ExperimentVideo = () => {
  const { selectedStandard } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Experimental Videos',
    });
  }, [navigation]);

  const getYoutubeId = useCallback((url) => {
    return url?.match(/(?:v=|\/v\/|\/embed\/|youtu\.be\/|\/shorts\/)([^"&?\/\s]+)/)?.[1] || null;
  }, []);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videosCollectionRef = collection(db, 'ExperimentVideos');
        const querySnapshot = await getDocs(videosCollectionRef);
        const fetchedVideos = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVideos(fetchedVideos);
        setError(null);
      } catch (err) {
        console.error('Error fetching videos:', err);
        setError('Failed to load videos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const renderVideoItem = useCallback(({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.classBadge}>🔬 {item.class}</Text>
        <Text style={styles.subjectTag}>{item.subject}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>

      {item.youtubelink ? (
        <YoutubePlayer
          height={SCREEN_WIDTH * 0.85 * (9 / 16)} // Maintain a 16:9 aspect ratio
          width={SCREEN_WIDTH * 0.85}
          videoId={getYoutubeId(item.youtubelink)}
          webViewProps={{ accessible: false }}
          webViewStyle={styles.videoPlayer}
        />
      ) : (
        <Text style={styles.noVideoText}>No video available.</Text>
      )}
    </View>
  ), [getYoutubeId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Experiments...</Text>
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

  const filteredVideos = videos.filter(video =>
    video.class.toLowerCase() === selectedStandard.toLowerCase()
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Science Experiments</Text>
        <Text style={styles.subHeader}>{selectedStandard} Demonstration Videos</Text>
      </View>

      <FlatList
        data={filteredVideos}
        keyExtractor={item => item.id}
        renderItem={renderVideoItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📹</Text>
            <Text style={styles.emptyText}>
              No experiments available for {selectedStandard}
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
  },
  subHeader: {
    fontSize: 16,
    color: '#636E72',
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
  subjectTag: {
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
  videoPlayer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  noVideoText: {
    fontSize: 14,
    color: '#636E72',
    textAlign: 'center',
    marginVertical: 16,
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

export default React.memo(ExperimentVideo);
