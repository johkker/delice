import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginData } from '../../types/auth';

type RootStackParamList = {
    Register: undefined;
    Home: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export const LoginScreen = () => {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<LoginData>({
        email: '',
        password: '',
    });

    const handleLogin = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.login(formData);
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            navigation.replace('Home');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Surface style={styles.surface}>
                <Text variant="headlineMedium" style={styles.title}>
                    Bem-vindo ao Delice
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Faça login para continuar
                </Text>

                <TextInput
                    label="Email"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    mode="outlined"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                />

                <TextInput
                    label="Senha"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    mode="outlined"
                    secureTextEntry
                    style={styles.input}
                />

                {error && (
                    <Text style={styles.errorText} variant="bodyMedium">
                        {error}
                    </Text>
                )}

                <Button
                    mode="contained"
                    onPress={handleLogin}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Entrar
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.navigate('Register')}
                    style={styles.linkButton}
                >
                    Não tem uma conta? Cadastre-se
                </Button>
            </Surface>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    surface: {
        flex: 1,
        padding: 20,
        margin: 16,
        borderRadius: 8,
        elevation: 4,
    },
    title: {
        textAlign: 'center',
        marginBottom: 8,
        color: '#1a237e',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 24,
        color: '#666',
    },
    input: {
        marginBottom: 16,
    },
    button: {
        marginTop: 8,
        paddingVertical: 8,
    },
    linkButton: {
        marginTop: 16,
    },
    errorText: {
        color: '#d32f2f',
        marginBottom: 16,
        textAlign: 'center',
    },
}); 