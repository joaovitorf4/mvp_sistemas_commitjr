import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

export function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipo_usuario: 'cliente',
    cep: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 1. Validação simples de confirmação de senha
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    // 2. Montagem do payload base
    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      tipo_usuario: formData.tipo_usuario,
    };

    // 3. Validação e envio do CEP apenas se o usuário for Vendedor
    if (formData.tipo_usuario === 'vendedor') {
      const cepLimpo = formData.cep.replace(/\D/g, '');
      if (cepLimpo.length !== 8) {
        setError('Informe um CEP válido com 8 dígitos para o perfil de Vendedor.');
        return;
      }
      payload.cep = cepLimpo;
    }

    try {
      setLoading(true);

      await api.post('/auth/register/', payload);

      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
    } catch (err) {
      console.error('Erro no cadastro:', err);

      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'object') {
          const firstKey = Object.keys(data)[0];
          const firstError = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
          setError(`${firstKey}: ${firstError}`);
        } else {
          setError('Erro ao realizar cadastro. Verifique os dados fornecidos.');
        }
      } else {
        setError('Não foi possível se conectar ao servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Criar Nova Conta</h2>

        {error && <div style={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tipo de Perfil:</label>
            <select
              name="tipo_usuario"
              value={formData.tipo_usuario}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="cliente">Cliente</option>
              <option value="vendedor">Vendedor</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nome de Usuário (Username):</label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="ex: loja_teste"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>E-mail:</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="ex: vendas@lojateste.com"
              style={styles.input}
            />
          </div>

          {/* Campo CEP condicional: só exibe para vendedores */}
          {formData.tipo_usuario === 'vendedor' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>CEP da Loja/Vendedor:</label>
              <input
                type="text"
                name="cep"
                required
                maxLength={8}
                value={formData.cep}
                onChange={handleChange}
                placeholder="30140071"
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Senha:</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirmar Senha:</label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repita sua senha"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={styles.btnSubmit}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p style={styles.loginLink}>
          Já tem uma conta? <Link to="/login" style={styles.link}>Faça login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    padding: '1rem',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    border: '1px solid #eee'
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.3rem'
  },
  label: {
    fontSize: '0.9rem',
    color: '#495057',
    fontWeight: 'bold'
  },
  input: {
    padding: '0.65rem',
    borderRadius: '4px',
    border: '1px solid #ced4da',
    fontSize: '0.95rem'
  },
  btnSubmit: {
    marginTop: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
    fontSize: '0.9rem',
    border: '1px solid #f5c6cb'
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontSize: '0.9rem',
    color: '#666'
  },
  link: {
    color: '#007bff',
    textDecoration: 'none',
    fontWeight: 'bold'
  }
};