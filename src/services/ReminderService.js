import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export const initReminders = async () => {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Notification permission not granted!');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Failed to init reminders:', error);
        return false;
    }
};

export const scheduleReminder = async (title, body, secondsFromNow) => {
    try {
        const hasPermission = await initReminders();
        if (!hasPermission) return null;

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: title,
                body: body,
            },
            trigger: {
                seconds: secondsFromNow,
            },
        });
        return id;
    } catch (error) {
        console.error('Failed to schedule reminder:', error);
        throw error;
    }
};

export const cancelReminder = async (id) => {
    try {
        await Notifications.cancelScheduledNotificationAsync(id);
    } catch (error) {
        console.error('Failed to cancel reminder:', error);
    }
};
