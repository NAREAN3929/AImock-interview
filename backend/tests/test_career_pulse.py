import unittest
from datetime import date, datetime, timedelta
import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.career_pulse_service import (
    compute_session_score,
    compute_readiness_score,
    compute_streak_and_freeze,
    find_weakest_skill,
    generate_practice_heatmap_28_days
)

class TestCareerPulseService(unittest.TestCase):

    def test_compute_session_score_weights(self):
        # 50% Tech (80), 30% Beh (90), 20% Comm (70)
        # Expected = 0.50*80 + 0.30*90 + 0.20*70 = 40 + 27 + 14 = 81.0
        score = compute_session_score(80.0, 90.0, 70.0)
        self.assertEqual(score, 81.0)

    def test_compute_readiness_score_empty(self):
        # User with 0 sessions should return None
        result = compute_readiness_score([])
        self.assertIsNone(result)

    def test_compute_readiness_score_fewer_than_five(self):
        # 2 sessions
        sessions = [
            {"technical_score": 90.0, "behavioral_score": 80.0, "communication_score": 70.0}, # 45 + 24 + 14 = 83.0
            {"technical_score": 70.0, "behavioral_score": 80.0, "communication_score": 90.0}, # 35 + 24 + 18 = 77.0
        ]
        # Average of 83.0 and 77.0 is 80.0
        result = compute_readiness_score(sessions)
        self.assertEqual(result, 80.0)

    def test_compute_readiness_score_last_five_capped(self):
        # 6 sessions, only the first 5 should be averaged
        sessions = [
            {"technical_score": 100.0, "behavioral_score": 100.0, "communication_score": 100.0}, # 100.0
            {"technical_score": 100.0, "behavioral_score": 100.0, "communication_score": 100.0}, # 100.0
            {"technical_score": 100.0, "behavioral_score": 100.0, "communication_score": 100.0}, # 100.0
            {"technical_score": 100.0, "behavioral_score": 100.0, "communication_score": 100.0}, # 100.0
            {"technical_score": 100.0, "behavioral_score": 100.0, "communication_score": 100.0}, # 100.0
            {"technical_score": 0.0, "behavioral_score": 0.0, "communication_score": 0.0},       # ignored
        ]
        result = compute_readiness_score(sessions)
        self.assertEqual(result, 100.0)

    def test_compute_streak_active_consecutive(self):
        today = date(2026, 10, 12)
        activity_dates = [
            today,
            today - timedelta(days=1),
            today - timedelta(days=2),
            today - timedelta(days=3)
        ]
        res = compute_streak_and_freeze(activity_dates, freeze_used_this_week=False, today=today)
        self.assertEqual(res["streak_days"], 4)
        self.assertTrue(res["freeze_available"])
        self.assertEqual(res["freeze_status_message"], "Streak freeze is available once a week")

    def test_compute_streak_protected_by_freeze(self):
        today = date(2026, 10, 12) # Monday
        # Missed yesterday (Sunday), practiced Friday and Saturday
        activity_dates = [
            today - timedelta(days=2), # Saturday
            today - timedelta(days=3), # Friday
        ]
        # Freeze is available
        res = compute_streak_and_freeze(activity_dates, freeze_used_this_week=False, today=today)
        self.assertTrue(res["freeze_applied_today"])
        self.assertGreater(res["streak_days"], 0)

    def test_compute_streak_breaks_when_freeze_already_used(self):
        today = date(2026, 10, 12)
        # Missed yesterday and today, freeze already used
        activity_dates = [
            today - timedelta(days=2),
        ]
        res = compute_streak_and_freeze(activity_dates, freeze_used_this_week=True, today=today)
        self.assertEqual(res["streak_days"], 0)
        self.assertFalse(res["freeze_available"])
        self.assertEqual(res["freeze_status_message"], "Freeze used this week")

    def test_find_weakest_skill(self):
        category_scores = {
            "System Design": 85.0,
            "Algorithms": 72.0,
            "STAR Behavioral": 90.0,
            "Web Performance": 88.0
        }
        improvements = [
            "Quantify time complexity before jumping to code.",
            "Handle edge cases for negative numbers."
        ]
        res = find_weakest_skill(category_scores, improvements)
        self.assertIsNotNone(res)
        self.assertEqual(res["skill"], "Algorithms")
        self.assertEqual(res["score"], 72.0)
        self.assertEqual(res["reason"], "Quantify time complexity before jumping to code.")

    def test_practice_heatmap_28_days_structure(self):
        today = date(2026, 10, 12)
        session_times = [
            datetime(2026, 10, 12, 10, 0),
            datetime(2026, 10, 12, 15, 0), # 2 sessions today => level 2
            datetime(2026, 10, 11, 14, 0), # 1 session yesterday => level 1
        ]
        cells = generate_practice_heatmap_28_days(session_times, today=today)
        self.assertEqual(len(cells), 28)
        self.assertEqual(cells[-1]["date"], "2026-10-12")
        self.assertEqual(cells[-1]["count"], 2)
        self.assertEqual(cells[-1]["level"], 2)
        self.assertEqual(cells[-2]["count"], 1)
        self.assertEqual(cells[-2]["level"], 1)

if __name__ == '__main__':
    unittest.main()
