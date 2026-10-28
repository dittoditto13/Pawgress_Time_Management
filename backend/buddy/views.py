# buddy/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Buddy
from .serializers import BuddySerializer, SessionInputSerializer
from .services import record_session


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def buddy_detail(request):
    buddy, _ = Buddy.objects.get_or_create(user=request.user)
    return Response(BuddySerializer(buddy).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_session(request):
    data = SessionInputSerializer(data=request.data)
    data.is_valid(raise_exception=True)
    session, buddy, gained, leveled_up = record_session(request.user, data.validated_data['minutes'])
    return Response({
        'session_id': session.id,
        'xp_gained': gained,
        'leveled_up': leveled_up,
        'buddy': BuddySerializer(buddy).data,
    }, status=status.HTTP_201_CREATED)