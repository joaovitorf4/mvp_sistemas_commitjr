from django.db import models
from django.conf import settings
from catalog.models import Produto

class Pedido(models.Model):
    STATUS_CHOICES = [
        ('carrinho', 'Carrinho Aberto'),
        ('pago', 'Pago / Concluído'),
        ('cancelado', 'Cancelado'),
    ]

    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='pedidos'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='carrinho')
    
    # Informações de entrega e valores calculados
    cep_entrega = models.CharField(max_length=8, blank=True, null=True)
    valor_frete = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    valor_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pedido {self.id} ({self.status}) - {self.cliente.username}"


class ItemPedido(models.Model):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name='itens'
    )
    produto = models.ForeignKey(
        Produto,
        on_delete=models.CASCADE,
        related_name='itens_pedido'
    )
    quantidade = models.PositiveIntegerField(default=1)
    
    # IMPORTANTE: Guardamos o preço do momento da compra para histórico financeiro.
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantidade}x {self.produto.titulo} (Pedido #{self.pedido.id})"