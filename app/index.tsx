import { View } from 'react-native';
import Login from "./components/Login";
import { auth } from '../configs/firebaseConfig';
import { Redirect } from 'expo-router';
import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
    const user = auth.currentUser;
    const navigation = useNavigation();
    useEffect(() => {
        navigation.setOptions({
            headerShown: false,
        })
    }, [navigation])
    return (
        <View style={{ flex: 1 }}>
            {user ? <Redirect href={'/(tabs)/home'} /> : <Login />}
        </View>
    );
}
