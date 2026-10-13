"""
Career Roadmap AI Generator Service
Generates structured, validated learning roadmaps divided into ordered phases,
topics, prerequisites, learning objectives, resources, exercises, and interactive quizzes.
"""

import json
import logging
import re
from typing import Dict, Any, List, Optional
from app.services.gemini_service import gemini_service

logger = logging.getLogger("roadmap_generator")

def _calc_weeks_multiplier(study_time_daily: str) -> float:
    time_lower = (study_time_daily or "").lower()
    if "30" in time_lower:
        return 1.8
    elif "2" in time_lower:
        return 0.75
    elif "3" in time_lower:
        return 0.5
    return 1.0  # default for 1 hour

def get_fallback_roadmap(
    domain: str,
    skill_level: str,
    target_role: str,
    study_time_daily: str = "1 hour",
    learning_preference: str = "balanced"
) -> List[Dict[str, Any]]:
    """
    Returns rich, domain-specific structured roadmap data tailored to skill level and study pace.
    """
    mult = _calc_weeks_multiplier(study_time_daily)
    domain_clean = (domain or "Full-Stack Development").strip().lower()
    level_clean = (skill_level or "Intermediate").strip().lower()

    if "java" in domain_clean:
        return _get_java_roadmap(target_role, level_clean, mult)
    elif "front" in domain_clean:
        return _get_frontend_roadmap(target_role, level_clean, mult)
    elif "back" in domain_clean:
        return _get_backend_roadmap(target_role, level_clean, mult)
    elif "data eng" in domain_clean:
        return _get_data_engineering_roadmap(target_role, level_clean, mult)
    elif "data sci" in domain_clean or "ai/ml" in domain_clean or "machine" in domain_clean:
        return _get_ai_ml_roadmap(target_role, level_clean, mult)
    elif "devops" in domain_clean or "cloud" in domain_clean:
        return _get_devops_roadmap(target_role, level_clean, mult)
    elif "cyber" in domain_clean or "security" in domain_clean:
        return _get_cybersecurity_roadmap(target_role, level_clean, mult)
    else:
        # Default Full-Stack Development
        return _get_fullstack_roadmap(target_role, level_clean, mult)

