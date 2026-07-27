import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!username || !password) {
      setError('Preencha todos os campos!');
      return;
    }

    try {
      setError('');
      setLoadingForm(true);
      
      const success = await login(username, password);

      if (success) {
        navigate('/');
      } else {
        setError('Usuário ou senha incorretos.');
      }
    } catch (err) {
      setError('Ocorreu um erro ao tentar fazer login. Tente novamente.');
      setError('O erro é ', err.message || 'desconhecido.');
    } finally {
      setLoadingForm(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Entrar no Marketplace</h2>
        
        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label htmlFor="username">Nome de Usuário</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ex: joaovitor"
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loadingForm} style={styles.button}>
            {loadingForm ? 'Carregando...' : 'Entrar'}
          </button>
        </form>

        <p style={styles.footerText}>
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
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
    height: '100vh',
    backgroundColor: '#f4f6f9',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    marginBottom: '1.5rem',
    textAlign: 'center',
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
    gap: '0.5rem'
  },
  input: {
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem'
  },
  button: {
    padding: '0.75rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '0.5rem'
  },
  error: {
    color: 'red',
    backgroundColor: '#ffe6e6',
    padding: '0.5rem',
    borderRadius: '4px',
    textAlign: 'center',
    marginBottom: '1rem'
  },
  footerText: {
    marginTop: '1.5rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#666'
  }
};