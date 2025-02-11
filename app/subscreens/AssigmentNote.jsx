import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { db } from "../../configs/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';

const AssignmentNote = React.memo(() => {
  const { selectedStandard,selectedStandardColor } = useContext(AuthContext);
  const [assignmentNotes, setAssignmentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Search states for filtering by Title and Subject
  const [searchTitle, setSearchTitle] = useState('');
  const [searchSubject, setSearchSubject] = useState('');

  // Get current screen dimensions for responsive styling.
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  useEffect(() => {
    navigation.setOptions({
      title: 'Assignment Notes',
    });
  }, [navigation]);

  const fetchAssignmentNotes = useCallback(async () => {
    try {
      setLoading(true);
      const notesCollectionRef = collection(db, 'AssigmentNotes');
      const querySnapshot = await getDocs(notesCollectionRef);
      const fetchedNotes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAssignmentNotes(fetchedNotes);
      setError(null);
    } catch (err) {
      console.error('Error fetching assignment notes:', err);
      setError('Failed to load notes. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignmentNotes();
  }, [fetchAssignmentNotes]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignmentNotes();
  }, [fetchAssignmentNotes]);

  const openDriveLink = useCallback((url) => {
    if (!url) {
      Alert.alert('Invalid Link', 'This document is not currently available');
      return;
    }
    router.push({
      pathname: '/helper/WebViewScreen',
      params: { url },
    });
  }, []);

  // Filter notes based on selected standard and search inputs.
  const filteredNotes = useMemo(() => {
    return assignmentNotes.filter((note) => {
      const matchesStandard =
        note.class.toLowerCase() === selectedStandard.toLowerCase();
      const matchesTitle = note.title
        .toLowerCase()
        .includes(searchTitle.toLowerCase());
      const matchesSubject = note.subject
        .toLowerCase()
        .includes(searchSubject.toLowerCase());
      return matchesStandard && matchesTitle && matchesSubject;
    });
  }, [assignmentNotes, selectedStandard, searchTitle, searchSubject]);

  const RenderNoteItem = useCallback(
    ({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.classTag}>{item.class}</Text>
        </View>

        <View style={styles.metaContainer}>
          <Text style={styles.subject} numberOfLines={1}>
            📚 {item.subject}
          </Text>
          <Text style={styles.detail} numberOfLines={3}>
            {item.detail}
          </Text>
        </View>

        {item.drivelink ? (
          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => openDriveLink(item.drivelink)}
          >
            <Text style={styles.linkText}>🔗 Open Document</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.disabledLink}>🚫 Link Unavailable</Text>
        )}
      </View>
    ),
    [openDriveLink]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer,{backgroundColor:selectedStandardColor}]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Notes...</Text>
      </SafeAreaView>
    );
  }

  if (error && assignmentNotes.length === 0) {
    return (
      <SafeAreaView style={[styles.centerContainer,{backgroundColor:selectedStandardColor}]}>
        <Text style={{ fontSize: 48, color: "#D32F2F" }}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container,{backgroundColor:selectedStandardColor}]}>
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RenderNoteItem item={item} />}
        ListHeaderComponent={
          <View>
            <View style={styles.headerContainer}>
              <Text style={styles.header}>
                {selectedStandard} Study Materials
              </Text>
            </View>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Title"
                placeholderTextColor="#888"
                value={searchTitle}
                onChangeText={setSearchTitle}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by Subject"
                placeholderTextColor="#888"
                value={searchSubject}
                onChangeText={setSearchSubject}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyText}>
                      No Assigment found for {selectedStandard} Matching Your SEarch 
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
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerContainer: {
    paddingHorizontal: 24,
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
    marginBottom: 12,
  },
  searchContainer: {
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: '#FFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
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
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: '#2D3436',
    flex: 1,
    marginRight: 12,
  },
  classTag: {
    backgroundColor: '#4CAF5055',
    color: '#2D3436',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '500',
  },
  metaContainer: {
    marginBottom: 12,
  },
  subject: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
    fontWeight: '500',
  },
  detail: {
    fontSize: 14,
    color: '#636E72',
    lineHeight: 20,
  },
  linkContainer: {
    backgroundColor: '#4CAF5020',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#4CAF50',
    fontWeight: '500',
    fontSize: 16,
  },
  disabledLink: {
    color: '#636E72',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
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
    fontWeight: '500',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontSize: 16,
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

export default React.memo(AssignmentNote);
