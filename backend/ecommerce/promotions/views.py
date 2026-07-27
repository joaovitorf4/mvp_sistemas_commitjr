from rest_framework import views, generics, status, permissions
from rest_framework.response import Response
from .serializers import ValidarCupomSerializer, CupomSerializer
from .models import Cupom

class ValidarCupomView(views.APIView):
    """
    Endpoint para o cliente validar um código de desconto no carrinho.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ValidarCupomSerializer(data=request.data)
        
        if serializer.is_valid():
            cupom = serializer.validated_data['codigo']
            
            return Response(
                {
                    "detail": "Cupom aplicado com sucesso!",
                    "cupom": CupomSerializer(cupom).data
                },
                status=status.HTTP_200_OK
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CupomListCreateView(generics.ListCreateAPIView):
    """
    Lista e cria cupons pertencentes ao vendedor autenticado.
    """
    serializer_class = CupomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cupom.objects.filter(vendedor=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(vendedor=self.request.user)


class CupomDetailView(generics.DestroyAPIView):
    """
    Permite ao vendedor remover um cupom cadastrado.
    """
    serializer_class = CupomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cupom.objects.filter(vendedor=self.request.user)