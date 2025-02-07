import React, { useEffect, useState, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Dimensions, ActivityIndicator } from 'react-native';
import { db } from "../../configs/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AssignmentNote = React.memo(() => {
  const { selectedStandard } = useContext(AuthContext);
  const [assignmentNotes, setAssignmentNotes] = useState([]);
  const [loading, setLoading] = useState(true); // Start with true while loading data
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Assignment Notes',
    });
  }, [navigation]);

  useEffect(() => {
    const fetchAssignmentNotes = async () => {
      try {
        const notesCollectionRef = collection(db, 'AssigmentNotes');
        const querySnapshot = await getDocs(notesCollectionRef);
        const fetchedNotes = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAssignmentNotes(fetchedNotes);
      } catch (err) {
        console.error('Error fetching assignment notes:', err);
        setError('Failed to load notes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentNotes();
  }, []);

  const openDriveLink = useCallback(
    (url) => {
      if (!url) {
        Alert.alert('Invalid Link', 'This document is not currently available');
        return;
      }
      navigation.navigate('WebViewScreen', { url });
    },
    [navigation]
  );

  const renderNoteItem = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => item.drivelink && openDriveLink(item.drivelink)}
      >
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
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>🔗 Open Document</Text>
          </View>
        ) : (
          <Text style={styles.disabledLink}>🚫 Link Unavailable</Text>
        )}
      </TouchableOpacity>
    ),
    [openDriveLink]
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Notes...</Text>
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

  // Filter notes based on selectedStandard
  const filteredNotes = assignmentNotes.filter(
    (note) => note.class.toLowerCase() === selectedStandard.toLowerCase()
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Assignment Notes</Text>
        <Text style={styles.subHeader}>{selectedStandard} Study Materials</Text>
      </View>

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No notes available for {selectedStandard}
            </Text>
          </View>
        }
        renderItem={renderNoteItem}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 16,
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
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
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

export default AssignmentNote;
