import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

export function Orders() {
  // Extrai o 'loading' do AuthContext e renomeia para 'loadingAuth'
  const { signed, loading: loadingAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Se o AuthContext ainda está validando o token do localStorage no F5, aguarda
    if (loadingAuth) return;

    // 2. Só redireciona se a checagem terminou e o usuário realmente não está logado
    if (!signed) {
      navigate('/login');
    }
  }, [signed, loadingAuth, navigate]);

  useEffect(() => {
    async function carregarPedidos() {
      try {
        setLoading(true);
        const token = localStorage.getItem('@MVP:token');
        
        const response = await api.get('/orders/meus-pedidos/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const dados = Array.isArray(response.data) 
          ? response.data 
          : response.data?.results || response.data?.pedidos || [];

        setPedidos(dados);
      } catch (error) {
        console.error("Erro ao buscar histórico de pedidos:", error);
      } finally {
        setLoading(false);
      }
    }

    if (!loadingAuth && signed) {
      carregarPedidos();
    }
  }, [signed, loadingAuth]);

  if (loadingAuth) {
    return <p style={{ textAlign: 'center', marginTop: '3rem' }}>Carregando sessão...</p>;
  }

  if (!signed) return null;

  return (
    <div style={styles.container}>
      <h1>Seus Pedidos</h1>
      <p>Acompanhe o histórico de suas compras no marketplace.</p>

      {loading ? (
        <p>Carregando histórico...</p>
      ) : pedidos.length === 0 ? (
        <div style={styles.empty}>
          <p>Você ainda não realizou nenhuma compra.</p>
          <button onClick={() => navigate('/')} style={styles.btnPrimary}>Ir para as compras</button>
        </div>
      ) : (
        <div style={styles.list}>
          {pedidos.map(pedido => (
            <div key={pedido.id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <span>Pedido <strong>#{pedido.id}</strong></span>
                <span style={styles.statusBadge}>{pedido.status?.toUpperCase() || 'PROCESSADO'}</span>
              </div>
              <div style={styles.orderBody}>
                <p>Data: {new Date(pedido.criado_em).toLocaleDateString('pt-BR')}</p>
                <p>
                  Total: <strong style={styles.total}>
                    {parseFloat(pedido.valor_total || pedido.total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </p>
              </div>
            </div>
          ))}
          <button onClick={() => navigate('/')} style={styles.btnPrimary}>Home</button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Arial, sans-serif' },
  empty: { textAlign: 'center', padding: '3rem 0', color: '#666' },
  btnPrimary: { padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem', width: '20vh' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' },
  orderCard: { backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', overflow: 'hidden', width: '60vw' },
  orderHeader: { backgroundColor: '#f8f9fa', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' },
  statusBadge: { backgroundColor: '#e3f2fd', color: '#0d47a1', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' },
  orderBody: { padding: '1rem' },
  total: { color: '#28a745' }
};