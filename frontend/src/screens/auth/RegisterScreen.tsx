import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RegisterData } from '../../types/auth';

type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Verification: { token: string };
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login' | 'Verification'>;

export const RegisterScreen = () => {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<RegisterData>({
        name: '',
        email: '',
        password: '',
        phone: '',
        document: '',
    });

    const handleRegister = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await authService.register(formData);
            await AsyncStorage.setItem('token', response.token);
            await AsyncStorage.setItem('user', JSON.stringify(response.user));
            navigation.navigate('Verification', { token: response.token });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer cadastro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Surface style={styles.surface}>
                    <Text variant="headlineMedium" style={styles.title}>
                        Criar Conta
                    </Text>
                    <Text variant="bodyLarge" style={styles.subtitle}>
                        Preencha seus dados para se cadastrar
                    </Text>

                    <TextInput
                        label="Nome"
                        value={formData.name}
                        onChangeText={(text) => setFormData({ ...formData, name: text })}
                        mode="outlined"
                        style={styles.input}
                    />

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

                    <TextInput
                        label="Telefone"
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        mode="outlined"
                        keyboardType="phone-pad"
                        style={styles.input}
                    />

                    <TextInput
                        label="CPF/CNPJ"
                        value={formData.document}
                        onChangeText={(text) => setFormData({ ...formData, document: text })}
                        mode="outlined"
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    {error && (
                        <Text style={styles.errorText} variant="bodyMedium">
                            {error}
                        </Text>
                    )}

                    <Button
                        mode="contained"
                        onPress={handleRegister}
                        loading={loading}
                        disabled={loading}
                        style={styles.button}
                    >
                        Cadastrar
                    </Button>

                    <Button
                        mode="text"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.linkButton}
                    >
                        Já tem uma conta? Faça login
                    </Button>
                </Surface>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        flexGrow: 1,
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