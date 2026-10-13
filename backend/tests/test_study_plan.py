import unittest
import datetime
from app.services.study_plan_generator import generate_study_plan
from app.schemas.schemas import OnboardingSubmitRequest
from pydantic import ValidationError

class TestStudyPlanGenerator(unittest.TestCase):

    def test_compressed_plan_seven_days_fresher(self):
        plan = generate_study_plan(
            role="Frontend developer",
            experience_level="Fresher",
            interview_date_preset="within_7_days",
            remaining_monthly_sessions=10
        )
        self.assertEqual(plan["weeks_count"], 1)
        self.assertEqual(plan["days_until_interview"], 7)
        self.assertEqual(len(plan["tasks"]), 7)
        # Check mandatory components
        types = [t["session_type"] for t in plan["tasks"]]
        self.assertIn("fundamentals", types)
        self.assertIn("dsa", types)
        self.assertIn("star_behavioral", types)
        self.assertIn("mock_interview", types)

    def test_two_weeks_plan_mid_level(self):
        plan = generate_study_plan(
            role="Backend developer",
            experience_level="1 to 3 years",
            interview_date_preset="within_14_days",
            remaining_monthly_sessions=10
        )
        self.assertEqual(plan["weeks_count"], 2)
        self.assertEqual(len(plan["tasks"]), 8)
        types = [t["session_type"] for t in plan["tasks"]]
        self.assertIn("dsa", types)
        self.assertIn("star_behavioral", types)
        self.assertIn("mock_interview", types)

    def test_four_weeks_plan_senior(self):
        plan = generate_study_plan(
            role="Full stack",
            experience_level="3+ years",
            interview_date_preset="within_30_days",
            remaining_monthly_sessions=15,
            target_company="Google"
        )
        self.assertEqual(plan["weeks_count"], 4)
        self.assertEqual(len(plan["tasks"]), 12)
        types = [t["session_type"] for t in plan["tasks"]]
        self.assertIn("system_design", types)
        self.assertIn("dsa", types)
        self.assertIn("star_behavioral", types)
        self.assertIn("mock_interview", types)
        # Check target company tag
        last_task = plan["tasks"][-1]
        self.assertIn("Google", last_task["title"])

    def test_quota_capping(self):
        # 12-session plan capped by 6 remaining sessions
        plan = generate_study_plan(
            role="Data analyst",
            experience_level="Fresher",
            interview_date_preset="within_30_days",
            remaining_monthly_sessions=6
        )
        self.assertTrue(plan["quota_capped"])
        self.assertIsNotNone(plan["quota_warning"])
        self.assertEqual(plan["total_sessions"], 6)
        # Final task is still a mock interview
        self.assertEqual(plan["tasks"][-1]["session_type"], "mock_interview")

    def test_date_validation_rejects_past_date(self):
        past_date = datetime.datetime.now() - datetime.timedelta(days=2)
        with self.assertRaises(ValidationError):
            OnboardingSubmitRequest(
                target_role="Frontend developer",
                experience_level="Fresher",
                interview_date=past_date
            )

    def test_date_validation_accepts_future_date(self):
        future_date = datetime.datetime.now() + datetime.timedelta(days=10)
        req = OnboardingSubmitRequest(
            target_role="Frontend developer",
            experience_level="Fresher",
            interview_date=future_date
        )
        self.assertEqual(req.interview_date, future_date)

    def test_empty_role_rejected(self):
        with self.assertRaises(ValidationError):
            OnboardingSubmitRequest(
                target_role="   ",
                experience_level="Fresher"
            )

if __name__ == "__main__":
    unittest.main()
