from django.urls import path
from dibujo.views import *
from django.conf import settings
from django.conf.urls.static import static


app_name = 'dibujo'

urlpatterns = [
    path('', index, name='index'), # página del lienzo de dibujo
    path('guardar/', guardar_dibujo, name='guardar_dibujo'), # url para guardar un nuevo dibujo en la base de datos
    path('guardar_edicion_dibujo/', guardar_edicion_dibujo, name='guardar_edicion_dibujo') # url para guardar la edición de un dibujo en la base de datos
]+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
