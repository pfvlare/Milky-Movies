import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
    StatusBar,
    ActivityIndicator,
    Alert,
    Platform,
    BackHandler,
    Animated,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import AppLayout from "../components/AppLayout";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

interface PlayerScreenParams {
    videoUrl: string;
    title?: string;
    type?: 'trailer' | 'movie' | 'episode';
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    loadingContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        zIndex: 5,
    },
    loadingText: {
        color: "#fff",
        fontSize: 16,
        marginTop: 16,
        textAlign: "center",
    },
    loadingSubtext: {
        color: "#9CA3AF",
        fontSize: 14,
        marginTop: 8,
        textAlign: "center",
    },
    headerContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },
    headerGradient: {
        paddingTop: Platform.OS === "ios" ? 50 : 30,
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    headerContent: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    leftControls: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    backText: {
        color: "#fff",
        marginLeft: 8,
        fontSize: 16,
        fontWeight: "600",
    },
    titleContainer: {
        flex: 2,
        alignItems: "center",
        paddingHorizontal: 16,
    },
    videoTitle: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
    videoSubtitle: {
        color: "#9CA3AF",
        fontSize: 12,
        textAlign: "center",
        marginTop: 2,
    },
    rightControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flex: 1,
        justifyContent: "flex-end",
    },
    controlButton: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    webviewContainer: {
        flex: 1,
        backgroundColor: "#000",
    },
    webview: {
        flex: 1,
        backgroundColor: "#000",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
        paddingHorizontal: 32,
    },
    errorIcon: {
        marginBottom: 24,
        padding: 20,
        borderRadius: 50,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
    },
    errorTitle: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 12,
    },
    errorText: {
        color: "#9CA3AF",
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
    },
    errorActions: {
        flexDirection: "row",
        gap: 16,
    },
    errorButton: {
        borderRadius: 12,
        overflow: "hidden",
        minWidth: 120,
    },
    errorButtonGradient: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    errorButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 6,
    },
    secondaryButton: {
        backgroundColor: "rgba(55, 65, 81, 0.8)",
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    secondaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    controlsContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
    },
    controlsGradient: {
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: Platform.OS === "ios" ? 40 : 20,
    },
    playbackControls: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 24,
    },
    playButton: {
        backgroundColor: "rgba(236, 72, 153, 0.9)",
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    skipButton: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
    },
    progressContainer: {
        marginTop: 16,
        paddingHorizontal: 8,
    },
    progressBar: {
        height: 4,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: 2,
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#EC4899",
        borderRadius: 2,
        width: "30%", // Exemplo de progresso
    },
    timeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    timeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "500",
    },
    infoContainer: {
        backgroundColor: "rgba(31, 41, 55, 0.9)",
        borderRadius: 16,
        padding: 20,
        margin: 16,
        borderWidth: 1,
        borderColor: "#374151",
    },
    infoTitle: {
        color: "#F3F4F6",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    infoText: {
        color: "#D1D5DB",
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 16,
    },
    actionButtons: {
        flexDirection: "row",
        gap: 12,
    },
    primaryButton: {
        flex: 1,
        borderRadius: 12,
        overflow: "hidden",
    },
    primaryButtonGradient: {
        paddingVertical: 14,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    primaryButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
});

