import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { signed, user } = useContext(AuthContext);

  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function carregarDetalhes() {
      try {
        setLoading(true);
        const response = await api.get(`/catalog/produtos/${id}/`);
        setProduto(response.data);
      } catch (err) {
        console.error("Erro ao carregar produto:", err);
        setError('Não foi possível carregar os detalhes deste produto.');
      } finally {
        setLoading(false);
      }
    }

    carregarDetalhes();
  }, [id]);

  async function handleAdicionarAoCarrinho() {
    if (!signed) {
      alert('Você precisa estar logado para adicionar itens ao carrinho!');
      navigate('/login');
      return;
    }

    if (user.tipo_usuario === 'vendedor') {
      alert('Contas de vendedor não podem realizar compras!');
      return;
    }

    try {
      await api.post('/orders/carrinho/adicionar/', {
        produto_id: produto.id,
        quantidade: 1
      });

      alert(`${produto.titulo} foi adicionado ao seu carrinho!`);
      navigate('/');
    } catch (err) {
      console.error("Erro ao adicionar ao carrinho:", err);
      alert('Erro ao adicionar produto ao carrinho. Verifique o endpoint do backend.');
    }
  }

  if (loading) return <div style={styles.centered}>Carregando detalhes do produto...</div>;
  if (error) return <div style={styles.centered}>{error} <br/><button onClick={() => navigate('/')} style={styles.btnBack}>Voltar para Home</button></div>;
  if (!produto) return <div style={styles.centered}>Produto não encontrado.</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/')} style={styles.btnBack}>← Voltar para a Vitrine</button>
      
      <div style={styles.cardDetail}>
        {/* Lado Esquerdo: Imagem */}
        <div style={styles.imageSection}>
          {produto.imagem ? (
            <img src={produto.imagem} alt={produto.titulo} style={styles.image} />
          ) : (
            <div style={styles.noImage}>Sem imagem disponível</div>
          )}
        </div>

        {/* Lado Direito: Informações */}
        <div style={styles.infoSection}>
          <span style={styles.badgeVendor}>Vendedor: {produto.vendedor?.username || 'Desconhecido'}</span>
          <h1 style={styles.title}>{produto.titulo}</h1>
          
          <p style={styles.price}>
            {parseFloat(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>

          <div style={styles.descriptionContainer}>
            <h4 style={styles.descTitle}>Descrição do Produto</h4>
            <p style={styles.description}>
              {produto.descricao || 'Este produto não possui uma descrição detalhada.'}
            </p>
          </div>

          <button onClick={handleAdicionarAoCarrinho} style={styles.btnCart}>
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Arial, sans-serif' },
  btnBack: { padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem' },
  cardDetail: { display: 'flex', flexWrap: 'wrap', gap: '2rem', backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  imageSection: { flex: '1 1 400px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' },
  image: { width: '100%', maxHeight: '450px', objectFit: 'contain' },
  noImage: { height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d', backgroundColor: '#e9ecef', width: '100%' },
  infoSection: { flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  badgeVendor: { alignSelf: 'flex-start', backgroundColor: '#e2e3e5', color: '#383d41', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1rem' },
  title: { fontSize: '2rem', margin: '0 0 1rem 0', color: '#333' },
  price: { fontSize: '2.2rem', fontWeight: 'bold', color: '#28a745', margin: '0 0 1.5rem 0' },
  descriptionContainer: { borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '2rem' },
  descTitle: { margin: '0 0 0.5rem 0', color: '#555' },
  description: { color: '#666', lineHeight: '1.6', margin: 0 },
  btnCart: { padding: '1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(40, 167, 69, 0.2)' },
  centered: { textAlign: 'center', marginTop: '5rem', fontSize: '1.2rem', fontFamily: 'Arial, sans-serif', color: '#666' }
};