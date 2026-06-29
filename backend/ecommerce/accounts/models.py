from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    # Definindo as opções de tipo de usuário
    TIPO_USUARIO_CHOICES = (
        ('cliente', 'Cliente'),
        ('vendedor', 'Vendedor'),
    )
    
    tipo_usuario = models.CharField(
        max_length=10, 
        choices=TIPO_USUARIO_CHOICES, 
        default='cliente'
    )
    
    # CEP é obrigatório para vendedor na sua regra de negócio, mas deixamos 
    # null=True no banco porque clientes podem se cadastrar sem CEP inicialmente.
    # A validação de obrigatoriedade faremos no Serializer mais para frente.
    cep = models.CharField(max_length=9, blank=True, null=True) 
    
    # É uma boa prática em APIs usar o email de forma única
    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.username} - {self.get_tipo_usuario_display()}"