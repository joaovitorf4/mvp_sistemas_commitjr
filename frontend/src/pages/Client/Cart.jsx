import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

export function Cart() {
  const { cart, loadCart, removeFromCart, clearCart } = useContext(CartContext);
  const { signed } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estados dos novos campos
  const [cep, setCep] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [cupomInput, setCupomInput] = useState('');
  const [descontoPercentual, setDescontoPercentual] = useState(0);
  const [mensagemCupom, setMensagemCupom] = useState({ tipo: '', texto: '' });
  const [loadingCupom, setLoadingCupom] = useState(false);

  const itensCarrinho = cart?.itens || (Array.isArray(cart) ? cart : []);

  const subtotal = itensCarrinho?.reduce((acc, item) => acc + (parseFloat(item.preco_unitario || 0) * item.quantidade), 0) || 0;
  const cepLimpo = cep.replace(/\D/g, '');
  const frete = cepLimpo.length === 8
    ? (((cepLimpo.split('').reduce((acc, digit) => acc + Number(digit), 0) % 21) + 5))
    : 0;
  const valorDesconto = (subtotal * descontoPercentual) / 100;
  
  // Total somando o valor do frete e subtraindo o desconto
  const totalFinal = subtotal - valorDesconto + frete;

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Função para alterar a quantidade (+1 ou -1)
  async function handleAlterarQuantidade(item, delta) {
    const novaQuantidade = item.quantidade + delta;

    // 1. Se a quantidade for <= 0, remove o item do carrinho
    if (novaQuantidade <= 0) {
      await removeFromCart(item.id);
      return;
    }

    // 2. Validação de estoque disponível (evita pedir mais do que há no estoque)
    const estoqueDisponivel = item.produto_detalhe?.quantidade_estoque;
    if (estoqueDisponivel !== undefined && novaQuantidade > estoqueDisponivel) {
      alert(`Estoque insuficiente! A quantidade máxima disponível para "${item.produto_detalhe?.titulo}" é ${estoqueDisponivel}.`);
      return;
    }

    // 3. Atualiza a quantidade no backend
    try {
      const token = localStorage.getItem('@MVP:token');
      await api.patch(
        `/orders/itens/${item.id}/`,
        { quantidade: novaQuantidade },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadCart(); // Recarrega os dados atualizados do carrinho
    } catch (error) {
      console.error("Erro ao alterar quantidade:", error);
      const msg = error.response?.data?.detail || 'Erro ao atualizar a quantidade no carrinho.';
      alert(msg);
    }
  }

  // Função para validar o cupom com a API
  async function handleValidarCupom() {
    if (!cupomInput.trim()) {
      setMensagemCupom({ tipo: 'erro', texto: 'Digite um código de cupom.' });
      return;
    }

    try {
      setLoadingCupom(true);
      setMensagemCupom({ tipo: '', texto: '' });

      const token = localStorage.getItem('@MVP:token');
      const response = await api.post('/promotions/validar/', 
        { codigo: cupomInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const percentual = parseFloat(response.data.cupom?.percentual_desconto || 0);
      setDescontoPercentual(percentual);
      setMensagemCupom({ tipo: 'sucesso', texto: response.data.detail || 'Cupom aplicado com sucesso!' });
    } catch (error) {
      console.error("Erro ao validar cupom:", error);
      setDescontoPercentual(0);
      const mensagemErro = error.response?.data?.detail || 'Cupom inválido ou expirado.';
      setMensagemCupom({ tipo: 'erro', texto: mensagemErro });
    } finally {
      setLoadingCupom(false);
    }
  }

  // Função para finalizar o pedido (corrigida para incluir valor_total e valor_desconto)
  async function handleFinalizarPedido() {
    if (!signed) {
      alert('Você precisa fazer login para finalizar a compra.');
      navigate('/login');
      return;
    }

    const cepLimpo = cep.replace(/\D/g, '');
    if (!cepLimpo || cepLimpo.length !== 8) {
      alert('Por favor, informe um CEP válido com 8 dígitos.');
      return;
    }

    try {
      const token = localStorage.getItem('@MVP:token');
      
      const dadosPedido = {
        cep_entrega: cepLimpo,
        forma_pagamento: formaPagamento,
        cupom: cupomInput.trim() || null,
        frete: frete,
        valor_desconto: valorDesconto,
        valor_total: totalFinal
      };

      const response = await api.post('/orders/finalizar/', dadosPedido, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(response.data.detail || 'Pedido realizado com sucesso!');
      clearCart();
      navigate('/cliente/pedidos'); 
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      const msg = error.response?.data?.detail || 'Ocorreu um erro ao processar seu pedido. Tente novamente.';
      alert(msg);
    }
  }

  return (
    <div style={styles.container}>
      <h1>Seu Carrinho de Compras</h1>
      
      {itensCarrinho.length === 0 ? (
        <div style={styles.emptyContainer}>
          <p>Seu carrinho está vazio.</p>
          <button onClick={() => navigate('/')} style={styles.btnPrimary}>Voltar para a Vitrine</button>
        </div>
      ) : (
        <div style={styles.cartContent}>
          <div style={styles.itemsList}>
            {itensCarrinho.map(item => (
              <div key={item.id} style={styles.itemRow}>
                <div>
                  <h3>{item.produto_detalhe?.titulo}</h3>
                  <p style={styles.fabricante}>Fabricante: {item.produto_detalhe?.fabricante}</p>
                  
                  {/* Controles de Quantidade */}
                  <div style={styles.qtdContainer}>
                    <span>Qtd: </span>
                    <button 
                      onClick={() => handleAlterarQuantidade(item, -1)} 
                      style={styles.btnQtd}
                      title="Diminuir quantidade"
                    >
                      -
                    </button>
                    <strong>{item.quantidade}</strong>
                    <button 
                      onClick={() => handleAlterarQuantidade(item, 1)} 
                      style={styles.btnQtd}
                      title="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={styles.itemRight}>
                  <strong style={styles.price}>
                    {(parseFloat(item.preco_unitario || 0) * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </strong>
                  <button onClick={() => removeFromCart(item.id)} style={styles.btnLink}>Remover</button>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.summaryCard}>
            <h3>Resumo do Pedido</h3>

            {/* Campo de CEP */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>CEP de Entrega:</label>
              <input
                type="text"
                placeholder="00000000"
                maxLength={8}
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                style={styles.input}
              />
            </div>

            {/* Campo de Forma de Pagamento */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Forma de Pagamento:</label>
              <select
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
                style={styles.input}
              >
                <option value="pix">Pix</option>
                <option value="cartao_credito">Cartão de Crédito</option>
                <option value="boleto">Boleto Bancário</option>
              </select>
            </div>

            {/* Campo de Cupom de Desconto */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Cupom de Desconto:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Ex: COMMIT10"
                  value={cupomInput}
                  onChange={(e) => setCupomInput(e.target.value)}
                  style={{ ...styles.input, flex: 1, textTransform: 'uppercase' }}
                />
                <button 
                  onClick={handleValidarCupom} 
                  disabled={loadingCupom}
                  style={styles.btnCupom}
                >
                  {loadingCupom ? '...' : 'Aplicar'}
                </button>
              </div>
              {mensagemCupom.texto && (
                <small style={{ 
                  color: mensagemCupom.tipo === 'sucesso' ? '#28a745' : '#dc3545',
                  marginTop: '0.25rem',
                  display: 'block'
                }}>
                  {mensagemCupom.texto}
                </small>
              )}
            </div>

            {/* Valores e Totais */}
            <div style={styles.calculationSection}>
              <div style={styles.subtotalRow}>
                <span>Subtotal:</span>
                <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>

              {descontoPercentual > 0 && (
                <div style={styles.discountRow}>
                  <span>Desconto ({descontoPercentual}%):</span>
                  <span>- {valorDesconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              )}

              <div style={styles.subtotalRow}>
                <span>Frete:</span>
                <span>
                  {frete > 0 
                    ? frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                    : 'Informe o CEP'}
                </span>
              </div>

              <div style={styles.totalRow}>
                <span>Total:</span>
                <strong style={styles.totalPrice}>
                  {totalFinal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </strong>
              </div>
            </div>

            <button onClick={handleFinalizarPedido} style={styles.btnCheckout}>Finalizar Pedido</button>
            <button onClick={() => navigate('/')} style={styles.btnSecondary}>Continuar Comprando</button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'Arial, sans-serif' },
  cartContent: { display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1.5rem' },
  itemsList: { flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '1rem' },
  itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #eee' },
  fabricante: { fontSize: '0.85rem', color: '#666', margin: '0.2rem 0' },
  qtdContainer: { display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' },
  btnQtd: { width: '28px', height: '28px', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#e9ecef', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' },
  itemRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' },
  price: { color: '#333', fontSize: '1.1rem' },
  btnLink: { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' },
  summaryCard: { flex: '1 1 300px', backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e9ecef', display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  label: { fontSize: '0.9rem', color: '#495057', fontWeight: 'bold' },
  input: { padding: '0.5rem', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '0.95rem' },
  btnCupom: { padding: '0.5rem 1rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  calculationSection: { borderTop: '1px solid #ddd', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  subtotalRow: { display: 'flex', justifyContent: 'space-between', color: '#6c757d', fontSize: '0.95rem' },
  discountRow: { display: 'flex', justifyContent: 'space-between', color: '#28a745', fontSize: '0.95rem', fontWeight: 'bold' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', fontSize: '1.2rem', borderTop: '1px dashed #ccc' },
  totalPrice: { color: '#28a745' },
  btnCheckout: { width: '100%', padding: '0.75rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' },
  btnSecondary: { width: '100%', padding: '0.6rem', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnPrimary: { padding: '0.6rem 1.2rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '1rem' },
  emptyContainer: { textAlign: 'center', padding: '3rem 0', color: '#666' }
};