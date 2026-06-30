from django.urls import path
from .views import CarrinhoView, AdicionarItemView, FinalizarPedidoView

urlpatterns = [
    path('carrinho/', CarrinhoView.as_view(), name='carrinho-detalhe'),
    path('carrinho/adicionar/', AdicionarItemView.as_view(), name='carrinho-adicionar'),
    path('finalizar/', FinalizarPedidoView.as_view(), name='pedido-finalizar'),
]