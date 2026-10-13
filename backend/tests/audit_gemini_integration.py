import os
import sys
import time
import json
import re
from typing import List, Dict, Any
from dotenv import load_dotenv

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(line_buffering=True)
load_dotenv(os.path.join(backend_dir, ".env"))

from app.services.gemini_service import gemini_service
from app.core.config import settings

def normalize_text(text: str) -> str:
    """Normalizes text for exact duplicate detection (lowercased, stripped punctuation, single whitespace)."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def jaccard_similarity(text1: str, text2: str) -> float:
    """Calculates word-level Jaccard similarity to measure semantic/conceptual overlap."""
    words1 = set(normalize_text(text1).split())
    words2 = set(normalize_text(text2).split())
    if not words1 or not words2:
        return 0.0
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    return len(intersection) / len(union)

def run_gemini_audit():
    print("=" * 80)
    print("GEMINI API AUDIT — AI MOCK INTERVIEW QUESTION GENERATION & ASSESSMENT")
    print("=" * 80)
    print(f"Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend Python: {sys.version.split()[0]}")
    
    # -------------------------------------------------------------
    # SECTION 1: API Key & Model Configuration Audit
    # -------------------------------------------------------------
    print("\n--- SECTION 1: API Configuration & Key Security ---")
    status = gemini_service.get_status()
    api_key = os.getenv("GEMINI_API_KEY") or settings.GEMINI_API_KEY
    has_key = bool(api_key and len(api_key) > 10)
    key_preview = "[CONFIGURED & PROTECTED]" if has_key else "NOT CONFIGURED"
    
    print(f"Key Status: {key_preview}")
    print(f"Active Model: {status.get('model')}")
    print(f"Status: {status.get('status')}")
    print(f"Message: {status.get('message')}")
    
    assert has_key, "API Key must be configured for audit."
    
    # -------------------------------------------------------------
    # SECTION 2: Test Fresh Questions Across Consecutive Interviews
    # Config: Java Developer, Beginner, Easy, 5 Questions
    # -------------------------------------------------------------
    print("\n--- SECTION 2: Fresh Question Generation (3 Identical Config Sessions) ---")
    config = {
        "role": "Java Developer",
        "experience": "Beginner",
        "company": "Google",
        "interview_type": "Technical",
        "count": 5,
        "difficulty": "Easy"
    }
    
    sessions = []
    latencies = []
    
    for session_idx, name in enumerate(["Session A", "Session B", "Session C"]):
        print(f"\nTriggering {name} with config: {config['role']} | {config['experience']} | {config['difficulty']} (5 Qs)...")
        t0 = time.time()
        questions = gemini_service.generate_interview_questions(
            role=config["role"],
            experience=config["experience"],
            company=config["company"],
            interview_type=config["interview_type"],
            count=config["count"],
            difficulty=config["difficulty"]
        )
        lat = time.time() - t0
        latencies.append(lat)
        sessions.append({"name": name, "questions": questions, "latency": lat})
        
        print(f"  {name} completed in {lat:.2f}s | Received: {len(questions)} questions")
        print(f"  AI Generated: {questions[0].get('ai_generated')} | Source: {questions[0].get('source')} | Model: {questions[0].get('model')}")
        for q in questions:
            print(f"    Q{q.get('question_order')}: {q.get('question_text')[:85]}...")

    # Duplicate & Semantic Overlap Analysis
    all_q_texts = []
    norm_map = {}
    for sess in sessions:
        for q in sess["questions"]:
            raw = q.get("question_text", "")
            norm = normalize_text(raw)
            norm_map[norm] = raw
            all_q_texts.append({"session": sess["name"], "raw": raw, "norm": norm})

    # Exact duplicates check
    exact_duplicates = 0
    total_comparisons = 0
    high_similarity_pairs = []

    for i in range(len(all_q_texts)):
        for j in range(i + 1, len(all_q_texts)):
            if all_q_texts[i]["session"] != all_q_texts[j]["session"]:
                total_comparisons += 1
                if all_q_texts[i]["norm"] == all_q_texts[j]["norm"]:
                    exact_duplicates += 1
                sim = jaccard_similarity(all_q_texts[i]["raw"], all_q_texts[j]["raw"])
                if sim >= 0.55:
                    high_similarity_pairs.append({
                        "q1": all_q_texts[i]["raw"],
                        "q2": all_q_texts[j]["raw"],
                        "sim": sim,
                        "s1": all_q_texts[i]["session"],
                        "s2": all_q_texts[j]["session"]
                    })

    print(f"\n--- DUPLICATE & REPETITION METRICS ---")
    print(f"Total Questions Evaluated across 3 runs: {len(all_q_texts)}")
    print(f"Cross-Session Exact Duplicates: {exact_duplicates} (Duplicate Rate: {exact_duplicates/max(total_comparisons,1)*100:.1f}%)")
    print(f"Semantically Overlapping Concept Pairs (Jaccard >= 0.55): {len(high_similarity_pairs)}")
    for pair in high_similarity_pairs:
        print(f"  - [{pair['s1']} vs {pair['s2']}] (Sim: {pair['sim']:.2f}):")
        print(f"      Q1: {pair['q1'][:70]}...")
        print(f"      Q2: {pair['q2'][:70]}...")

    # -------------------------------------------------------------
    # SECTION 3: Configuration Sensitivity Audit
    # Testing contrasting configs: Python Senior Hard vs SQL Data vs HR Behavioral
    # -------------------------------------------------------------
    print("\n--- SECTION 3: Configuration Alignment & Domain Sensitivity ---")
    test_configs = [
        {
            "label": "Config 1 (Python Senior Hard)",
            "role": "Python Backend Architect",
            "experience": "Senior (8+ YOE)",
            "company": "Amazon",
            "interview_type": "Technical & System Architecture",
            "count": 3,
            "difficulty": "Hard",
            "must_contain": ["python", "async", "concurrency", "distributed", "architecture", "memory", "gil"]
        },
        {
            "label": "Config 2 (SQL / Database Engineer)",
            "role": "Database Reliability Engineer",
            "experience": "Mid-Level",
            "company": "Meta",
            "interview_type": "Technical",
            "count": 3,
            "difficulty": "Medium",
            "must_contain": ["sql", "index", "b-tree", "query", "transaction", "acid", "sharding", "replica"]
        },
        {
            "label": "Config 3 (HR / STAR Behavioral)",
            "role": "Engineering Manager",
            "experience": "Senior",
            "company": "Google",
            "interview_type": "HR & Behavioral",
            "count": 3,
            "difficulty": "Medium",
            "must_contain": ["conflict", "team", "time", "leadership", "disagreement", "project", "feedback", "star"]
        }
    ]

    for cfg in test_configs:
        print(f"\nTesting {cfg['label']}: {cfg['role']} ({cfg['count']} Qs)...")
        t0 = time.time()
        res = gemini_service.generate_interview_questions(
            role=cfg["role"],
            experience=cfg["experience"],
            company=cfg["company"],
            interview_type=cfg["interview_type"],
            count=cfg["count"],
            difficulty=cfg["difficulty"]
        )
        lat = time.time() - t0
        print(f"  Received: {len(res)} Qs in {lat:.2f}s | Source: {res[0].get('source')}")
        assert len(res) == cfg["count"], f"Expected {cfg['count']} questions, received {len(res)}"
        
        # Verify domain relevance
        combined_text = " ".join([q.get("question_text", "") + " " + q.get("category", "") for q in res]).lower()
        matches = [kw for kw in cfg["must_contain"] if kw in combined_text]
        print(f"  Domain keywords matched: {matches}")
        assert len(matches) >= 1, f"Generated questions failed to reflect {cfg['role']} domain concepts."

    # -------------------------------------------------------------
    # SECTION 4: Candidate Answer Evaluation & Rubric Precision
    # -------------------------------------------------------------
    print("\n--- SECTION 4: Live Answer Evaluation & Adaptive Follow-up ---")
    eval_question = "Explain the difference between the '==' operator and the '.equals()' method when comparing two String objects in Java."
    
    test_answers = [
        {
            "type": "Strong Answer",
            "text": "In Java, the '==' operator checks for reference identity, verifying if both references point to the exact same memory address. In contrast, .equals() tests value/content equality. Because of String interning in the JVM string pool, string literals with the same value will return true for ==, but String objects instantiated with 'new String()' occupy distinct heap locations and thus return false for ==, while returning true for .equals().",
            "min_expected_score": 80.0
        },
        {
            "type": "Partial Answer",
            "text": "== compares references and equals compares the value inside. Sometimes they give different results.",
            "min_expected_score": 35.0,
            "max_expected_score": 75.0
        },
        {
            "type": "Irrelevant Answer",
            "text": "I really enjoy building convolutional neural networks with PyTorch and fine-tuning BERT transformers on Linux GPUs.",
            "max_expected_score": 25.0
        }
    ]

    for item in test_answers:
        print(f"\nEvaluating {item['type']}...")
        t0 = time.time()
        eval_res = gemini_service.evaluate_response(
            question_text=eval_question,
            user_answer=item["text"],
            persona="strict-tech-lead"
        )
        lat = time.time() - t0
        score = eval_res.get("score", 0.0)
        acc = eval_res.get("technical_accuracy", 0.0)
        print(f"  Score: {score} | Technical Accuracy: {acc} | Latency: {lat:.2f}s")
        print(f"  Source: {eval_res.get('source')} | Model: {eval_res.get('model')}")
        print(f"  Strengths: {eval_res.get('strengths')}")
        print(f"  Improvements: {eval_res.get('improvements')}")
        print(f"  Adaptive follow-up question: {eval_res.get('adaptive_followup_question')}")
        
        if "min_expected_score" in item:
            assert score >= item["min_expected_score"], f"{item['type']} score {score} below expected minimum {item['min_expected_score']}"
        if "max_expected_score" in item:
            assert score <= item["max_expected_score"], f"{item['type']} score {score} above expected maximum {item['max_expected_score']}"

    # -------------------------------------------------------------
    # SECTION 5: Failure Recovery & Offline Domain Fallback Audit
    # -------------------------------------------------------------
    print("\n--- SECTION 5: Failure Recovery & Honest Fallback Attribution ---")
    print("Testing offline domain fallback generator...")
    fallback_res = gemini_service._fallback_questions(
        role="Java Developer",
        company="Google",
        interview_type="Technical",
        count=3,
        difficulty="Easy"
    )
    print(f"Fallback generated {len(fallback_res)} questions:")
    for q in fallback_res:
        print(f"  - Q{q['question_order']}: {q['question_text'][:80]}... [AI Generated: {q['ai_generated']}, Source: {q['source']}]")
        assert q["ai_generated"] is False, "Fallback questions must honestly declare ai_generated: False"
        assert q["source"] == "fallback_engine", "Fallback questions must declare source: fallback_engine"
        assert "java" in q["question_text"].lower() or "jvm" in q["question_text"].lower() or "hashmap" in q["question_text"].lower(), "Java fallback must contain Java-specific concepts"

    print("\n" + "=" * 80)
    print("ALL AUDIT TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 80)

if __name__ == "__main__":
    run_gemini_audit()
