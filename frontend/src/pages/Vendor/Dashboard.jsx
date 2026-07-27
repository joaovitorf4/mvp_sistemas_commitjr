import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

export function Dashboard() {
  const { user, signed, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados dos produtos e vendas
  const [meusProdutos, setMeusProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendas, setVendas] = useState([]);
  const [loadingVendas, setLoadingVendas] = useState(true);

  // Estados para Cupons
  const [cupons, setCupons] = useState([]);
  const [loadingCupons, setLoadingCupons] = useState(true);
  const [novoCupom, setNovoCupom] = useState({
    codigo: '',
    tipo_aplicacao: 'produto', // 'produto' ou 'frete'
    percentual_desconto: '',
    valor_minimo_pedido: '',
    limite_uso: '',
    data_inicio: '',
    data_fim: ''
  });

  // Estados para o modo de Edição de produtos
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editFabricante, setEditFabricante] = useState('');
  const [editPreco, setEditPreco] = useState('');
  const [editEstoque, setEditEstoque] = useState('');
  const [editDescricao, setEditDescricao] = useState('');

  useEffect(() => {
    if (!signed || user?.tipo_usuario?.toLowerCase() !== 'vendedor') {
      alert('Acesso restrito para vendedores!');
      navigate('/');
    }
  }, [signed, user, navigate]);

  async function carregarMeusProdutos() {
    try {
      setLoading(true);
      const token = localStorage.getItem('@MVP:token');
      const response = await api.get('/catalog/produtos/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const filtrados = response.data.filter(prod => prod.vendedor?.username === user?.username);
      setMeusProdutos(filtrados);
    } catch (error) {
      console.error("Erro ao carregar seus produtos:", error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarVendas() {
    try {
      setLoadingVendas(true);
      const token = localStorage.getItem('@MVP:token');
      const response = await api.get('/orders/vendas/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dadosVendas = Array.isArray(response.data)
        ? response.data
        : response.data?.results || response.data?.vendas || [];

      setVendas(dadosVendas);
    } catch (error) {
      console.error("Erro ao carregar vendas:", error);
    } finally {
      setLoadingVendas(false);
    }
  }

  async function carregarCupons() {
    try {
      setLoadingCupons(true);
      const token = localStorage.getItem('@MVP:token');
      const response = await api.get('/promotions/cupons/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const dadosCupons = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setCupons(dadosCupons);
    } catch (error) {
      console.error("Erro ao carregar cupons:", error);
    } finally {
      setLoadingCupons(false);
    }
  }

  useEffect(() => {
    if (user?.username) {
      const timeoutId = setTimeout(() => {
        carregarMeusProdutos();
        carregarVendas();
        carregarCupons();
      }, 0);

      return () => clearTimeout(timeoutId);
    }
  }, [user]);

  // Função para criar novo cupom
  async function handleCriarCupom(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('@MVP:token');

      // Monta os campos obrigatórios
      const payload = {
        codigo: novoCupom.codigo.toUpperCase().trim(),
        tipo_aplicacao: novoCupom.tipo_aplicacao || 'produto',
        percentual_desconto: parseFloat(novoCupom.percentual_desconto) || 0,
      };

      // Insere campos opcionais no payload APENAS se estiverem preenchidos (evitando enviar null)
      if (novoCupom.valor_minimo_pedido) {
        payload.valor_minimo_pedido = parseFloat(novoCupom.valor_minimo_pedido);
      }
      if (novoCupom.limite_uso) {
        payload.limite_uso = parseInt(novoCupom.limite_uso, 10);
      }
      if (novoCupom.data_inicio) {
        payload.data_inicio = novoCupom.data_inicio;
      }
      if (novoCupom.data_fim) {
        payload.data_fim = novoCupom.data_fim;
      }

      await api.post('/promotions/cupons/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Cupom criado com sucesso!');
      setNovoCupom({
        codigo: '',
        tipo_aplicacao: 'produto',
        percentual_desconto: '',
        valor_minimo_pedido: '',
        limite_uso: '',
        data_inicio: '',
        data_fim: ''
      });
      carregarCupons();
    } catch (error) {
      console.error("Erro ao criar cupom:", error.response?.data || error);
      
      const erroMsg = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : 'Verifique as informações.';
      
      alert(`Erro ao cadastrar cupom: ${erroMsg}`);
    }
  }

  async function handleExcluirCupom(id) {
    if (!id) {
      alert('Identificador do cupom inválido.');
      return;
    }

    if (!window.confirm('Deseja excluir este cupom de desconto?')) return;

    try {
      const token = localStorage.getItem('@MVP:token');
      await api.delete(`/promotions/cupons/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cupom removido com sucesso!');
      carregarCupons();
    } catch (error) {
      console.error("Erro ao excluir cupom:", error.response?.data || error);
      const erroMsg = error.response?.data 
        ? JSON.stringify(error.response.data) 
        : 'Erro ao excluir cupom.';
      alert(`Erro ao excluir cupom: ${erroMsg}`);
    }
  }

  async function handleExcluirProduto(id) {
    if (!window.confirm('Tem certeza que deseja excluir este produto permanentemente?')) return;

    try {
      const token = localStorage.getItem('@MVP:token');
      await api.delete(`/catalog/produtos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Produto removido com sucesso!');
      carregarMeusProdutos();
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      alert('Erro ao excluir o produto do servidor.');
    }
  }

  function iniciarEdicao(produto) {
    setProdutoEditando(produto.id);
    setEditTitulo(produto.titulo);
    setEditFabricante(produto.fabricante);
    setEditPreco(produto.preco);
    setEditEstoque(produto.quantidade_estoque || 0);
    setEditDescricao(produto.descricao || '');
  }

  async function handleSalvarEdicao(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('@MVP:token');
      
      const dadosAtualizados = {
        titulo: editTitulo,
        fabricante: editFabricante,
        preco: parseFloat(editPreco),
        quantidade_estoque: parseInt(editEstoque, 10),
        descricao: editDescricao
      };

      await api.patch(`/catalog/produtos/${produtoEditando}/`, dadosAtualizados, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Produto atualizado com sucesso!');
      setProdutoEditando(null);
      carregarMeusProdutos();
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      alert('Erro ao atualizar produto. Verifique os dados.');
    }
  }

  if (!signed || user?.tipo_usuario?.toLowerCase() !== 'vendedor') return null;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1>Painel do Vendedor</h1>
          <p>Bem-vindo, <strong>{user?.username}</strong>!</p>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={() => navigate('/vendedor/adicionar-produto')} style={styles.btnSuccess}>+ Anunciar Produto</button>
          <button onClick={() => navigate('/')} style={styles.btnSecondary}>Voltar para Vitrine</button>
          <button onClick={() => { logout(); navigate('/login'); }} style={styles.btnDanger}>Sair</button>
        </div>
      </header>

      {/* Formulário de Edição rápida de Produto */}
      {produtoEditando && (
        <div style={{...styles.cardFull, marginBottom: '2rem', border: '2px solid #007bff'}}>
          <h2 style={styles.sectionTitle}>Editando Produto</h2>
          <form onSubmit={handleSalvarEdicao} style={styles.formRow}>
            <input type="text" value={editTitulo} onChange={e => setEditTitulo(e.target.value)} placeholder="Título" style={styles.input} required />
            <input type="text" value={editFabricante} onChange={e => setEditFabricante(e.target.value)} placeholder="Fabricante" style={styles.input} required />
            <input type="number" step="0.01" value={editPreco} onChange={e => setEditPreco(e.target.value)} placeholder="Preço" style={{...styles.input, width: '100px'}} required />
            <input type="number" min="0" value={editEstoque} onChange={e => setEditEstoque(e.target.value)} placeholder="Qtd Estoque" style={{...styles.input, width: '100px'}} required />
            <button type="submit" style={styles.btnSuccess}>Salvar</button>
            <button type="button" onClick={() => setProdutoEditando(null)} style={styles.btnSecondary}>Cancelar</button>
          </form>
        </div>
      )}

      {/* Seção: Gerenciamento de Cupons de Desconto */}
      <div style={{ ...styles.cardFull, marginBottom: '2rem' }}>
        <h2 style={styles.sectionTitle}>Cadastrar Novo Cupom de Desconto</h2>
        <form onSubmit={handleCriarCupom} style={styles.couponFormGrid}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Código do Cupom:</label>
            <input
              type="text"
              placeholder="Ex: PROMO10"
              value={novoCupom.codigo}
              onChange={e => setNovoCupom({ ...novoCupom, codigo: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Desconto Aplicado Em:</label>
            <select
              value={novoCupom.tipo_aplicacao}
              onChange={e => setNovoCupom({ ...novoCupom, tipo_aplicacao: e.target.value })}
              style={styles.input}
            >
              <option value="produto">Preço do Produto</option>
              <option value="frete">Frete</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Porcentagem de Desconto (%):</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max="100"
              placeholder="Ex: 10"
              value={novoCupom.percentual_desconto}
              onChange={e => setNovoCupom({ ...novoCupom, percentual_desconto: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Mínimo em Compras (R$):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Opcional. Ex: 100.00"
              value={novoCupom.valor_minimo_pedido}
              onChange={e => setNovoCupom({ ...novoCupom, valor_minimo_pedido: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Limite de Uso (Primeiros X):</label>
            <input
              type="number"
              min="1"
              placeholder="Opcional. Ex: 50"
              value={novoCupom.limite_uso}
              onChange={e => setNovoCupom({ ...novoCupom, limite_uso: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Data Inicial:</label>
            <input
              type="date"
              value={novoCupom.data_inicio}
              onChange={e => setNovoCupom({ ...novoCupom, data_inicio: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Data Final:</label>
            <input
              type="date"
              value={novoCupom.data_fim}
              onChange={e => setNovoCupom({ ...novoCupom, data_fim: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={{ ...styles.btnSuccess, width: '100%', padding: '0.65rem' }}>
              Criar Cupom
            </button>
          </div>
        </form>

        <h3 style={{ ...styles.sectionTitle, fontSize: '1.1rem', marginTop: '1.5rem' }}>Cupons Ativos</h3>
        {loadingCupons ? (
          <p>Carregando cupons...</p>
        ) : cupons.length === 0 ? (
          <p style={styles.emptyText}>Nenhum cupom cadastrado no momento.</p>
        ) : (
          <div style={styles.listContainer}>
            {cupons.map(c => {
              const idCupom = c.id || c.codigo;
              return (
                <div key={idCupom} style={styles.couponRow}>
                  <div>
                    <strong style={{ fontSize: '1.05rem', color: '#007bff' }}>{c.codigo}</strong>
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: '#555' }}>
                      ({c.tipo_aplicacao === 'frete' ? 'Desconto no Frete' : 'Desconto no Produto'})
                    </span>
                    <div style={styles.productFabricante}>
                      Desconto: <strong>{c.percentual_desconto}%</strong> | 
                      Mín. Pedido: <strong>{c.valor_minimo_pedido ? parseFloat(c.valor_minimo_pedido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'Nenhum'}</strong> | 
                      Usos: <strong>{c.usos_atuais ?? 0}{c.limite_uso ? ` / ${c.limite_uso}` : ''}</strong>
                    </div>
                    {(c.data_inicio || c.data_fim) && (
                      <div style={styles.productFabricante}>
                        Validade: {c.data_inicio ? new Date(c.data_inicio).toLocaleDateString('pt-BR') : 'Sem data início'} até {c.data_fim ? new Date(c.data_fim).toLocaleDateString('pt-BR') : 'Sem data fim'}
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleExcluirCupom(idCupom)} style={styles.btnDelete}>
                    Excluir
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seção: Compras feitas por Clientes */}
      <div style={{ ...styles.cardFull, marginBottom: '2rem' }}>
        <h2 style={styles.sectionTitle}>Vendas Realizadas / Pedidos dos Clientes</h2>
        
        {loadingVendas ? (
          <p>Carregando vendas efetuadas...</p>
        ) : vendas.length === 0 ? (
          <p style={styles.emptyText}>Você ainda não possui nenhuma venda registrada.</p>
        ) : (
          <div style={styles.listContainer}>
            {vendas.map(venda => (
              <div key={venda.id} style={styles.pedidoRow}>
                <div style={styles.productInfo}>
                  <strong>Pedido #{venda.id}</strong>
                  <span style={styles.productFabricante}>
                    Data: {new Date(venda.criado_em).toLocaleDateString('pt-BR')} às {new Date(venda.criado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={styles.productFabricante}>
                    Status: <strong>{venda.status?.toUpperCase()}</strong>
                    {venda.cep_entrega && ` | CEP Entrega: ${venda.cep_entrega}`}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={styles.productPriceText}>
                    {parseFloat(venda.valor_total || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção: Meus Produtos */}
      <div style={styles.cardFull}>
        <h2 style={styles.sectionTitle}>Seus Produtos Anunciados</h2>
        
        {loading ? (
          <p>Carregando seus anúncios...</p>
        ) : meusProdutos.length === 0 ? (
          <p style={styles.emptyText}>Você ainda não tem nenhum produto cadastrado.</p>
        ) : (
          <div style={styles.listContainer}>
            {meusProdutos.map(prod => (
              <div key={prod.id} style={styles.productRow}>
                <div style={styles.productInfo}>
                  <strong>{prod.titulo}</strong>
                  <span style={styles.productFabricante}>Fabricante: {prod.fabricante} | Qtd Estoque: <strong>{prod.quantidade_estoque ?? 0}</strong></span>
                  <span style={styles.productPriceText}>
                    {parseFloat(prod.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div style={styles.actionRowButtons}>
                  <button onClick={() => iniciarEdicao(prod)} style={styles.btnEdit}>Editar</button>
                  <button onClick={() => handleExcluirProduto(prod.id)} style={styles.btnDelete}>Excluir</button>
                  <button onClick={() => navigate(`/produto/${prod.id}`)} style={styles.btnView}>Ver</button>
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
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Arial, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' },
  headerButtons: { display: 'flex', gap: '0.5rem' },
  cardFull: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  card: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  sectionTitle: { fontSize: '1.4rem', color: '#333', marginBottom: '1.2rem', borderBottom: '1px solid #f0f0f0', paddingBottom: '0.5rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formRow: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' },
  couponFormGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  label: { fontSize: '0.85rem', fontWeight: 'bold', color: '#444' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  input: { padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.95rem' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  productRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' },
  pedidoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' },
  couponRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' },
  productInfo: { display: 'flex', flexDirection: 'column', gap: '0.2rem' },
  productFabricante: { fontSize: '0.85rem', color: '#666' },
  productPriceText: { color: '#28a745', fontWeight: 'bold', fontSize: '0.95rem' },
  emptyText: { color: '#777', fontStyle: 'italic' },
  actionRowButtons: { display: 'flex', gap: '0.4rem' },
  btnSuccess: { padding: '0.5rem 1rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' },
  btnSecondary: { padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnDanger: { padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnEdit: { padding: '0.4rem 0.8rem', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnDelete: { padding: '0.4rem 0.8rem', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnView: { padding: '0.4rem 0.8rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
};