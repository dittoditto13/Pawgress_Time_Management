from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from accounts.views import register_user   # adjust to wherever your view lives
from django.urls import include, path
    
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', register_user),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/', include('buddy.urls')),
]