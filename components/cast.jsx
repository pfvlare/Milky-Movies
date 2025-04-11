import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { fallBackPersonImage, image185 } from '../api/moviedb';

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    title: {
        color: 'white',
        fontSize: 18,
        marginHorizontal: 16,
        marginBottom: 16,
    },
    scrollViewContent: {
        paddingHorizontal: 16,
    },
    castItem: {
        marginRight: 16,
        alignItems: 'center',
    },
    imageContainer: {
        overflow: 'hidden',
        borderRadius: 100, // Para garantir que fique circular
        height: 80,
        width: 80,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#374151',
    },
    castImage: {
        height: '100%',
        width: '100%',
    },
    characterName: {
        color: 'white',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
    originalName: {
        color: '#6B7280',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
});

export default function Cast({ cast, navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Elenco</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollViewContent}
            >
                {cast &&
                    cast.map((person, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.castItem}
                            onPress={() => navigation.navigate('Person', person)}
                        >
                            <View style={styles.imageContainer}>
                                <Image
                                    style={styles.castImage}
                                    source={
                                        person?.profile_path
                                            ? { uri: image185(person.profile_path) }
                                            : fallBackPersonImage
                                    }
                                />
                            </View>
                            <Text style={styles.characterName}>
                                {person?.character?.length > 10
                                    ? person.character.slice(0, 10) + '...'
                                    : person.character}
                            </Text>
                            <Text style={styles.originalName}>
                                {person?.original_name?.length > 10
                                    ? person.original_name.slice(0, 10) + '...'
                                    : person.original_name}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </ScrollView>
        </View>
    );
}