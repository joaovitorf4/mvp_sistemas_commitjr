import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const CartContext = createContext({});

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // useCallback evita que a função seja recriada a cada renderização, impedindo loops no useEffect
  const loadCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('@MVP:token');
      if (!token) return;

      const response = await api.get('/orders/carrinho/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const backendItens = response.data.itens || [];

      const carrinhoFormatado = backendItens.map(item => {
        const detalhe = item.produto_detalhe || {};
        const precoNumerico = parseFloat(detalhe.preco || item.preco_unitario || 0);

        const produtoObj = {
          ...detalhe,
          id: detalhe.id || item.produto,
          titulo: detalhe.titulo || '',
          nome: detalhe.titulo || '',
          title: detalhe.titulo || '',
          fabricante: detalhe.fabricante || '',
          preco: precoNumerico,
          price: precoNumerico,
        };

        return {
          ...produtoObj,
          id: item.id, // ID do item do carrinho
          itemCarrinhoId: item.id,
          produto: item.produto, // Mantém o ID numérico original do produto (ex: 9)
          quantidade: item.quantidade,
          preco_unitario: precoNumerico,
          subtotal: item.subtotal || (precoNumerico * item.quantidade),
          produto_detalhe: produtoObj,
        };
      });

      setCart(carrinhoFormatado);
    } catch (error) {
      console.error("Erro ao carregar o carrinho do backend:", error);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  async function addToCart(product, quantidade = 1) {
    try {
      const token = localStorage.getItem('@MVP:token');
      if (!token) return;

      const productId = product.id || product;

      await api.post('/orders/carrinho/adicionar/', {
        produto: productId,
        quantidade: quantidade
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await loadCart();
    } catch (error) {
      console.error("Erro ao adicionar item ao carrinho:", error);
    }
  }

  async function removeFromCart(itemId) {
    try {
      const token = localStorage.getItem('@MVP:token');
      if (!token) return;

      // 1. Envia a requisição DELETE para a CarrinhoView do Django
      await api.delete('/orders/carrinho/', {
        data: { item_id: itemId },
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Atualiza os dados sincronizados do backend imediatamente
      await loadCart();
    } catch (error) {
      console.error("Erro ao remover item do carrinho no backend:", error);
    }
  }

  function clearCart() {
    setCart([]);
    localStorage.removeItem('@MVP:cart');
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}