from django.urls import path
from inicio.views import *

app_name = 'inicio'

urlpatterns = [
    path('inicio/', index, name='index'), # página de inicio o de información
    path('', login_view, name='login'), # página para ingresar a la aplicación
    path('logout/', logout_view, name='logout'), # url para terminar sesión
    path('register/', registro, name='registro'), # página para registro de nuevos usuarios
    path('perfil/', perfil, name='perfil'),  # página para ver el prefil y poder editar su información
    path('perfil_busqueda/<int:id_artista>', perfil_busqueda, name='perfil_busqueda'), # página para ver un ver un prefil de un artista buscado
    path('cambiar_info_perfil', cambiar_info_perfil, name='cambiar_info_perfil'), # url para cambiar la información de perfil/
]