def _get_fullstack_roadmap(target_role: str, level: str, mult: float) -> List[Dict[str, Any]]:
    is_beginner = "beginner" in level
    phases = [
        {
            "phase_order": 1,
            "title": "Web Architecture & Modern JavaScript Mastery",
            "purpose": "Establish rock-solid fluency in HTTP protocols, asynchronous JavaScript (Event Loop, Promises), and DOM mechanics.",
            "estimated_weeks": max(1, round(3 * mult)),
            "milestone_project": "Interactive Async Dashboard with REST Integration",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "HTTP, DNS, and Browser Execution Model",
                    "description": "Understand how browsers request, parse, render HTML/CSS, and execute JS through the critical rendering path.",
                    "learning_objectives": [
                        "Explain DNS resolution and TLS handshake flow",
                        "Optimize the Critical Rendering Path (CRP)",
                        "Differentiate HTTP/1.1 pipelining vs HTTP/2 multiplexing and HTTP/3"
                    ],
                    "prerequisites": ["Basic terminal and text editor familiarity"],
                    "key_concepts": "Browsers request HTML via HTTP GET, parse DOM trees, construct CSSOM, combine into Render Tree, and calculate Layout before Painting.",
                    "exercises": [
                        "Trace network waterfalls in Chrome DevTools Network Tab for a high-traffic site",
                        "Implement responsive meta viewport tags and media query breakpoints"
                    ],
                    "resources": [
                        {"title": "MDN Web Docs - How the Web Works", "url": "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works", "type": "Documentation"},
                        {"title": "web.dev - Fast load times", "url": "https://web.dev/fast/", "type": "Guide"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "Which of the following occurs during the Critical Rendering Path before Painting?",
                            "options": ["Garbage collection only", "DOM and CSSOM construction to build the Render Tree", "Server-side hydration", "WebSocket handshake"],
                            "correct": 1,
                            "explanation": "DOM and CSSOM are built in parallel and combined into the Render Tree before layout and painting occur."
                        },
                        {
                            "question": "What primary advantage does HTTP/2 provide over HTTP/1.1?",
                            "options": ["Binary protocols without headers", "Full multiplexing over a single TCP connection", "Automatic server caching", "Removal of TLS encryption"],
                            "correct": 1,
                            "explanation": "HTTP/2 introduces binary framing and multiplexing, eliminating head-of-line blocking on single TCP streams."
                        },
                        {
                            "question": "Where does script execution with 'defer' attribute occur?",
                            "options": ["Immediately before HTML parsing", "In parallel, but executed only after HTML parsing completes", "During CSSOM construction", "Only after page reload"],
                            "correct": 1,
                            "explanation": "'defer' scripts download in the background without blocking parsing and execute in order right before DOMContentLoaded."
                        }
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Practice in Coding Bank"
                },
                {
                    "topic_order": 2,
                    "title": "Asynchronous JavaScript & Event Loop Deep Dive",
                    "description": "Master microtasks vs macrotasks, Promises, async/await, and error propagation.",
                    "learning_objectives": [
                        "Trace the JS Event Loop call stack, task queue, and microtask queue",
                        "Handle Promise.all, Promise.allSettled, and Promise.race patterns",
                        "Avoid unhandled promise rejections and memory leaks"
                    ],
                    "prerequisites": ["JavaScript Variables and Functions"],
                    "key_concepts": "JavaScript is single-threaded. Synchronous code executes on the Call Stack; Promise resolutions enter the Microtask queue; setTimeout enters the Macrotask queue.",
                    "exercises": [
                        "Build an async retry utility with exponential backoff and jitter",
                        "Implement an abortable fetch request using AbortController"
                    ],
                    "resources": [
                        {"title": "JavaScript.info - Event Loop", "url": "https://javascript.info/event-loop", "type": "Article"},
                        {"title": "MDN - Using Promises", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises", "type": "Documentation"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "In what order will console.log execute for: sync log, setTimeout(0), Promise.resolve()?",
                            "options": ["setTimeout, Promise, sync", "sync, Promise, setTimeout", "sync, setTimeout, Promise", "Promise, sync, setTimeout"],
                            "correct": 1,
                            "explanation": "Synchronous code runs first, then microtasks (Promise.then), then macrotasks (setTimeout)."
                        },
                        {
                            "question": "Which Promise combinator waits for all promises to settle regardless of rejection?",
                            "options": ["Promise.all", "Promise.race", "Promise.allSettled", "Promise.any"],
                            "correct": 2,
                            "explanation": "Promise.allSettled resolves when all input promises have either fulfilled or rejected."
                        },
                        {
                            "question": "How do you cancel an active fetch() request in modern JavaScript?",
                            "options": ["Calling fetch.cancel()", "Passing an AbortController.signal to fetch options", "Closing the browser window", "Invoking window.stop()"],
                            "correct": 1,
                            "explanation": "AbortController provides a signal that can be passed to fetch to cancel the ongoing HTTP connection."
                        }
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Solve Async Drills in Coding Bank"
                }
            ]
        },
        {
            "phase_order": 2,
            "title": "Frontend Frameworks & Scalable State Management",
            "purpose": "Construct performant component hierarchies with React, custom hooks, and predictable state lifecycles.",
            "estimated_weeks": max(1, round(3 * mult)),
            "milestone_project": "Production-Grade E-Commerce or SaaS Dashboard with Optimistic UI",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "React Lifecycle, Reconciliation, and Hooks",
                    "description": "Understand Fiber reconciliation, virtual DOM diffing, and functional hook rules (useState, useEffect, useMemo, useCallback).",
                    "learning_objectives": [
                        "Explain React Fiber tree traversal and double buffering",
                        "Prevent unnecessary re-renders using memo and dependency arrays",
                        "Design robust custom hooks separating UI from business logic"
                    ],
                    "prerequisites": ["Asynchronous JavaScript & Event Loop Deep Dive"],
                    "key_concepts": "React diffs elements using key heuristics. Components re-render when state or props change. Hooks must execute at the top level in consistent order.",
                    "exercises": [
                        "Create a useDebounce and useLocalStorage custom hook suite",
                        "Profile component render times using React DevTools Profiler"
                    ],
                    "resources": [
                        {"title": "React.dev - Documentation", "url": "https://react.dev/", "type": "Documentation"},
                        {"title": "Overreacted - A Complete Guide to useEffect", "url": "https://overreacted.io/a-complete-guide-to-useeffect/", "type": "Guide"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "Why must list items in React have unique and stable 'key' props?",
                            "options": ["To style them with CSS", "To help React Fiber identify which items changed, were added, or were removed", "To prevent JavaScript memory leaks", "To enable server-side hydration"],
                            "correct": 1,
                            "explanation": "Keys provide identity across renders so React can reuse existing DOM nodes efficiently during reconciliation."
                        },
                        {
                            "question": "When should useCallback be applied?",
                            "options": ["On every single function inside every component", "Only when passing callbacks to optimized child components that rely on reference equality", "To replace useEffect", "To handle API errors"],
                            "correct": 1,
                            "explanation": "useCallback caches function definitions to prevent breaking reference equality on memoized child components."
                        },
                        {
                            "question": "What is the consequence of omitting dependencies from useEffect's dependency array?",
                            "options": ["Syntax error at compile time", "Stale closures where the effect captures outdated state or props", "Immediate browser freeze", "Automatic React re-mounting"],
                            "correct": 1,
                            "explanation": "Omitting dependencies leads to stale closures capturing variables from previous render cycles."
                        }
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Take React Technical Mock Interview"
                },
                {
                    "topic_order": 2,
                    "title": "Global State Architecture & Client Caching",
                    "description": "Evaluate Context API vs Zustand vs Redux Toolkit, and implement server-state caching patterns.",
                    "learning_objectives": [
                        "Implement atomic state management with Zustand or Redux",
                        "Prevent Context re-render cascading across unrelated children",
                        "Handle optimistic mutations and query invalidation"
                    ],
                    "prerequisites": ["React Lifecycle, Reconciliation, and Hooks"],
                    "key_concepts": "Separate client UI state (theme, modals) from server cache state (user profile, interview records). Use selectors to subscribe only to needed slices.",
                    "exercises": [
                        "Refactor a multi-step form to use Zustand with persistent storage",
                        "Implement optimistic UI updates with automatic rollback on error"
                    ],
                    "resources": [
                        {"title": "Zustand Documentation", "url": "https://docs.pmnd.rs/zustand/getting-started/introduction", "type": "Documentation"},
                        {"title": "TanStack Query Guides", "url": "https://tanstack.com/query/latest", "type": "Guide"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "What is the primary drawback of using React Context for frequently updating global state?",
                            "options": ["It doesn't support TypeScript", "All consumers re-render whenever any value in the context changes", "It only works on class components", "It breaks browser history"],
                            "correct": 1,
                            "explanation": "React Context lacks granular selectors by default, causing all consumer components to re-render on any value change."
                        },
                        {
                            "question": "What is an 'optimistic UI update'?",
                            "options": ["Hoping the server never crashes", "Updating the client UI immediately before server confirmation, rolling back on error", "Using light theme instead of dark theme", "Generating code via AI"],
                            "correct": 1,
                            "explanation": "Optimistic updates deliver instantaneous UX by rendering expected outcomes immediately while the server request executes in background."
                        },
                        {
                            "question": "Why is separating server-state from client-state beneficial?",
                            "options": ["It halves bundle size", "Server-state involves caching, deduplication, and revalidation, unlike transient UI state", "It removes need for backend databases", "It enables offline video streaming"],
                            "correct": 1,
                            "explanation": "Server state requires caching, background revalidation, and retry mechanics that differ fundamentally from local UI flags."
                        }
                    ],
                    "practical_link_tab": "company-oa",
                    "practical_action_label": "Test State Logic in Company OA Simulator"
                }
            ]
        },
        {
            "phase_order": 3,
            "title": "Backend Engineering, RESTful APIs & Authentication",
            "purpose": "Design robust server endpoints, data validation, JWT authentication, and secure session management.",
            "estimated_weeks": max(1, round(4 * mult)),
            "milestone_project": "Full Authentication & Role-Based Access Control (RBAC) API Service",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "REST API Architecture & Input Validation",
                    "description": "Design idempotent endpoints, standard HTTP status codes, structured error envelopes, and schema validation with Pydantic/Zod.",
                    "learning_objectives": [
                        "Structure canonical REST resource hierarchies (/api/v1/resources/:id)",
                        "Enforce strict schema validation and sanitization against injection",
                        "Implement pagination (cursor vs offset) and rate limiting"
                    ],
                    "prerequisites": ["HTTP, DNS, and Browser Execution Model"],
                    "key_concepts": "APIs should be stateless and idempotent where appropriate (GET, PUT, DELETE). Use 201 for Created, 400 for Bad Request, 401 for Unauthorized, 403 for Forbidden.",
                    "exercises": [
                        "Implement CRUD endpoints with Pydantic/Zod request validation",
                        "Add cursor-based pagination for large data streams"
                    ],
                    "resources": [
                        {"title": "FastAPI Documentation", "url": "https://fastapi.tiangolo.com/", "type": "Documentation"},
                        {"title": "RESTful API Design Best Practices", "url": "https://restfulapi.net/", "type": "Guide"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "Which HTTP method is required to be idempotent according to RFC specifications?",
                            "options": ["POST", "PUT", "PATCH without preconditions", "CONNECT"],
                            "correct": 1,
                            "explanation": "PUT is idempotent: repeating the request multiple times produces the exact same server resource state."
                        },
                        {
                            "question": "What is the difference between HTTP 401 and 403 status codes?",
                            "options": ["401 is server error; 403 is client error", "401 means unauthenticated (who are you?); 403 means unauthorized (you lack permission)", "401 is deprecated in HTTP/2", "There is no difference"],
                            "correct": 1,
                            "explanation": "401 Unauthorized indicates missing or invalid credentials; 403 Forbidden indicates credentials are recognized but lack permissions."
                        },
                        {
                            "question": "Why is cursor-based pagination preferred over offset-based pagination on large datasets?",
                            "options": ["Offset requires full table sequential scans and skips, while cursor uses indexed pointers", "Cursor pagination requires less memory in the browser", "Offset pagination cannot return JSON", "Cursor pagination only works in SQLite"],
                            "correct": 0,
                            "explanation": "Offset pagination suffers from O(N) performance degradation (OFFSET 100000) and duplicate rows when records are inserted concurrently."
                        }
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Practice API Design in Coding Bank"
                },
                {
                    "topic_order": 2,
                    "title": "JWT, Refresh Tokens & Secure Session Management",
                    "description": "Implement stateless JWT tokens, HTTP-only secure cookies, CSRF protection, and token revocation.",
                    "learning_objectives": [
                        "Implement short-lived access tokens (15m) paired with rotating refresh tokens (7d)",
                        "Store credentials in HTTP-only, SameSite=Strict cookies to eliminate XSS token theft",
                        "Design token blocklisting / revocation strategies"
                    ],
                    "prerequisites": ["REST API Architecture & Input Validation"],
                    "key_concepts": "Never store JWTs in browser localStorage due to XSS vulnerability. Use HTTP-only cookies with CSRF defense tokens and secure headers.",
                    "exercises": [
                        "Build an auth middleware verifying JWT signatures with public/private keys",
                        "Implement refresh token rotation that invalidates token families on reuse detection"
                    ],
                    "resources": [
                        {"title": "OWASP Authentication Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html", "type": "Security Guide"},
                        {"title": "RFC 7519 - JSON Web Token (JWT)", "url": "https://datatracker.ietf.org/doc/html/rfc7519", "type": "Specification"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "Why should JWT access tokens never be stored in browser localStorage for sensitive apps?",
                            "options": ["localStorage is limited to 5MB", "Any script running on the page (including third-party XSS) can read localStorage and exfiltrate tokens", "localStorage expires automatically after 1 hour", "Browsers block JSON in localStorage"],
                            "correct": 1,
                            "explanation": "localStorage is accessible to all client-side JavaScript, making tokens vulnerable to Cross-Site Scripting (XSS) extraction."
                        },
                        {
                            "question": "What is the purpose of Refresh Token Rotation?",
                            "options": ["To change the user's password daily", "To invalidate previously issued tokens and detect compromised token reuse", "To speed up database indexing", "To bypass CORS checks"],
                            "correct": 1,
                            "explanation": "When a refresh token is used, a new one is issued; if an old token is presented again, the entire family is revoked as a breach indicator."
                        },
                        {
                            "question": "Which cookie attribute prevents client-side JavaScript from reading the authentication cookie?",
                            "options": ["Secure", "HttpOnly", "SameSite", "Max-Age"],
                            "correct": 1,
                            "explanation": "The HttpOnly flag blocks document.cookie access from client scripts, defending against token theft via XSS."
                        }
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Test Auth Flow in Security Mock Interview"
                }
            ]
        },
        {
            "phase_order": 4,
            "title": "Databases, Data Persistence & Query Optimization",
            "purpose": "Model relational and NoSQL schemas, write performant SQL queries, and configure migrations and indexing.",
            "estimated_weeks": max(1, round(3 * mult)),
            "milestone_project": "Optimized Multi-Tenant Database Schema with Connection Pooling",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "Relational Data Modeling, Normalization & ACID Guarantees",
                    "description": "Design 3NF relational schemas with foreign key cascades, transactions, and isolation levels.",
                    "learning_objectives": [
                        "Apply 1NF, 2NF, and 3NF normalization rules",
                        "Understand ACID properties (Atomicity, Consistency, Isolation, Durability)",
                        "Differentiate transaction isolation levels (Read Committed vs Repeatable Read vs Serializable)"
                    ],
                    "prerequisites": ["REST API Architecture & Input Validation"],
                    "key_concepts": "Relational integrity prevents orphan records. Transactions guarantee that all writes succeed or the entire batch rolls back safely.",
                    "exercises": [
                        "Model an e-commerce database with users, orders, line items, and inventory constraints",
                        "Simulate race conditions during concurrent inventory decrements and solve using SELECT FOR UPDATE"
                    ],
                    "resources": [
                        {"title": "PostgreSQL Official Documentation", "url": "https://www.postgresql.org/docs/", "type": "Documentation"},
                        {"title": "Use The Index, Luke! - SQL Indexing Guide", "url": "https://use-the-index-luke.com/", "type": "Guide"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "What does the 'A' in ACID transactions guarantee?",
                            "options": ["Asynchronous execution", "Atomicity: all statements succeed or none do (all-or-nothing)", "Automatic indexing", "Availability across data centers"],
                            "correct": 1,
                            "explanation": "Atomicity guarantees that in a transaction containing multiple operations, either all modifications take effect or none do."
                        },
                        {
                            "question": "Which transaction anomaly is prevented by the 'Repeatable Read' isolation level?",
                            "options": ["Dirty Read and Non-Repeatable Read", "Phantom reads only", "Hardware failure", "Schema corruption"],
                            "correct": 0,
                            "explanation": "Repeatable Read prevents Dirty Reads (reading uncommitted data) and Non-Repeatable Reads (data read twice differing)."
                        },
                        {
                            "question": "When is intentional denormalization justified in relational databases?",
                            "options": ["To avoid writing SQL queries", "To optimize read-heavy query performance by eliminating expensive multi-table JOINs", "To reduce disk space", "Denormalization is never allowed"],
                            "correct": 1,
                            "explanation": "Denormalization introduces controlled redundancy to accelerate heavy read queries at the cost of write complexity."
                        }
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Solve SQL Questions in Coding Bank"
                },
                {
                    "topic_order": 2,
                    "title": "B-Tree Indexing, EXPLAIN Analysis & Connection Pooling",
                    "description": "Diagnose slow queries using EXPLAIN ANALYZE, build composite indexes, and configure database connection pools.",
                    "learning_objectives": [
                        "Analyze query execution plans (Seq Scan vs Index Scan vs Bitmap Heap Scan)",
                        "Apply the Leftmost Prefix rule on composite indexes",
                        "Tune connection pool size and pre-ping health checks"
                    ],
                    "prerequisites": ["Relational Data Modeling, Normalization & ACID Guarantees"],
                    "key_concepts": "Indexes speed up SELECT queries with WHERE/JOIN/ORDER BY clauses, but add overhead to INSERT/UPDATE operations. Composite index order matters.",
                    "exercises": [
                        "Run EXPLAIN ANALYZE on a 100,000-row table before and after creating a composite index",
                        "Configure SQLAlchemy or PgBouncer connection pool limits and monitor active connections"
                    ],
                    "resources": [
                        {"title": "PostgreSQL EXPLAIN Explained", "url": "https://www.postgresql.org/docs/current/using-explain.html", "type": "Guide"},
                        {"title": "SQLAlchemy Engine & Connection Pooling", "url": "https://docs.sqlalchemy.org/en/20/core/pooling.html", "type": "Documentation"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "If an index is created on (user_id, created_at), will a query filtering ONLY on created_at use this index efficiently?",
                            "options": ["Yes, unconditionally", "No, because the leftmost prefix (user_id) is missing from the filter", "Only if it is a primary key", "Only in MySQL, never PostgreSQL"],
                            "correct": 1,
                            "explanation": "B-Tree composite indexes require matching the leftmost prefix columns to perform efficient index lookups."
                        },
                        {
                            "question": "What is the primary benefit of connection pooling in backend servers?",
                            "options": ["Encrypting database passwords", "Reusing existing open TCP connections instead of paying TLS/handshake costs on every request", "Auto-generating SQL queries", "Preventing SQL injection"],
                            "correct": 1,
                            "explanation": "Connection pools maintain a cache of active connections, eliminating high latency associated with negotiating new database connections."
                        },
                        {
                            "question": "What does a 'Seq Scan' in an EXPLAIN ANALYZE query plan signify?",
                            "options": ["The fastest possible query execution", "A sequential scan reading every row in the table, indicating missing or bypassed indexes", "A hardware level SSD failure", "A successful cache hit"],
                            "correct": 1,
                            "explanation": "Sequential Scan reads the entire table from beginning to end, which causes severe latency on large tables."
                        }
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Take System Architecture Mock Interview"
                }
            ]
        },
        {
            "phase_order": 5,
            "title": "System Design, Microservices & High-Concurrency Scalability",
            "purpose": "Master distributed caching, asynchronous message queues, load balancing, and CAP theorem trade-offs.",
            "estimated_weeks": max(1, round(4 * mult)),
            "milestone_project": "High-Throughput Rate-Limited Notification or Feed Delivery System",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "Distributed Caching Strategies with Redis",
                    "description": "Implement Cache-Aside, Write-Through, Write-Behind, cache invalidation, and defense against stampedes.",
                    "learning_objectives": [
                        "Implement Cache-Aside pattern with TTL expiration",
                        "Prevent Cache Penetration, Cache Breakdown, and Cache Avalanche",
                        "Design distributed locks with Redis Redlock"
                    ],
                    "prerequisites": ["B-Tree Indexing, EXPLAIN Analysis & Connection Pooling"],
                    "key_concepts": "Caches hold hot data in memory for sub-millisecond retrieval. Always set TTLs and protect against stampede via mutex locks or probabilistic early expiration.",
                    "exercises": [
                        "Implement Redis caching middleware with automated cache-aside and invalidation on updates",
                        "Simulate a cache avalanche with randomized TTL jitter"
                    ],
                    "resources": [
                        {"title": "Redis Documentation", "url": "https://redis.io/docs/", "type": "Documentation"},
                        {"title": "System Design Primer - Caching", "url": "https://github.com/donnemartin/system-design-primer#cache", "type": "Architecture Guide"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "What is a 'Cache Avalanche' and how is it mitigated?",
                            "options": ["A physical data center flood; mitigated with sandbags", "When many cache keys expire at the same instant, overwhelming the DB; mitigated with TTL jitter", "Redis memory overflow; mitigated with reboot", "Slow network cables; mitigated with fiber"],
                            "correct": 1,
                            "explanation": "A cache avalanche occurs when synchronized expirations flood the primary database; adding random jitter to TTLs staggers expiration."
                        },
                        {
                            "question": "In the Cache-Aside pattern, what happens on a Cache Miss?",
                            "options": ["An HTTP 404 is returned immediately", "The application queries the database, writes the result to the cache, and returns it to the client", "The database automatically queries Redis", "The server crashes"],
                            "correct": 1,
                            "explanation": "On cache miss, the application service reads from the persistent database, stores the value in cache with a TTL, and returns the response."
                        },
                        {
                            "question": "How do you protect against Cache Penetration (queries for non-existent IDs)?",
                            "options": ["Bloom Filters and caching null values with short TTLs", "Removing primary keys", "Disabling SQL joins", "Turning off the cache"],
                            "correct": 0,
                            "explanation": "Bloom filters quickly reject impossible keys, and caching null results prevents repeated hits to the database for nonexistent records."
                        }
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Practice System Design in Mock Interview"
                },
                {
                    "topic_order": 2,
                    "title": "Asynchronous Queues, Event-Driven Architecture & Kafka/RabbitMQ",
                    "description": "Decouple microservices using pub/sub message brokers, consumer groups, dead-letter queues, and idempotency.",
                    "learning_objectives": [
                        "Design producer-consumer pipelines with RabbitMQ / Apache Kafka",
                        "Handle at-least-once delivery with idempotent consumers and deduplication keys",
                        "Configure Dead Letter Exchanges (DLX) for unrecoverable errors"
                    ],
                    "prerequisites": ["Distributed Caching Strategies with Redis"],
                    "key_concepts": "Synchronous HTTP requests block thread execution. Message brokers decouple workloads, absorb spikes, and ensure reliable asynchronous execution.",
                    "exercises": [
                        "Set up an asynchronous email and report generation worker with retry queues",
                        "Implement an idempotent message consumer using deduplication ID lookups in Redis"
                    ],
                    "resources": [
                        {"title": "Apache Kafka Documentation", "url": "https://kafka.apache.org/documentation/", "type": "Documentation"},
                        {"title": "RabbitMQ Tutorials", "url": "https://www.rabbitmq.com/tutorials", "type": "Guide"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "What is the primary guarantee of 'At-Least-Once' delivery in message brokers?",
                            "options": ["Messages are delivered exactly once without duplicates", "Messages will never be lost, but consumers may receive duplicate deliveries and must be idempotent", "Messages are delivered within 1 millisecond", "Only one consumer can ever read the queue"],
                            "correct": 1,
                            "explanation": "At-Least-Once delivery guarantees no loss, but network retries can duplicate messages, requiring idempotent consumer processing."
                        },
                        {
                            "question": "What is the purpose of a Dead Letter Queue (DLQ)?",
                            "options": ["To delete old messages automatically", "To quarantine poison messages that fail processing repeatedly after max retries for inspection", "To speed up consumer memory", "To store user passwords"],
                            "correct": 1,
                            "explanation": "A DLQ isolates malformed or unprocessable messages so they don't block the queue or exhaust retry attempts infinitely."
                        },
                        {
                            "question": "How does Kafka achieve high horizontal throughput across consumers?",
                            "options": ["By running on a single CPU core", "By partitioning topics across consumer groups where each partition is read by one consumer in the group", "By removing persistence to disk", "By dropping unread messages"],
                            "correct": 1,
                            "explanation": "Kafka topics are partitioned, allowing parallel consumption where each consumer in a consumer group processes distinct partitions concurrently."
                        }
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Practice System Design in Mock Interview"
                }
            ]
        },
        {
            "phase_order": 6,
            "title": "CI/CD, Dockerization & Production Deployment",
            "purpose": "Package applications in containerized microservices, automate pipelines, and deploy with zero-downtime health probes.",
            "estimated_weeks": max(1, round(2 * mult)),
            "milestone_project": "Automated Multi-Stage Docker Build & GitHub Actions CI/CD Pipeline",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "Docker Multi-Stage Builds & Container Hardening",
                    "description": "Create slim production container images, use non-root users, configure environment variables, and manage multi-container setups with Docker Compose.",
                    "learning_objectives": [
                        "Write multi-stage Dockerfiles reducing image size from 1GB to <100MB",
                        "Run containers as non-root users with read-only root filesystems",
                        "Orchestrate frontend, backend, and PostgreSQL with Docker Compose"
                    ],
                    "prerequisites": ["Asynchronous Queues, Event-Driven Architecture"],
                    "key_concepts": "Multi-stage builds compile artifacts in a builder image and copy only the binary/static assets to a minimal runtime alpine/distroless base.",
                    "exercises": [
                        "Create a multi-stage Dockerfile for a React and FastAPI/Node application",
                        "Spin up an integrated stack (App + DB + Redis) using docker-compose.yml with healthchecks"
                    ],
                    "resources": [
                        {"title": "Docker Official Docs - Multi-stage builds", "url": "https://docs.docker.com/build/building/multi-stage/", "type": "Documentation"},
                        {"title": "OWASP Docker Security Cheat Sheet", "url": "https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html", "type": "Guide"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "What is the primary benefit of a multi-stage Docker build?",
                            "options": ["Faster internet connection", "Separating build tools from runtime containers, creating lean, secure, and minimal production images", "Compiling code into machine hardware", "Removing need for Docker daemon"],
                            "correct": 1,
                            "explanation": "Multi-stage builds leave compiler tools and dev dependencies behind in temporary build stages, keeping final images tiny and secure."
                        },
                        {
                            "question": "Why should production containers avoid running as the default 'root' user?",
                            "options": ["Root user is slower", "To prevent container breakout exploits from obtaining root privileges on the host kernel", "Docker forbids root in newer versions", "Root containers cannot connect to the internet"],
                            "correct": 1,
                            "explanation": "Running as a non-root user enforces the principle of least privilege, severely limiting the blast radius of container breakouts."
                        },
                        {
                            "question": "What is the role of HEALTHCHECK instruction in Dockerfiles?",
                            "options": ["To check if the developer is healthy", "To enable container orchestrators to probe container health and restart unhealthy containers", "To run unit tests automatically", "To scan for malware"],
                            "correct": 1,
                            "explanation": "HEALTHCHECK tells Docker how to test if the container application is actively functioning (e.g., curling /health)."
                        }
                    ],
                    "practical_link_tab": "company-oa",
                    "practical_action_label": "Solve Cloud/DevOps OA Simulator"
                }
            ]
        },
        {
            "phase_order": 7,
            "title": "Technical Interview Mastery & FAANG Job Readiness",
            "purpose": "Consolidate coding sandbox speed, algorithmic complexity, STAR behavioral leadership, and architectural defense.",
            "estimated_weeks": max(1, round(2 * mult)),
            "milestone_project": "Polished Full-Stack Production Portfolio & Senior Mock Interview Clearance",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "High-Frequency Data Structures & Algorithm Patterns",
                    "description": "Master Two Pointers, Sliding Window, Graph Traversals (BFS/DFS), Dynamic Programming, and Topological Sort.",
                    "learning_objectives": [
                        "Recognize problem patterns instantly without brute-force guessing",
                        "Analyze upfront O(N) time and space complexity with strict invariants",
                        "Communicate live code reasoning clearly under timed constraints"
                    ],
                    "prerequisites": ["Docker Multi-Stage Builds & Container Hardening"],
                    "key_concepts": "Interviewers evaluate problem decomposition, edge case awareness, modular helper functions, and clear O(N) space/time explanations.",
                    "exercises": [
                        "Solve 5 LeetCode Medium problems using Sliding Window and Two Pointers in Coding Bank",
                        "Complete a 45-minute timed live mock interview session with Gemini Bar Raiser"
                    ],
                    "resources": [
                        {"title": "LeetCode Curated 75 Patterns", "url": "https://leetcode.com/", "type": "Practice Bank"},
                        {"title": "Grokking Coding Interview Patterns", "url": "https://github.com/trekhleb/javascript-algorithms", "type": "Repository"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "Which algorithmic pattern is optimal for finding the longest substring without repeating characters?",
                            "options": ["Depth First Search", "Sliding Window with a Hash Set / Map", "Dijkstra's Algorithm", "Binary Search on answers"],
                            "correct": 1,
                            "explanation": "The Sliding Window pattern maintains dynamic left and right pointers while tracking character frequencies in O(N) time."
                        },
                        {
                            "question": "What is the worst-case space complexity of Recursive Depth-First Search on an arbitrary graph with V vertices?",
                            "options": ["O(1)", "O(V) for the recursion call stack / visited set", "O(V^2)", "O(log V)"],
                            "correct": 1,
                            "explanation": "In skewed or linear graphs, recursion depth reaches V frames, requiring O(V) space."
                        },
                        {
                            "question": "In a technical interview, when should you start coding your solution?",
                            "options": ["Instantly without speaking to prove speed", "After clarifying ambiguous requirements, confirming edge cases, and agreeing on an approach and complexity with the interviewer", "Only when the interview is 5 minutes from ending", "Never write code; only speak"],
                            "correct": 1,
                            "explanation": "Always validate assumptions, edge cases (empty inputs, negatives), and complexity trade-offs before writing code."
                        }
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Solve FAANG Drills in Coding Bank"
                },
                {
                    "topic_order": 2,
                    "title": "STAR Behavioral Leadership & Technical Architecture Defense",
                    "description": "Structure behavioral stories around Situation, Task, Action, and quantifiable Results; defend architecture trade-offs.",
                    "learning_objectives": [
                        "Structure conflict resolution, technical disagreements, and leadership stories",
                        "Quantify business and engineering impact with measurable metrics (% reduction in latency, cost savings)",
                        "Articulate trade-offs between speed-to-market vs technical debt"
                    ],
                    "prerequisites": ["High-Frequency Data Structures & Algorithm Patterns"],
                    "key_concepts": "Focus heavily on ACTION and RESULT. State what YOU personally did, not just the team. Quantify outcomes with numbers.",
                    "exercises": [
                        "Draft 4 STAR stories for leadership principles in Communication Lab",
                        "Simulate a Bar Raiser behavioral drill evaluating technical pushback"
                    ],
                    "resources": [
                        {"title": "Amazon Leadership Principles Guide", "url": "https://www.aboutamazon.com/about-us/leadership-principles", "type": "Guide"},
                        {"title": "STAR Method Interview Guide", "url": "https://www.themuse.com/advice/star-interview-method", "type": "Article"}
                    ],
                    "assessment_quiz": [
                        {
                            "question": "What represents the most impactful part of a STAR behavioral response?",
                            "options": ["Describing how hard the situation was for 10 minutes", "The specific Actions YOU took and the measurable Results achieved", "Complaining about previous teammates", "Quoting computer science textbooks"],
                            "correct": 1,
                            "explanation": "Hiring managers evaluate personal agency (Actions taken) and measurable business/engineering outcomes (Results)."
                        },
                        {
                            "question": "How should a candidate handle a technical question when they don't know the exact answer?",
                            "options": ["Pretend to know and invent fake APIs", "State transparently what you do know, break down logical first principles, and explain how you would investigate or test the hypothesis", "Remain completely silent", "Leave the interview room"],
                            "correct": 1,
                            "explanation": "Engineering teams value intellectual honesty, problem decomposition from first principles, and a clear troubleshooting methodology."
                        },
                        {
                            "question": "What makes an engineering 'Result' convincing to a hiring panel?",
                            "options": ["Adjectives like 'very fast' and 'really good'", "Concrete metrics: e.g., 'reduced API p99 latency from 450ms to 85ms and cut AWS egress costs by $12k/mo'", "Vague team statements: 'we all did our best'", "Saying the project was approved"],
                            "correct": 1,
                            "explanation": "Quantified metrics provide objective evidence of technical contribution and business impact."
                        }
                    ],
                    "practical_link_tab": "communication",
                    "practical_action_label": "Practice in STAR Communication Lab"
                }
            ]
        }
    ]
    return phases

