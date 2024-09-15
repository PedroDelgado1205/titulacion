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
    path('buscar-artista/', buscar_artista, name='buscar_artista'),
    path('galeria-busqueda/<int:autor_id>/', galeria_busqueda, name='galeria_busqueda'),
    path('ver-obra/<int:id>/<int:autor_id>', ver_obra_busqueda, name='ver_obra_busqueda'),
    path('guardar-dibujo', guardar_dibujo, name='guardar_dibujo'),
]
