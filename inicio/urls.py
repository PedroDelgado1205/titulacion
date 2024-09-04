from django.urls import path
from inicio.views import *

app_name = 'inicio'

urlpatterns = [
    path('inicio/', index, name='index'),
    path('', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('register/', registro, name='registro'),
]
