import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { analyzeResumeApi, uploadResumeFileApi } from '../services/api';
import { FileText, Sparkles, CheckCircle2, AlertCircle, Play, Loader2, Upload, File, Trash2, Zap } from 'lucide-react';

export const ResumeAnalyzer: React.FC = () => {
  const { setActiveSession, setActiveTab } = useStore();
  const [resumeText, setResumeText] = useState('');
  const [targetRole, setTargetRole] = useState('Data Engineer');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [uploadedFileSize, setUploadedFileSize] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const sampleResumes = {
    dataEngineer: `SUMMARY: Senior Data Engineer with 5+ years of experience building ETL pipelines, PySpark data lakes, and Snowflake data warehouses.
SKILLS: Python, SQL, Apache Spark, Airflow, Snowflake, AWS S3, Redshift, Kafka, PostgreSQL, Docker.
EXPERIENCE:
- Designed real-time event streaming pipeline processing 50M events/day using Kafka & Spark Streaming.
- Optimized Snowflake queries reducing monthly warehouse compute costs by 35%.
- Implemented automated data quality checks with Great Expectations and Airflow DAGs.`,
    softwareEngineer: `SUMMARY: Full Stack Engineer with expertise in React, TypeScript, Python FastAPI, and PostgreSQL.
SKILLS: React 19, TypeScript, Node.js, Python, FastAPI, Docker, Kubernetes, Redis, MySQL, System Design.
EXPERIENCE:
- Built real-time collaborative web application serving 100k active users.
- Designed RESTful API microservices with Redis caching & OAuth2 security.`
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${(file.size / 1024).toFixed(1)} KB`);

    if (file.name.toLowerCase().endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const content = evt.target?.result as string;
        if (content && content.length > 10) {
          setResumeText(content);
        }
      };
      reader.readAsText(file);
    } else {
      setResumeText(`[Binary File Attached: ${file.name}]\n\nContents will be extracted automatically on the server during analysis.`);
    }
  };

  const handleClearFile = () => {
    setUploadedFile(null);
    setUploadedFileName(null);
    setUploadedFileSize(null);
    setResumeText('');
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim() && !uploadedFile) return;

    setLoading(true);
    try {
      let result;
      if (uploadedFile) {
        result = await uploadResumeFileApi(uploadedFile, targetRole);
      } else {
        result = await analyzeResumeApi(resumeText, targetRole);
      }
      setAnalysisResult(result);
    } catch (err) {
      console.error('Resume analysis failed', err);
    } finally {
      setLoading(false);
    }
  };


  const handleLaunchTargetSession = () => {
    if (!analysisResult) return;

    setActiveSession({
      id: Date.now(),
      title: `Resume-Tailored Mock (${targetRole})`,
      role: targetRole,
      company: 'Targeted Resume Scan',
      difficulty: 'Senior',
      interviewType: 'Resume Tailored',
      currentQuestionIndex: 0,
      questions: analysisResult.recommended_questions.map((qText: string, idx: number) => ({
        id: idx + 1,
        question_order: idx + 1,
        category: 'Resume Skill Gap',
        question_text: qText,
        expected_keywords: analysisResult.extracted_skills
      }))
    });

    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    setActiveTab('live-session');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>Resume AI Scanner & Target Generator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Generate Personalized Interview Questions</h1>
        <p className="text-sm text-slate-400">
          Upload your resume document (PDF, JPG, PNG, TXT) or paste text to extract skill gaps and generate a customized mock session.
        </p>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        
        {/* Target Role Title */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">Target Role Title</label>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Data Engineer / Senior Frontend Developer / SRE Specialist"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:border-cyan-500 focus:outline-none font-semibold"
          />
        </div>

        {/* 1-Click Preset Sample Resumes for Instant Testing */}
        <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold text-cyan-400 flex items-center gap-1.5">
            <Zap className="w-4 h-4" /> 1-Click Test Samples:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setTargetRole('Data Engineer');
                setResumeText(sampleResumes.dataEngineer);
                setUploadedFileName('Data_Engineer_Resume.pdf');
                setUploadedFileSize('142 KB');
              }}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-semibold"
            >
              + Data Engineer Sample
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetRole('Software Engineer');
                setResumeText(sampleResumes.softwareEngineer);
                setUploadedFileName('Software_Engineer_Resume.pdf');
                setUploadedFileSize('118 KB');
              }}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-violet-300 font-semibold"
            >
              + Software Engineer Sample
            </button>
          </div>
        </div>

        {/* File Upload Drop Area (PDF, JPG, PNG, TXT) */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">Upload Resume Document (PDF, JPG, PNG, DOCX, TXT)</label>
          
          <div className="relative border-2 border-dashed border-slate-700 hover:border-cyan-500/60 rounded-2xl p-6 bg-slate-950/60 text-center transition-colors">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.docx,.txt"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            
            {uploadedFileName ? (
              <div className="flex items-center justify-between bg-slate-900 p-3.5 rounded-xl border border-cyan-500/40 text-left">
                <div className="flex items-center gap-3">
                  <File className="w-8 h-8 text-cyan-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-white text-sm">{uploadedFileName}</h4>
                    <p className="text-xs text-slate-400 font-mono">{uploadedFileSize} • Uploaded & Ready for AI Scan</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="p-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 transition-colors z-20 relative"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 text-cyan-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-white text-sm">Drag & drop resume file here, or browse computer</h4>
                <p className="text-xs text-slate-500">Supports PDF, JPG, PNG, DOCX, or TXT (Max 10MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Resume Text Area Preview */}
        <div>
          <label className="block text-sm font-bold text-slate-200 mb-2">Resume Extracted Text Preview</label>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            rows={6}
            placeholder="Uploaded text or paste your resume text here (Skills, Projects, Work Experience, Education)..."
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 text-sm focus:border-cyan-500 focus:outline-none resize-none leading-relaxed font-mono"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !resumeText.trim()}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl glow-gradient text-white font-bold text-base shadow-xl shadow-cyan-500/20 hover:scale-[1.01] transition-transform disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Scanning Resume with Gemini AI...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Scan Resume & Generate Targeted Session</span>
            </>
          )}
        </button>
      </div>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-cyan-500/30 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-white">Resume Alignment Analysis</h2>
              <p className="text-xs text-slate-400">{analysisResult.summary}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-mono">MATCH SCORE</span>
              <span className="text-3xl font-extrabold text-cyan-400 font-mono">{analysisResult.resume_score}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Extracted Key Skills
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysisResult.extracted_skills.map((s: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Missing / Gap Skills for {targetRole}
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysisResult.missing_skills.map((s: string, idx: number) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Customized Questions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">Generated Tailored Interview Questions</h3>
            <div className="space-y-2">
              {analysisResult.recommended_questions.map((q: string, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                  <span className="text-cyan-400 font-mono font-bold">{idx + 1}.</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleLaunchTargetSession}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition-transform"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch Resume-Tailored Mock Session</span>
          </button>
        </div>
      )}
    </div>
  );
};
