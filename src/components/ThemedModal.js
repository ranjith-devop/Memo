import React, { useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, Animated, Dimensions } from 'react-native';
import { useMemoContext } from '../contexts/MemoContext';

const { width } = Dimensions.get('window');

export default function ThemedModal({ visible, title, message, options = [], onClose }) {
    const { theme } = useMemoContext();
    const { colors, spacing, typography } = theme;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 200,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            scaleAnim.setValue(0.9);
            opacityAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <Animated.View
                    style={[
                        styles.container,
                        {
                            backgroundColor: colors.surface,
                            borderColor: colors.border,
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    <View style={styles.content}>
                        {title && <Text style={[styles.title, { color: colors.text }]}>{title}</Text>}
                        {message && <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>}
                    </View>

                    <View style={styles.options}>
                        {options.map((option, index) => {
                            const isDestructive = option.style === 'destructive';
                            const isCancel = option.style === 'cancel';

                            return (
                                <Pressable
                                    key={index}
                                    style={({ pressed }) => [
                                        styles.optionButton,
                                        {
                                            borderTopColor: colors.border,
                                            backgroundColor: pressed ? colors.background : 'transparent'
                                        }
                                    ]}
                                    onPress={() => {
                                        if (option.onPress) option.onPress();
                                        if (isCancel) onClose();
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            {
                                                color: isDestructive ? colors.error : (isCancel ? colors.textSecondary : colors.primary),
                                                fontWeight: isCancel ? 'normal' : '600'
                                            }
                                        ]}
                                    >
                                        {option.text}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        width: width * 0.8,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    content: {
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 22,
    },
    options: {
        borderTopWidth: 0,
    },
    optionButton: {
        paddingVertical: 16,
        alignItems: 'center',
        borderTopWidth: 1,
    },
    optionText: {
        fontSize: 17,
    },
});
