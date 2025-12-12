import React, { createContext, useReducer, useContext, useEffect, useState } from 'react';
import { initDB } from '../services/DBService';
import { palettes, spacing, typography } from '../theme';
import * as SecureStore from 'expo-secure-store'; // Using SecureStore for persistence as it's already installed

const MemoContext = createContext();

const initialState = {
    memories: [],
    isLoading: true,
};

const memoReducer = (state, action) => {
    switch (action.type) {
        case 'DB_INITIALIZED':
            return { ...state, isLoading: false };
        default:
            return state;
    }
};

export const MemoProvider = ({ children }) => {
    const [state, dispatch] = useReducer(memoReducer, initialState);
    const [themeName, setThemeName] = useState('midnight');
    const [theme, setTheme] = useState({
        colors: palettes.midnight,
        spacing,
        typography
    });

    useEffect(() => {
        const loadDB = async () => {
            try {
                await initDB();
                dispatch({ type: 'DB_INITIALIZED' });
            } catch (error) {
                console.error('Failed to init DB:', error);
                dispatch({ type: 'DB_INITIALIZED' });
            }
        };

        const loadTheme = async () => {
            try {
                const savedTheme = await SecureStore.getItemAsync('user_theme');
                if (savedTheme && palettes[savedTheme]) {
                    setThemeName(savedTheme);
                    setTheme({
                        colors: palettes[savedTheme],
                        spacing,
                        typography
                    });
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        };

        loadDB();
        loadTheme();
    }, []);

    const updateTheme = async (newThemeName) => {
        if (palettes[newThemeName]) {
            setThemeName(newThemeName);
            setTheme({
                colors: palettes[newThemeName],
                spacing,
                typography
            });
            try {
                await SecureStore.setItemAsync('user_theme', newThemeName);
            } catch (error) {
                console.error('Failed to save theme:', error);
            }
        }
    };

    return (
        <MemoContext.Provider value={{ state, dispatch, theme, themeName, setTheme: updateTheme }}>
            {!state.isLoading && children}
        </MemoContext.Provider>
    );
};

export const useMemoContext = () => useContext(MemoContext);
export const useTheme = () => {
    const context = useContext(MemoContext);
    return context.theme;
};
