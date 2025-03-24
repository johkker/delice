import Constants from 'expo-constants';

const getApiUrl = () => {
    if (__DEV__) {
        return 'http://172.20.224.137:3333/api';
    }
    // Production URL (you'll need to update this when deploying)
    return 'https://your-production-api.com/api';
};

export const API_URL = getApiUrl();

// For debugging
if (__DEV__) {
    console.log('API URL:', API_URL);
    console.log('Development mode:', __DEV__);
    console.log('Manifest URL:', Constants.expoConfig?.hostUri);
} 