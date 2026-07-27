from rest_framework import serializers
from .models import Cupom
from django.utils import timezone

class CupomSerializer(serializers.ModelSerializer):
    """
    Serializer para exibir os dados do cupom aprovado.
    """
    class Meta:
        model = Cupom
        fields = ['id', 'codigo', 'percentual_desconto', 'ativo', 'data_validade', 'vendedor', 'criado_em']


class ValidarCupomSerializer(serializers.Serializer):
    """
    Serializer de entrada para verificar se o código digitado é válido.
    """
    codigo = serializers.CharField(max_length=50)

    def validate_codigo(self, value):
        codigo_formatado = value.upper()
        
        try:
            cupom = Cupom.objects.get(codigo=codigo_formatado)
        except Cupom.DoesNotExist:
            raise serializers.ValidationError("Cupom inválido ou não encontrado.")

        if not cupom.ativo:
            raise serializers.ValidationError("Este cupom está desativado.")

        if cupom.data_validade and cupom.data_validade < timezone.now():
            raise serializers.ValidationError("Este cupom já expirou.")

        # Se passou por tudo, retorna o objeto do cupom em vez da string
        return cupom