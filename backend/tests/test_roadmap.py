import unittest
import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Base, User, Profile, CareerRoadmap, RoadmapPhase, RoadmapTopic
from app.services.roadmap_generator import get_fallback_roadmap, generate_roadmap_with_ai
from app.routers.roadmap import _resolve_user, _format_roadmap_response

class TestCareerRoadmapBackend(unittest.TestCase):

    def setUp(self):
        # Create an in-memory SQLite database for test isolation
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(bind=self.engine)
        self.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        self.db = self.SessionLocal()

        # Seed test candidate user
        self.user = User(
            email="test_candidate@interview.ai",
            username="test_candidate",
            hashed_password="hashed_pw_secret",
            full_name="Test Candidate",
            is_verified=True
        )
        self.db.add(self.user)
        self.db.commit()
        self.db.refresh(self.user)

        self.profile = Profile(user_id=self.user.id)
        self.db.add(self.profile)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    def test_fallback_roadmap_structure(self):
        """Verifies fallback templates produce valid sequenced phases, topics, quizzes, and exercises."""
        data = get_fallback_roadmap("Full-Stack Development", "Intermediate", "Full-Stack Developer", "1 hour/day")
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 3)

        first_phase = data[0]
        self.assertIn("title", first_phase)
        self.assertIn("topics", first_phase)
        self.assertGreaterEqual(len(first_phase["topics"]), 1)

        first_topic = first_phase["topics"][0]
        self.assertIn("title", first_topic)
        self.assertIn("description", first_topic)
        self.assertIn("learning_objectives", first_topic)
        self.assertIn("assessment_quiz", first_topic)
        self.assertGreaterEqual(len(first_topic["assessment_quiz"]), 1)
        quiz_item = first_topic["assessment_quiz"][0]
        self.assertIn("question", quiz_item)
        self.assertIn("options", quiz_item)

    def test_resolve_user_finds_existing_user(self):
        """Verifies _resolve_user successfully locates user by email."""
        resolved = _resolve_user(self.db, "test_candidate@interview.ai")
        self.assertEqual(resolved.id, self.user.id)
        self.assertEqual(resolved.username, "test_candidate")

    def test_roadmap_database_persistence_and_formatting(self):
        """Verifies saving roadmap, phases, and topics to SQLite DB and formatting output."""
        fallback_data = get_fallback_roadmap("Java Development", "Beginner", "Java Developer", "2 hours/day")

        roadmap = CareerRoadmap(
            user_id=self.user.id,
            domain="Java Development",
            skill_level="Beginner",
            target_role="Java Developer",
            study_time_daily="2 hours/day",
            learning_preference="balanced",
            status="active",
            overall_progress=0.0
        )
        self.db.add(roadmap)
        self.db.commit()
        self.db.refresh(roadmap)

        for p_data in fallback_data:
            phase = RoadmapPhase(
                roadmap_id=roadmap.id,
                phase_order=p_data.get("phase_order", 1),
                title=p_data.get("title", ""),
                purpose=p_data.get("purpose", ""),
                estimated_weeks=p_data.get("estimated_weeks", 2),
                milestone_project=p_data.get("milestone_project", "")
            )
            self.db.add(phase)
            self.db.commit()
            self.db.refresh(phase)

            for t_data in p_data.get("topics", []):
                topic = RoadmapTopic(
                    phase_id=phase.id,
                    topic_order=t_data.get("topic_order", 1),
                    title=t_data.get("title", ""),
                    description=t_data.get("description", ""),
                    learning_objectives=t_data.get("learning_objectives", []),
                    prerequisites=t_data.get("prerequisites", []),
                    key_concepts=t_data.get("key_concepts", ""),
                    exercises=t_data.get("exercises", []),
                    resources=t_data.get("resources", []),
                    assessment_quiz=t_data.get("assessment_quiz", []),
                    status="not_started"
                )
                self.db.add(topic)

        self.db.commit()

        # Query and format roadmap
        loaded_roadmap = self.db.query(CareerRoadmap).filter(CareerRoadmap.id == roadmap.id).first()
        formatted = _format_roadmap_response(loaded_roadmap)

        self.assertEqual(formatted["user_id"], self.user.id)
        self.assertEqual(formatted["domain"], "Java Development")
        self.assertGreater(formatted["total_phases"], 0)
        self.assertGreater(formatted["total_topics"], 0)
        self.assertEqual(formatted["completed_topics"], 0)
        self.assertEqual(formatted["overall_progress"], 0.0)
        self.assertIsNotNone(formatted["next_recommended_topic"])

    def test_topic_completion_progress_recalculation(self):
        """Verifies progress calculation updates accurately when topics are marked completed."""
        roadmap = CareerRoadmap(
            user_id=self.user.id,
            domain="Backend Development",
            skill_level="Intermediate",
            target_role="Backend Developer",
            study_time_daily="1 hour/day",
            learning_preference="balanced",
            status="active",
            overall_progress=0.0
        )
        self.db.add(roadmap)
        self.db.commit()

        phase = RoadmapPhase(
            roadmap_id=roadmap.id,
            phase_order=1,
            title="Backend Foundations",
            purpose="Build REST APIs",
            estimated_weeks=2
        )
        self.db.add(phase)
        self.db.commit()

        t1 = RoadmapTopic(phase_id=phase.id, topic_order=1, title="FastAPI Basics", description="test", status="completed", is_verified=True, quiz_score=100)
        t2 = RoadmapTopic(phase_id=phase.id, topic_order=2, title="SQLAlchemy ORM", description="test", status="not_started")
        self.db.add_all([t1, t2])
        self.db.commit()

        formatted = _format_roadmap_response(roadmap)
        self.assertEqual(formatted["total_topics"], 2)
        self.assertEqual(formatted["completed_topics"], 1)
        self.assertEqual(formatted["overall_progress"], 50.0)
        self.assertEqual(formatted["next_recommended_topic"]["title"], "SQLAlchemy ORM")

if __name__ == '__main__':
    unittest.main()
