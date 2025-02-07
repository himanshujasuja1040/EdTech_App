import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import { router, useNavigation } from 'expo-router';

const Profile = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        navigation.setOptions({
            title:''
        })
    }, [])

    // Fetch user data from Firebase on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userData]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <View style={styles.avatarContainer}>
                    {userData?.photoURL ? (
                        <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
                    ) : (
                        <Ionicons name="person-circle" size={100} color={Colors.PRIMARY} />
                    )}
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>{userData.fullName || "User Name"}</Text>
                    <Text style={styles.email}>{userData.email || "user@example.com"}</Text>
                    {userData.selectedStandard && (
                        <Text style={styles.class}>{userData.selectedStandard}</Text>
                    )}
                </View>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Me</Text>
                <Text style={styles.sectionText}>
                    {userData.bio || "No bio available."}
                </Text>
            </View>

            {/* Contact Details Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Contact Details</Text>
                <View style={styles.contactRow}>
                    <Ionicons name="mail" size={20} color={Colors.PRIMARY} />
                    <Text style={styles.contactText}>
                        {userData.email || "user@example.com"}
                    </Text>
                </View>
                {userData.phone && (
                    <View style={styles.contactRow}>
                        <Ionicons name="call" size={20} color={Colors.PRIMARY} />
                        <Text style={styles.contactText}>{userData.phone}</Text>
                    </View>
                )}
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push("/components/EditProfile")}
            >
                <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.WHITE,
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    infoContainer: {
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.PRIMARY,
        fontFamily: 'outfit-medium',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#666',
        fontFamily: 'outfit-medium',

        marginBottom: 8,
    },
    class: {
        fontSize: 16,
        fontFamily: 'outfit-medium',

        color: '#4B86B4',
    },
    section: {
        backgroundColor: Colors.WHITE,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.PRIMARY,
        marginBottom: 8,
    },
    sectionText: {
        fontFamily: 'outfit',

        fontSize: 16,
        color: '#333',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    contactText: {
        fontFamily: 'outfit',

        fontSize: 16,
        color: '#333',
        marginLeft: 8,
    },
    editButton: {
        backgroundColor: Colors.PRIMARY,
        fontFamily: 'outfit-medium',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    editButtonText: {
        color: Colors.WHITE,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default Profile;
