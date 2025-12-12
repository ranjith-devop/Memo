import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function MemoryDetailScreen({ navigation, route }) {
    const { title, items = [] } = route.params || {};

    const renderItem = ({ item }) => (
        <Pressable
            style={styles.itemContainer}
            onPress={() => navigation.navigate('PhotoDetail', { uri: item.uri })}
        >
            <Image source={{ uri: item.uri }} style={styles.image} />
        </Pressable>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={styles.title}>{title || 'Memory'}</Text>
            </View>

            <FlatList
                data={items}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderItem}
                numColumns={3}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyText}>No items in this memory.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        marginRight: spacing.m,
    },
    title: {
        ...typography.h3,
        color: colors.text,
    },
    list: {
        padding: spacing.s,
    },
    itemContainer: {
        flex: 1 / 3,
        aspectRatio: 1,
        padding: spacing.xs,
    },
    image: {
        flex: 1,
        borderRadius: 8,
        backgroundColor: colors.surface,
    },
    empty: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        ...typography.body,
        color: colors.textSecondary,
    },
});
