import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, SegmentedButtons } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { authService } from '../../services/api';
import { VerificationData } from '../../types/auth';

type RootStackParamList = {
    Home: undefined;
    Login: undefined;
};

type VerificationScreenRouteProp = RouteProp<{
    Verification: { token: string };
}, 'Verification'>;

type VerificationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home' | 'Login'>;

export const VerificationScreen = () => {
    const navigation = useNavigation<VerificationScreenNavigationProp>();
    const route = useRoute<VerificationScreenRouteProp>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');
    const [code, setCode] = useState('');

    const handleVerification = async () => {
        try {
            setLoading(true);
            setError(null);
            const data: VerificationData = {
                token: route.params.token,
                code,
            };

            if (verificationType === 'email') {
                await authService.verifyEmail(data);
            } else {
                await authService.verifyPhone(data);
            }

            navigation.replace('Home');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao verificar código');
        } finally {
            setLoading(false);
        }
    };

    const handleResendCode = async () => {
        try {
            setLoading(true);
            setError(null);
            await authService.resendCode({
                token: route.params.token,
                type: verificationType,
            });
            // Show success message or handle UI feedback
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao reenviar código');
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
                    Verificação
                </Text>
                <Text variant="bodyLarge" style={styles.subtitle}>
                    Digite o código enviado para seu {verificationType === 'email' ? 'email' : 'telefone'}
                </Text>

                <SegmentedButtons
                    value={verificationType}
                    onValueChange={(value) => setVerificationType(value as 'email' | 'phone')}
                    buttons={[
                        { value: 'email', label: 'Email' },
                        { value: 'phone', label: 'Telefone' },
                    ]}
                    style={styles.segmentedButtons}
                />

                <TextInput
                    label="Código de Verificação"
                    value={code}
                    onChangeText={setCode}
                    mode="outlined"
                    keyboardType="number-pad"
                    maxLength={6}
                    style={styles.input}
                />

                {error && (
                    <Text style={styles.errorText} variant="bodyMedium">
                        {error}
                    </Text>
                )}

                <Button
                    mode="contained"
                    onPress={handleVerification}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                >
                    Verificar
                </Button>

                <Button
                    mode="text"
                    onPress={handleResendCode}
                    disabled={loading}
                    style={styles.linkButton}
                >
                    Reenviar código
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
    segmentedButtons: {
        marginBottom: 24,
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