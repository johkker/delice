import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api';
import { RegisterData } from '../types/auth';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { setTempCredentials } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    phone: '',
    document: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { token } = await authService.register(formData);
      // Store credentials for later use in phone verification
      setTempCredentials({
        email: formData.email,
        password: formData.password
      });
      toast.success('Cadastro iniciado com sucesso!');
      navigate(`/verify-email?token=${token}`);
    } catch (error) {
      // Error will be handled by the API interceptor
    } finally {
      setLoading(false);
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
          Criar Conta
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
          Preencha seus dados para começar
        </Typography>

        <Box component="form" onSubmit={handleRegister} sx={{ 
          mt: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          <TextField
            fullWidth
            label="Nome Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            autoComplete="email"
          />

          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            helperText="Mínimo de 6 caracteres"
          />

          <TextField
            fullWidth
            label="Telefone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            placeholder="(99) 99999-9999"
          />

          <TextField
            fullWidth
            label="CPF/CNPJ"
            value={formData.document}
            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
            required
            placeholder="000.000.000-00"
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: { xs: 2, sm: 3 } }}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/login')}
            >
              Já tem uma conta? Faça login
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 