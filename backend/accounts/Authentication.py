import json
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

@csrf_exempt # Exempting for demonstration; handle token authentication in production
@require_POST
def register_user(request):
    try:
        # 1. Parse the incoming JSON payload from Electron
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        # 2. Basic validation check
        if not username or not email or not password:
            return JsonResponse({"error": "All fields are required."}, status=400)

        # 3. Check if user already exists
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username is already taken."}, status=400)
            
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email is already registered."}, status=400)

        # 4. Create the user using create_user() to safely hash the password
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        # 5. Return success response to the client
        return JsonResponse({
            "message": "User registered successfully!",
            "user_id": user.id,
            "username": user.username
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON format."}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
