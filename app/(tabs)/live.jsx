import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { useNavigation } from 'expo-router';
import { WebView } from 'react-native-webview';
import YoutubePlayer from 'react-native-youtube-iframe';

const Live = () => {
  const navigation = useNavigation();
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // The default video URL (for demonstration)
  const defaultUrl = 'https://www.youtube.com/watch?v=4tzzmiBCWQU';
  // We'll store the live stream URL here.
  const [liveUrl, setLiveUrl] = useState(defaultUrl);

  // Get window dimensions dynamically
  const { width } = useWindowDimensions();
  // Set a max width for larger screens (web/desktop) so the content doesn't stretch too far.
  const containerMaxWidth = 800;
  // Calculate container width as 90% of screen width (or max width)
  const containerWidth = Math.min(width * 0.9, containerMaxWidth);
  
  // Calculate player dimensions maintaining a 16:9 ratio.
  const playerWidth = containerWidth;
  const playerHeight = (playerWidth * 9) / 16;

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Simulated polling function.
  // In a real app, call the YouTube Data API (with your API key) here to check if your channel is live.
  const fetchLiveStreamUrl = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate a 50% chance that the channel is live.
        const isLive = Math.random() < 0.5;
        if (isLive) {
          // When live, return the same URL (or a new one if available)
          resolve(defaultUrl);
        } else {
          resolve(null);
        }
      }, 1000);
    });
  };

  // Set up polling every 60 seconds.
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveStreamUrl().then((live) => {
        if (live) {
          setLiveUrl(live);
        } else {
          setLiveUrl(null);
        }
      });
    }, 60000); // every 60 seconds

    // Perform an initial check.
    fetchLiveStreamUrl().then((live) => {
      setLiveUrl(live ? live : null);
      setLoading(false);
    });

    return () => clearInterval(interval);
  }, []);

  // Helper function to extract the YouTube video ID from various URL formats.
  function getYoutubeId(url) {
    if (!url) return null;
    const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|watch\?.+&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[1].length === 11) ? match[1] : null;
  }

  // Build the embed URL for the hidden WebView (to extract metadata).
  const embedUrl = liveUrl ? `https://www.youtube.com/embed/${getYoutubeId(liveUrl)}?autoplay=0` : null;

  // Inject JavaScript into the WebView to extract (for example) the document title after 3 seconds.
  const injectedJS = `
    setTimeout(() => {
      const info = { title: document.title };
      window.ReactNativeWebView.postMessage(JSON.stringify(info));
    }, 3000);
    true;
  `;

  // When the hidden WebView sends data, update our state.
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      setVideoInfo(data);
    } catch (error) {
      console.error('Error parsing message from WebView:', error);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={[styles.container, { width: containerWidth }]}>
        <Text style={styles.headerTitle}>Live Lecture Streaming</Text>
        {liveUrl ? (
          <>
            <View style={[styles.playerContainer, { width: playerWidth, height: playerHeight }]}>
              <YoutubePlayer
                height={playerHeight}
                width={playerWidth}
                videoId={getYoutubeId(liveUrl)}
                play={false}
              />
            </View>
            {/* Hidden WebView to extract video info */}
            <WebView
              source={{ uri: embedUrl }}
              injectedJavaScript={injectedJS}
              onMessage={handleMessage}
              style={{ height: 0, width: 0 }}
            />
            {videoInfo && (
              <View style={styles.videoInfoContainer}>
                <Text style={styles.videoTitle}>Title: {videoInfo.title}</Text>
              </View>
            )}
          </>
        ) : (
          <Text style={styles.noLiveText}>No live stream currently. Please check back later.</Text>
        )}
        {loading && <ActivityIndicator size="large" color="#2A4D69" style={{ marginTop: 16 }} />}
      </View>
    </View>
  );
};

export default Live;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f4f6fa',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 40 : 20,
    paddingHorizontal: 10,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    // Shadows for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
    color: '#2A4D69',
    fontWeight: '700',
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
  noLiveText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});
