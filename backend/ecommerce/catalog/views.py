from rest_framework import generics, permissions
from .models import Produto, Categoria
from .serializers import ProdutoSerializer, CategoriaSerializer

# --- PERMISSÕES CUSTOMIZADAS ---

class IsVendedor(permissions.BasePermission):
    """
    Permissão que concede acesso apenas se o utilizador for um Vendedor.
    """
    def has_permission(self, request, view):
        # Permite ações de leitura (GET, HEAD, OPTIONS) para qualquer utilizador autenticado
        if request.method in permissions.SAFE_METHODS:
            return True
        # Ações de escrita (POST) exigem que o utilizador seja vendedor
        return request.user.is_authenticated and request.user.tipo_usuario == 'vendedor'


class IsDonoDoProduto(permissions.BasePermission):
    """
    Permissão que garante que o vendedor só possa modificar o seu próprio produto.
    """
    def has_object_permission(self, request, view, obj):
        # Métodos de leitura são permitidos
        if request.method in permissions.SAFE_METHODS:
            return True
        # Métodos de alteração/eliminação exigem que o utilizador seja o dono
        return obj.vendedor == request.user


# --- VIEWS PÚBLICAS (VITRINE) ---

class ProdutoListView(generics.ListAPIView):
    """
    Lista todos os produtos disponíveis no marketplace (Público).
    """
    queryset = Produto.objects.all().order_by('-criado_em')
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.AllowAny] # Livre para todos


class ProdutoDetailView(generics.RetrieveAPIView):
    """
    Exibe os detalhes de um produto específico (Público).
    """
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.AllowAny]


# --- VIEWS PRIVADAS (ÁREA DO VENDEDOR) ---

class VendedorProdutoListCreateView(generics.ListCreateAPIView):
    """
    Área do Vendedor: Lista apenas os produtos dele e permite criar novos.
    """
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendedor]

    def get_queryset(self):
        # Sobrescrevemos a busca para que o vendedor VEJA APENAS os seus produtos
        return Produto.objects.filter(vendedor=self.request.user).order_by('-criado_em')

    def perform_create(self, serializer):
        # Injeta automaticamente o utilizador logado como o vendedor do produto
        serializer.save(vendedor=self.request.user)


class VendedorProdutoDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Área do Vendedor: Permite visualizar, atualizar ou eliminar um produto específico do próprio vendedor.
    """
    serializer_class = ProdutoSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendedor, IsDonoDoProduto]

    def get_queryset(self):
        # Garante que mesmo que o vendedor tente adivinhar o ID de outra pessoa pela URL, o Django não encontre
        return Produto.objects.filter(vendedor=self.request.user)