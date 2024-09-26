from django.shortcuts import render
import base64
from django.core.files.base import ContentFile
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Obra
from galeria.models import Galeria
import json
from inicio.models import Usuario
from django.shortcuts import get_object_or_404

@login_required(login_url='/') # login
def index(request):
    return render(request, 'dibujo/index.html', {})

@login_required(login_url='/')
@csrf_exempt
def guardar_dibujo(request): # guardar dibujo
    if request.method == 'POST':
        # Información del dibujo a guardar 
        data = json.loads(request.body)
        titulo = data.get('titulo')
        descripcion = data.get('descripcion')
        imagen_data = data.get('imagen')
        
        usuario = request.user.usuario 
        count_obras = Galeria.objects.filter(autor=usuario).count() 

        format, imgstr = imagen_data.split(';base64,') # imagen recibida en formato base64 por comodidad
        ext = format.split('/')[-1]
        imagen = ContentFile(base64.b64decode(imgstr), name=f'{titulo}.{ext}')

        obra = Obra.objects.create(titulo=titulo, imagen=imagen, orden=count_obras, descripcion=descripcion)

        Galeria.objects.create(autor=usuario, obra=obra)

        return JsonResponse({'status': 'success'})

    return JsonResponse({'status': 'error'}, status=400)

@login_required(login_url='/')
@csrf_exempt
def guardar_edicion_dibujo(request): # guardar edicion
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            # Información del dibujo a guardar 
            obra_id = data.get('id')
            nuevo_titulo = data.get('titulo')
            nueva_descripcion = data.get('descripcion')
            nueva_imagen = data.get('imagen')

            usuario = get_object_or_404(Usuario, usuario=request.user)

            galeria = Galeria.objects.get(obra_id=obra_id, autor=usuario)
            obra = galeria.obra

            if nuevo_titulo:
                obra.titulo = nuevo_titulo
            if nueva_descripcion:
                obra.descripcion = nueva_descripcion

            if nueva_imagen:
                from django.core.files.base import ContentFile
                format, imgstr = nueva_imagen.split(';base64,')
                ext = format.split('/')[-1]
                obra.imagen.save(f'{nuevo_titulo}.{ext}', ContentFile(base64.b64decode(imgstr)), save=True)
            obra.save()
            return JsonResponse({'success': True, 'message': 'La obra ha sido actualizada correctamente.'})

        except Galeria.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'No se encontró la obra o no tienes permiso para editarla.'})

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Solicitud inválida, no se pudo procesar el JSON.'})

    return JsonResponse({'success': False, 'message': 'Solicitud inválida.'})