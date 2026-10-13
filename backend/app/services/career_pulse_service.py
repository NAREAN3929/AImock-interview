"""
Career Pulse Analytics & Readiness Engine
Pure, thoroughly tested functions for computing:
1. Weighted readiness scores (50% technical, 30% behavioral, 20% communication).
2. Streak with weekly freeze mechanics.
3. Weakest skill detection with actionable feedback reason.
4. 28-day practice activity heatmap.
"""

from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional

def compute_session_score(technical: float, behavioral: float, communication: float) -> float:
    """
    Computes a single session's readiness score using the mandated formula:
    50% Technical, 30% Behavioral, 20% Communication.
    """
    tech = max(0.0, min(100.0, float(technical)))
    beh = max(0.0, min(100.0, float(behavioral)))
    comm = max(0.0, min(100.0, float(communication)))
    
    return round((0.50 * tech) + (0.30 * beh) + (0.20 * comm), 1)

def compute_readiness_score(sessions: List[Dict[str, float]]) -> Optional[float]:
    """
    Computes server-side readiness score as the average of the user's last 5 evaluated sessions.
    Each session is weighted: 50% technical, 30% behavioral, 20% communication.
    
    Returns:
        float rounded to 1 decimal place, or None if 0 evaluated sessions exist.
    """
    if not sessions:
        return None
    
    # Take at most the 5 most recent evaluated sessions
    recent_sessions = sessions[:5]
    if not recent_sessions:
        return None

    scores = []
    for s in recent_sessions:
        score = compute_session_score(
            technical=s.get("technical_score", 0.0),
            behavioral=s.get("behavioral_score", 0.0),
            communication=s.get("communication_score", 0.0)
        )
        scores.append(score)
    
    if not scores:
        return None
        
    avg = sum(scores) / len(scores)
    return round(avg, 1)

def compute_streak_and_freeze(
    activity_dates: List[date],
    freeze_used_this_week: bool,
    last_freeze_used_at: Optional[datetime] = None,
    today: Optional[date] = None
) -> Dict[str, Any]:
    """
    Computes candidate streak and manages weekly streak freeze.
    Rule: One streak freeze is available per calendar week.
    If the user missed a day and has a freeze available, the freeze protects the streak.
    """
    if today is None:
        today = date.today()
        
    unique_dates = sorted(set(activity_dates), reverse=True)
    
    # Check if freeze was used this week (since most recent Monday)
    days_since_monday = today.weekday()
    current_week_start = today - timedelta(days=days_since_monday)
    
    is_freeze_available = not freeze_used_this_week
    if last_freeze_used_at:
        freeze_date = last_freeze_used_at.date()
        if freeze_date < current_week_start:
            # New week has started, freeze resets
            is_freeze_available = True
            freeze_used_this_week = False

    if not unique_dates:
        return {
            "streak_days": 0,
            "freeze_available": is_freeze_available,
            "freeze_status_message": "Streak freeze is available once a week" if is_freeze_available else "Freeze used this week",
            "freeze_used_this_week": freeze_used_this_week,
            "freeze_applied_today": False
        }

    streak = 0
    check_date = today
    freeze_applied = False
    
    # Check if user practiced today
    if unique_dates[0] == today:
        streak = 1
        check_date = today - timedelta(days=1)
        remaining_dates = unique_dates[1:]
    elif unique_dates[0] == today - timedelta(days=1):
        # Practiced yesterday
        streak = 1
        check_date = today - timedelta(days=2)
        remaining_dates = unique_dates[1:]
    else:
        # Missed yesterday and today
        if is_freeze_available:
            # Apply freeze to yesterday
            freeze_applied = True
            freeze_used_this_week = True
            is_freeze_available = False
            check_date = today - timedelta(days=2)
            remaining_dates = unique_dates
        else:
            return {
                "streak_days": 0,
                "freeze_available": False,
                "freeze_status_message": "Freeze used this week",
                "freeze_used_this_week": freeze_used_this_week,
                "freeze_applied_today": False
            }

    # Count consecutive prior days
    date_set = set(remaining_dates)
    while check_date in date_set:
        streak += 1
        check_date -= timedelta(days=1)

    status_msg = "Streak freeze is available once a week" if is_freeze_available else "Freeze used this week"

    return {
        "streak_days": streak,
        "freeze_available": is_freeze_available,
        "freeze_status_message": status_msg,
        "freeze_used_this_week": freeze_used_this_week,
        "freeze_applied_today": freeze_applied
    }

def find_weakest_skill(
    category_scores: Dict[str, float],
    latest_improvements: Optional[List[str]] = None
) -> Optional[Dict[str, Any]]:
    """
    Finds the user's lowest-scoring skill category and pairs it with one line of reason
    derived from the latest evaluation improvements feedback.
    """
    if not category_scores:
        return None
    
    # Find category with lowest score
    weakest_category, lowest_score = min(category_scores.items(), key=lambda item: item[1])
    
    reason = "Focus on fundamental problem decomposition and pacing."
    if latest_improvements and len(latest_improvements) > 0:
        first_imp = str(latest_improvements[0]).strip()
        if first_imp:
            reason = first_imp
            
    return {
        "skill": weakest_category,
        "score": round(lowest_score, 1),
        "reason": reason
    }

def generate_practice_heatmap_28_days(
    session_datetimes: List[datetime],
    today: Optional[date] = None
) -> List[Dict[str, Any]]:
    """
    Generates activity history for the last 28 days (14 columns x 2 rows grid).
    Cell levels:
        0 = no practice
        1 = one session
        2 = two or more sessions
    """
    if today is None:
        today = date.today()

    # Count sessions per date
    counts_by_date: Dict[date, int] = {}
    for dt in session_datetimes:
        d = dt.date()
        counts_by_date[d] = counts_by_date.get(d, 0) + 1

    cells = []
    # 28 days ending today: from (today - 27 days) to today
    start_date = today - timedelta(days=27)
    for i in range(28):
        current_date = start_date + timedelta(days=i)
        count = counts_by_date.get(current_date, 0)
        level = 0 if count == 0 else (1 if count == 1 else 2)
        
        cells.append({
            "date": current_date.isoformat(),
            "day_label": current_date.strftime("%b %d"),
            "count": count,
            "level": level
        })

    return cells
