from django.urls import path
from .views import ValidarCupomView

urlpatterns = [
    path('validar/', ValidarCupomView.as_view(), name='validar-cupom'),
]