export default function PlayerScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { videoUrl, title, type = 'trailer' } = route.params as PlayerScreenParams;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [canGoBack, setCanGoBack] = useState(false);
    const [canGoForward, setCanGoForward] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Corrigindo o useRef com valor inicial
    const webViewRef = useRef<WebView>(null);
    const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const controlsOpacity = useRef(new Animated.Value(1)).current;

    // Auto-hide dos controles
    useEffect(() => {
        if (showControls) {
            resetHideControlsTimer();
        }

        return () => {
            if (hideControlsTimeout.current) {
                clearTimeout(hideControlsTimeout.current);
            }
        };
    }, [showControls]);

    // Corrigindo o BackHandler para Android
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                handleGoBack();
                return true;
            };

            if (Platform.OS === "android") {
                const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
                return () => subscription.remove();
            }
        }, [])
    );

    const resetHideControlsTimer = () => {
        if (hideControlsTimeout.current) {
            clearTimeout(hideControlsTimeout.current);
        }

        hideControlsTimeout.current = setTimeout(() => {
            hideControls();
        }, 3000);
    };

    const hideControls = () => {
        Animated.timing(controlsOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setShowControls(false);
        });
    };

    const showControlsAnimated = () => {
        setShowControls(true);
        Animated.timing(controlsOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
        resetHideControlsTimer();
    };

    const handleScreenTap = () => {
        if (showControls) {
            hideControls();
        } else {
            showControlsAnimated();
        }
    };

    const handleGoBack = () => {
        Alert.alert(
            "Sair do Player",
            "Tem certeza que deseja parar a reprodução?",
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Sair",
                    style: "destructive",
                    onPress: () => {
                        navigation.goBack();
                    },
                },
            ]
        );
    };

    const handleWebViewLoad = () => {
        setLoading(false);
        setError(false);
        Toast.show({
            type: "success",
            text1: "Vídeo carregado",
            text2: type === 'trailer' ? "Trailer pronto para reprodução" : "Conteúdo carregado"
        });
    };

    const handleWebViewError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.error("WebView error:", nativeEvent);
        setLoading(false);
        setError(true);
        Toast.show({
            type: "error",
            text1: "Erro no player",
            text2: "Não foi possível carregar o vídeo"
        });
    };

    const handleReload = () => {
        setLoading(true);
        setError(false);
        webViewRef.current?.reload();
    };

    const handleShare = () => {
        Toast.show({
            type: "info",
            text1: "Compartilhar",
            text2: title || "Compartilhando vídeo..."
        });
    };

    const handleOpenInBrowser = () => {
        // Implementar abertura no navegador externo se necessário
        Toast.show({
            type: "info",
            text1: "Abrir no navegador",
            text2: "Funcionalidade em desenvolvimento"
        });
    };

    const getVideoTypeLabel = (videoType: string) => {
        switch (videoType) {
            case 'trailer': return 'Trailer';
            case 'movie': return 'Filme';
            case 'episode': return 'Episódio';
            default: return 'Vídeo';
        }
    };

    const getVideoTypeDescription = (videoType: string) => {
        switch (videoType) {
            case 'trailer':
                return 'Este é um trailer do filme. Para assistir ao filme completo, você pode procurar em plataformas de streaming ou cinemas.';
            case 'movie':
                return 'Conteúdo de filme completo. Aproveite a experiência cinematográfica!';
            case 'episode':
                return 'Episódio de série. Continue assistindo para acompanhar a história.';
            default:
                return 'Conteúdo de vídeo para sua diversão.';
        }
    };

    if (error) {
        return (
            <AppLayout>
                <View style={styles.container}>
                    <StatusBar hidden />

                    <View style={styles.errorContainer}>
                        <View style={styles.errorIcon}>
                            <Ionicons name="warning-outline" size={48} color="#EF4444" />
                        </View>
                        <Text style={styles.errorTitle}>Erro no Player</Text>
                        <Text style={styles.errorText}>
                            Não foi possível carregar o vídeo.{'\n'}
                            Verifique sua conexão e tente novamente.
                        </Text>

                        <View style={styles.errorActions}>
                            <TouchableOpacity style={styles.errorButton} onPress={handleReload}>
                                <LinearGradient
                                    colors={["#EC4899", "#D946EF"]}
                                    style={styles.errorButtonGradient}
                                >
                                    <Ionicons name="refresh-outline" size={16} color="#fff" />
                                    <Text style={styles.errorButtonText}>Tentar Novamente</Text>
                                </LinearGradient>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.secondaryButtonText}>Voltar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <View style={styles.container}>
                <StatusBar hidden />

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#EC4899" />
                        <Text style={styles.loadingText}>Carregando vídeo...</Text>
                        <Text style={styles.loadingSubtext}>
                            {type === 'trailer' ? 'Preparando trailer para reprodução' : 'Inicializando player'}
                        </Text>
                    </View>
                )}

                {/* Informações do Vídeo quando não está carregando */}
                {!loading && !error && (
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoTitle}>
                            {title || 'Reproduzindo Vídeo'}
                        </Text>
                        <Text style={styles.infoText}>
                            {getVideoTypeDescription(type)}
                        </Text>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.primaryButton} onPress={() => setLoading(true)}>
                                <LinearGradient
                                    colors={["#EC4899", "#D946EF"]}
                                    style={styles.primaryButtonGradient}
                                >
                                    <Ionicons name="play" size={20} color="#fff" />
                                    <Text style={styles.primaryButtonText}>Reproduzir</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.secondaryButton} onPress={handleOpenInBrowser}>
                                <Text style={styles.secondaryButtonText}>Abrir no Navegador</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* WebView Container - Escondido inicialmente */}
                {loading && (
                    <TouchableOpacity
                        style={styles.webviewContainer}
                        onPress={handleScreenTap}
                        activeOpacity={1}
                    >
                        <WebView
                            ref={webViewRef}
                            source={{ uri: videoUrl }}
                            style={styles.webview}
                            allowsFullscreenVideo={true}
                            allowsInlineMediaPlayback={true}
                            mediaPlaybackRequiresUserAction={false}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            startInLoadingState={false}
                            onLoad={handleWebViewLoad}
                            onError={handleWebViewError}
                            onNavigationStateChange={(navState) => {
                                setCanGoBack(navState.canGoBack);
                                setCanGoForward(navState.canGoForward);
                            }}
                            renderError={() => (
                                <View style={styles.errorContainer}>
                                    <Text style={styles.errorText}>Erro ao carregar o vídeo</Text>
                                </View>
                            )}
                        />
                    </TouchableOpacity>
                )}

                {/* Header Controls */}
                {showControls && !loading && (
                    <Animated.View style={[styles.headerContainer, { opacity: controlsOpacity }]}>
                        <LinearGradient
                            colors={["rgba(0,0,0,0.8)", "transparent"]}
                            style={styles.headerGradient}
                        >
                            <View style={styles.headerContent}>
                                <View style={styles.leftControls}>
                                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                                        <Ionicons name="arrow-back" size={20} color="#fff" />
                                        <Text style={styles.backText}>Voltar</Text>
                                    </TouchableOpacity>
                                </View>

                                {title && (
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.videoTitle} numberOfLines={1}>
                                            {title}
                                        </Text>
                                        <Text style={styles.videoSubtitle}>
                                            {getVideoTypeLabel(type)}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.rightControls}>
                                    <TouchableOpacity style={styles.controlButton} onPress={handleShare}>
                                        <Ionicons name="share-outline" size={20} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}

                {/* Bottom Controls */}
                {showControls && !loading && (
                    <Animated.View style={[styles.controlsContainer, { opacity: controlsOpacity }]}>
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.8)"]}
                            style={styles.controlsGradient}
                        >
                            {/* Progress Bar */}
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBar}>
                                    <View style={styles.progressFill} />
                                </View>
                                <View style={styles.timeContainer}>
                                    <Text style={styles.timeText}>00:30</Text>
                                    <Text style={styles.timeText}>02:45</Text>
                                </View>
                            </View>

                            {/* Playback Controls */}
                            <View style={styles.playbackControls}>
                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={() => webViewRef.current?.goBack()}
                                    disabled={!canGoBack}
                                >
                                    <Ionicons name="play-skip-back" size={24} color={canGoBack ? "#fff" : "#666"} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.playButton}
                                    onPress={() => setIsPlaying(!isPlaying)}
                                >
                                    <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#fff" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={() => webViewRef.current?.goForward()}
                                    disabled={!canGoForward}
                                >
                                    <Ionicons name="play-skip-forward" size={24} color={canGoForward ? "#fff" : "#666"} />
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    </Animated.View>
                )}
            </View>
        </AppLayout>
    );
}