import { View, Dimensions, StyleSheet } from 'react-native';
import React from 'react';
import * as Progress from 'react-native-progress';
import { theme } from '../theme';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        height,
        width,
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
});

export default function Loading() {
    return (
        <View style={styles.container}>
            <Progress.CircleSnail thickness={12} size={160} color={theme.background} />
        </View>
    );
}