def _get_java_roadmap(target_role: str, level: str, mult: float) -> List[Dict[str, Any]]:
    # Tailored Java Developer Roadmap: Core Java, JVM Internals, Spring Boot, Microservices, Hibernate, Kafka
    return [
        {
            "phase_order": 1,
            "title": "Java 17/21 Core Fundamentals & JVM Internals",
            "purpose": "Master modern Java syntax, records, sealed classes, memory layout (Heap vs Stack), and Garbage Collection algorithms.",
            "estimated_weeks": max(1, round(3 * mult)),
            "milestone_project": "Custom In-Memory Cache with Concurrent Collections and Expiry Policies",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "JVM Memory Model, Garbage Collection & ClassLoaders",
                    "description": "Understand Metaspace, Young/Old Generation, G1GC / ZGC collectors, and Memory Leaks in Java.",
                    "learning_objectives": [
                        "Differentiate Stack memory from Heap memory in multi-threaded Java",
                        "Tune JVM parameters (-Xms, -Xmx, -XX:+UseG1GC)",
                        "Analyze JVM heap dumps with VisualVM / JProfiler"
                    ],
                    "prerequisites": ["Basic Java or OOP fundamentals"],
                    "key_concepts": "Primitives and method frames live on the stack; object instances reside in the heap. Young generation uses minor GC; old generation uses major/full GC.",
                    "exercises": ["Write a memory leak simulation with unclosed resources or static collections and analyze with jcmd", "Benchmark ZGC vs G1GC throughput with JMH"],
                    "resources": [{"title": "Oracle Java Documentation", "url": "https://docs.oracle.com/en/java/", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "Where are Java object instances allocated?", "options": ["Thread stack", "Heap memory", "CPU registers only", "Disk swap only"], "correct": 1, "explanation": "All object instances in Java reside in the Heap; reference pointers live on the Stack."},
                        {"question": "What is the primary objective of the modern ZGC garbage collector in Java 21?", "options": ["Sub-millisecond max pause times even on multi-terabyte heaps", "Stopping all threads for 10 seconds", "Compiling code to C++", "Eliminating Heap memory"], "correct": 0, "explanation": "ZGC is a scalable low-latency garbage collector with max pause times under 1ms."}
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Solve Java Drills in Coding Bank"
                },
                {
                    "topic_order": 2,
                    "title": "Concurrency, Virtual Threads & CompletableFuture",
                    "description": "Master Java Concurrency API, synchronized, ReentrantLock, Virtual Threads (Project Loom), and async pipelines.",
                    "learning_objectives": [
                        "Utilize Virtual Threads in Java 21 for millions of concurrent tasks",
                        "Avoid race conditions using AtomicInteger and ConcurrentHashMap",
                        "Chain asynchronous tasks using CompletableFuture.supplyAsync"
                    ],
                    "prerequisites": ["JVM Memory Model, Garbage Collection & ClassLoaders"],
                    "key_concepts": "Virtual Threads are lightweight threads managed by the JVM runtime rather than 1:1 OS kernel threads, eliminating thread pool exhaustion.",
                    "exercises": ["Implement a high-throughput crawler with Virtual Threads", "Chain asynchronous microservice calls with CompletableFuture.allOf"],
                    "resources": [{"title": "Java Concurrency in Practice Guide", "url": "https://docs.oracle.com/javase/tutorial/essential/concurrency/", "type": "Guide"}],
                    "assessment_quiz": [
                        {"question": "How do Java 21 Virtual Threads differ from traditional platform threads?", "options": ["They run in the browser", "They are lightweight user-mode threads managed by the JVM, not 1:1 OS threads", "They cannot perform I/O", "They are deprecated"], "correct": 1, "explanation": "Virtual threads decoupling thread count from OS kernel threads, allowing millions of concurrent tasks without memory exhaustion."}
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Take Java Mock Interview"
                }
            ]
        },
        {
            "phase_order": 2,
            "title": "Spring Boot 3, Spring Data JPA & Microservices",
            "purpose": "Construct enterprise APIs with dependency injection, auto-configuration, transactions, and Hibernate optimization.",
            "estimated_weeks": max(1, round(4 * mult)),
            "milestone_project": "Enterprise Order Management Service with Spring Boot, PostgreSQL & Redis",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "Spring IoC, Bean Lifecycles & REST Controllers",
                    "description": "Understand Inversion of Control, scopes (Singleton, Prototype), Actuator endpoints, and custom validations.",
                    "learning_objectives": ["Design clean modular services with @Autowired / Constructor injection", "Expose production-grade actuator metrics for Prometheus", "Handle global exceptions with @RestControllerAdvice"],
                    "prerequisites": ["Java 17/21 Core Fundamentals"],
                    "key_concepts": "Spring IoC container creates, wires, and manages the lifecycle of beans via reflection and bytecode proxies.",
                    "exercises": ["Build a RESTful service with validation and global exception mapping", "Create custom Spring Boot starter with auto-configuration"],
                    "resources": [{"title": "Spring Boot Documentation", "url": "https://spring.io/projects/spring-boot", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "Why is constructor-based injection preferred over field injection (@Autowired on fields)?", "options": ["It looks prettier", "It enforces immutability, facilitates unit testing without Spring context, and prevents NPEs", "It is required in Java 21", "Field injection is forbidden by compiler"], "correct": 1, "explanation": "Constructor injection allows fields to be final, promotes testability with mocks, and avoids hidden circular dependencies."}
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Practice Spring in Coding Bank"
                },
                {
                    "topic_order": 2,
                    "title": "Hibernate / JPA Performance & N+1 Query Elimination",
                    "description": "Master EntityManager, FetchType.LAZY vs EAGER, JOIN FETCH, and secondary level caching.",
                    "learning_objectives": ["Detect and eliminate the N+1 select problem using JOIN FETCH or EntityGraphs", "Configure @Transactional propagation and rollback rules", "Optimize batch insertions with hibernate.jdbc.batch_size"],
                    "prerequisites": ["Spring IoC, Bean Lifecycles & REST Controllers"],
                    "key_concepts": "N+1 query problem occurs when fetching parent records triggers N individual child queries. Use JOIN FETCH to query in a single round-trip.",
                    "exercises": ["Profile SQL logs with show-sql and eliminate N+1 queries with EntityGraphs", "Implement optimistic locking with @Version"],
                    "resources": [{"title": "Vlad Mihalcea - High-Performance Java Persistence", "url": "https://vladmihalcea.com/", "type": "Blog & Guide"}],
                    "assessment_quiz": [
                        {"question": "How is the Hibernate N+1 query problem solved?", "options": ["By deleting the child table", "Using JOIN FETCH in JPQL or @EntityGraph to retrieve associations in a single query", "Changing database to MongoDB", "Setting fetch type to EAGER everywhere"], "correct": 1, "explanation": "JOIN FETCH instructs Hibernate to issue an SQL JOIN in the primary query, retrieving both parent and children at once."}
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Take Java Architecture Interview"
                }
            ]
        }
    ]

