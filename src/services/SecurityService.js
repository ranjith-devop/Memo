import * as SecureStore from 'expo-secure-store';
import { generateKey } from './EncryptionService';

const MK_STORAGE_KEY = 'memo_mk_enc';
const IS_ONBOARDED_KEY = 'memo_is_onboarded';
const SECURITY_ENABLED_KEY = 'memo_security_enabled';

let masterKey = null;

// Mutex implementation to serialize SecureStore operations
class Mutex {
    constructor() {
        this._queue = Promise.resolve();
    }

    lock(callback) {
        const next = this._queue.then(() => callback().catch(e => {
            console.error('Mutex operation failed:', e);
            throw e;
        }));
        this._queue = next.catch(() => { }); // Prevent unhandled rejection in queue
        return next;
    }
}

const securityMutex = new Mutex();

export const isSecurityEnabled = async () => {
    return securityMutex.lock(async () => {
        // Check public flag first to avoid auth prompt
        const flag = await SecureStore.getItemAsync(SECURITY_ENABLED_KEY);
        if (flag === 'true') return true;

        // Fallback for migration: check if MK exists (might trigger auth on some devices, but necessary once)
        const result = await SecureStore.getItemAsync(MK_STORAGE_KEY);
        if (result) {
            // Migrate: set the flag so next time we don't need auth
            await SecureStore.setItemAsync(SECURITY_ENABLED_KEY, 'true');
            return true;
        }
        return false;
    });
};

export const isOnboarded = async () => {
    return securityMutex.lock(async () => {
        const result = await SecureStore.getItemAsync(IS_ONBOARDED_KEY);
        return result === 'true';
    });
};

export const setOnboarded = async () => {
    return securityMutex.lock(async () => {
        await SecureStore.setItemAsync(IS_ONBOARDED_KEY, 'true');
    });
};

export const ensureMasterKeyExists = async () => {
    return securityMutex.lock(async () => {
        const existing = await SecureStore.getItemAsync(MK_STORAGE_KEY, {
            authenticationPrompt: 'Unlock Memo'
        });
        if (!existing) {
            const newKey = generateKey();
            await SecureStore.setItemAsync(MK_STORAGE_KEY, newKey, {
                requireAuthentication: true,
                keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
            });
            console.log('Master Key generated');
            return newKey;
        }
        return existing;
    });
};

// Internal helper for use within locked contexts
const _ensureMasterKeyExistsInternal = async () => {
    const existing = await SecureStore.getItemAsync(MK_STORAGE_KEY, {
        authenticationPrompt: 'Unlock Memo'
    });
    if (!existing) {
        const newKey = generateKey();
        await SecureStore.setItemAsync(MK_STORAGE_KEY, newKey, {
            requireAuthentication: true,
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY
        });
        console.log('Master Key generated');
        return newKey;
    }
    return existing;
};

export const initializeSecurity = async () => {
    return securityMutex.lock(async () => {
        await SecureStore.setItemAsync(SECURITY_ENABLED_KEY, 'true');
        return await _ensureMasterKeyExistsInternal();
    });
};

export const disableSecurity = async () => {
    return securityMutex.lock(async () => {
        await SecureStore.setItemAsync(SECURITY_ENABLED_KEY, 'false');
    });
};

export const unlockApp = async (preloadedKey = null) => {
    if (preloadedKey) {
        masterKey = preloadedKey;
        return true;
    }

    return securityMutex.lock(async () => {
        try {
            // We rely on SecureStore to trigger authentication because the key was stored  
            // with requireAuthentication: true.
            const key = await SecureStore.getItemAsync(MK_STORAGE_KEY, {
                authenticationPrompt: 'Unlock Memo' // iOS only, Android uses system default
            });

            if (key) {
                masterKey = key;
                return true;
            }
            return false;
        } catch (error) {
            const msg = error.message || error.toString();
            if (msg.toLowerCase().includes('canceled') || msg.toLowerCase().includes('cancelled')) {
                console.log('Unlock canceled by user');
                return false;
            }
            // If another auth is in progress (should be caught by mutex, but just in case)
            if (msg.includes('Authentication is already in progress')) {
                console.log('Auth already in progress, ignoring');
                return false;
            }
            console.error('Unlock failed:', error);
            return false;
        }
    });
};

export const lockApp = () => {
    masterKey = null;
};

export const getMasterKey = () => {
    return masterKey;
};

export const isLocked = () => {
    return masterKey === null;
};
