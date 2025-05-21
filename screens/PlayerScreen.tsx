import React from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
    StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

export default function PlayerScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { videoUrl } = route.params as { videoUrl: string };

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Top gradient header */}
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.headerGradient}
            >
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                    <Text style={styles.backText}>Voltar</Text>
                </TouchableOpacity>
            </LinearGradient>

            {/* WebView player */}
            <WebView
                source={{ uri: videoUrl }}
                style={styles.video}
                allowsFullscreenVideo
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        paddingTop: 40,
        paddingHorizontal: 16,
        paddingBottom: 12,
        zIndex: 10,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backText: {
        color: 'white',
        marginLeft: 8,
        fontSize: 16,
        fontWeight: 'bold',
    },
    video: {
        width,
        height,
    },
});
