from django.db import models
from django.contrib.postgres.fields import JSONField, ArrayField  # For storing rich JSON data or arrays
from django.contrib.postgres.search import SearchVector           # For advanced Postgres text search
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, serializers, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from channels.generic.websocket import AsyncWebsocketConsumer
import json
