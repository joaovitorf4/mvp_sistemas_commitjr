import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

export function AddProduct() {
  const { user, signed } = useContext(AuthContext);
  const navigate = useNavigate();

  const [titulo, setTitulo] = useState('');
  const [fabricante, setFabricante] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('1');
  const [imagem, setImagem] = useState(null);
  const [formError, setFormError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  useEffect(() => {
    if (!signed || user?.tipo_usuario?.toLowerCase() !== 'vendedor') {
      alert('Acesso restrito!');
      navigate('/');
    }
  }, [signed, user, navigate]);

  async function handleCadastrarProduto(e) {
    e.preventDefault();

    if (!titulo || !preco || !fabricante || !estoque) {
      setFormError('Título, Fabricante, Preço e Estoque são obrigatórios!');
      return;
    }

    try {
      setFormError('');
      setLoadingForm(true);
      const token = localStorage.getItem('@MVP:token');

      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('fabricante', fabricante);
      formData.append('preco', parseFloat(preco));
      formData.append('quantidade_estoque', parseInt(estoque, 10));
      formData.append('descricao', descricao);
      
      if (imagem) {
        formData.append('imagem', imagem);
      }

      await api.post('/catalog/produtos/', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Produto cadastrado com sucesso!');
      navigate('/vendedor/dashboard');
    } catch (error) {
      console.error("Erro ao cadastrar produto:", error);
      setFormError('Erro ao cadastrar. Verifique os dados inseridos.');
    } finally {
      setLoadingForm(false);
    }
  }

  if (!signed || user?.tipo_usuario?.toLowerCase() !== 'vendedor') return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Cadastrar Novo Produto</h2>
        {formError && <p style={styles.error}>{formError}</p>}
        
        <form onSubmit={handleCadastrarProduto} style={styles.form}>
          <div style={styles.inputGroup}>
            <label>Título do Produto *</label>
            <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Teclado Mecânico" style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Fabricante *</label>
            <input type="text" value={fabricante} onChange={e => setFabricante(e.target.value)} placeholder="Ex: Logitech" style={styles.input} />
          </div>

          <div style={styles.rowInputs}>
            <div style={{...styles.inputGroup, flex: 1}}>
              <label>Preço (R$) *</label>
              <input type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} placeholder="0.00" style={styles.input} />
            </div>
            
            {/* Campo de quantidade de estoque adicionado aqui */}
            <div style={{...styles.inputGroup, flex: 1}}>
              <label>Quantidade em Estoque *</label>
              <input type="number" min="0" value={estoque} onChange={e => setEstoque(e.target.value)} placeholder="1" style={styles.input} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label>Upload da Imagem</label>
            <input type="file" accept="image/*" onChange={e => setImagem(e.target.files[0])} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label>Descrição</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Detalhes..." rows="4" style={{...styles.input, resize: 'none'}} />
          </div>

          <div style={styles.actions}>
            <button type="button" onClick={() => navigate('/vendedor/dashboard')} style={styles.btnSecondary}>Cancelar</button>
            <button type="submit" disabled={loadingForm} style={styles.btnSuccess}>
              {loadingForm ? 'Salvando...' : 'Cadastrar Produto'}
            </button>
          </div>
        </form>
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
  rowInputs: { display: 'flex', gap: '1rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  input: { padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' },
  error: { color: 'red', backgroundColor: '#ffe6e6', padding: '0.5rem', borderRadius: '4px' },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  productRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' },
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