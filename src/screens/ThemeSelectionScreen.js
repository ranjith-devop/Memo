import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMemoContext } from '../contexts/MemoContext';
import { palettes } from '../theme';
import { Ionicons } from '@expo/vector-icons';

export default function ThemeSelectionScreen({ navigation }) {
    const { theme, setTheme, themeName } = useMemoContext();
    const { colors, spacing, typography } = theme;

    const themes = [
        { id: 'midnight', name: 'Midnight', icon: 'moon' },
        { id: 'sunlight', name: 'Sunlight', icon: 'sunny' },
        { id: 'ocean', name: 'Ocean', icon: 'water' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.title, { color: colors.text }]}>Select Theme</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {themes.map((item) => (
                    <Pressable
                        key={item.id}
                        style={[
                            styles.themeCard,
                            {
                                backgroundColor: palettes[item.id].surface,
                                borderColor: themeName === item.id ? colors.primary : colors.border
                            }
                        ]}
                        onPress={() => setTheme(item.id)}
                    >
                        <View style={styles.themePreview}>
                            <View style={[styles.colorCircle, { backgroundColor: palettes[item.id].primary }]} />
                            <View style={[styles.colorCircle, { backgroundColor: palettes[item.id].background }]} />
                            <View style={[styles.colorCircle, { backgroundColor: palettes[item.id].text }]} />
                        </View>
                        <View style={styles.themeInfo}>
                            <Ionicons name={item.icon} size={24} color={palettes[item.id].text} />
                            <Text style={[styles.themeName, { color: palettes[item.id].text }]}>{item.name}</Text>
                        </View>
                        {themeName === item.id && (
                            <View style={[styles.checkContainer, { backgroundColor: colors.primary }]}>
                                <Ionicons name="checkmark" size={16} color={colors.surface} />
                            </View>
                        )}
                    </Pressable>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    content: {
        padding: 16,
        gap: 16,
    },
    themeCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 80,
    },
    themePreview: {
        flexDirection: 'row',
        gap: 8,
    },
    colorCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    themeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
        marginLeft: 24,
    },
    themeName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    checkContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
