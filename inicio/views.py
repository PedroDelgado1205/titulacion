from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .forms import RegistroForm, LoginForm
from .models import Usuario

def index(request): # página de inicio o de información
    return render(request, 'inicio/index.html', {})

def login_view(request): # login
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password) # verificar la informacio para poer ingresar
            if user is not None:
                login(request, user)
                return redirect('galeria:index')
            else:
                form.add_error(None, 'Nombre de usuario o contraseña incorrectos')
    else:
        form = LoginForm()
    
    return render(request, 'inicio/login.html', {'form': form})

def logout_view(request): # logout
    logout(request)
    return redirect('inicio:login')

def registro(request): # registro
    if request.method == 'POST':
        form = RegistroForm(request.POST)
        if form.is_valid():
            # datos necesarios para poder crear una cuenta
            user = form.save(commit=False)
            user.set_password(form.cleaned_data['password'])
            user.save()

            Usuario.objects.create(
                usuario=user,
                foto='usuarios/user.png',
                biografia='Sin biografía',
                edad=0
            )
            
            login(request, user)
            return redirect('galeria:index')
    else:
        form = RegistroForm()

    return render(request, 'inicio/registro.html', {'form': form})

@login_required(login_url='/')
def perfil(request): # perfil
    usuario = Usuario.objects.get(usuario=request.user)
    context = {
        'usuario': usuario,
    }
    return render(request, 'inicio/perfil.html', context)

@login_required(login_url='/')
def perfil_busqueda(request, id_artista): # perfil buscado
    usuario = get_object_or_404(Usuario, id=id_artista)
    context = {
        'usuario': usuario,
        'id_artista': id_artista
    }
    return render(request, 'inicio/perfil_busqueda.html', context)

@login_required(login_url='/')
def cambiar_info_perfil(request): # cambio de informacio de usuario
    usuario = request.user.usuario  # Obtener el usuario logueado

    if request.method == 'POST':
        # adtos nesecarios para actualizar la información del usuario
        foto = request.FILES.get('foto')
        biografia = request.POST.get('biografia')
        edad = request.POST.get('edad')

        if foto:
            usuario.foto = foto
        usuario.biografia = biografia
        usuario.edad = edad
        usuario.save()

        return redirect('inicio:perfil')

    context = {
        'usuario': usuario,
    }
    return render(request, 'inicio/cambiar_info_perfil.html', context)
