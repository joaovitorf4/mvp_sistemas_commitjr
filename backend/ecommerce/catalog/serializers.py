from rest_framework import serializers
from .models import Categoria, Produto
from accounts.serializers import UserProfileSerializer

class CategoriaSerializer(serializers.ModelSerializer):
    """
    Serializer para gerir as categorias dos produtos.
    """
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'descricao']


class ProdutoSerializer(serializers.ModelSerializer):
    """
    Serializer principal para o cadastro e listagem de produtos.
    """
    # Tornamos o vendedor read_only para que nenhum utilizador malintencionado
    # tente enviar o ID de outro vendedor no JSON.
    vendedor = UserProfileSerializer(read_only=True)
    
    # Permite exibir o nome da categoria na listagem, mas mantém a escrita por ID
    categoria_detalhe = CategoriaSerializer(source='categoria', read_only=True)

    class Meta:
        model = Produto
        fields = [
            'id', 
            'vendedor', 
            'categoria', 
            'categoria_detalhe', 
            'titulo', 
            'fabricante', 
            'descricao', 
            'preco', 
            'quantidade_estoque',
            'imagem',
            'criado_em',
            'atualizado_em'
        ]

    def validate_imagem(self, value):
        """
        Valida se o tamanho da imagem não ultrapassa 5MB.
        """
        # 5MB = 5 * 1024 * 1024 bytes
        limite_tamanho = 5 * 1024 * 1024
        
        if value.size > limite_tamanho:
            raise serializers.ValidationError("A imagem não pode ser maior que 5 MB.")
        
        return value
        
    def validate_preco(self, value):
        """
        Validação customizada: Garante que o preço nunca seja negativo ou zero.
        """
        if value <= 0:
            raise serializers.ValidationError("O preço do produto deve ser maior que zero.")
        return value