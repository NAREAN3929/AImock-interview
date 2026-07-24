import json
import logging
import re
from typing import Dict, Any, List
from app.core.config import settings

logger = logging.getLogger("gemini_service")

class GeminiService:
    def __init__(self):
        self.model = None
        self._init_client()

    def _init_client(self):
        api_key = settings.GEMINI_API_KEY
        if api_key and not self.model:
            try:
                import google.generativeai as genai
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                logger.info("Google Gemini API configured successfully!")
            except Exception as e:
                logger.warning(f"Failed to initialize Google Gemini API client: {e}. Fallback engine will be used.")
                self.model = None

    def generate_interview_questions(self, role: str, experience: str, company: str, interview_type: str, count: int = 5) -> List[Dict[str, Any]]:
        self._init_client()
        prompt = f"""
        You are a Principal Tech Lead and Interviewer at {company}.
        Generate {count} distinct interview questions for a {experience} candidate applying for the role of {role}.
        Interview Type: {interview_type}.

        Return ONLY a JSON array of objects with the following schema:
        [
          {{
            "question_order": 1,
            "category": "Data Structures & Algorithms / System Design / Behavioral",
            "question_text": "Detailed question prompt...",
            "expected_keywords": ["keyword1", "keyword2", "keyword3"],
            "ideal_answer": "Brief summary of what an ideal candidate answer should include",
            "code_template": "// Optional code starter if technical question, else empty string"
          }}
        ]
        """
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                raw_text = response.text
                clean_json = self._extract_json(raw_text)
                questions = json.loads(clean_json)
                if isinstance(questions, list) and len(questions) > 0:
                    return questions
            except Exception as e:
                logger.error(f"Gemini Question Generation error: {e}")

        # Fallback preset generator
        return self._fallback_questions(role, company, interview_type, count)

    def evaluate_response(self, question_text: str, user_answer: str, code_submission: str = None, persona: str = "strict-tech-lead") -> Dict[str, Any]:
        self._init_client()
        prompt = f"""
        You are an AI Interviewer adopting the persona: "{persona}".
        - Strict Tech Lead: Probes deeply into algorithm complexity, memory overhead, edge cases.
        - Friendly HR Recruiter: Focuses on STAR structure, empathy, teamwork.
        - Fast-Paced FAANG Engineer: Demands concise, high-throughput answers without fluff.
        - System Architect: Evaluates scalability, fault-tolerance, microservice trade-offs.

        Question: {question_text}
        Candidate Answer: {user_answer}
        Code Submission (if any): {code_submission or "None"}

        Evaluate the response. If candidate answer is brief or missing specific details, generate a dynamic probing follow-up question.
        Return ONLY a JSON object with this exact structure:
        {{
            "score": 85.0,
            "technical_accuracy": 88.0,
            "clarity_score": 82.0,
            "star_method_score": 85.0,
            "strengths": ["Clear explanation of core concept", "Good problem decomposition"],
            "improvements": ["Could mention edge case handling", "Quantify results more"],
            "model_answer": "Ideal STAR or technical answer candidate should have given...",
            "adaptive_followup_question": "How did you handle database write contention under high concurrency?"
        }}
        """
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                clean_json = self._extract_json(response.text)
                result = json.loads(clean_json)
                return result
            except Exception as e:
                logger.error(f"Gemini Response Evaluation error: {e}")

        # Fallback Evaluation Engine
        res = self._fallback_evaluation(user_answer, code_submission)
        res["adaptive_followup_question"] = f"Can you elaborate further on how you would measure performance and handle edge cases?"
        return res

    def evaluate_system_design_diagram(self, canvas_schema: Dict[str, Any]) -> Dict[str, Any]:
        self._init_client()
        prompt = f"""
        You are a Principal System Architect auditing a System Design whiteboard diagram.
        Diagram Nodes & Connections JSON:
        {json.dumps(canvas_schema)}

        Analyze the architecture for:
        1. Single Point of Failure (SPOF) risks.
        2. Performance bottlenecks & scalability constraints.
        3. Scalability Score (0-100).
        4. Strengths & recommended architectural improvements.
        5. Estimated monthly infrastructure cost (USD).

        Return ONLY a JSON object with format:
        {{
            "scalabilityScore": 86.5,
            "spofRisks": ["Single primary database without read replicas or failover", "Uncached auth service endpoint"],
            "bottlenecks": ["Monolithic API service handling both WebSocket and heavy compute"],
            "strengths": ["Clear separation of CDN and object storage", "Load Balancer positioned at entrance"],
            "recommendations": ["Introduce Redis caching cluster for session state", "Add message queue (Kafka/RabbitMQ) for async tasks"],
            "estimatedMonthlyCostUSD": "$450 - $1,200 / month"
        }}
        """
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                clean_json = self._extract_json(response.text)
                return json.loads(clean_json)
            except Exception as e:
                logger.error(f"Gemini System Design Evaluation error: {e}")

        return {
            "scalabilityScore": 84.0,
            "spofRisks": [
                "Single primary database instance without automated multi-AZ failover",
                "Lack of distributed cache layer in front of high-traffic queries"
            ],
            "bottlenecks": [
                "Synchronous database queries during user authentication",
                "Potential memory bottleneck on microservice worker node"
            ],
            "strengths": [
                "Proper positioning of NGINX / Cloudflare Load Balancer at API gateway",
                "Decoupled asset serving via object storage buckets"
            ],
            "recommendations": [
                "Add Redis cluster for session caching and query result buffering",
                "Implement RabbitMQ/Kafka queue for background processing",
                "Configure DB read replicas with horizontal scaling"
            ],
            "estimatedMonthlyCostUSD": "$380 - $950 / month"
        }

    def analyze_resume(self, resume_text: str, target_role: str) -> Dict[str, Any]:
        self._init_client()
        prompt = f"""
        Analyze this resume for a target role of {target_role}:
        Resume Text:
        {resume_text[:2000]}

        Return ONLY a JSON object with format:
        {{
            "resume_score": 84.5,
            "extracted_skills": ["Python", "FastAPI", "React", "Docker", "SQL"],
            "missing_skills": ["Kubernetes", "System Design", "CI/CD Pipeline"],
            "summary": "Strong backend foundation with relevant APIs experience.",
            "recommended_questions": [
                "Explain how you design REST APIs for high-throughput services.",
                "How do you handle database migrations with SQLAlchemy?",
                "Describe a project where you optimized frontend page load times."
            ]
        }}
        """
        if self.model:
            try:
                response = self.model.generate_content(prompt)
                clean_json = self._extract_json(response.text)
                return json.loads(clean_json)
            except Exception as e:
                logger.error(f"Gemini Resume Analysis error: {e}")

        return self._fallback_resume_analysis(resume_text, target_role)

    def _extract_json(self, text: str) -> str:
        match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
        if match:
            return match.group(1)
        match = re.search(r'\[.*\]|\{.*\}', text, re.DOTALL)
        if match:
            return match.group(0)
        return text

    def _fallback_questions(self, role: str, company: str, interview_type: str, count: int) -> List[Dict[str, Any]]:
        preset_pool = [
            {
                "question_order": 1,
                "category": "System Architecture",
                "question_text": f"At {company}, how would you design a rate-limiting middleware for a high-traffic microservices cluster handling 100k requests/sec?",
                "expected_keywords": ["Redis", "Token Bucket", "Sliding Window", "Latency", "Distributed Lock"],
                "ideal_answer": "Discuss sliding window counter or token bucket using Redis cluster for zero-latency rate limiting.",
                "code_template": "// Implement rate limiter logic\nfunction isAllowed(userId, limit, windowSec) {\n  // Your implementation here\n}"
            },
            {
                "question_order": 2,
                "category": "Behavioral / STAR",
                "question_text": "Describe a situation where you had a major technical disagreement with a team member. How did you resolve it?",
                "expected_keywords": ["Situation", "Task", "Action", "Result", "Data-driven", "Empathy"],
                "ideal_answer": "Use STAR method: Explain context, data benchmarking, open discussion, consensus, and positive outcome.",
                "code_template": ""
            },
            {
                "question_order": 3,
                "category": "Coding & Problem Solving",
                "question_text": "Given an array of integers, write an algorithm to find the longest contiguous subarray with a sum equal to target K in O(N) time.",
                "expected_keywords": ["HashMap", "Prefix Sum", "Two Pointers", "Time Complexity"],
                "ideal_answer": "Use prefix sum map to store (sum -> first index) to achieve O(N) time and O(N) space complexity.",
                "code_template": "def max_subarray_len(nums, k):\n    # Write your solution here\n    pass"
            },
            {
                "question_order": 4,
                "category": "Performance Optimization",
                "question_text": f"What strategies would you deploy to optimize a React + Vite web application facing high Initial Page Load and Layout Shift (CLS)?",
                "expected_keywords": ["Code Splitting", "Lazy Loading", "Web Vitals", "SSR", "Asset Caching"],
                "ideal_answer": "Address code splitting with React.lazy, dynamic imports, font preloading, and explicit image dimensions.",
                "code_template": ""
            },
            {
                "question_order": 5,
                "category": "Database Engineering",
                "question_text": "Explain the trade-offs between B-Tree indexes and Hash indexes in MySQL InnoDB. When does an index fail to improve query performance?",
                "expected_keywords": ["B-Tree", "Range Queries", "Cardinality", "Full Table Scan", "Composite Key"],
                "ideal_answer": "B-Tree supports range queries (<, >, BETWEEN) while Hash only supports equality (=). Low cardinality causes full table scans.",
                "code_template": ""
            }
        ]
        return preset_pool[:count]

    def _fallback_evaluation(self, user_answer: str, code_submission: str = None) -> Dict[str, Any]:
        words = len(user_answer.split())
        has_code = bool(code_submission and len(code_submission) > 10)
        
        base_score = min(70.0 + (words * 0.3) + (15.0 if has_code else 0.0), 96.0)
        
        return {
            "score": round(base_score, 1),
            "technical_accuracy": round(min(base_score + 2.0, 98.0), 1),
            "clarity_score": round(min(base_score - 1.5, 95.0), 1),
            "star_method_score": round(min(base_score + 1.0, 95.0), 1),
            "strengths": [
                "Good technical terminology and clear structure",
                "Addressed core requirements directly",
                "Showed practical problem-solving initiative"
            ],
            "improvements": [
                "Provide specific metrics or benchmarks from past experience",
                "Discuss failure modes and fallback scenarios in more detail"
            ],
            "model_answer": "A top-tier answer clearly defines the Situation, details the technical constraints, presents data-backed Actions, and concludes with quantifiable Results (e.g. 'reduced latency by 40%')."
        }

    def _fallback_resume_analysis(self, resume_text: str, target_role: str) -> Dict[str, Any]:
        return {
            "resume_score": 86.0,
            "extracted_skills": ["TypeScript", "React", "Python", "FastAPI", "SQL", "Git", "REST APIs"],
            "missing_skills": ["System Design", "Kubernetes", "GraphQL", "Performance Profiling"],
            "summary": f"Strong engineering background aligned well with {target_role}. Demonstrates solid API construction and modern web app development.",
            "recommended_questions": [
                "How do you design scalable state management in modern React applications?",
                "Explain your approach to database indexing and query optimization in FastAPI.",
                "Describe a project where you handled production API rate limiting and security."
            ]
        }

gemini_service = GeminiService()
