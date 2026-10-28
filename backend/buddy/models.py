from django.conf import settings
from django.db import models
from django.utils import timezone


class Buddy(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='buddy')
    name = models.CharField(max_length=50, default='Pawgress')
    streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    level = models.PositiveIntegerField(default=1)
    xp = models.PositiveIntegerField(default=0)   # XP toward the next level
    last_study_date = models.DateField(null=True, blank=True)

    def current_streak(self, today=None):
        """Streak as it should be displayed: 0 if a full day was missed."""
        today = today or timezone.localdate()
        if self.last_study_date is None or (today - self.last_study_date).days > 1:
            return 0
        return self.streak

    def __str__(self):
        return f'{self.user} - level {self.level}'


class StudySession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sessions')
    minutes = models.PositiveIntegerField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-created_at']
# Create your models here.
