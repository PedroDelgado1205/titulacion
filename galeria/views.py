from django.shortcuts import render, get_object_or_404, redirect
from .models import Obra
from galeria.models import Galeria
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required


@login_required
def index(request):
    galeria = Galeria.objects.filter(autor__usuario=request.user).select_related('obra').order_by('obra__orden')
    obras = [galeria_item.obra for galeria_item in galeria]
    return render(request, 'galeria/index.html', {'obras': obras})

def ver_obra(request, id):
    obra = get_object_or_404(Obra, id=id)
    return render(request, 'galeria/ver_obra.html', {'obra': obra})

def cambiar_info(request, id):
    obra = get_object_or_404(Obra, id=id)
    if request.method == 'POST':
        nuevo_nombre = request.POST.get('titulo')
        nueva_descripcion = request.POST.get('descripcion')
        
        obra.titulo = nuevo_nombre
        obra.descripcion = nueva_descripcion
        obra.save()
        
        return redirect('galeria:index')
    
    return render(request, 'galeria/cambiar_info.html', {'obra': obra})


def editar_obra(request, id):
    obra = get_object_or_404(Obra, id=id)
    return render(request, 'dibujo/editar_obra.html', {'obra': obra})

def borrar_obra(request, id):
    obra = get_object_or_404(Obra, id=id)
    if request.method == 'POST':
        obra.delete()
        return redirect('galeria:index')
    return render(request, 'galeria/borrar_obra.html', {'obra': obra})

@csrf_exempt
def actualizar_orden(request):
    if request.method == 'POST':
        data = request.POST.getlist('orden[]')
        for index, obra_id in enumerate(data):
            obra = Obra.objects.get(id=obra_id)
            obra.orden = index
            obra.save()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'})
