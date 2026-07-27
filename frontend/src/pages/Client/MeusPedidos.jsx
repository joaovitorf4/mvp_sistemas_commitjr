import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

export function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Extraído 'loading' renomeado para 'loadingAuth' para não conflitar com o loading da página
  const { signed, loading: loadingAuth } = useContext(AuthContext); 
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Se o AuthContext ainda está lendo o localStorage (F5), não faz nada ainda
    if (loadingAuth) return;

    // 2. Se terminou a leitura e o usuário realmente não está logado, redireciona
    if (!signed) {
      navigate('/login');
      return;
    }

    async function carregarPedidos() {
      try {
        const token = localStorage.getItem('@MVP:token');
        
        const response = await api.get('/orders/meus-pedidos/', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const dadosPedidos = Array.isArray(response.data) 
          ? response.data 
          : response.data?.results || response.data?.pedidos || [];

        setPedidos(dadosPedidos);
      } catch (error) {
        console.error("Erro ao carregar histórico de pedidos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarPedidos();
  }, [signed, loadingAuth, navigate]);

  if (loadingAuth) {
    return <p style={styles.centeredText}>Carregando sessão...</p>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Seus Pedidos</h1>
          <p style={styles.subtitle}>Acompanhe o histórico de suas compras no marketplace.</p>
        </div>
        <button onClick={() => navigate('/')} style={styles.btnSecondary}>
          Voltar para a Home
        </button>
      </div>

      {loading ? (
        <p style={styles.centeredText}>Carregando seus pedidos...</p>
      ) : pedidos.length === 0 ? (
        <div style={styles.emptyContainer}>
          <p style={styles.emptyText}>Você ainda não realizou nenhuma compra.</p>
          <button onClick={() => navigate('/')} style={styles.btnPrimary}>Ir para as compras</button>
        </div>
      ) : (
        <div style={styles.pedidosList}>
          {pedidos.map((pedido) => (
            <div key={pedido.id} style={styles.pedidoCard}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.pedidoIdText}>Pedido #{pedido.id}</h3>
                  <span style={styles.dateText}>
                    {new Date(pedido.criado_em).toLocaleDateString('pt-BR')} às {new Date(pedido.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={styles.priceAndStatus}>
                  <span style={styles.statusBadge}>{pedido.status.toUpperCase()}</span>
                  <strong style={styles.totalPrice}>
                    {parseFloat(pedido.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                </div>
              </div>

              {pedido.cep_entrega && (
                <p style={styles.infoText}>CEP de Entrega: <strong>{pedido.cep_entrega}</strong></p>
              )}

              <hr style={styles.divider} />

              <h4 style={styles.itensTitle}>Itens do Pedido:</h4>
              <div style={styles.itensGrid}>
                {pedido.itens?.map((item) => (
                  <div key={item.id} style={styles.itemRow}>
                    <div>
                      <strong>{item.produto_detalhe?.titulo || `Produto #${item.produto}`}</strong>
                      <span style={styles.quantidadeText}> (x{item.quantidade})</span>
                    </div>
                    <span>
                      {parseFloat(item.subtotal || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Arial, sans-serif' },
  header: { marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '2rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#000' },
  subtitle: { color: '#6c757d', margin: 0, fontSize: '1rem' },
  pedidosList: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  pedidoCard: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #e9ecef' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' },
  pedidoIdText: { margin: 0, fontSize: '1.2rem', color: '#333' },
  dateText: { fontSize: '0.85rem', color: '#6c757d' },
  priceAndStatus: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' },
  statusBadge: { backgroundColor: '#d4edda', color: '#155724', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' },
  totalPrice: { fontSize: '1.25rem', color: '#28a745' },
  infoText: { fontSize: '0.9rem', color: '#495057', margin: '0.5rem 0 0 0' },
  divider: { margin: '1rem 0', border: 'none', borderTop: '1px solid #eee' },
  itensTitle: { margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#495057' },
  itensGrid: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  itemRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#333' },
  quantidadeText: { color: '#6c757d', fontSize: '0.9rem' },
  centeredText: { textAlign: 'center', fontSize: '1.2rem', color: '#666', marginTop: '3rem' },
  emptyContainer: { textAlign: 'center', padding: '3rem 0', color: '#666', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' },
  emptyText: { margin: 0, color: '#6c757d', fontSize: '1rem' },
  btnPrimary: { padding: '0.6rem 1.2rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnSecondary: { padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};