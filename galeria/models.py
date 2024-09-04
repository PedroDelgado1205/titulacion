from django.db import models
from inicio.models import Usuario
from dibujo.models import Obra

# Create your models here.

class Galeria(models.Model):
    autor = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    obra = models.ForeignKey(Obra, on_delete=models.CASCADE)
    
    def __str__(self):
        return f'{self.obra.titulo} - {self.autor}'