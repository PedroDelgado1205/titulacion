from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Usuario(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    foto = models.ImageField(upload_to='usuarios/', null=True, blank=True)
    biografia = models.TextField(max_length=500, null=True, blank=True)
    edad = models.IntegerField()

    def __str__(self):
        return self.usuario.username