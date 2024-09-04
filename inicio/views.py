from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm, UserCreationForm
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required

def index(request):
    return render(request, 'inicio/index.html', {})

def login_view(request):
    if request.user.is_authenticated:
        return redirect('galeria:index') 
    
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user) 
            return redirect('galeria:index') 
    else:
        form = AuthenticationForm()
    
    return render(request, 'inicio/login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('inicio:login')

def registro(request):
    if request.user.is_authenticated:
        return redirect('galeria:index')

    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user) 
            return redirect('galeria:index')
    else:
        form = UserCreationForm()

    return render(request, 'inicio/registro.html', {'form': form})