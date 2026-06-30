from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Pedido, ItemPedido
from catalog.models import Produto
from .serializers import PedidoSerializer, AdicionarItemSerializer

class CarrinhoView(views.APIView):
    """
    Exibe o carrinho atual (Pedido em aberto) do usuário autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Procura por um pedido 'carrinho'. Se não existir, cria um zerado na hora.
        pedido, _ = Pedido.objects.get_or_create(cliente=request.user, status='carrinho')
        serializer = PedidoSerializer(pedido)
        return Response(serializer.data)


class AdicionarItemView(views.APIView):
    """
    Adiciona um produto ao carrinho ou aumenta a quantidade se ele já existir lá.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AdicionarItemSerializer(data=request.data)
        if serializer.is_valid():
            produto_id = serializer.validated_data['produto_id']
            quantidade = serializer.validated_data['quantidade']
            
            produto = get_object_or_404(Produto, id=produto_id)
            
            # Captura ou cria o carrinho ativo do usuário
            pedido, _ = Pedido.objects.get_or_create(cliente=request.user, status='carrinho')
            
            # Verifica se o item já foi adicionado antes a este mesmo carrinho
            item, criado = ItemPedido.objects.get_or_create(
                pedido=pedido,
                produto=produto,
                defaults={'quantidade': quantidade, 'preco_unitario': produto.preco}
            )
            
            if not criado:
                # Se o item já existia no carrinho, apenas incrementa a quantidade
                item.quantidade += quantidade
                # Atualiza para o preço mais recente do catálogo, por garantia
                item.preco_unitario = produto.preco
                item.save()
            
            return Response(
                {"detail": f"'{produto.titulo}' adicionado ao carrinho com sucesso!"}, 
                status=status.HTTP_201_CREATED
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FinalizarPedidoView(views.APIView):
    """
    Fecha o carrinho, valida estoque final, calcula frete fake e altera status para pago.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Busca o carrinho atual do usuário
        pedido = Pedido.objects.filter(cliente=request.user, status='carrinho').first()
        
        if not pedido or not pedido.itens.exists():
            return Response({"detail": "Seu carrinho está vazio."}, status=status.HTTP_400_BAD_REQUEST)
        
        cep_entrega = request.data.get('cep_entrega')
        if not cep_entrega or len(cep_entrega) != 8:
            return Response({"detail": "Informe um CEP de entrega válido com 8 dígitos."}, status=status.HTTP_400_BAD_REQUEST)
        
        # 1. Validação de Segurança de Estoque
        for item in pedido.itens.all():
            if item.produto.quantidade_estoque < item.quantidade:
                return Response(
                    {"detail": f"Estoque insuficiente para o produto '{item.produto.titulo}'. Disponível: {item.produto.quantidade_estoque}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # 2. Baixa no Estoque real das tabelas do catálogo
        for item in pedido.itens.all():
            item.produto.quantidade_estoque -= item.quantidade
            item.produto.save()
        
        # 3. Regra de Negócio: Cálculo de frete simulado e fechamento
        pedido.cep_entrega = cep_entrega
        pedido.valor_frete = 15.00  # Valor fixo simulado para o MVP
        pedido.status = 'pago'      # Transiciona o status, congelando o carrinho
        pedido.save()
        
        return Response(
            {
                "detail": "Pedido finalizado com sucesso!", 
                "pedido_id": pedido.id,
                "status": pedido.status
            }, 
            status=status.HTTP_200_OK
        )