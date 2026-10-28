from rest_framework import serializers

from .models import Buddy
from .services import xp_needed


class BuddySerializer(serializers.ModelSerializer):
    streak = serializers.SerializerMethodField()
    xp_to_next = serializers.SerializerMethodField()

    class Meta:
        model = Buddy
        fields = ['name', 'streak', 'longest_streak', 'level', 'xp', 'xp_to_next', 'last_study_date']

    def get_streak(self, obj):
        return obj.current_streak()

    def get_xp_to_next(self, obj):
        return xp_needed(obj.level)


class SessionInputSerializer(serializers.Serializer):
    minutes = serializers.IntegerField(min_value=1, max_value=600)