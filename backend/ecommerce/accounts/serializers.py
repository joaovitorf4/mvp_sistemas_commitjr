from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer apenas para expor os dados do usuário logado no endpoint de perfil.
    """
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'tipo_usuario', 'cep']
        read_only_fields = ['id', 'tipo_usuario']


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer responsável pela criação de novos usuários (Clientes e Vendedores).
    """
    # Garantimos que a senha seja apenas para escrita (nunca retornará no JSON)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'tipo_usuario', 'cep']

    def validate(self, attrs):
        """
        Aqui entra a validação da regra de negócio do MVP:
        Se for Vendedor, o CEP é obrigatório.
        """
        tipo_usuario = attrs.get('tipo_usuario', 'cliente')
        cep = attrs.get('cep')

        if tipo_usuario == 'vendedor' and not cep:
            raise serializers.ValidationError(
                {"cep": "O campo CEP é obrigatório para contas de vendedor."}
            )
        
        return attrs

    def create(self, validated_data):
        """
        Sobrescrevemos o método de criação para garantir que a senha 
        seja criptografada corretamente usando o 'create_user'.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            tipo_usuario=validated_data.get('tipo_usuario', 'cliente'),
            cep=validated_data.get('cep', None)
        )
        return user