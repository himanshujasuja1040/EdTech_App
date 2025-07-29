import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useNavigation } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../configs/firebaseConfig';
import { AuthContext } from '../AuthContext/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Live = () => {
  const navigation = useNavigation();
  const { selectedStandardColor } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [liveVideos, setLiveVideos] = useState([]); // Array to hold all live videos

  // Responsive layout dimensions.
  const { width, height } = useWindowDimensions();
  const isPortrait = height >= width;

  // Adjust container width based on orientation.
  const containerMaxWidth = 800;
  const containerWidth = Math.min(width * (isPortrait ? 0.9 : 0.8), containerMaxWidth);
  const playerWidth = containerWidth;
  const playerHeight = (playerWidth * 9) / 16; // Maintain a 16:9 aspect ratio

  // Hide header (Expo Router).
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Load cached live videos on mount.
  useEffect(() => {
    const loadCachedVideos = async () => {
      try {
        const cached = await AsyncStorage.getItem('liveVideos');
        if (cached) {
          setLiveVideos(JSON.parse(cached));
          setLoading(false);
        }
      } catch (error) {
        console.error('Error retrieving cached live videos:', error);
      }
    };
    loadCachedVideos();
  }, []);

  // Listen to all live video details from Firestore.
  useEffect(() => {
    const liveVideoQuery = query(
      collection(db, 'liveVideoDetail'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(
      liveVideoQuery,
      (snapshot) => {
        const videos = snapshot.docs.map((doc) => doc.data());
        setLiveVideos(videos);
        // Update cache with the new live videos data.
        AsyncStorage.setItem('liveVideos', JSON.stringify(videos))
          .catch((err) => console.error('Error caching live videos:', err));
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching live video detail:', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Helper function to extract the YouTube video ID from various URL formats.
  const getYoutubeId = useCallback((url) => {
    if (!url) return null;
    const regExp =
      /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
  }, []);

  return (
    <SafeAreaView style={[styles.outerContainer, { backgroundColor: selectedStandardColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.headerTitle}>Live Lecture Streaming</Text>
        {loading && (
          <ActivityIndicator
            size="large"
            color="#2A4D69"
            style={{ marginVertical: 16 }}
          />
        )}
        {!loading && liveVideos.length > 0 ? (
          liveVideos.map((video, index) => (
            <View key={index} style={[styles.videoCard, { width: containerWidth }]}>
              <View
                style={[
                  styles.playerContainer,
                  { width: playerWidth, height: playerHeight },
                ]}
              >
                <YoutubePlayer
                  height={playerHeight}
                  width={playerWidth}
                  videoId={getYoutubeId(video.url)}
                  play={false}
                />
              </View>
              <View style={styles.videoInfoContainer}>
                <Text style={styles.videoTitle}>Title: {video.title}</Text>
                {video.createdAt && (
                  <Text style={styles.videoSubtitle}>
                    Date: {new Date(video.createdAt.seconds * 1000).toLocaleString()}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          !loading && (
            <Text style={styles.noLiveText}>
              No live stream currently. Please check back later.
            </Text>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Live;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f4f6fa',
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#2A4D69',
    fontWeight: '700',
  },
  videoCard: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    // iOS shadow properties
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Android elevation
    elevation: 5,
  },
  playerContainer: {
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    marginBottom: 16,
  },
  videoInfoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#eef1f8',
    borderRadius: 10,
    alignItems: 'center',
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2A4D69',
  },
  videoSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  noLiveText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});