def _get_frontend_roadmap(target_role: str, level: str, mult: float) -> List[Dict[str, Any]]:
    # Specialized Frontend roadmap: TypeScript, Advanced CSS/Tailwind, React/Next.js SSR/SSG, Web Vitals
    return [
        {
            "phase_order": 1,
            "title": "Modern TypeScript & Advanced JavaScript",
            "purpose": "Master type safety, generics, utility types, and performance-critical DOM manipulation.",
            "estimated_weeks": max(1, round(3 * mult)),
            "milestone_project": "Type-Safe Component Design System with Tailwind & Storybook",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "TypeScript Generics, Conditional Types & Inference",
                    "description": "Write advanced generic functions, infer return types, and build strictly-typed component interfaces.",
                    "learning_objectives": ["Use generic constraints (T extends object)", "Understand discriminated unions for exhaustive type checking", "Master keyof, typeof, and mapped types"],
                    "prerequisites": ["Basic JavaScript"],
                    "key_concepts": "TypeScript checks types at compile time and erases types during build, leaving pure JavaScript.",
                    "exercises": ["Build a type-safe event emitter with generic payload mapping", "Implement a deep Partial<T> utility type"],
                    "resources": [{"title": "TypeScript Official Handbook", "url": "https://www.typescriptlang.org/docs/", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "What is the primary benefit of discriminated unions in TypeScript?", "options": ["Automatic runtime validation", "Enabling the compiler to narrow types exhaustively via a common discriminant property", "Faster bundling", "Replacing CSS modules"], "correct": 1, "explanation": "Discriminated unions share a common literal tag, allowing TypeScript to narrow exact shapes in switch/if checks."}
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Practice TypeScript in Coding Bank"
                }
            ]
        },
        {
            "phase_order": 2,
            "title": "Next.js 14/15 App Router, SSR & Core Web Vitals",
            "purpose": "Architect high-performance web applications with React Server Components, Streaming SSR, and Core Web Vitals optimization.",
            "estimated_weeks": max(1, round(4 * mult)),
            "milestone_project": "SEO-Optimized Full-Stack Web App with Edge Middleware & Dynamic Routing",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "React Server Components (RSC) vs Client Components",
                    "description": "Understand server execution boundaries, streaming with Suspense, and data fetching without client waterfalls.",
                    "learning_objectives": ["Structure applications using RSC by default and 'use client' only for interactivity", "Stream UI segments using React Suspense", "Implement Server Actions for mutations"],
                    "prerequisites": ["TypeScript Generics"],
                    "key_concepts": "RSCs execute only on the server, zeroing out client bundle size for libraries used solely on the server.",
                    "exercises": ["Migrate a client-side fetch tree to streaming RSC", "Implement server action form validation with optimistic update"],
                    "resources": [{"title": "Next.js Documentation", "url": "https://nextjs.org/docs", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "Do React Server Components ship their JavaScript dependencies to the client browser bundle?", "options": ["Yes, always", "No, RSC dependencies stay on the server; only rendered JSON/HTML streams to the client", "Only in development mode", "Only if smaller than 50KB"], "correct": 1, "explanation": "Server Components execute exclusively on the server, leaving zero component JavaScript in the client bundle."}
                    ],
                    "practical_link_tab": "company-oa",
                    "practical_action_label": "Test in Frontend OA Simulator"
                }
            ]
        }
    ]

