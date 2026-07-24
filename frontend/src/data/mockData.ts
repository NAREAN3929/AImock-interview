export const ZOHO_SVG_DATA_URI = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 80"><rect x="5" y="12" width="40" height="40" rx="8" stroke="%23E53935" stroke-width="7" fill="none" transform="rotate(-6 25 32)"/><rect x="44" y="10" width="40" height="40" rx="8" stroke="%2343A047" stroke-width="7" fill="none" transform="rotate(6 64 30)"/><rect x="82" y="12" width="40" height="40" rx="8" stroke="%231E88E5" stroke-width="7" fill="none" transform="rotate(-4 102 32)"/><rect x="120" y="10" width="40" height="40" rx="8" stroke="%23FB8C00" stroke-width="7" fill="none" transform="rotate(4 140 30)"/><text x="92" y="72" font-family="sans-serif" font-weight="900" font-size="16" fill="%230F172A" text-anchor="middle" letter-spacing="6">ZOHO</text></svg>`;

export const INITIAL_COMPANIES = [
  { 
    id: 'google', 
    name: 'Google', 
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg',
    fallbackEmoji: '🌐',
    isCustom: false
  },
  { 
    id: 'amazon', 
    name: 'Amazon', 
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    fallbackEmoji: '📦',
    isCustom: false
  },
  { 
    id: 'meta', 
    name: 'Meta', 
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    fallbackEmoji: '♾️',
    isCustom: false
  },
  { 
    id: 'microsoft', 
    name: 'Microsoft', 
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
    fallbackEmoji: '🪟',
    isCustom: false
  },
  { 
    id: 'netflix', 
    name: 'Netflix', 
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
    fallbackEmoji: '🎬',
    isCustom: false
  },
  { 
    id: 'apple', 
    name: 'Apple', 
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
    fallbackEmoji: '🍎',
    isCustom: false
  },
  { 
    id: 'tcs', 
    name: 'TCS', 
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    fallbackEmoji: '💼',
    isCustom: false
  },
  { 
    id: 'infosys', 
    name: 'Infosys', 
    logoSvg: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    fallbackEmoji: '🏢',
    isCustom: false
  },
  { 
    id: 'zoho', 
    name: 'Zoho', 
    logoSvg: ZOHO_SVG_DATA_URI,
    fallbackEmoji: '🚩',
    isCustom: false
  }
];

export const COMPANIES = INITIAL_COMPANIES;

export const ROLES = [
  { id: 'swe', label: 'Software Engineer' },
  { id: 'frontend', label: 'Frontend Developer (React/TS)' },
  { id: 'backend', label: 'Backend Engineer (Python/FastAPI/Node)' },
  { id: 'fullstack', label: 'Full Stack Engineer' },
  { id: 'ai-engineer', label: 'AI / Machine Learning Engineer' },
  { id: 'system-design', label: 'System Design Architect' },
  { id: 'devops', label: 'DevOps / Site Reliability Engineer' },
  { id: 'pm', label: 'Product Manager' },
  { id: 'hr-behavioral', label: 'HR & Behavioral STAR' }
];

export const DIFFICULTY_LEVELS = [
  'Junior (0-2 YOE)',
  'Mid-Level (2-5 YOE)',
  'Senior (5-8 YOE)',
  'Staff / Principal Architect (8+ YOE)',
  'Engineering Director / Lead'
];

export const QUESTION_BANK_PRESETS = [
  {
    id: 101,
    role: 'Software Engineer',
    company: 'Google',
    category: 'System Design',
    question: 'How would you design Google Drive / Dropbox to handle chunked uploads and conflict resolution across devices?',
    difficulty: 'Senior',
    starTips: 'Structure answer using System Design pillars: Requirements -> API Contracts -> Database Schema -> Storage Chunking -> Synchronization Strategy.'
  },
  {
    id: 102,
    role: 'Frontend Developer',
    company: 'Meta',
    category: 'React & Web Vitals',
    question: 'Explain how React Fiber scheduler prioritizes state updates, and how you prevent costly re-renders in deep component trees.',
    difficulty: 'Senior',
    starTips: 'Highlight useMemo, useCallback, React Compiler, virtualized windowing (react-window), and Concurrent Mode transitions.'
  },
  {
    id: 103,
    role: 'Backend Engineer',
    company: 'Amazon',
    category: 'Distributed Databases',
    question: 'What is the CAP Theorem? How does Amazon DynamoDB achieve Eventual Consistency vs Strong Consistency?',
    difficulty: 'Mid-Level',
    starTips: 'Compare Consistency, Availability, Partition Tolerance. Mention quorum reads (R + W > N) in DynamoDB.'
  },
  {
    id: 104,
    role: 'HR & Behavioral STAR',
    company: 'Microsoft',
    category: 'Leadership & Conflict',
    question: 'Tell me about a time you missed a project deadline due to unforeseen technical debt. How did you handle stakeholder expectations?',
    difficulty: 'Mid-Level',
    starTips: 'Use STAR format: Situation (context), Task (goal), Action (proactive communication & scope trimming), Result (client satisfaction & tech debt post-mortem).'
  }
];
