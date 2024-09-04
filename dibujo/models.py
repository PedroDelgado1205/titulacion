from django.db import models

# Create your models here.

class Obra(models.Model):
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to='galeria/', null=True, blank=True)
    orden = models.TextField(max_length=10)

    def __str__(self):
        return self.titulo