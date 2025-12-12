import React from 'react';
import { View, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';

export default function PhotoDetailScreen({ navigation, route }) {
    const { uri } = route.params;

    const handleShare = async () => {
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri);
        }
    };

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.header} edges={['top', 'left', 'right']}>
                <Pressable onPress={() => navigation.goBack()} style={styles.button}>
                    <Ionicons name="close" size={28} color={colors.surface} />
                </Pressable>
                <Pressable onPress={handleShare} style={styles.button}>
                    <Ionicons name="share-outline" size={28} color={colors.surface} />
                </Pressable>
            </SafeAreaView>

            <Image
                source={{ uri }}
                style={styles.image}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: spacing.m,
    },
    button: {
        padding: spacing.s,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
    },
    image: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
