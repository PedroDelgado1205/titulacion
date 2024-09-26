from django.shortcuts import render, get_object_or_404, redirect
from .models import Obra
from galeria.models import Galeria
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from inicio.models import Usuario
from .models import Obra, Galeria

@login_required(login_url='/') # galeria
def index(request):
    galeria = Galeria.objects.filter(autor__usuario=request.user).select_related('obra').order_by('obra__orden')
    obras = [galeria_item.obra for galeria_item in galeria]
    return render(request, 'galeria/index.html', {'obras': obras})

def ver_obra(request, id): #ver obra
    obra = get_object_or_404(Obra, id=id)
    return render(request, 'galeria/ver_obra.html', {'obra': obra})

def cambiar_info(request, id): # cambiar información de una obra
    obra = get_object_or_404(Obra, id=id)
    if request.method == 'POST':
        nuevo_nombre = request.POST.get('titulo')
        nueva_descripcion = request.POST.get('descripcion')
        
        # datos de las obras para guardae en la base de datos
        obra.titulo = nuevo_nombre
        obra.descripcion = nueva_descripcion
        obra.save()
        
        return redirect('galeria:index')
    
    return render(request, 'galeria/cambiar_info.html', {'obra': obra})


def editar_obra(request, id): # editar obra
    obra = get_object_or_404(Obra, id=id)
    return render(request, 'dibujo/editar_obra.html', {'obra': obra})

def borrar_obra(request, id): # borrar una obra
    obra = get_object_or_404(Obra, id=id)
    if request.method == 'POST':
        obra.delete()
        return redirect('galeria:index')
    return render(request, 'galeria/borrar_obra.html', {'obra': obra})

@csrf_exempt
def actualizar_orden(request): #cambiar el orden de presntación
    if request.method == 'POST':
        data = request.POST.getlist('orden[]')
        for index, obra_id in enumerate(data):
            obra = Obra.objects.get(id=obra_id)
            obra.orden = index
            obra.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'})

def buscar_artista(request): # buscar artistas
    query = request.GET.get('query')
    resultados = []
    if query:
        resultados = Usuario.objects.filter(usuario__username__icontains=query) # busca artistas con un username similares, iguales o que contengan a lo ingresado
    return render(request, 'galeria/resultados_busqueda.html', {'resultados': resultados, 'query': query})

def galeria_busqueda(request, autor_id): # galeria de un usuario buscado
    autor = get_object_or_404(Usuario, id=autor_id)
    galeria = Galeria.objects.filter(autor=autor).select_related('obra').order_by('obra__orden')
    obras = [galeria_item.obra for galeria_item in galeria]
    return render(request, 'galeria/galeria_busqueda.html', {'autor': autor, 'obras': obras})

def ver_obra_busqueda(request, id, autor_id): # ver obra de un usuario buscado
    obra = get_object_or_404(Obra, id=id)
    return render(request, 'galeria/ver_obra_busqueda.html', {'obra': obra, 'id_artista':autor_id})

@csrf_exempt
def guardar_dibujo(request): # guardar un dibujo desde la galeria
    if request.method == 'POST':
        #datos necesarios para guardar un dibujo en la base de datos
        titulo = request.POST.get('titulo')
        descripcion = request.POST.get('descripcion')
        imagen = request.FILES.get('imagen')  

        if not titulo or not descripcion or not imagen:
            return JsonResponse({'status': 'error', 'message': 'Faltan campos requeridos'}, status=400)

        usuario = request.user.usuario
        count_obras = Galeria.objects.filter(autor=usuario).count()

        obra = Obra.objects.create(
            titulo=titulo,
            imagen=imagen,
            orden=count_obras,
            descripcion=descripcion
        )

        Galeria.objects.create(autor=usuario, obra=obra)

        return redirect('galeria:index')

    return JsonResponse({'status': 'error', 'message': 'Método no permitido'}, status=405)