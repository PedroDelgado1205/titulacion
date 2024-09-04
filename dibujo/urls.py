from django.urls import path
from dibujo.views import *
from django.conf import settings
from django.conf.urls.static import static


app_name = 'dibujo'

urlpatterns = [
    path('', index, name='index'),
    path('guardar/', guardar_dibujo, name='guardar_dibujo'),
    path('guardar_edicion_dibujo/', guardar_edicion_dibujo, name='guardar_edicion_dibujo')
]+ static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
