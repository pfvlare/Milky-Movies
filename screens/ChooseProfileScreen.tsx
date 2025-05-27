import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal,
    Platform,
    SafeAreaView,
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
    } = useDeleteProfile(user.id);
    const {
        data: profiles = [],
        refetch,
        isFetching,
    } = useProfiles(user.id);

    const [editMode, setEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [newName, setNewName] = useState("");
    const [selectedColor, setSelectedColor] = useState(profileColors[0]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const maxProfiles = user?.subscription?.maxProfiles || 1;
    const usedColors = profiles.map((p) => p.color);
    const availableColors = profileColors.filter((c) => !usedColors.includes(c));

    const handleSelectProfile = (id: string) => {
        if (editMode) return;
        setCurrentProfile(id);
        navigation.reset({ index: 0, routes: [{ name: "Home" as never }] });
    };

    const handleAddProfile = async () => {
        if (!newName.trim() || !selectedColor) return;
        try {
            await createProfile({ name: newName.trim(), color: selectedColor, userId: user.id });
            Toast.show({ type: "success", text1: "Perfil criado com sucesso!" });
        } catch {
            Toast.show({ type: "error", text1: "Erro ao criar perfil" });
        }
        setShowModal(false);
        setNewName("");
        setSelectedColor(profileColors[0]);
        await refetch();
    };

    const handleEditProfile = async () => {
        if (editingIndex === null) return;
        const profile = profiles[editingIndex];
        try {
            await editProfile({ id: profile.id, name: newName.trim(), color: selectedColor, userId: user.id });
            Toast.show({ type: "success", text1: "Perfil atualizado!" });
        } catch {
            Toast.show({ type: "error", text1: "Erro ao editar perfil" });
        }
        setShowModal(false);
        setNewName("");
        setEditingIndex(null);
        await refetch();
    };

    const handleDelete = async (index: number) => {
        if (profiles.length === 1) {
            alert("Você precisa manter pelo menos 1 perfil.");
            return;
        }
        const profileId = profiles[index].id;
        try {
            await deleteProfile(profileId);
            Toast.show({ type: "success", text1: "Perfil excluído!" });
        } catch {
            Toast.show({ type: "error", text1: "Erro ao excluir perfil" });
        }
        const newActive = profiles.filter((_, i) => i !== index)[0]?.id || null;
        setCurrentProfile(newActive);
        await refetch();
    };

    const openEditModal = (index: number) => {
        const profile = profiles[index];
        setNewName(profile.name);
        setSelectedColor(profile.color);
        setEditingIndex(index);
        setShowModal(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Quem Está Assistindo?</Text>

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
                        const initials = profile.name.split(" ").map(p => p[0]).join("").toUpperCase();
                        return (
                            <View key={profile.id} style={styles.profileItem}>
                                <TouchableOpacity
                                    onPress={() => handleSelectProfile(profile.id)}
                                    style={styles.profileTouchable}
                                >
                                    <View style={[styles.avatar, { backgroundColor: profile.color }]}>\
                                        <Text style={styles.avatarText}>{initials}</Text>
                                    </View>
                                    <Text style={styles.profileName}>{profile.name}</Text>
                                </TouchableOpacity>
                                {editMode && (
                                    <View style={styles.iconsRow}>
                                        <TouchableOpacity onPress={() => openEditModal(index)}>
                                            <Ionicons name="pencil" size={20} color="#EC4899" />
                                        </TouchableOpacity>
                                        {profiles.length > 1 && (
                                            <TouchableOpacity onPress={() => handleDelete(index)}>
                                                <Ionicons
                                                    name="trash"
                                                    size={20}
                                                    color="#EF4444"
                                                    style={{ marginLeft: 8 }}
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

            {!editMode && profiles.length < maxProfiles && (
                <TouchableOpacity
                    style={styles.editToggle}
                    onPress={() => {
                        setEditingIndex(null);
                        setNewName("");
                        setSelectedColor(availableColors[0] || profileColors[0]);
                        setShowModal(true);
                    }}
                >
                    <Text style={styles.editText}>Adicionar Perfil</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                onPress={() => setEditMode(prev => !prev)}
                style={styles.editToggle}
            >
                <Text style={styles.editText}>{editMode ? "Concluir" : "Editar"}</Text>
            </TouchableOpacity>

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
                        />

                        <Text style={styles.modalSubtitle}>Cor do perfil:</Text>
                        <View style={styles.colorPicker}>
                            {[...new Set([...availableColors, selectedColor])].map((color, index) => (
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
                                onPress={() => {
                                    setShowModal(false);
                                    setNewName("");
                                    setEditingIndex(null);
                                }}
                            >
                                <Text style={styles.cancelText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={editingIndex !== null ? handleEditProfile : handleAddProfile}
                            >
                                <Text style={styles.confirmText}>Salvar</Text>
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
    scroll: {
        paddingHorizontal: 24,
        paddingBottom: 40,
        alignItems: "center",
        justifyContent: "center",
        flexGrow: 1,
    },
    title: {
        color: "#fff",
        fontSize: 28,
        fontWeight: "bold",
        letterSpacing: 1,
        marginBottom: 32,
        textAlign: "center",
    },
    profileList: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 32,
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
    addAvatar: {
        backgroundColor: "#374151",
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
    },
    iconsRow: {
        flexDirection: "row",
        marginTop: 8,
    },
    addItem: {
        alignItems: "center",
        marginHorizontal: 16,
        marginBottom: 24,
    },
    editToggle: {
        marginTop: 24,
        backgroundColor: "#EC4899",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 10,
    },
    editText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
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
        width: "80%",
    },
    modalTitle: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
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
    },
    colorPicker: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 8,
    },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "transparent",
    },
    selectedColor: {
        borderColor: "#F9FAFB",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 24,
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
});
