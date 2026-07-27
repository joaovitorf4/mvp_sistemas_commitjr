from django.db import models
from django.conf import settings

class Cupom(models.Model):
    codigo = models.CharField(max_length=50, unique=True)
    percentual_desconto = models.DecimalField(max_digits=5, decimal_places=2)
    ativo = models.BooleanField(default=True)
    data_validade = models.DateTimeField(null=True, blank=True)
    
    vendedor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cupons',
        null=True,
        blank=True
    )

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.codigo} - {self.percentual_desconto}%"
    
    def save(self, *args, **kwargs):
        self.codigo = self.codigo.upper()
        super().save(*args, **kwargs)