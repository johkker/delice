import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { DEV_CONFIG } from './src/config/dev';

// Enable remote debugging in development
if (__DEV__) {
    const { enableRemoteDebugging, devServerUrl } = DEV_CONFIG;
    if (enableRemoteDebugging) {
        // @ts-ignore
        global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
        // @ts-ignore
        global.FormData = global.originalFormData || global.FormData;
    }
}

export default function App() {
    return (
        <PaperProvider>
            <NavigationContainer>
                <AuthNavigator />
            </NavigationContainer>
        </PaperProvider>
    );
}
