import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { v4 as uuidv4 } from 'uuid';

const MEDIA_DIR = FileSystem.documentDirectory + 'media/';

export const initMedia = async () => {
    try {
        const dirInfo = await FileSystem.getInfoAsync(MEDIA_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
        }
    } catch (error) {
        console.error('Failed to init media dir:', error);
    }
};

export const pickImage = async () => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permission denied');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7, // Compress
            allowsEditing: false,
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }
        return null;
    } catch (error) {
        console.error('Pick image failed:', error);
        throw error;
    }
};

export const takePhoto = async () => {
    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Permission denied');
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.7,
        });

        if (!result.canceled) {
            return result.assets[0].uri;
        }
        return null;
    } catch (error) {
        console.error('Take photo failed:', error);
        throw error;
    }
};

export const saveMedia = async (uri) => {
    try {
        await initMedia();
        const ext = uri.split('.').pop();
        const filename = `${uuidv4()}.${ext}`;
        const newPath = MEDIA_DIR + filename;

        await FileSystem.copyAsync({
            from: uri,
            to: newPath
        });

        return {
            path: newPath,
            filename: filename
        };
    } catch (error) {
        console.error('Save media failed:', error);
        throw error;
    }
};

export const deleteMedia = async (path) => {
    try {
        await FileSystem.deleteAsync(path, { idempotent: true });
    } catch (error) {
        console.error('Delete media failed:', error);
    }
};
