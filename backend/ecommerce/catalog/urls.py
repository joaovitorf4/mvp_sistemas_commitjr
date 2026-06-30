from django.urls import path
from .views import (
    ProdutoListView, 
    ProdutoDetailView, 
    VendedorProdutoListCreateView, 
    VendedorProdutoDetailView
)

urlpatterns = [
    # Endpoints Públicos (Clientes e Visitantes)
    path('produtos/', ProdutoListView.as_view(), name='produto-list'),
    path('produtos/<int:pk>/', ProdutoDetailView.as_view(), name='produto-detail'),
    
    # Endpoints Privados (Gestão do Vendedor)
    path('vendor/produtos/', VendedorProdutoListCreateView.as_view(), name='vendor-produto-list-create'),
    path('vendor/produtos/<int:pk>/', VendedorProdutoDetailView.as_view(), name='vendor-produto-detail'),
]