def _get_backend_roadmap(target_role: str, level: str, mult: float) -> List[Dict[str, Any]]:
    return _get_fullstack_roadmap(target_role, level, mult)[2:] # Extracts phases 3-7 from fullstack

def _get_data_engineering_roadmap(target_role: str, level: str, mult: float) -> List[Dict[str, Any]]:
    return [
        {
            "phase_order": 1,
            "title": "Advanced SQL, Python & Data Ingestion Pipelines",
            "purpose": "Build robust ETL pipelines, parse semi-structured formats, and master window functions.",
            "estimated_weeks": max(1, round(3 * mult)),
            "milestone_project": "Automated Batch Ingestion Pipeline with Apache Airflow & PostgreSQL",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "SQL Window Functions, CTEs & Query Optimization",
                    "description": "Master ROW_NUMBER(), RANK(), DENSE_RANK(), LAG(), LEAD(), and partitioning.",
                    "learning_objectives": ["Write complex aggregations over moving frames", "Optimize execution plans for petabyte-scale tables", "Design star and snowflake schemas"],
                    "prerequisites": ["Basic SQL"],
                    "key_concepts": "Window functions compute values over sets of rows without collapsing rows into a single output.",
                    "exercises": ["Write moving averages and running totals over partitioned time series", "Deduplicate event streams using ROW_NUMBER() OVER (PARTITION BY id ORDER BY timestamp DESC)"],
                    "resources": [{"title": "PostgreSQL Window Functions", "url": "https://www.postgresql.org/docs/current/tutorial-window.html", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "How does DENSE_RANK() differ from RANK()?", "options": ["DENSE_RANK does not skip ranks after ties; RANK leaves gaps", "DENSE_RANK only works on strings", "DENSE_RANK runs slower", "There is no difference"], "correct": 0, "explanation": "DENSE_RANK assigns consecutive integers without gaps when ties occur (e.g. 1, 1, 2 vs 1, 1, 3 for RANK)."}
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Solve SQL Questions in Coding Bank"
                }
            ]
        },
        {
            "phase_order": 2,
            "title": "Distributed Processing with Apache Spark & Lakehouses",
            "purpose": "Process large-scale datasets with PySpark, Delta Lake, and distributed partitions.",
            "estimated_weeks": max(1, round(4 * mult)),
            "milestone_project": "Real-Time Streaming Lakehouse with Spark Structured Streaming & Delta Lake",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "Apache Spark RDD, DataFrames & Catalyst Optimizer",
                    "description": "Understand distributed transformations, actions, shuffles, and broadcast joins.",
                    "learning_objectives": ["Optimize wide transformations and prevent skew", "Apply broadcast joins to eliminate costly cluster shuffles", "Implement ACID lakehouse operations with Delta Lake"],
                    "prerequisites": ["SQL Window Functions"],
                    "key_concepts": "Spark evaluates transformations lazily. Wide transformations (groupBy, join) cause costly data shuffles across worker nodes.",
                    "exercises": ["Implement a PySpark ETL script optimizing shuffle partitions", "Broadcast lookup tables to accelerate fact-table joins"],
                    "resources": [{"title": "Apache Spark Documentation", "url": "https://spark.apache.org/docs/latest/", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "What triggers actual data processing execution in Apache Spark?", "options": ["Transformations like map() and filter()", "Actions like count(), collect(), and write()", "Importing pyspark", "Creating a session"], "correct": 1, "explanation": "Spark uses lazy evaluation: execution only triggers when an Action (such as count or write) is invoked."}
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Take Data Engineering Interview"
                }
            ]
        }
    ]

