import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Dimensions,
  TextInput,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ExperimentVideo = () => {
  const { selectedStandard,selectedStandardColor } = useContext(AuthContext);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Search states for filtering by Title and Subject.
  const [searchTitle, setSearchTitle] = useState('');
  const [searchSubject, setSearchSubject] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Experimental Videos',
    });
  }, [navigation]);

  const getYoutubeId = useCallback((url) => {
    return (
      url?.match(
        /(?:v=|\/v\/|\/embed\/|youtu\.be\/|\/shorts\/)([^"&?\/\s]+)/
      )?.[1] || null
    );
  }, []);


  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);

      const videosCollectionRef = collection(db, 'ExperimentVideos');
      const querySnapshot = await getDocs(videosCollectionRef);
      const fetchedVideos = querySnapshot.docs.map((doc) => ({
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
      setRefreshing(false);

    }
  }, []);



  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVideos();
  }, [fetchVideos]);

  // Filter videos based on selectedStandard, Title, and Subject.
const filteredVideos = useMemo(() => {

  return videos.filter((video) => {
    const matchesStandard = video.class.toLowerCase() === selectedStandard.toLowerCase();
    const matchesTitle = video.title.toLowerCase().includes(searchTitle.toLowerCase());
    const matchesSubject = video.subject.toLowerCase().includes(searchSubject.toLowerCase());
    return matchesStandard && matchesTitle && matchesSubject;
  });
}, [videos, selectedStandard, searchTitle, searchSubject]);

const RenderVideoItem = useCallback(
  ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.classBadge}>{item.class}</Text>
          <Text style={styles.subjectTag}>{item.subject}</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {item.youtubelink ? (
          <YoutubePlayer
            height={SCREEN_WIDTH * 0.85 * (9 / 16)}
            width={SCREEN_WIDTH * 0.85}
            videoId={getYoutubeId(item.youtubelink)}
            webViewProps={{ accessible: false }}
            webViewStyle={styles.videoPlayer}
          />
        ) : (
          <Text style={styles.noVideoText}>No video available.</Text>
        )}
      </View>
    );
  },
  [getYoutubeId] // Removed 'item' from here
);

const keyExtractor = useCallback(item => item.id, []);

if (loading) {
  return (
    <SafeAreaView style={[styles.centerContainer,{backgroundColor:selectedStandardColor}]}>
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text style={styles.loadingText}>Loading Experiments...</Text>
    </SafeAreaView>
  );
}

if (error) {
  return (
    <SafeAreaView style={[styles.centerContainer,,{backgroundColor:selectedStandardColor}]}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorText}>{error}</Text>
    </SafeAreaView>
  );
}

return (
      <SafeAreaView style={[styles.container,{backgroundColor:selectedStandardColor}]}>

  <FlatList
    data={filteredVideos}
    keyExtractor={keyExtractor}
    renderItem={RenderVideoItem}
    ListHeaderComponent={() => (
      <View>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>{selectedStandard} Demonstration Videos</Text>
      </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholderTextColor="#888"
            placeholder="Search by Title"
            value={searchTitle}
            onChangeText={setSearchTitle}
          />
          <TextInput
            style={styles.searchInput}
            placeholderTextColor="#888"
            placeholder="Search by Subject"
            value={searchSubject}
            onChangeText={setSearchSubject}
          />
        </View>
      </View>
    )}
    ListEmptyComponent={
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📹</Text>
        <Text style={styles.emptyText}>
          No experiments available for {selectedStandard}
        </Text>
      </View>
    }
    contentContainerStyle={styles.listContent}
    showsVerticalScrollIndicator={false}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
    }
    initialNumToRender={5}
    windowSize={10}
    maxToRenderPerBatch={5}
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

    paddingBottom:40,
  },
  headerContainer: {
    paddingHorizontal: 5,
  },
  header: {
    fontSize: 22, // Increased font size for better visibility
    fontWeight: 'bold', // Changed to bold for emphasis
    color: '#2c3e50', // Darker color for better readability
    textAlign: 'center',
    marginVertical: 12, // Increased margin for better spacing
    letterSpacing: 1,
  },
  subHeader: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7', // Changed to a softer gray color
    borderRadius: 8, // More rounded corners
    padding: 12, // Increased padding for better touch area
    fontSize: 16,
    marginBottom: 12, // Increased spacing between inputs
    backgroundColor: '#ffffff', // Keeping input background white
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4, // Adding shadow for depth
    elevation: 2,
  },
  card: {

    backgroundColor: '#ffffff',
    borderRadius: 15, // More pronounced rounded corners
    marginHorizontal: 10,
    marginBottom: 20, // Increased spacing for better separation
    padding: 16, // Increased padding for a spacious feel
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
