import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useMemoContext } from '../contexts/MemoContext';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SearchScreen from '../screens/SearchScreen';
import CreateScreen from '../screens/CreateScreen';
import QuickCaptureScreen from '../screens/QuickCaptureScreen';
import PhotoDetailScreen from '../screens/PhotoDetailScreen';
import MemoryDetailScreen from '../screens/MemoryDetailScreen';
import TaskDetailScreen from '../screens/TaskDetailScreen';
import ChecklistEditorScreen from '../screens/ChecklistEditorScreen';
import NoteEditorScreen from '../screens/NoteEditorScreen';
import VoiceNoteScreen from '../screens/VoiceNoteScreen';
import MoodScreen from '../screens/MoodScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import SecuritySetupScreen from '../screens/onboarding/SecuritySetupScreen';
import ThemeSelectionScreen from '../screens/ThemeSelectionScreen';
import TodoListScreen from '../screens/TodoListScreen';
import PasswordListScreen from '../screens/PasswordListScreen';
import PasswordDetailScreen from '../screens/PasswordDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    const { theme } = useMemoContext();
    const { colors } = theme;

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerStyle: { backgroundColor: colors.primary },
                headerTintColor: colors.surface,
                tabBarActiveTintColor: colors.surface,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    elevation: 10,
                    backgroundColor: colors.surface === '#FFFFFF' ? '#F0F0F0' : '#2A2A2A', // Dynamic background
                    borderRadius: 35,
                    height: 70,
                    borderTopWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 10,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 10,
                    paddingBottom: 0,
                    borderWidth: 1,
                    borderColor: colors.border,
                },
                tabBarShowLabel: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Search') {
                        iconName = focused ? 'search' : 'search-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return (
                        <View style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 50,
                            height: 50,
                            borderRadius: 25,
                            backgroundColor: focused ? colors.primary : 'transparent',
                            transform: [{ translateY: focused ? -5 : 0 }],
                        }}>
                            <Ionicons name={iconName} size={24} color={focused ? colors.surface : colors.textSecondary} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Search" component={SearchScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
}

export default function RootNavigator({ initialRouteName }) {
    // We can't use useMemoContext here if RootNavigator is the one wrapped by MemoProvider in App.js
    // But since TabNavigator is a child, it CAN use the context.
    // For Stack screens, they handle their own internal theming (like background color).
    // However, the Stack.Navigator itself doesn't expose many style props that need dynamic theming 
    // except maybe the default background color of the container.

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="SecuritySetup" component={SecuritySetupScreen} />
                <Stack.Screen name="ThemeSelection" component={ThemeSelectionScreen} />
                <Stack.Screen name="Main" component={TabNavigator} />
                <Stack.Screen name="TodoList" component={TodoListScreen} />
                <Stack.Screen name="PasswordList" component={PasswordListScreen} />
                <Stack.Screen name="PasswordDetail" component={PasswordDetailScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen
                    name="Create"
                    component={CreateScreen}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="QuickCapture"
                    component={QuickCaptureScreen}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="PhotoDetail"
                    component={PhotoDetailScreen}
                    options={{ headerShown: true, title: 'Photo' }}
                />
                <Stack.Screen
                    name="MemoryDetail"
                    component={MemoryDetailScreen}
                    options={{ headerShown: true, title: 'Memory' }}
                />
                <Stack.Screen
                    name="TaskDetail"
                    component={TaskDetailScreen}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="ChecklistEditor"
                    component={ChecklistEditorScreen}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="NoteEditor"
                    component={NoteEditorScreen}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="VoiceNote"
                    component={VoiceNoteScreen}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="Mood"
                    component={MoodScreen}
                    options={{ presentation: 'modal' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