def _get_ai_ml_roadmap(target_role: str, level: str, mult: float) -> List[Dict[str, Any]]:
    return [
        {
            "phase_order": 1,
            "title": "Mathematics, Python & Classical Machine Learning",
            "purpose": "Master Linear Algebra, Vector Calculus, NumPy/Pandas, and Scikit-Learn models.",
            "estimated_weeks": max(1, round(3 * mult)),
            "milestone_project": "End-to-End Predictive Model with Cross-Validation & Hyperparameter Tuning",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "Supervised Learning, Loss Functions & Evaluation Metrics",
                    "description": "Master gradient descent, regularization (L1/L2), precision, recall, F1, and ROC-AUC.",
                    "learning_objectives": ["Differentiate cross-entropy vs MSE loss", "Mitigate overfitting with L2 weight decay", "Select appropriate metrics for imbalanced datasets"],
                    "prerequisites": ["Python and Basic Probability"],
                    "key_concepts": "High variance indicates overfitting; high bias indicates underfitting. Tune regularizers using k-fold cross validation.",
                    "exercises": ["Train and evaluate an XGBoost classifier on an imbalanced fraud dataset", "Plot Precision-Recall curves and tune decision thresholds"],
                    "resources": [{"title": "Scikit-Learn Documentation", "url": "https://scikit-learn.org/stable/", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "Why is Accuracy an unreliable metric for highly imbalanced datasets (e.g. 99% negative, 1% positive)?", "options": ["Accuracy is too complex to calculate", "A naive model predicting 'negative' for everything achieves 99% accuracy while detecting zero positives", "Accuracy only works on regression", "Accuracy requires GPU clusters"], "correct": 1, "explanation": "In skewed classes, high accuracy masks complete failure to detect minority target classes; Precision/Recall/F1 or PR-AUC is required."}
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Practice ML Math in Coding Bank"
                }
            ]
        },
        {
            "phase_order": 2,
            "title": "Deep Learning, PyTorch & LLM Fine-Tuning",
            "purpose": "Train neural networks with PyTorch, Transformer architectures, and Retrieval-Augmented Generation (RAG).",
            "estimated_weeks": max(1, round(4 * mult)),
            "milestone_project": "Production RAG System with Vector Database, Embeddings & LLM Guardrails",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "Transformer Attention Mechanisms & RAG Architecture",
                    "description": "Understand Multi-Head Self-Attention, vector embeddings, cosine similarity, and chunking strategies.",
                    "learning_objectives": ["Explain Query, Key, Value attention calculations", "Build a RAG pipeline with ChromaDB/Pinecone and LangChain/LlamaIndex", "Implement re-ranking to maximize contextual precision"],
                    "prerequisites": ["Supervised Learning, Loss Functions"],
                    "key_concepts": "Attention weights how much tokens attend to one another: Softmax((Q * K^T) / sqrt(d_k)) * V. RAG augments LLM prompts with semantically retrieved domain context.",
                    "exercises": ["Build a semantic document search pipeline using sentence-transformers and FAISS", "Implement conversational memory and query rewriting for RAG"],
                    "resources": [{"title": "Hugging Face Transformers Documentation", "url": "https://huggingface.co/docs/transformers", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "What is the primary role of the Self-Attention mechanism in Transformer models?", "options": ["To compress images into MP3 files", "To compute dynamic contextual relationships between all tokens in a sequence regardless of distance", "To replace all GPUs with CPUs", "To encrypt user queries"], "correct": 1, "explanation": "Self-attention computes pairwise relationship weights across all sequence tokens, capturing long-range contextual dependencies."}
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Take AI/ML Technical Interview"
                }
            ]
        }
    ]

