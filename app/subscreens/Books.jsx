import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { db } from '../../configs/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AuthContext/AuthContext';
import { useNavigation } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true); // Set true to show loading until data is fetched
  const [error, setError] = useState(null);
  const { selectedStandard } = useContext(AuthContext);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Books',
    });
  }, [navigation]);

  // Fetch books from the "Books" collection using the modular Firebase SDK
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksCollectionRef = collection(db, 'Books');
        const querySnapshot = await getDocs(booksCollectionRef);
        const fetchedBooks = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setBooks(fetchedBooks);
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Filter books based on the selected standard
  const filteredBooks = useMemo(() =>
    books.filter(book => book.class.toLowerCase() === selectedStandard.toLowerCase()),
    [books, selectedStandard]
  );

  const handleOpenBook = useCallback((url) => {
    if (!url) {
      Alert.alert('Invalid Link', 'This book is not currently available');
      return;
    }
    // navigation.navigate('WebViewScreen', { url });
  }, [navigation]);

  const BookItem = useCallback(({ item }) => (
    <TouchableOpacity 
      style={styles.bookCard}
      activeOpacity={0.9}
      onPress={() => item.drivelink && handleOpenBook(item.drivelink)}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image 
            source={{ uri: item.image }} 
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>📚 No Preview Available</Text>
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.classTag}>Class {item.class}</Text>
          <Text style={styles.subject} numberOfLines={1}>{item.subject}</Text>
        </View>
        <Text style={styles.detailText} numberOfLines={3}>{item.detail}</Text>
      </View>

      {item.drivelink && (
        <TouchableOpacity 
          onPress={() => handleOpenBook(item.drivelink)}
          style={styles.linkContainer}
          activeOpacity={0.8}
        >
          <Text style={styles.linkText}>📖 Open Book</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  ), [handleOpenBook]);

  const keyExtractor = useCallback(item => item.id, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading Books...</Text>
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
        <Text style={styles.header}>Available Books</Text>
        <Text style={styles.subHeader}>{selectedStandard} Study Materials</Text>
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={keyExtractor}
        renderItem={({ item }) => <BookItem item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              No books found for {selectedStandard}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={3}
        maxToRenderPerBatch={5}
        windowSize={5}
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
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: SCREEN_WIDTH * 0.6,
    borderRadius: 8,
  },
  placeholderImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.6,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderText: {
    color: '#90A4AE',
    fontSize: 14,
    fontWeight: '500',
  },
  textContainer: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
    lineHeight: 24,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTag: {
    backgroundColor: '#4CAF5020',
    color: '#2D3436',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  subject: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    flex: 1,
  },
  detailText: {
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
    fontWeight: '600',
    fontSize: 16,
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

export default React.memo(Books);
