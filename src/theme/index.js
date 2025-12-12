export const palettes = {
    midnight: {
        primary: '#00ceeeff',
        primaryVariant: '#a184e5ff',
        secondary: '#03DAC6',
        background: '#121212',
        surface: '#1E1E1E',
        error: '#CF6679',
        text: '#FFFFFF',
        textSecondary: '#B0B0B0',
        textTertiary: '#666666',
        border: '#333333',
        success: '#00C853',
        warning: '#FFAB00',
        white: '#FFFFFF',
        black: '#000000',
        statusBarStyle: 'light',
    },
    sunlight: {
        primary: '#6200EE',
        primaryVariant: '#3700B3',
        secondary: '#03DAC6',
        background: '#F5F5F5',
        surface: '#FFFFFF',
        error: '#B00020',
        text: '#000000',
        textSecondary: '#666666',
        textTertiary: '#999999',
        border: '#E0E0E0',
        success: '#00C853',
        warning: '#FFAB00',
        white: '#FFFFFF',
        black: '#000000',
        statusBarStyle: 'dark',
    },
    ocean: {
        primary: '#006994',
        primaryVariant: '#003366',
        secondary: '#48D1CC',
        background: '#001f3f',
        surface: '#003366',
        error: '#FF6347',
        text: '#E0F7FA',
        textSecondary: '#B2EBF2',
        textTertiary: '#80DEEA',
        border: '#004D40',
        success: '#00E676',
        warning: '#FFD740',
        white: '#FFFFFF',
        black: '#000000',
        statusBarStyle: 'light',
    }
};

export const spacing = {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    h3: {
        fontSize: 20,
        fontWeight: '600',
    },
    body: {
        fontSize: 16,
    },
    caption: {
        fontSize: 12,
    },
    button: {
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
};

// Default export for backward compatibility during migration
export const colors = palettes.midnight;
export const theme = {
    colors: palettes.midnight,
    spacing,
    typography,
};
