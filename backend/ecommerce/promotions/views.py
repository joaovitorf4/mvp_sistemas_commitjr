from rest_framework import views, status, permissions
from rest_framework.response import Response
from .serializers import ValidarCupomSerializer, CupomSerializer

class ValidarCupomView(views.APIView):
    """
    Endpoint para o cliente validar um código de desconto no carrinho.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ValidarCupomSerializer(data=request.data)
        
        if serializer.is_valid():
            # Pega o objeto cupom que foi validado com sucesso lá no serializer
            cupom = serializer.validated_data['codigo']
            
            return Response(
                {
                    "detail": "Cupom aplicado com sucesso!",
                    "cupom": CupomSerializer(cupom).data
                },
                status=status.HTTP_200_OK
            )
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)