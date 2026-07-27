from django.urls import path
from .views import CarrinhoView, AdicionarItemView, FinalizarPedidoView, MeusPedidosView, AtualizarItemCarrinhoView, VendasVendedorView

urlpatterns = [
    path('carrinho/', CarrinhoView.as_view(), name='carrinho'),
    path('carrinho/adicionar/', AdicionarItemView.as_view(), name='adicionar-item'),
    path('finalizar/', FinalizarPedidoView.as_view(), name='finalizar-pedido'),
    path('meus-pedidos/', MeusPedidosView.as_view(), name='meus-pedidos'),
    path('itens/<int:pk>/', AtualizarItemCarrinhoView.as_view(), name='atualizar-item-carrinho'),
    path('vendas/', VendasVendedorView.as_view(), name='vendas-vendedor'),
]