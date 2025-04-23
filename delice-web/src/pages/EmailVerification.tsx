import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import { VerificationData } from '../types/auth';
import toast from 'react-hot-toast';

export default function EmailVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenParam = params.get('token');
    if (!tokenParam) {
      toast.error('Token de verificação não encontrado');
      navigate('/register');
      return;
    }
    setToken(tokenParam);
  }, [location, navigate]);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const verificationData: VerificationData = {
        token,
        code: verificationCode,
      };
      const { success } = await authService.verifyEmail(verificationData);
      if (success) {
        toast.success('Email verificado com sucesso!');
        navigate(`/verify-phone?token=${token}`);
      }
    } catch (error) {
      // Error will be handled by the API interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setResending(true);
      await authService.resendCode({ token, type: 'email' });
      toast.success('Código reenviado com sucesso!');
    } catch (error) {
      // Error will be handled by the API interceptor
    } finally {
      setResending(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ 
      width: '100%', 
      p: { xs: 2, sm: 3 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <Paper elevation={3} sx={{ 
        p: { xs: 2, sm: 3 },
        width: '100%',
        maxWidth: '480px',
        mt: { xs: 2, sm: 4 },
        borderRadius: { xs: 2, sm: 3 }
      }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Verificar Email
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
          Digite o código enviado para seu email
        </Typography>

        <Box component="form" onSubmit={handleVerification} sx={{ 
          mt: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <TextField
            fullWidth
            label="Código de Verificação"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
            placeholder="000000"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: { xs: 2, sm: 3 } }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verificar'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button
              variant="text"
              disabled={resending}
              onClick={handleResendCode}
            >
              {resending ? 'Reenviando...' : 'Reenviar código'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 