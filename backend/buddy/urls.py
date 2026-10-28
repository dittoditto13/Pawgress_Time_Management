# buddy/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('buddy/', views.buddy_detail),
    path('study-sessions/', views.log_session),
]