import CryptoJS from 'crypto-js';

/**
 * Encrypts a string using AES-CBC.
 * @param {string} data - The data to encrypt.
 * @param {string} key - The hex string key (256-bit).
 * @returns {string} - The encrypted string (IV + Ciphertext).
 */
export const encryptData = (data, key) => {
    try {
        const iv = CryptoJS.lib.WordArray.random(16);
        const keyHex = CryptoJS.enc.Hex.parse(key);

        const encrypted = CryptoJS.AES.encrypt(data, keyHex, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        // Return IV + Ciphertext encoded in Hex or Base64
        // We'll use a delimiter or JSON
        return JSON.stringify({
            iv: iv.toString(CryptoJS.enc.Hex),
            content: encrypted.ciphertext.toString(CryptoJS.enc.Hex)
        });
    } catch (error) {
        console.error('Encryption Failed:', error);
        throw error;
    }
};

/**
 * Decrypts a string using AES-CBC.
 * @param {string} encryptedData - The JSON string containing IV and content.
 * @param {string} key - The hex string key.
 * @returns {string} - The decrypted data.
 */
export const decryptData = (encryptedData, key) => {
    try {
        const parsed = JSON.parse(encryptedData);
        const iv = CryptoJS.enc.Hex.parse(parsed.iv);
        const keyHex = CryptoJS.enc.Hex.parse(key);
        const ciphertext = CryptoJS.enc.Hex.parse(parsed.content);

        const decrypted = CryptoJS.AES.decrypt(
            { ciphertext: ciphertext },
            keyHex,
            {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );

        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption Failed:', error);
        throw error;
    }
};

/**
 * Generates a random 256-bit key.
 * @returns {string} - Hex string of the key.
 */
export const generateKey = () => {
    return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
};
