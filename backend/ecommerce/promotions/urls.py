from django.urls import path
from .views import ValidarCupomView, CupomListCreateView, CupomDetailView

urlpatterns = [
    path('validar/', ValidarCupomView.as_view(), name='validar-cupom'),
    path('cupons/', CupomListCreateView.as_view(), name='listar-criar-cupons'),
    path('cupons/<int:pk>/', CupomDetailView.as_view(), name='deletar-cupom'),
]