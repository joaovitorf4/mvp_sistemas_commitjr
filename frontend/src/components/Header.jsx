import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function Header() {
  const { user, signed, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav style={styles.navbar}>
      <h2 style={styles.logo} onClick={() => navigate('/')}>Commit Marketplace</h2>
      
      <div style={styles.navActions}>
        {signed ? (
          <>
            <span style={styles.welcome}>Olá, <strong>{user.username}</strong> ({user.tipo_usuario})</span>
            {user.tipo_usuario === 'vendedor' && (
              <button onClick={() => navigate('/vendedor/dashboard')} style={styles.btnSecondary}>Painel Vendedor</button>
            )}
            {user.tipo_usuario === 'cliente' && (
              <>
                <button onClick={() => navigate('/carrinho')} style={styles.btnSecondary}>Carrinho</button>
                <button onClick={() => navigate('/cliente/pedidos')} style={styles.btnSecondary}>Meus Pedidos</button>
              </>
            )}
            <button onClick={() => { logout(); navigate('/login'); }} style={styles.btnDanger}>Sair</button>
          </>
        ) : (
          <button onClick={() => navigate('/login')} style={styles.btnPrimary}>Entrar / Login</button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  navbar: { fontFamily: 'Arial, sans-serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  logo: { color: '#007bff', cursor: 'pointer', margin: 0 },
  navActions: { display: 'flex', alignItems: 'center', gap: '1rem' },
  welcome: { fontSize: '0.9rem', color: '#333' },
  btnPrimary: { padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnSecondary: { padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnDanger: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};