def _get_devops_roadmap(target_role: str, level: str, mult: float) -> List[Dict[str, Any]]:
    return [
        {
            "phase_order": 1,
            "title": "Linux Systems, Shell Automation & Networking",
            "purpose": "Master Linux internals, process management, systemd, bash scripting, and IP routing.",
            "estimated_weeks": max(1, round(3 * mult)),
            "milestone_project": "Automated Linux Server Provisioning & Hardening Script Suite",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "Linux Process Architecture, Signals & File Permissions",
                    "description": "Understand PID 1, systemd services, signals (SIGTERM, SIGKILL), and iptables/ufw.",
                    "learning_objectives": ["Configure systemd services with restart policies and resource cgroups", "Manage file ACLs and chmod/chown", "Debug system metrics with top, htop, vmstat, and strace"],
                    "prerequisites": ["Basic terminal commands"],
                    "key_concepts": "Linux treats everything as a file descriptor. SIGTERM (15) allows graceful shutdown; SIGKILL (9) terminates abruptly.",
                    "exercises": ["Write a systemd daemon service with logging to journald", "Configure a UFW firewall restricting ingress ports to SSH (22) and HTTPS (443)"],
                    "resources": [{"title": "Linux Documentation Project", "url": "https://tldp.org/", "type": "Guide"}],
                    "assessment_quiz": [
                        {"question": "Which Linux signal allows a process to complete ongoing work and clean up resources before exiting?", "options": ["SIGKILL (9)", "SIGTERM (15)", "SIGSTOP (19)", "SIGHUP (1)"], "correct": 1, "explanation": "SIGTERM requests termination gracefully, allowing programs to close connections and save state before exiting."}
                    ],
                    "practical_link_tab": "question-bank",
                    "practical_action_label": "Solve Linux Drills in Coding Bank"
                }
            ]
        },
        {
            "phase_order": 2,
            "title": "Kubernetes Orchestration & Infrastructure as Code (Terraform)",
            "purpose": "Declare cloud infrastructure with Terraform, manage container pods, ingress, and deployments with K8s.",
            "estimated_weeks": max(1, round(4 * mult)),
            "milestone_project": "Terraform-Provisioned Multi-Node Kubernetes Cluster with Ingress & TLS",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "Kubernetes Pods, Deployments, Services & Ingress",
                    "description": "Master declarative YAML manifests, rolling updates, ConfigMaps, Secrets, and Liveness/Readiness probes.",
                    "learning_objectives": ["Write Deployments with zero-downtime rolling update strategy", "Configure ClusterIP, NodePort, and LoadBalancer services", "Set CPU/memory resource requests and limits to prevent node OOM"],
                    "prerequisites": ["Linux Process Architecture"],
                    "key_concepts": "Control plane maintains desired state declared in manifests. Kubelet runs containers on worker nodes and executes health probes.",
                    "exercises": ["Deploy an auto-scaling app with HorizontalPodAutoscaler based on CPU metrics", "Implement an Ingress controller with automated Let's Encrypt TLS certs"],
                    "resources": [{"title": "Kubernetes Official Documentation", "url": "https://kubernetes.io/docs/", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "What happens if a pod's Liveness Probe fails repeatedly?", "options": ["The pod is permanently deleted from the manifest", "Kubelet kills the container and initiates a restart according to its restartPolicy", "Kubernetes reboots the physical server", "Traffic is routed to the pod anyway"], "correct": 1, "explanation": "Liveness probe failures indicate an unresponsive process; Kubelet kills and restarts the container."}
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Take DevOps Mock Interview"
                }
            ]
        }
    ]

