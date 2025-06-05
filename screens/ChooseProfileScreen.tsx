import React, { useState, useEffect, useCallback } from "react";
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
    RefreshControl,
    Dimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
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

const { width } = Dimensions.get("window");

const profileColors = [
    "#EC4899", // Rosa
    "#3B82F6", // Azul
    "#10B981", // Verde
    "#F59E0B", // Amarelo
    "#8B5CF6", // Roxo
    "#EF4444", // Vermelho
    "#06B6D4", // Ciano
    "#84CC16", // Lima
    "#F97316", // Laranja
    "#6366F1", // Índigo
];

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
        refetch: refetchProfiles,
        isFetching,
        isLoading: isLoadingProfiles,
        error: profilesError,
        isError: hasProfilesError,
    } = useProfiles(user?.id);
    const {
        data: profileLimits,
        isLoading: isLoadingLimits,
        refetch: refetchLimits,
        error: limitsError,
        isError: hasLimitsError,
    } = useProfileLimits(user?.id);

    const [editMode, setEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [selectedColor, setSelectedColor] = useState(profileColors[0]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const maxProfiles = profileLimits?.maxProfiles || 1;
    const currentProfilesCount = profileLimits?.currentProfiles || profiles.length;
    const canCreateMore = profileLimits?.canCreateMore ?? (profiles.length < maxProfiles);
    const planName = profileLimits?.plan || 'none';

    // Calcular cores disponíveis
    const usedColors = profiles.map((p) => p.color);
    const availableColors = profileColors.filter((c) => !usedColors.includes(c));

    // Debug dos perfis
    useEffect(() => {
        console.log('🔍 [DEBUG] Profiles state:', {
            profilesLength: profiles.length,
            profiles: profiles.map(p => ({ id: p.id, name: p.name, color: p.color })),
            currentProfileId: user?.currentProfileId,
            isLoading: isLoadingProfiles,
            hasError: hasProfilesError
        });
    }, [profiles, user?.currentProfileId, isLoadingProfiles, hasProfilesError]);

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

    // Atualizar dados quando a tela ganhar foco
    useFocusEffect(
        useCallback(() => {
            if (user?.id) {
                console.log('🔄 Atualizando dados de perfis...');
                refetchProfiles();
                refetchLimits();
            }
        }, [user?.id, refetchProfiles, refetchLimits])
    );

    // Configurar cor inicial baseada nas cores disponíveis
    useEffect(() => {
        if (showModal && editingIndex === null) {
            // Para novo perfil, usar primeira cor disponível APENAS na abertura do modal
            const usedColors = profiles.map((p) => p.color);
            const availableColors = profileColors.filter((c) => !usedColors.includes(c));

            if (availableColors.length > 0) {
                setSelectedColor(availableColors[0]);
            } else {
                // Se não há cores disponíveis, usar a primeira da lista
                setSelectedColor(profileColors[0]);
            }
        }
    }, [showModal, editingIndex]); // REMOVIDO: availableColors das dependências

    // Verificar se o usuário tem ID
    useEffect(() => {
        if (!user?.id) {
            console.error('❌ Usuário sem ID!');
            Toast.show({
                type: "error",
                text1: "Erro: Usuário não identificado",
                text2: "Faça login novamente"
            });
            setTimeout(() => {
                navigation.reset({ index: 0, routes: [{ name: "Welcome" as never }] });
            }, 2000);
        }
    }, [user?.id, navigation]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                refetchProfiles(),
                refetchLimits()
            ]);
            Toast.show({
                type: "success",
                text1: "Perfis atualizados",
                text2: "Lista de perfis foi atualizada"
            });
        } catch (error) {
            console.error('Erro ao atualizar:', error);
            Toast.show({
                type: "error",
                text1: "Erro ao atualizar",
                text2: "Tente novamente"
            });
        } finally {
            setRefreshing(false);
        }
    };

    const handleSelectProfile = (id: string) => {
        if (editMode) return;

        console.log('🎯 Selecionando perfil:', id);
        setCurrentProfile(id);

        Toast.show({
            type: "success",
            text1: "Perfil selecionado",
            text2: "Redirecionando para a tela inicial..."
        });

        setTimeout(() => {
            navigation.reset({ index: 0, routes: [{ name: "Home" as never }] });
        }, 1000);
    };

    const validateProfileData = () => {
        if (!newName.trim()) {
            Toast.show({ type: "error", text1: "Nome do perfil é obrigatório" });
            return false;
        }

        if (newName.trim().length > 20) {
            Toast.show({ type: "error", text1: "Nome deve ter no máximo 20 caracteres" });
            return false;
        }

        if (!selectedColor) {
            Toast.show({ type: "error", text1: "Selecione uma cor para o perfil" });
            return false;
        }

        // Verificar se o nome já existe (exceto para edição do próprio perfil)
        const nameExists = profiles.some((profile, index) =>
            profile.name.toLowerCase() === newName.trim().toLowerCase() &&
            index !== editingIndex
        );

        if (nameExists) {
            Toast.show({
                type: "error",
                text1: "Nome já existe",
                text2: "Escolha um nome diferente"
            });
            return false;
        }

        return true;
    };

    const handleAddProfile = async () => {
        if (!validateProfileData()) return;

        if (!canCreateMore) {
            Toast.show({
                type: "error",
                text1: `Você pode ter no máximo ${maxProfiles} perfis`,
                text2: `Plano atual: ${getPlanDisplayName(planName)}`
            });
            return;
        }

        try {
            console.log('🚀 Criando perfil:', {
                name: newName.trim(),
                color: selectedColor,
                userId: user.id
            });

            const result = await createProfile({
                name: newName.trim(),
                color: selectedColor,
                userId: user.id
            });

            console.log('✅ Perfil criado com sucesso:', result);

            Toast.show({
                type: "success",
                text1: "Perfil criado com sucesso!",
                text2: `"${newName.trim()}" foi adicionado`
            });

            setShowModal(false);
            resetModal();

            // Forçar atualização dos dados
            await Promise.all([
                refetchProfiles(),
                refetchLimits()
            ]);

        } catch (error: any) {
            console.error("❌ Erro ao criar perfil:", error);
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
        if (!validateProfileData()) return;

        const profile = profiles[editingIndex];
        try {
            console.log('✏️ Editando perfil:', {
                id: profile.id,
                name: newName.trim(),
                color: selectedColor
            });

            const result = await editProfile({
                id: profile.id,
                name: newName.trim(),
                color: selectedColor
            });

            console.log('✅ Perfil editado com sucesso:', result);

            Toast.show({
                type: "success",
                text1: "Perfil atualizado!",
                text2: `"${newName.trim()}" foi salvo`
            });

            setShowModal(false);
            resetModal();

            // Forçar atualização dos dados
            await Promise.all([
                refetchProfiles(),
                refetchLimits()
            ]);

        } catch (error: any) {
            console.error("❌ Erro ao editar perfil:", error);
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
            `Tem certeza que deseja excluir o perfil "${profile.name}"?\n\nEsta ação não pode ser desfeita.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            console.log('🗑️ Excluindo perfil:', profile.id);

                            await deleteProfile(profile.id);

                            Toast.show({
                                type: "success",
                                text1: "Perfil excluído!",
                                text2: `"${profile.name}" foi removido`
                            });

                            // Se o perfil excluído era o ativo, definir outro como ativo
                            if (user?.currentProfileId === profile.id) {
                                const remainingProfiles = profiles.filter((_, i) => i !== index);
                                if (remainingProfiles.length > 0) {
                                    const newActive = remainingProfiles[0]?.id || null;
                                    setCurrentProfile(newActive);
                                    console.log('🔄 Perfil ativo alterado para:', newActive);
                                }
                            }

                            // Forçar atualização dos dados
                            await Promise.all([
                                refetchProfiles(),
                                refetchLimits()
                            ]);

                        } catch (error: any) {
                            console.error("❌ Erro ao excluir perfil:", error);
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
        // Definir cor padrão baseada nas cores disponíveis
        if (availableColors.length > 0) {
            setSelectedColor(availableColors[0]);
        } else {
            setSelectedColor(profileColors[0]);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        resetModal();
    };

    const handleUpgradePlan = () => {
        setShowModal(false);
        navigation.navigate("ChangePlan" as never);
    };

    const getColorsForPicker = () => {
        if (editingIndex !== null) {
            // Para edição, incluir a cor atual mesmo que já esteja em uso
            const currentColor = profiles[editingIndex]?.color;
            const colors = [...availableColors];
            if (currentColor && !colors.includes(currentColor)) {
                colors.unshift(currentColor);
            }
            return colors;
        } else {
            // Para novo perfil, apenas cores disponíveis
            return availableColors;
        }
    };

    // Renderizar item do perfil
    const renderProfileItem = ({ item, index }: { item: any; index: number }) => {
        const profile = item;
        const initials = profile.name
            .split(" ")
            .map((p: string) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

        const isCurrentProfile = user?.currentProfileId === profile.id;

        console.log('🎨 Renderizando perfil:', {
            index,
            profileId: profile.id,
            name: profile.name,
            isCurrentProfile
        });

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

                    <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
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
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#EC4899"
                        colors={["#EC4899"]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Quem Está Assistindo?</Text>
                    <Text style={styles.subtitle}>
                        <Text style={{ color: "#EC4899" }}>M</Text>ilky{" "}
                        <Text style={{ color: "#EC4899" }}>M</Text>ovies
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

                    <View style={styles.limitActions}>
                        <TouchableOpacity
                            style={styles.refreshButton}
                            onPress={handleRefresh}
                            disabled={refreshing}
                        >
                            <Ionicons
                                name={refreshing ? "hourglass" : "refresh-outline"}
                                size={16}
                                color="#10B981"
                            />
                        </TouchableOpacity>

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
                </View>

                {profiles.length > 0 ? (
                    <View style={styles.carouselContainer}>
                        <Text style={styles.profilesTitle}>
                            Selecione um perfil ({profiles.length} disponível{profiles.length > 1 ? 'is' : ''})
                        </Text>

                        {/* Usar FlatList em vez de Carousel para melhor controle */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.profilesScrollContainer}
                            style={styles.profilesScroll}
                        >
                            {profiles.map((profile, index) =>
                                renderProfileItem({ item: profile, index })
                            )}
                        </ScrollView>
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
                            {getColorsForPicker().map((color, index) => (
                                <TouchableOpacity
                                    key={`${color}-${index}`}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === color && styles.selectedColor,
                                    ]}
                                    onPress={() => setSelectedColor(color)}
                                    activeOpacity={0.8}
                                >
                                    {selectedColor === color && (
                                        <Ionicons name="checkmark" size={20} color="#fff" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {getColorsForPicker().length === 0 && (
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
                                disabled={isCreating || isEditing || !newName.trim() || !selectedColor}
                                style={styles.modalConfirmButton}
                            >
                                <LinearGradient
                                    colors={!newName.trim() || !selectedColor || isCreating || isEditing
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
                                        <Text style={styles.confirmText}>
                                            {editingIndex !== null ? "Salvar" : "Criar"}
                                        </Text>
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
    debugContainer: {
        backgroundColor: "#374151",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    debugText: {
        color: "#F59E0B",
        fontSize: 12,
        marginBottom: 2,
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
    limitActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    refreshButton: {
        backgroundColor: "#374151",
        padding: 8,
        borderRadius: 8,
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
        marginBottom: 24,
    },
    profilesTitle: {
        color: "#F3F4F6",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 16,
        textAlign: "center",
    },
    profilesScroll: {
        flexGrow: 0,
        paddingVertical: 20,
    },
    profilesScrollContainer: {
        paddingHorizontal: 8,
        alignItems: "center",
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
        minWidth: 100,
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
        maxWidth: 90,
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
        justifyContent: "center",
        alignItems: "center",
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