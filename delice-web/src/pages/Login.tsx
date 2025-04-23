import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signIn(formData.email, formData.password);
      navigate('/');
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
          Login
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" gutterBottom>
          Entre com suas credenciais
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ 
          mt: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
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
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: { xs: 2, sm: 3 } }}
          >
            {loading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/register')}
            >
              Não tem uma conta? Cadastre-se
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 