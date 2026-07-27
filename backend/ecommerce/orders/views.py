from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import models
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

    def delete(self, request):
        item_id = request.data.get('item_id')
        
        if not item_id:
            return Response({'erro': 'ID do item não informado.'}, status=status.HTTP_400_BAD_REQUEST)

        # Busca o carrinho (Pedido com status 'carrinho') do usuário logado
        pedido = Pedido.objects.filter(cliente=request.user, status='carrinho').first()
        
        if pedido:
            # Remove o item da tabela ItemPedido correspondente ao ID enviado
            ItemPedido.objects.filter(pedido=pedido, id=item_id).delete()
            return Response({'mensagem': 'Item removido com sucesso.'}, status=status.HTTP_200_OK)

        return Response({'erro': 'Carrinho não encontrado.'}, status=status.HTTP_404_NOT_FOUND)


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
    Fecha o carrinho, valida estoque final, registra frete e desconto, e altera status para pago.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        pedido = Pedido.objects.filter(cliente=request.user, status='carrinho').first()
        
        frete = request.data.get('valor_frete') if request.data.get('valor_frete') is not None else request.data.get('frete', 0)
        valor_desconto = request.data.get('valor_desconto') if request.data.get('valor_desconto') is not None else request.data.get('desconto', 0)
        
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
        
        # 3. Regra de Negócio: Grava CEP, valor_frete e valor_desconto
        subtotal = sum(item.quantidade * item.preco_unitario for item in pedido.itens.all())
        
        pedido.cep_entrega = cep_entrega
        pedido.valor_frete = frete
        pedido.valor_desconto = valor_desconto
        pedido.valor_total = float(subtotal) - float(valor_desconto) + float(frete)
        pedido.status = 'pago'
        pedido.save()
        
        return Response(
            {
                "detail": "Pedido finalizado com sucesso!", 
                "pedido_id": pedido.id,
                "status": pedido.status,
                "frete": pedido.valor_frete
            }, 
            status=status.HTTP_200_OK
        )

class MeusPedidosView(views.APIView):
    """
    Retorna o histórico de todos os pedidos finalizados do cliente autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Busca os pedidos do usuário, excluindo o carrinho ativo e ordenando dos mais recentes para os mais antigos
        pedidos = Pedido.objects.filter(cliente=request.user).exclude(status='carrinho').order_by('-id')
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data)

class AtualizarItemCarrinhoView(views.APIView):
    """
    Atualiza a quantidade de um item do carrinho do usuário autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            # Garante que o item pertence a um carrinho ativo do usuário logado
            item = ItemPedido.objects.get(id=pk, pedido__cliente=request.user, pedido__status='carrinho')
        except ItemPedido.DoesNotExist:
            return Response({"detail": "Item não encontrado no carrinho."}, status=status.HTTP_404_NOT_FOUND)

        quantidade = request.data.get('quantidade')

        if quantidade is None or int(quantidade) < 1:
            return Response({"detail": "Quantidade deve ser pelo menos 1."}, status=status.HTTP_400_BAD_REQUEST)

        # Validação de estoque no backend
        if item.produto.quantidade_estoque < int(quantidade):
            return Response(
                {"detail": f"Estoque insuficiente. Disponível: {item.produto.quantidade_estoque}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        item.quantidade = int(quantidade)
        item.save()

        return Response({"detail": "Quantidade atualizada com sucesso!"}, status=status.HTTP_200_OK)

class VendasVendedorView(views.APIView):
    """
    Retorna todos os pedidos de clientes que possuem pelo menos
    um produto pertencente ao vendedor autenticado.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'tipo_usuario', '').lower() != 'vendedor':
            return Response(
                {"detail": "Acesso permitido apenas para vendedores."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        # Filtra pedidos que possuem produtos do vendedor e exclui os que são apenas 'carrinho'
        pedidos = Pedido.objects.filter(
            itens__produto__vendedor=request.user
        ).exclude(status='carrinho').distinct().order_by('-criado_em')

        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)