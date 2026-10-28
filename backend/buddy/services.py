from django.db import transaction
from django.utils import timezone

from .models import Buddy, StudySession


def xp_needed(level):
    return 100 * level          # XP to go from `level` to `level + 1`; tune freely


@transaction.atomic
def record_session(user, minutes, today=None):
    today = today or timezone.localdate()
    Buddy.objects.get_or_create(user=user)
    buddy = Buddy.objects.select_for_update().get(user=user)
    session = StudySession.objects.create(user=user, minutes=minutes)

    last = buddy.last_study_date
    if last is None or (today - last).days > 1:
        buddy.streak = 1                      # first session, or a day was missed
    elif (today - last).days == 1:
        buddy.streak += 1                     # consecutive day
    # same day: streak unchanged

    buddy.longest_streak = max(buddy.longest_streak, buddy.streak)
    if last is None or today > last:
        buddy.last_study_date = today

    gained = int(minutes * (1 + min(buddy.streak, 10) * 0.1))   # streak bonus up to +100%
    buddy.xp += gained
    leveled_up = False
    while buddy.xp >= xp_needed(buddy.level):
        buddy.xp -= xp_needed(buddy.level)
        buddy.level += 1
        leveled_up = True

    buddy.save()
    return session, buddy, gained, leveled_up