from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserProfileSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    View responsável pelo registo de novos utilizadores.
    Usa 'AllowAny' para que qualquer pessoa possa criar uma conta.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class UserProfileView(APIView):
    """
    View responsável por retornar os dados do utilizador autenticado.
    Usa 'IsAuthenticated' para garantir que apenas utilizadores com token válido acedam.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # O DRF injeta o utilizador autenticado diretamente em request.user através do Token
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)