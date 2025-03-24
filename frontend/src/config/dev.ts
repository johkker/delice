import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Get the local IP address from Expo's development server
const getLocalIP = () => {
    // Get the manifest URL from Expo Constants
    const manifestUrl = Constants.expoConfig?.hostUri;
    if (!manifestUrl) return 'localhost';

    // Extract IP from manifest URL (format: exp://192.168.1.100:8081)
    const ipMatch = manifestUrl.match(/exp:\/\/([^:]+)/);
    return ipMatch ? ipMatch[1] : 'http://172.20.224.137';
};

export const DEV_CONFIG = {
    // Enable remote debugging
    enableRemoteDebugging: true,
    // Use the local IP for development
    devServerUrl: `http://${getLocalIP()}:8081`,
    // Enable network inspection
    enableNetworkInspection: true,
    // Log all network requests
    logNetworkRequests: true,
};

// Log development configuration
if (__DEV__) {
    console.log('Development Configuration:', DEV_CONFIG);
    console.log('Manifest URL:', Constants.expoConfig?.hostUri);
    console.log('Local IP:', getLocalIP());
} 