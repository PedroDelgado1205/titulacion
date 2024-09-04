from django.urls import path
from galeria.views import *

app_name = 'galeria'

urlpatterns = [
    path('', index, name='index'),
    path('ver/<int:id>/', ver_obra, name='ver_obra'),
    path('cambiar-info/<int:id>/', cambiar_info, name='cambiar_info'),
    path('editar/<int:id>/', editar_obra, name='editar_obra'),
    path('borrar/<int:id>/', borrar_obra, name='borrar_obra'),
    path('actualizar-orden/', actualizar_orden, name='actualizar_orden'),
]