def _get_cybersecurity_roadmap(target_role: str, level: str, mult: float) -> List[Dict[str, Any]]:
    return [
        {
            "phase_order": 1,
            "title": "Network Security, Cryptography & Threat Modeling",
            "purpose": "Understand TCP/IP security, TLS handshakes, asymmetric encryption, and OWASP Top 10 vulnerabilities.",
            "estimated_weeks": max(1, round(3 * mult)),
            "milestone_project": "Threat Model Assessment & Network Vulnerability Audit Report",
            "topics": [
                {
                    "topic_order": 1,
                    "title": "OWASP Top 10 Web Vulnerabilities & Exploitation Defense",
                    "description": "Master defenses against SQL Injection, XSS, CSRF, SSRF, and Broken Access Control.",
                    "learning_objectives": ["Identify and remediate SQL Injection using parameterized queries", "Defend against Stored and Reflected XSS using CSP and context-aware escaping", "Implement strict Server-Side Request Forgery (SSRF) validation"],
                    "prerequisites": ["Basic Web and Networking knowledge"],
                    "key_concepts": "Never trust client inputs. Parameterized queries separate code from data, completely neutralizing SQL injection.",
                    "exercises": ["Audit vulnerable code snippets and remediate XSS and SQLi flaws", "Configure Content Security Policy (CSP) headers in HTTP responses"],
                    "resources": [{"title": "OWASP Top 10", "url": "https://owasp.org/www-project-top-ten/", "type": "Documentation"}],
                    "assessment_quiz": [
                        {"question": "What is the only guaranteed defense against SQL Injection?", "options": ["Client-side regex validation", "Parameterized queries (prepared statements) that treat input strictly as parameters, never executable code", "Hashing passwords with MD5", "Hiding error messages"], "correct": 1, "explanation": "Prepared statements send data separately from SQL syntax, making injection impossible."}
                    ],
                    "practical_link_tab": "setup",
                    "practical_action_label": "Take Security Mock Interview"
                }
            ]
        }
    ]

def generate_roadmap_with_ai(
    domain: str,
    skill_level: str,
    target_role: str,
    study_time_daily: str = "1 hour",
    learning_preference: str = "balanced",
    target_date: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Attempts to generate a personalized career roadmap via Google Gemini AI.
    Falls back reliably to structured domain templates if AI is offline or returns invalid JSON.
    """
    gemini_service._init_client()
    
    if not gemini_service.model:
        logger.info("Gemini model not initialized. Using domain fallback template.")
        return get_fallback_roadmap(domain, skill_level, target_role, study_time_daily, learning_preference)

    prompt = f"""
You are a Principal Tech Career Architect. Generate a comprehensive, personalized Career Roadmap for:
- Domain: {domain}
- Current Skill Level: {skill_level}
- Target Role: {target_role}
- Available Daily Study Time: {study_time_daily}
- Learning Preference: {learning_preference}
- Target Date: {target_date or "Flexible"}

You MUST return ONLY a valid, parseable JSON array of ordered phases matching this exact schema:
[
  {{
    "phase_order": 1,
    "title": "Phase Title",
    "purpose": "Clear purpose of this phase",
    "estimated_weeks": 3,
    "milestone_project": "Hands-on Milestone Project Name",
    "topics": [
      {{
        "topic_order": 1,
        "title": "Topic Name",
        "description": "Comprehensive explanation appropriate for {skill_level}",
        "learning_objectives": ["Objective 1", "Objective 2", "Objective 3"],
        "prerequisites": ["Prerequisite 1"],
        "key_concepts": "Detailed technical explanation and core architectural concepts",
        "exercises": ["Hands-on exercise 1", "Hands-on exercise 2"],
        "resources": [
          {{"title": "Resource Name", "url": "https://legitimate-doc-url", "type": "Documentation"}}
        ],
        "assessment_quiz": [
          {{
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 1,
            "explanation": "Why Option B is correct"
          }}
        ],
        "practical_link_tab": "question-bank",
        "practical_action_label": "Practice in Coding Bank"
      }}
    ]
  }}
]

Rules:
- Provide 4 to 6 ordered phases tailored precisely to {domain} and {skill_level}.
- For each topic, practical_link_tab must be one of: "question-bank", "setup", "company-oa", "aptitude", "communication".
- Each topic MUST include 2-3 multiple-choice assessment quiz questions with 4 options and 0-indexed 'correct' integer.
- Ensure valid JSON with no markdown backticks, no trailing commas, and properly escaped quotes.
"""
    try:
        api_result = gemini_service._call_gemini_api(prompt, temperature=0.6)
        if not api_result:
            return get_fallback_roadmap(domain, skill_level, target_role, study_time_daily, learning_preference)
        
        text, used_model = api_result
        clean_text = gemini_service._extract_json(text)
        parsed = json.loads(clean_text)
        if isinstance(parsed, list) and len(parsed) >= 2:
            logger.info(f"Successfully generated personalized roadmap via Gemini AI ({used_model})!")
            return parsed
        else:
            logger.warning("AI output JSON had fewer than 2 phases. Falling back.")
            return get_fallback_roadmap(domain, skill_level, target_role, study_time_daily, learning_preference)
    except Exception as e:
        logger.warning(f"Failed to generate roadmap via Gemini AI ({e}). Using verified fallback template.")
        return get_fallback_roadmap(domain, skill_level, target_role, study_time_daily, learning_preference)
