import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function Home() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  // Busca os produtos da API ao carregar a página
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const response = await api.get('/catalog/produtos/');
        setProdutos(response.data);
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarProdutos();
  }, []);

  // Filtra os produtos pelo TÍTULO ou pelo NOME DA CATEGORIA
  const produtosFiltrados = produtos.filter(produto => {
    const termo = busca.toLowerCase();
    
    const combinaTitulo = produto.titulo?.toLowerCase().includes(termo);
    const combinaCategoria = produto.categoria_detalhe?.nome?.toLowerCase().includes(termo);

    return combinaTitulo || combinaCategoria;
  });

  return (
    <div style={styles.container}>
      {/* Seção Principal / Filtro de Busca */}
      <div style={styles.content}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            placeholder="Busque por produto ou categoria (ex: Eletrônicos)..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Listagem de Produtos */}
        {loading ? (
          <p style={styles.centeredText}>Carregando produtos...</p>
        ) : produtosFiltrados.length === 0 ? (
          <p style={styles.centeredText}>Nenhum produto encontrado.</p>
        ) : (
          <div style={styles.grid}>
            {produtosFiltrados.map(produto => (
              <div key={produto.id} style={styles.card} onClick={() => navigate(`/produto/${produto.id}`)}>
                {produto.imagem ? (
                  <img 
                    src={produto.imagem} 
                    alt={produto.titulo} 
                    style={styles.productImage} 
                  />
                ) : (
                  <div style={styles.noImage}>Sem imagem</div>
                )}
                <div style={styles.cardBody}>
                  <h3 style={styles.productTitle}>{produto.titulo}</h3>
                  {produto.categoria_detalhe?.nome && (
                    <span style={styles.categoryBadge}>{produto.categoria_detalhe.nome}</span>
                  )}
                  <p style={styles.productPrice}>
                    {parseFloat(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p style={styles.productVendor}>Vendedor: {produto.vendedor?.username || 'Desconhecido'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Arial, sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  searchContainer: { display: 'flex', justifyContent: 'center', margin: '2rem 0' },
  searchInput: { width: '100%', maxWidth: '600px', padding: '0.75rem 1rem', borderRadius: '25px', border: '1px solid #ccc', fontSize: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' },
  content: { padding: '0 2rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem', paddingBottom: '3rem' },
  card: { backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s' },
  productImage: { width: '100%', height: '200px', objectFit: 'cover' },
  noImage: { width: '100%', height: '200px', backgroundColor: '#e9ecef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6c757d' },
  cardBody: { padding: '1rem' },
  productTitle: { fontSize: '1.1rem', margin: '0 0 0.25rem 0', color: '#333' },
  categoryBadge: { display: 'inline-block', backgroundColor: '#e9ecef', color: '#495057', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', marginBottom: '0.5rem' },
  productPrice: { fontSize: '1.2rem', fontWeight: 'bold', color: '#28a745', margin: '0 0 0.5rem 0' },
  productVendor: { fontSize: '0.8rem', color: '#6c757d', margin: 0 },
  centeredText: { textAlign: 'center', fontSize: '1.2rem', color: '#666', marginTop: '3rem' }
};