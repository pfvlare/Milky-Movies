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
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useNavigation } from "@react-navigation/native";
import { useUserStore } from "../store/userStore";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
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

    // Usar os limites do backend se disponível, senão fallback para o user store
    const maxProfiles = profileLimits?.maxProfiles || user?.subscription?.maxProfiles || 1;
    const currentProfilesCount = profileLimits?.currentProfiles || profiles.length;
    const canCreateMore = profileLimits?.canCreateMore ?? (profiles.length < maxProfiles);

    const usedColors = profiles.map((p) => p.color);
    const availableColors = profileColors.filter((c) => !usedColors.includes(c));

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
        }
    }, [user?.id]);

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
                text1: `Você pode ter no máximo ${maxProfiles} perfis com seu plano atual`
            });
            return;
        }

        try {
            await createProfile({
                name: newName.trim(),
                color: selectedColor,
                userId: user.id
            });
            Toast.show({ type: "success", text1: "Perfil criado com sucesso!" });
            setShowModal(false);
            resetModal();
            await refetch();
        } catch (error: any) {
            console.error("Erro ao criar perfil:", error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                "Erro ao criar perfil";
            Toast.show({ type: "error", text1: errorMessage });
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
            Toast.show({ type: "success", text1: "Perfil atualizado!" });
            setShowModal(false);
            resetModal();
            await refetch();
        } catch (error: any) {
            console.error("Erro ao editar perfil:", error);
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                "Erro ao editar perfil";
            Toast.show({ type: "error", text1: errorMessage });
        }
    };

    const handleDelete = async (index: number) => {
        if (profiles.length === 1) {
            Toast.show({
                type: "error",
                text1: "Você precisa manter pelo menos 1 perfil."
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
                            Toast.show({ type: "success", text1: "Perfil excluído!" });

                            // Se o perfil excluído era o ativo, definir outro como ativo
                            const remainingProfiles = profiles.filter((_, i) => i !== index);
                            const newActive = remainingProfiles[0]?.id || null;
                            setCurrentProfile(newActive);

                            await refetch();
                        } catch (error: any) {
                            console.error("Erro ao excluir perfil:", error);
                            const errorMessage = error?.response?.data?.message ||
                                error?.message ||
                                "Erro ao excluir perfil";
                            Toast.show({ type: "error", text1: errorMessage });
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
                text1: `Você já atingiu o limite de ${maxProfiles} perfis`
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

    // Loading state
    if (isLoadingProfiles || isLoadingLimits) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color="#EC4899" style={{ marginTop: 100 }} />
                <Text style={styles.loadingText}>Carregando perfis...</Text>
            </SafeAreaView>
        );
    }

    // Error state
    if (hasProfilesError) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Erro ao carregar perfis</Text>
                    <Text style={styles.errorSubtext}>
                        {profilesError?.response?.data?.message ||
                            profilesError?.message ||
                            'Erro desconhecido'}
                    </Text>

                    <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                        <Text style={styles.retryButtonText}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Quem Está Assistindo?</Text>

            {/* Indicador de limite de perfis */}
            <Text style={styles.limitText}>
                {currentProfilesCount} de {maxProfiles} perfis utilizados
            </Text>

            {profiles.length > 0 ? (
                <View style={{ height: 240 }}>
                    <Carousel
                        width={140}
                        height={160}
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
                                .slice(0, 2); // Máximo 2 iniciais

                            return (
                                <View key={profile.id} style={styles.profileItem}>
                                    <TouchableOpacity
                                        onPress={() => handleSelectProfile(profile.id)}
                                        style={styles.profileTouchable}
                                        disabled={editMode}
                                    >
                                        <View style={[
                                            styles.avatar,
                                            { backgroundColor: profile.color },
                                            editMode && styles.avatarEditMode
                                        ]}>
                                            <Text style={styles.avatarText}>{initials}</Text>
                                        </View>
                                        <Text style={styles.profileName}>{profile.name}</Text>
                                    </TouchableOpacity>

                                    {editMode && (
                                        <View style={styles.iconsRow}>
                                            <TouchableOpacity
                                                onPress={() => openEditModal(index)}
                                                disabled={isEditing}
                                            >
                                                <Ionicons name="pencil" size={20} color="#EC4899" />
                                            </TouchableOpacity>
                                            {profiles.length > 1 && (
                                                <TouchableOpacity
                                                    onPress={() => handleDelete(index)}
                                                    disabled={isDeleting}
                                                    style={{ marginLeft: 8 }}
                                                >
                                                    <Ionicons
                                                        name="trash"
                                                        size={20}
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
                    <Text style={styles.emptyText}>Nenhum perfil encontrado</Text>
                    <Text style={styles.emptySubtext}>Crie seu primeiro perfil para começar</Text>

                    {/* Botão para criar primeiro perfil quando não há nenhum */}
                    <TouchableOpacity
                        style={[styles.editToggle, { marginTop: 20 }]}
                        onPress={openAddModal}
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.editText}>Criar Primeiro Perfil</Text>
                        )}
                    </TouchableOpacity>
                </View>
            )}

            {/* Botão Adicionar Perfil */}
            {!editMode && canCreateMore && profiles.length > 0 && (
                <TouchableOpacity
                    style={[styles.editToggle, !canCreateMore && styles.editToggleDisabled]}
                    onPress={openAddModal}
                    disabled={isCreating || !canCreateMore}
                >
                    {isCreating ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={styles.editText}>
                            Adicionar Perfil ({currentProfilesCount}/{maxProfiles})
                        </Text>
                    )}
                </TouchableOpacity>
            )}

            {/* Botão Editar */}
            {profiles.length > 0 && (
                <TouchableOpacity
                    onPress={() => setEditMode(prev => !prev)}
                    style={[styles.editToggle, { marginTop: 12 }]}
                    disabled={isCreating || isEditing || isDeleting}
                >
                    <Text style={styles.editText}>
                        {editMode ? "Concluir" : "Editar"}
                    </Text>
                </TouchableOpacity>
            )}

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

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={closeModal}
                                disabled={isCreating || isEditing}
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
                            >
                                {(isCreating || isEditing) ? (
                                    <ActivityIndicator size="small" color="#EC4899" />
                                ) : (
                                    <Text style={[
                                        styles.confirmText,
                                        !newName.trim() && styles.disabledText
                                    ]}>
                                        Salvar
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#111827",
        paddingTop: Platform.OS === "ios" ? 50 : 30,
    },
    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: 1,
        marginBottom: 16,
        textAlign: "center",
    },
    limitText: {
        color: "#9CA3AF",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 32,
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
        marginBottom: 8,
        textAlign: "center",
    },
    errorSubtext: {
        color: "#9CA3AF",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: "#EC4899",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    emptyState: {
        alignItems: "center",
        marginTop: 60,
        paddingHorizontal: 20,
    },
    emptyText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
    },
    emptySubtext: {
        color: "#9CA3AF",
        fontSize: 16,
        textAlign: "center",
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
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },
    avatarEditMode: {
        opacity: 0.7,
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
    },
    iconsRow: {
        flexDirection: "row",
        marginTop: 8,
        justifyContent: "center",
    },
    editToggle: {
        marginTop: 24,
        backgroundColor: "#EC4899",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
        alignSelf: "center",
        minWidth: 150,
        alignItems: "center",
    },
    editToggleDisabled: {
        backgroundColor: "#6B7280",
        opacity: 0.6,
    },
    editText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#1F2937",
        borderRadius: 16,
        padding: 24,
        width: "85%",
        maxWidth: 400,
    },
    modalTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    modalSubtitle: {
        color: "#fff",
        fontSize: 14,
        marginTop: 16,
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#374151",
        color: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 4,
    },
    characterCount: {
        color: "#9CA3AF",
        fontSize: 12,
        textAlign: "right",
        marginBottom: 8,
    },
    colorPicker: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 8,
        justifyContent: "center",
    },
    colorOption: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedColor: {
        borderColor: "#F9FAFB",
        borderWidth: 3,
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
        alignItems: "center",
    },
    cancelText: {
        color: "#9CA3AF",
        fontSize: 16,
    },
    confirmText: {
        color: "#EC4899",
        fontWeight: "bold",
        fontSize: 16,
    },
    disabledText: {
        opacity: 0.5,
    },
});