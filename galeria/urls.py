from django.urls import path
from galeria.views import *

app_name = 'galeria'

urlpatterns = [
    path('', index, name='index'), # página de la galeria
    path('ver/<int:id>/', ver_obra, name='ver_obra'), # página para ver un dibujo en especifico
    path('cambiar-info/<int:id>/', cambiar_info, name='cambiar_info'), # página para cambiar la infomracion de la obra
    path('editar/<int:id>/', editar_obra, name='editar_obra'), # página del lienzo de dibujo para editar una obra
    path('borrar/<int:id>/', borrar_obra, name='borrar_obra'), # url para borrar una obra
    path('actualizar-orden/', actualizar_orden, name='actualizar_orden'), # url para editar el orden en el que se muestran las obras en la galería
    path('buscar-artista/', buscar_artista, name='buscar_artista'), # página para mostar a otros usuario registrados
    path('galeria-busqueda/<int:autor_id>/', galeria_busqueda, name='galeria_busqueda'), # página para ver la galería del usuario buscado
    path('ver-obra/<int:id>/<int:autor_id>', ver_obra_busqueda, name='ver_obra_busqueda'), # página para ver un dibujo en especifico del usuario buscado
    path('guardar-dibujo', guardar_dibujo, name='guardar_dibujo'), # url para guardar un nuevo dibujo desde la galeria
]
