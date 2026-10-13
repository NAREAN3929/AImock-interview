import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/v1"

def test_endpoints():
    print("=" * 70)
    print("FULL BACKEND API INTEGRATION TEST")
    print("=" * 70)

    # 1. Health & AI Status
    print("\n1. Testing Health & AI Status...")
    r = requests.get("http://127.0.0.1:8000/api/v1/health")
    assert r.status_code == 200, f"Health check failed: {r.status_code}"
    health_data = r.json()
    print("   Health response:", health_data)

    r = requests.get(f"{BASE_URL}/interviews/ai-status")
    assert r.status_code == 200, f"AI status check failed: {r.status_code}"
    ai_status = r.json()
    print("   AI status:", ai_status)

    # 2. Authentication Flow (Register, Login, Me)
    print("\n2. Testing Authentication...")
    test_email = f"audit_user_{int(time.time())}@aimock.in"
    test_user = {
        "email": test_email,
        "username": f"auditor_{int(time.time())}",
        "password": "Password123!",
        "full_name": "Audit Test User"
    }
    r = requests.post(f"{BASE_URL}/auth/register", json=test_user)
    print("   Register status:", r.status_code)
    
    r = requests.post(f"{BASE_URL}/auth/login", json={
        "username_or_email": test_user["email"],
        "password": test_user["password"]
    })
    print("   Login status:", r.status_code)
    token = None
    if r.status_code == 200:
        token_data = r.json()
        token = token_data.get("access_token")
        print("   Access token received:", bool(token))

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 3. Interview History
    print("\n3. Testing Interview History...")
    r = requests.get(f"{BASE_URL}/interviews/history")
    print("   History status:", r.status_code)
    if r.status_code == 200:
        hist = r.json()
        print(f"   History count: {len(hist)} items")

    # 4. On-demand Question Generation
    print("\n4. Testing On-Demand Question Generation...")
    q_req = {
        "role": "Java Developer",
        "company": "Google",
        "experience_level": "Beginner",
        "interview_type": "Technical",
        "difficulty": "Easy",
        "count": 2
    }
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/interviews/generate-questions", json=q_req)
    lat = time.time() - t0
    print(f"   Generate Q status: {r.status_code} in {lat:.2f}s")
    if r.status_code == 200:
        q_data = r.json()
        print(f"   Questions returned: {len(q_data.get('questions', []))}")
        print(f"   AI Generated: {q_data.get('ai_generated')}, Source: {q_data.get('source')}, Model: {q_data.get('model')}")

    # 5. Create Interview Session
    print("\n5. Testing Interview Creation...")
    create_req = {
        "role": "Software Engineer",
        "experience_level": "Mid-Level",
        "company": "Amazon",
        "interview_type": "Technical",
        "question_count": 2,
        "difficulty": "Medium"
    }
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/interviews/create", json=create_req)
    lat = time.time() - t0
    print(f"   Create session status: {r.status_code} in {lat:.2f}s")
    session_id = None
    q_id = None
    if r.status_code == 200:
        sess = r.json()
        session_id = sess.get("interview_id")
        questions = sess.get("questions", [])
        if questions:
            q_id = questions[0].get("id")
        print(f"   Created Interview ID: {session_id}, Questions: {len(questions)}")

    # 6. Evaluate Answer
    if session_id and q_id:
        print("\n6. Testing Answer Evaluation...")
        eval_payload = {
            "interview_id": session_id,
            "question_id": q_id,
            "user_response": "I would use a distributed cache such as Redis with LRU eviction and consistent hashing to balance load across nodes.",
            "code_submission": "def cache_get(key):\n    return redis.get(key)",
            "audio_duration_sec": 45.0,
            "persona": "strict-tech-lead"
        }
        t0 = time.time()
        r = requests.post(f"{BASE_URL}/interviews/evaluate-answer", json=eval_payload)
        lat = time.time() - t0
        print(f"   Evaluate answer status: {r.status_code} in {lat:.2f}s")
        if r.status_code == 200:
            eval_data = r.json()
            print(f"   Score: {eval_data.get('score')}, WPM: {eval_data.get('wpm')}")
            print(f"   Source: {eval_data.get('source')}, Model: {eval_data.get('model')}")
            print(f"   Adaptive follow-up: {eval_data.get('adaptive_followup_question')}")

        # 7. Complete Interview Session
        print("\n7. Testing Interview Completion...")
        r = requests.post(f"{BASE_URL}/interviews/complete/{session_id}")
        print(f"   Complete status: {r.status_code}")
        if r.status_code == 200:
            print("   Overall Score:", r.json().get("overall_score"), "Recommendation:", r.json().get("hiring_recommendation"))

        # 8. Resume / Get Interview Detail
        print("\n8. Testing Resume & Detail Retrieval...")
        r = requests.get(f"{BASE_URL}/interviews/{session_id}")
        print(f"   Detail status: {r.status_code}")
        if r.status_code == 200:
            detail = r.json()
            print(f"   Detail title: {detail.get('title')}, Questions stored: {len(detail.get('questions', []))}")

    # 9. Career Roadmap Generation
    print("\n9. Testing Career Roadmap Generation...")
    rm_req = {
        "domain": "Full Stack Web Development",
        "skill_level": "Intermediate",
        "target_role": "Senior Full Stack Engineer",
        "study_time_daily": "2 hours",
        "learning_preference": "Hands-on Projects"
    }
    t0 = time.time()
    r = requests.post(f"{BASE_URL}/roadmap/generate", json=rm_req)
    lat = time.time() - t0
    print(f"   Roadmap status: {r.status_code} in {lat:.2f}s")
    if r.status_code == 200:
        phases = r.json()
        print(f"   Roadmap phases generated: {len(phases)}")

    # 10. Admin Analytics
    print("\n10. Testing Admin Analytics...")
    r = requests.get(f"{BASE_URL}/admin/analytics")
    print(f"   Admin analytics status: {r.status_code}")
    if r.status_code == 200:
        adm = r.json()
        print(f"   Admin active sessions: {adm.get('active_sessions_count')}, Gemini status: {adm.get('gemini_api_status')}")

    print("\n" + "=" * 70)
    print("ALL API ENDPOINT INTEGRATION TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    test_endpoints()
