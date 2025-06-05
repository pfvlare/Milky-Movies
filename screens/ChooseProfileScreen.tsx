import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal,
    Platform,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    ScrollView,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useNavigation } from "@react-navigation/native";
import { useUserStore } from "../store/userStore";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { LinearGradient } from "expo-linear-gradient";
import {
    useCreateProfile,
    useEditProfile,
    useDeleteProfile,
    useProfiles,
    useProfileLimits,
} from "../hooks/useProfiles";

const profileColors = ["#EC4899", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

export default function ChooseProfileScreen() {
    const navigation = useNavigation();
    const user = useUserStore((state) => state.user);
    const setCurrentProfile = useUserStore((state) => state.setCurrentProfile);

    const {
        mutateAsync: createProfile,
        isPending: isCreating,
    } = useCreateProfile();
    const {
        mutateAsync: editProfile,
        isPending: isEditing,
    } = useEditProfile();
    const {
        mutateAsync: deleteProfile,
        isPending: isDeleting,
    } = useDeleteProfile();
    const {
        data: profiles = [],
        refetch,
        isFetching,
        isLoading: isLoadingProfiles,
        error: profilesError,
        isError: hasProfilesError,
    } = useProfiles(user?.id);
    const {
        data: profileLimits,
        isLoading: isLoadingLimits,
        error: limitsError,
        isError: hasLimitsError,
    } = useProfileLimits(user?.id);

    const [editMode, setEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [selectedColor, setSelectedColor] = useState(profileColors[0]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const maxProfiles = profileLimits?.maxProfiles || 1;
    const currentProfilesCount = profileLimits?.currentProfiles || profiles.length;
    const canCreateMore = profileLimits?.canCreateMore ?? (profiles.length < maxProfiles);
    const planName = profileLimits?.plan || 'none';

    const usedColors = profiles.map((p) => p.color);
    const availableColors = profileColors.filter((c) => !usedColors.includes(c));

    // Função para mapear nome do plano
    const getPlanDisplayName = (plan: string) => {
        const planNames = {
            'basic': 'Básico',
            'intermediary': 'Padrão',
            'complete': 'Premium',
            'none': 'Gratuito'
        };
        return planNames[plan] || 'Desconhecido';
    };

    // Efeito para definir cor inicial quando disponível
    useEffect(() => {
        if (availableColors.length > 0 && !editingIndex) {
            setSelectedColor(availableColors[0]);
        }
    }, [availableColors, editingIndex]);

    // Verificar se o usuário tem ID
    useEffect(() => {
        if (!user?.id) {
            console.error('❌ Usuário sem ID!');
            Toast.show({
                type: "error",
                text1: "Erro: Usuário não identificado",
                text2: "Faça login novamente"
            });
            // Redirecionar para login após um tempo
            setTimeout(() => {
                navigation.reset({ index: 0, routes: [{ name: "Welcome" as never }] });
            }, 2000);
        }
    }, [user?.id, navigation]);

    const handleSelectProfile = (id: string) => {
        if (editMode) return;
        setCurrentProfile(id);
        navigation.reset({ index: 0, routes: [{ name: "Home" as never }] });
    };

    const handleAddProfile = async () => {
        // Validações
        if (!newName.trim()) {
            Toast.show({ type: "error", text1: "Nome do perfil é obrigatório" });
            return;
        }

        if (newName.trim().length > 20) {
            Toast.show({ type: "error", text1: "Nome deve ter no máximo 20 caracteres" });
            return;
        }

        if (!selectedColor) {
            Toast.show({ type: "error", text1: "Selecione uma cor para o perfil" });
            return;
        }

        if (!canCreateMore) {
            Toast.show({
                type: "error",
                text1: `Você pode ter no máximo ${maxProfiles} perfis`,
                text2: `Plano atual: ${getPlanDisplayName(planName)}`
            });
            return;
        }

        try {
            await createProfile({
                name: newName.trim(),
                color: selectedColor,
                userId: user.id
            });
            Toast.show({
                type: "success",
                text1: "Perfil criado com sucesso!",
                text2: `"${newName.trim()}" foi adicionado`
            });
            setShowModal(false);
            resetModal();
            await refetch();
        } catch (error: any) {
            console.error("Erro ao criar perfil:", error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                "Erro ao criar perfil";
            Toast.show({
                type: "error",
                text1: "Erro ao criar perfil",
                text2: errorMessage
            });
        }
    };

    const handleEditProfile = async () => {
        if (editingIndex === null) return;

        // Validações
        if (!newName.trim()) {
            Toast.show({ type: "error", text1: "Nome do perfil é obrigatório" });
            return;
        }

        if (newName.trim().length > 20) {
            Toast.show({ type: "error", text1: "Nome deve ter no máximo 20 caracteres" });
            return;
        }

        const profile = profiles[editingIndex];
        try {
            await editProfile({
                id: profile.id,
                name: newName.trim(),
                color: selectedColor
            });
            Toast.show({
                type: "success",
                text1: "Perfil atualizado!",
                text2: `"${newName.trim()}" foi salvo`
            });
            setShowModal(false);
            resetModal();
            await refetch();
        } catch (error: any) {
            console.error("Erro ao editar perfil:", error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                "Erro ao editar perfil";
            Toast.show({
                type: "error",
                text1: "Erro ao editar perfil",
                text2: errorMessage
            });
        }
    };

    const handleDelete = async (index: number) => {
        if (profiles.length === 1) {
            Toast.show({
                type: "error",
                text1: "Não é possível excluir",
                text2: "Você precisa manter pelo menos 1 perfil."
            });
            return;
        }

        const profile = profiles[index];

        Alert.alert(
            "Excluir Perfil",
            `Tem certeza que deseja excluir o perfil "${profile.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteProfile(profile.id);
                            Toast.show({
                                type: "success",
                                text1: "Perfil excluído!",
                                text2: `"${profile.name}" foi removido`
                            });

                            // Se o perfil excluído era o ativo, definir outro como ativo
                            const remainingProfiles = profiles.filter((_, i) => i !== index);
                            if (remainingProfiles.length > 0) {
                                const newActive = remainingProfiles[0]?.id || null;
                                setCurrentProfile(newActive);
                            }

                            await refetch();
                        } catch (error: any) {
                            console.error("Erro ao excluir perfil:", error);
                            const errorMessage = error?.response?.data?.message ||
                                error?.message ||
                                "Erro ao excluir perfil";
                            Toast.show({
                                type: "error",
                                text1: "Erro ao excluir perfil",
                                text2: errorMessage
                            });
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (index: number) => {
        const profile = profiles[index];
        setNewName(profile.name);
        setSelectedColor(profile.color);
        setEditingIndex(index);
        setShowModal(true);
    };

    const openAddModal = () => {
        if (!canCreateMore) {
            Toast.show({
                type: "error",
                text1: `Limite de perfis atingido`,
                text2: `Plano ${getPlanDisplayName(planName)}: ${maxProfiles} perfil${maxProfiles > 1 ? 's' : ''}`
            });
            return;
        }

        resetModal();
        setShowModal(true);
    };

    const resetModal = () => {
        setEditingIndex(null);
        setNewName("");
        setSelectedColor(availableColors[0] || profileColors[0]);
    };

    const closeModal = () => {
        setShowModal(false);
        resetModal();
    };

    // Função para navegar para upgrade de plano
    const handleUpgradePlan = () => {
        setShowModal(false);
        navigation.navigate("ChangePlan" as never);
    };

    // Loading state
    if (isLoadingProfiles || isLoadingLimits) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#EC4899" />
                    <Text style={styles.loadingText}>Carregando perfis...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Error state
    if (hasProfilesError) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
                    <Text style={styles.errorText}>Erro ao carregar perfis</Text>
                    <Text style={styles.errorSubtext}>
                        {profilesError?.response?.data?.message ||
                            profilesError?.message ||
                            'Erro desconhecido'}
                    </Text>

                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                        <LinearGradient
                            colors={["#EC4899", "#D946EF"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.retryGradient}
                        >
                            <Ionicons name="refresh" size={20} color="#fff" />
                            <Text style={styles.retryButtonText}>Tentar novamente</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Quem Está Assistindo?</Text>
                    <Text style={styles.subtitle}>
                        <Text style={{ color: theme.text }}>M</Text>ilky{" "}
                        <Text style={{ color: theme.text }}>M</Text>ovies
                    </Text>
                </View>

                {/* Indicador de limite de perfis */}
                <View style={styles.limitContainer}>
                    <View style={styles.limitInfo}>
                        <Text style={styles.limitText}>
                            {currentProfilesCount} de {maxProfiles} perfis utilizados
                        </Text>
                        <Text style={styles.planText}>
                            Plano: {getPlanDisplayName(planName)}
                        </Text>
                    </View>

                    {planName !== 'complete' && (
                        <TouchableOpacity
                            style={styles.upgradeButton}
                            onPress={handleUpgradePlan}
                        >
                            <Ionicons name="arrow-up-circle-outline" size={16} color="#EC4899" />
                            <Text style={styles.upgradeText}>Upgrade</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {profiles.length > 0 ? (
                    <View style={styles.carouselContainer}>
                        <Carousel
                            width={140}
                            height={180}
                            loop={false}
                            autoPlay={false}
                            data={profiles}
                            scrollAnimationDuration={400}
                            renderItem={({ index }) => {
                                const profile = profiles[index];
                                const initials = profile.name
                                    .split(" ")
                                    .map(p => p[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2);

                                const isCurrentProfile = user?.currentProfileId === profile.id;

                                return (
                                    <View key={profile.id} style={styles.profileItem}>
                                        <TouchableOpacity
                                            onPress={() => handleSelectProfile(profile.id)}
                                            style={[
                                                styles.profileTouchable,
                                                isCurrentProfile && styles.currentProfileTouchable
                                            ]}
                                            disabled={editMode}
                                        >
                                            <View style={[
                                                styles.avatar,
                                                { backgroundColor: profile.color },
                                                editMode && styles.avatarEditMode,
                                                isCurrentProfile && styles.currentAvatar
                                            ]}>
                                                <Text style={styles.avatarText}>{initials}</Text>
                                                {isCurrentProfile && (
                                                    <View style={styles.currentBadge}>
                                                        <Ionicons name="checkmark" size={16} color="#fff" />
                                                    </View>
                                                )}
                                            </View>
                                            <Text style={[
                                                styles.profileName,
                                                isCurrentProfile && styles.currentProfileName
                                            ]}>
                                                {profile.name}
                                            </Text>
                                            {isCurrentProfile && (
                                                <Text style={styles.currentLabel}>ATUAL</Text>
                                            )}
                                        </TouchableOpacity>

                                        {editMode && (
                                            <View style={styles.iconsRow}>
                                                <TouchableOpacity
                                                    onPress={() => openEditModal(index)}
                                                    disabled={isEditing}
                                                    style={styles.iconButton}
                                                >
                                                    <Ionicons name="pencil" size={18} color="#EC4899" />
                                                </TouchableOpacity>
                                                {profiles.length > 1 && (
                                                    <TouchableOpacity
                                                        onPress={() => handleDelete(index)}
                                                        disabled={isDeleting}
                                                        style={[styles.iconButton, { marginLeft: 8 }]}
                                                    >
                                                        <Ionicons
                                                            name="trash"
                                                            size={18}
                                                            color="#EF4444"
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                );
                            }}
                        />
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="person-add-outline" size={64} color="#6B7280" />
                        <Text style={styles.emptyText}>Nenhum perfil encontrado</Text>
                        <Text style={styles.emptySubtext}>Crie seu primeiro perfil para começar a assistir</Text>

                        <TouchableOpacity
                            style={styles.createFirstButton}
                            onPress={openAddModal}
                            disabled={isCreating}
                        >
                            <LinearGradient
                                colors={["#EC4899", "#D946EF"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.createFirstGradient}
                            >
                                {isCreating ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="add" size={20} color="#fff" />
                                        <Text style={styles.createFirstText}>Criar Primeiro Perfil</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Botões de ação */}
                <View style={styles.actionsContainer}>
                    {/* Botão Adicionar Perfil */}
                    {!editMode && profiles.length > 0 && (
                        <TouchableOpacity
                            style={[styles.actionButton, !canCreateMore && styles.actionButtonDisabled]}
                            onPress={openAddModal}
                            disabled={isCreating || !canCreateMore}
                        >
                            <LinearGradient
                                colors={canCreateMore ? ["#EC4899", "#D946EF"] : ["#6B7280", "#6B7280"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.actionGradient}
                            >
                                {isCreating ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="add" size={20} color="#fff" />
                                        <Text style={styles.actionText}>
                                            Adicionar Perfil ({currentProfilesCount}/{maxProfiles})
                                        </Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* Botão Editar */}
                    {profiles.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setEditMode(prev => !prev)}
                            style={[styles.actionButton, { marginTop: 12 }]}
                            disabled={isCreating || isEditing || isDeleting}
                        >
                            <LinearGradient
                                colors={editMode ? ["#6B7280", "#6B7280"] : ["#374151", "#4B5563"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.actionGradient}
                            >
                                <Ionicons
                                    name={editMode ? "checkmark" : "create-outline"}
                                    size={20}
                                    color="#fff"
                                />
                                <Text style={styles.actionText}>
                                    {editMode ? "Concluir Edição" : "Gerenciar Perfis"}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* Modal */}
            <Modal visible={showModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {editingIndex !== null ? "Editar Perfil" : "Novo Perfil"}
                        </Text>

                        <TextInput
                            placeholder="Nome do perfil"
                            placeholderTextColor="#9CA3AF"
                            value={newName}
                            onChangeText={setNewName}
                            style={styles.input}
                            maxLength={20}
                            autoFocus={true}
                        />

                        <Text style={styles.characterCount}>
                            {newName.length}/20 caracteres
                        </Text>

                        <Text style={styles.modalSubtitle}>Cor do perfil:</Text>
                        <View style={styles.colorPicker}>
                            {(editingIndex !== null
                                ? [...new Set([...availableColors, selectedColor])]
                                : availableColors
                            ).map((color, index) => (
                                <TouchableOpacity
                                    key={`${color}-${index}`}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColor,
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))}
                        </View>

                        {availableColors.length === 0 && editingIndex === null && (
                            <Text style={styles.noColorsText}>
                                Todas as cores estão em uso. Exclua um perfil para liberar cores.
                            </Text>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={closeModal}
                                disabled={isCreating || isEditing}
                                style={styles.modalCancelButton}
                            >
                                <Text style={[
                                    styles.cancelText,
                                    (isCreating || isEditing) && styles.disabledText
                                ]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={editingIndex !== null ? handleEditProfile : handleAddProfile}
                                disabled={isCreating || isEditing || !newName.trim()}
                                style={styles.modalConfirmButton}
                            >
                                <LinearGradient
                                    colors={!newName.trim() || isCreating || isEditing
                                        ? ["#6B7280", "#6B7280"]
                                        : ["#EC4899", "#D946EF"]
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.confirmGradient}
                                >
                                    {(isCreating || isEditing) ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.confirmText}>Salvar</Text>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const theme = { text: "#EC4899" }; // Definição do tema

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
        paddingTop: Platform.OS === "ios" ? 50 : 30,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    headerContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: 1,
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        color: "#9CA3AF",
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 0.5,
    },
    limitContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#1F2937",
        borderRadius: 12,
        padding: 16,
        marginBottom: 32,
    },
    limitInfo: {
        flex: 1,
    },
    limitText: {
        color: "#F3F4F6",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    planText: {
        color: "#9CA3AF",
        fontSize: 14,
    },
    upgradeButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#374151",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    upgradeText: {
        color: "#EC4899",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#9CA3AF",
        fontSize: 16,
        textAlign: "center",
        marginTop: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    errorText: {
        color: "#EF4444",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    errorSubtext: {
        color: "#9CA3AF",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },
    retryButton: {
        borderRadius: 12,
    },
    retryGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 8,
    },
    carouselContainer: {
        height: 200,
        marginBottom: 24,
    },
    emptyState: {
        alignItems: "center",
        marginTop: 60,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtext: {
        color: "#9CA3AF",
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
    },
    createFirstButton: {
        borderRadius: 12,
    },
    createFirstGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    createFirstText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 8,
    },
    profileItem: {
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 24,
    },
    profileTouchable: {
        alignItems: "center",
        justifyContent: "center",
    },
    currentProfileTouchable: {
        transform: [{ scale: 1.05 }],
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        position: "relative",
    },
    currentAvatar: {
        borderWidth: 3,
        borderColor: "#10B981",
    },
    avatarEditMode: {
        opacity: 0.7,
    },
    currentBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        backgroundColor: "#10B981",
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#111827",
    },
    avatarText: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        textAlignVertical: "center",
    },
    profileName: {
        color: "#F9FAFB",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        marginBottom: 4,
    },
    currentProfileName: {
        color: "#10B981",
        fontWeight: "600",
    },
    currentLabel: {
        color: "#10B981",
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
    iconsRow: {
        flexDirection: "row",
        marginTop: 12,
        justifyContent: "center",
    },
    iconButton: {
        backgroundColor: "#374151",
        padding: 8,
        borderRadius: 8,
    },
    actionsContainer: {
        marginTop: 16,
    },
    actionButton: {
        borderRadius: 12,
    },
    actionButtonDisabled: {
        opacity: 0.6,
    },
    actionGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    actionText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 24,
        width: "90%",
        maxWidth: 400,
    },
    modalTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    modalSubtitle: {
        color: "#fff",
        fontSize: 16,
        marginTop: 16,
        marginBottom: 12,
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#374151",
        color: "#fff",
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        marginBottom: 4,
        borderWidth: 1,
        borderColor: "#4B5563",
    },
    characterCount: {
        color: "#9CA3AF",
        fontSize: 12,
        textAlign: "right",
        marginBottom: 16,
    },
    colorPicker: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 8,
        justifyContent: "center",
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedColor: {
        borderColor: "#F9FAFB",
        borderWidth: 3,
        transform: [{ scale: 1.1 }],
    },
    noColorsText: {
        color: "#EF4444",
        fontSize: 14,
        textAlign: "center",
        marginTop: 8,
        fontStyle: "italic",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 32,
        alignItems: "center",
    },
    modalCancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    modalConfirmButton: {
        borderRadius: 8,
    },
    confirmGradient: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        minWidth: 80,
        alignItems: "center",
    },
    cancelText: {
        color: "#9CA3AF",
        fontSize: 16,
        fontWeight: "500",
    },
    confirmText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    disabledText: {
        opacity: 0.5,
    },
});