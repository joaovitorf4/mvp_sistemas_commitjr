from rest_framework import serializers
from .models import Pedido, ItemPedido
from catalog.models import Produto
from catalog.serializers import ProdutoSerializer

class ItemPedidoSerializer(serializers.ModelSerializer):
    """
    Serializer para exibir os detalhes de um item dentro do pedido.
    """
    # Traz os dados completos do produto (título, fabricante, etc.) para o frontend
    produto_detalhe = ProdutoSerializer(source='produto', read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = ItemPedido
        fields = [
            'id', 
            'produto', 
            'produto_detalhe', 
            'quantidade', 
            'preco_unitario', 
            'subtotal'
        ]
        # O preço unitário é fixado pelo sistema com base no catálogo, nunca enviado pelo usuário
        read_only_fields = ['preco_unitario']

    def get_subtotal(self, obj):
        """
        Calcula dinamicamente o valor total deste item (quantidade x preço).
        """
        return obj.quantidade * obj.preco_unitario


class PedidoSerializer(serializers.ModelSerializer):
    """
    Serializer principal para o Pedido / Carrinho.
    """
    # Cria o aninhamento para listar todos os itens que pertencem a este pedido
    itens = ItemPedidoSerializer(many=True, read_only=True)
    valor_total = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = [
            'id', 
            'cliente', 
            'status', 
            'itens', 
            'cep_entrega', 
            'valor_frete', 
            'valor_total', 
            'criado_em', 
            'atualizado_em'
        ]
        read_only_fields = ['cliente', 'status', 'valor_frete']

    def get_valor_total(self, obj):
        """
        Soma o subtotal de todos os itens do pedido para dar o valor total do carrinho.
        """
        return sum(item.quantidade * item.preco_unitario for item in obj.itens.all())


class AdicionarItemSerializer(serializers.Serializer):
    """
    Serializer de entrada (somente escrita) para validar quando o cliente 
    adiciona algo ao carrinho.
    """
    produto_id = serializers.IntegerField()
    quantidade = serializers.IntegerField(min_value=1, default=1)

    def validate_produto_id(self, value):
        # Valida se o produto realmente existe e se há estoque disponível
        try:
            produto = Produto.objects.get(id=value)
            if produto.quantidade_estoque <= 0:
                raise serializers.ValidationError("Este produto está esgotado.")
        except Produto.DoesNotExist:
            raise serializers.ValidationError("Produto não encontrado no catálogo.")
        return value