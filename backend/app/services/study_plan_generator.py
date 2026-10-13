import datetime
from typing import Dict, Any, List, Optional

def generate_study_plan(
    role: str,
    experience_level: str,
    interview_date: Optional[datetime.datetime] = None,
    interview_date_preset: Optional[str] = "within_14_days",
    remaining_monthly_sessions: int = 10,
    target_company: Optional[str] = None
) -> Dict[str, Any]:
    """
    Deterministic study plan generator based on candidate profile.
    Fast, reliable, and strictly without external AI dependencies.
    """
    cleaned_role = (role or "Software Engineer").strip()
    norm_exp = (experience_level or "Fresher").strip().lower()
    comp_tag = f" ({target_company})" if target_company else ""

    # 1. Determine timeline duration (days & weeks)
    now = datetime.datetime.now(interview_date.tzinfo) if (interview_date and interview_date.tzinfo) else datetime.datetime.now()
    days_left: Optional[int] = None

    if interview_date is not None:
        delta = (interview_date - now).total_seconds() / 86400
        days_left = max(1, int(round(delta)))
    elif interview_date_preset == "within_7_days":
        days_left = 7
    elif interview_date_preset == "within_14_days":
        days_left = 14
    elif interview_date_preset == "within_30_days":
        days_left = 30
    else: # not_scheduled or other
        days_left = 14

    if days_left <= 7:
        weeks_count = 1
        is_compressed = True
    elif days_left <= 14:
        weeks_count = 2
        is_compressed = False
    else:
        weeks_count = 4
        is_compressed = False

    tasks: List[Dict[str, Any]] = []

    # 2. Build tasks based on timeline and experience level
    if is_compressed:
        # 1-Week Compressed Daily Sprint (7 Days)
        if "fresher" in norm_exp:
            daily_schedule = [
                ("Day 1: Role Core Fundamentals & Syntax Drills", "fundamentals", 1),
                ("Day 2: Essential Data Structures (Arrays & Strings)", "dsa", 1),
                ("Day 3: Core Algorithms & Searching/Sorting", "dsa", 1),
                ("Day 4: Framework Essentials & Component Lifecycles", "fundamentals", 1),
                ("Day 5: STAR Behavioral Stories & Culture Alignment", "star_behavioral", 1),
                ("Day 6: Speed Coding & Edge Case Sandbox Practice", "dsa", 1),
                (f"Day 7: Full-Length AI Mock Interview{comp_tag}", "mock_interview", 1),
            ]
        elif "3+" in norm_exp or "senior" in norm_exp:
            daily_schedule = [
                ("Day 1: High-Level System Architecture & Scalability", "system_design", 1),
                ("Day 2: Advanced Data Structures & Concurrency", "dsa", 1),
                ("Day 3: Distributed Caching & Database Sharding", "system_design", 1),
                ("Day 4: Executive Leadership & STAR Conflict Scenarios", "star_behavioral", 1),
                ("Day 5: High-Scale API Design & Fault Tolerance", "system_design", 1),
                ("Day 6: Rapid Problem Solving & Code Architecture", "dsa", 1),
                (f"Day 7: Comprehensive Senior Bar Raiser Mock{comp_tag}", "mock_interview", 1),
            ]
        else: # 1 to 3 years
            daily_schedule = [
                ("Day 1: Architecture Fundamentals & API Design", "fundamentals", 1),
                ("Day 2: Mid-Level Data Structures (Trees & Hash Maps)", "dsa", 1),
                ("Day 3: Performance Profiling & Optimization Drills", "dsa", 1),
                ("Day 4: STAR Behavioral & Project Ownership Scenarios", "star_behavioral", 1),
                ("Day 5: System Trade-Offs & Storage Selection", "system_design", 1),
                ("Day 6: Coding Sandbox Verification & Bug Hunt", "dsa", 1),
                (f"Day 7: Full Simulated Technical Mock Interview{comp_tag}", "mock_interview", 1),
            ]

        for day_idx, (title, s_type, cnt) in enumerate(daily_schedule, start=1):
            tasks.append({
                "week_number": 1,
                "day_number": day_idx,
                "title": f"[{cleaned_role}] {title}",
                "session_type": s_type,
                "sessions_count": cnt,
                "status": "pending"
            })

    elif weeks_count == 2:
        # 2-Week Plan (4 tasks per week)
        if "fresher" in norm_exp:
            w1 = [
                ("Language Syntax & Core Computer Science Foundations", "fundamentals", 1),
                ("Arrays, Strings & Two-Pointer DSA Drills", "dsa", 1),
                ("Linked Lists, Stacks & Queue Drills", "dsa", 1),
                ("Intro to STAR Method & Self Introduction Pitch", "star_behavioral", 1),
            ]
            w2 = [
                ("Recursion, Trees & Hash Map Mastery", "dsa", 1),
                ("Modular Code Design & Clean Architecture Drills", "fundamentals", 1),
                ("STAR Behavioral: Overcoming Challenges & Group Projects", "star_behavioral", 1),
                (f"Final 45-Min Technical Mock Interview{comp_tag}", "mock_interview", 1),
            ]
        elif "3+" in norm_exp or "senior" in norm_exp:
            w1 = [
                ("Distributed Systems & Microservices Decomposition", "system_design", 1),
                ("Graphs, Dynamic Programming & Scale Drills", "dsa", 1),
                ("Database Replication, Sharding & CAP Theorem", "system_design", 1),
                ("Senior STAR: Technical Strategy & Cross-Team Influence", "star_behavioral", 1),
            ]
            w2 = [
                ("Cache Invalidation, Kafka Event Pipelines & Queues", "system_design", 1),
                ("Advanced Algorithmic Optimization & Complexity Bounds", "dsa", 1),
                ("Executive Leadership, Culture & Ambiguity Resolution", "star_behavioral", 1),
                (f"Full Senior Bar Raiser & System Design Mock{comp_tag}", "mock_interview", 1),
            ]
        else: # 1 to 3 years
            w1 = [
                ("Application Layer Architecture & REST/GraphQL Design", "fundamentals", 1),
                ("Binary Search, Trees & Hash Table Patterns", "dsa", 1),
                ("STAR Behavioral: Ownership, Deadlines & Teamwork", "star_behavioral", 1),
                ("Relational vs NoSQL Storage Trade-Offs", "system_design", 1),
            ]
            w2 = [
                ("Dynamic Programming & Graph Traversal Techniques", "dsa", 1),
                ("Microservice Component Design & Error Handling", "system_design", 1),
                ("Behavioral: Resolving Production Incidents (STAR)", "star_behavioral", 1),
                (f"Full-Length Technical Mock Interview{comp_tag}", "mock_interview", 1),
            ]

        for d_idx, (title, s_type, cnt) in enumerate(w1, start=1):
            tasks.append({
                "week_number": 1,
                "day_number": d_idx,
                "title": f"[{cleaned_role}] {title}",
                "session_type": s_type,
                "sessions_count": cnt,
                "status": "pending"
            })
        for d_idx, (title, s_type, cnt) in enumerate(w2, start=1):
            tasks.append({
                "week_number": 2,
                "day_number": d_idx,
                "title": f"[{cleaned_role}] {title}",
                "session_type": s_type,
                "sessions_count": cnt,
                "status": "pending"
            })

    else:
        # 4-Week In-Depth Plan (3 tasks per week = 12 sessions)
        for wk in range(1, 5):
            if wk == 1:
                t1 = ("Core Foundations & Syntax Deep-Dive", "fundamentals") if "fresher" in norm_exp else ("Scalable Architecture & Design Principles", "system_design")
                t2 = ("Array & String Algorithmic Patterns", "dsa")
                t3 = ("STAR Behavioral Framework & Personal Story Bank", "star_behavioral")
            elif wk == 2:
                t1 = ("Trees, Graphs & Search Algorithms", "dsa")
                t2 = ("Database Indexing & Query Optimization", "fundamentals" if "fresher" in norm_exp else "system_design")
                t3 = ("Behavioral: Conflict & Project Ownership", "star_behavioral")
            elif wk == 3:
                t1 = ("Dynamic Programming & Advanced DSA", "dsa")
                t2 = ("Distributed Systems & Resiliency Patterns", "system_design")
                t3 = ("High-Pressure Behavioral & STAR Delivery", "star_behavioral")
            else: # wk 4
                t1 = ("End-to-End System Integration Drills", "system_design" if "fresher" not in norm_exp else "fundamentals")
                t2 = ("Speed Coding & Algorithmic Refinement", "dsa")
                t3 = (f"Comprehensive Final Mock Interview Simulation{comp_tag}", "mock_interview")

            for day_idx, (title, s_type) in enumerate([t1, t2, t3], start=1):
                tasks.append({
                    "week_number": wk,
                    "day_number": day_idx,
                    "title": f"[{cleaned_role}] {title}",
                    "session_type": s_type,
                    "sessions_count": 1,
                    "status": "pending"
                })

    # 3. Monthly Session Quota Enforcing
    total_requested = sum(t["sessions_count"] for t in tasks)
    quota_capped = False
    quota_warning: Optional[str] = None

    if total_requested > remaining_monthly_sessions:
        quota_capped = True
        quota_warning = (
            f"This plan recommends {total_requested} sessions, but your current plan has "
            f"{remaining_monthly_sessions} sessions remaining this month. Tasks have been prioritized."
        )
        # Cap tasks while guaranteeing minimum of fundamentals, DSA, STAR, and mock
        capped_tasks = []
        running_count = 0
        for t in tasks:
            if running_count + t["sessions_count"] <= remaining_monthly_sessions:
                capped_tasks.append(t)
                running_count += t["sessions_count"]
            elif running_count < remaining_monthly_sessions:
                t["sessions_count"] = remaining_monthly_sessions - running_count
                capped_tasks.append(t)
                running_count = remaining_monthly_sessions
                break

        # Ensure a final mock is retained if possible
        has_mock = any(t["session_type"] == "mock_interview" for t in capped_tasks)
        if not has_mock and capped_tasks:
            capped_tasks[-1]["title"] = f"[{cleaned_role}] Final Full-Length Mock Interview{comp_tag}"
            capped_tasks[-1]["session_type"] = "mock_interview"

        tasks = capped_tasks

    return {
        "role": cleaned_role,
        "experience_level": experience_level,
        "weeks_count": weeks_count,
        "days_until_interview": days_left,
        "interview_date": interview_date,
        "total_sessions": sum(t["sessions_count"] for t in tasks),
        "remaining_monthly_sessions": remaining_monthly_sessions,
        "quota_capped": quota_capped,
        "quota_warning": quota_warning,
        "tasks": tasks
    }
