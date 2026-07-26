import React, { useState, useEffect, useRef } from 'react';
import { Users, Video, Mic, MicOff, VideoOff, Copy, CheckCircle2, RefreshCw, Send, Sparkles, Award, Star, MessageSquare, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

export const P2PMockRoom: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState(false);
  const [userRole, setUserRole] = useState<'interviewer' | 'candidate'>('interviewer');
  
  // Audio / Video / Fullscreen toggles
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAiRecs, setShowAiRecs] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // WebRTC Media Stream & WebSocket Refs
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [peerCount, setPeerCount] = useState(1);

  // Initialize WebSockets connection when in Room
  useEffect(() => {
    if (joinedRoom && roomCode) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const wsProtocol = apiBase.startsWith('https') ? 'wss:' : 'ws:';
      const hostPath = apiBase.replace(/^https?:\/\//, '');
      const wsUrl = `${wsProtocol}//${hostPath}/ws/p2p/${roomCode}`;
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;


      socket.onopen = () => {
        console.log(`Connected to P2P WebSocket signaling room: ${roomCode}`);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.peer_count !== undefined) {
            setPeerCount(data.peer_count);
          }
          if (data.type === 'peer_connected') {
            console.log('Peer connected to room!');
          }
        } catch (err) {
          console.warn('WebSocket message error:', err);
        }
      };

      socket.onerror = (err) => {
        console.warn('WebSocket connection error (using local state fallback):', err);
      };

      socket.onclose = () => {
        console.log('P2P WebSocket disconnected');
      };

      return () => {
        socket.close();
        wsRef.current = null;
      };
    }
  }, [joinedRoom, roomCode]);

  // Initialize live Webcam and Audio Media Stream when in Room
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (joinedRoom) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          activeStream = stream;
          mediaStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          setMediaError(null);
        })
        .catch((err) => {
          console.warn("Webcam / Microphone access denied:", err);
          setMediaError("Webcam/Microphone access blocked or unavailable.");
        });
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [joinedRoom]);


  // Toggle Video Track
  useEffect(() => {
    if (mediaStreamRef.current) {
      const videoTracks = mediaStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = isVideoOn;
      });
    }
  }, [isVideoOn]);

  // Toggle Audio Track
  useEffect(() => {
    if (mediaStreamRef.current) {
      const audioTracks = mediaStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMicOn;
      });
    }
  }, [isMicOn]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCreateRoom = () => {
    const newCode = `P2P-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(newCode);
    setJoinedRoom(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-violet-500/30">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-semibold">
            <Users className="w-4 h-4 text-violet-400" />
            <span>Peer-to-Peer (P2P) Live Mock Interview Room</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Interactive Peer Mock Interview & Role Switcher</h1>
          <p className="text-xs text-slate-400">
            Connect with peer candidates live over WebRTC. Use AI-generated scoring rubrics to evaluate each other.
          </p>
        </div>

        {!joinedRoom && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreateRoom}
              className="px-5 py-3 rounded-2xl glow-gradient text-white text-xs font-bold shadow-lg shadow-violet-600/30 hover:scale-105 transition-transform"
            >
              Create New P2P Interview Room
            </button>
          </div>
        )}
      </div>

      {!joinedRoom ? (
        /* ROOM LOBBY / JOIN ROOM SCREEN */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-xl font-bold text-white">Join Existing P2P Room</h3>
            <p className="text-xs text-slate-400">Enter room code provided by your peer candidate:</p>

            <div>
              <label className="block text-xs font-mono font-bold text-slate-300 mb-2">P2P ROOM CODE</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter room code (e.g. P2P-7267)"
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 text-white font-mono text-sm font-bold focus:border-violet-500 focus:outline-none uppercase"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-slate-300">SELECT YOUR INITIAL ROLE</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUserRole('interviewer')}
                  className={`p-3.5 rounded-2xl font-bold text-xs font-mono border transition-all ${
                    userRole === 'interviewer'
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🎭 Interviewer (Ask Qs)
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('candidate')}
                  className={`p-3.5 rounded-2xl font-bold text-xs font-mono border transition-all ${
                    userRole === 'candidate'
                      ? 'bg-violet-600/20 border-violet-500 text-white shadow-md'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  🎓 Candidate (Answer Qs)
                </button>
              </div>
            </div>

            <button
              onClick={() => setJoinedRoom(true)}
              className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 transition-transform"
            >
              Enter P2P Mock Room
            </button>
          </div>

          {/* Peer Matchmaking Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI AUTOMATIC PEER MATCHMAKER</span>
              </div>
              <h3 className="text-xl font-bold text-white">Instant Peer Matchmaking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with candidates online practicing for Software Engineer, Data Engineer, or System Design roles.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">14 Candidates Online</span>
                <span className="font-mono text-slate-500">Queue time: &lt;15s</span>
              </div>
              <p className="text-[11px] text-slate-400">Matched peers take 30-minute turns asking AI-generated technical questions.</p>
            </div>

            <button
              onClick={handleCreateRoom}
              className="w-full py-4 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-600/30 transition-transform"
            >
              Find Random Peer Match Now
            </button>
          </div>
        </div>
      ) : (
        /* LIVE P2P INTERVIEW ROOM INTERFACE */
        <div className={
          isFullscreen 
            ? "fixed inset-0 z-[100] bg-[#090d16] p-4 sm:p-6 overflow-y-auto w-screen h-screen flex flex-col space-y-6" 
            : "space-y-6"
        }>
          
          {/* Room Toolbar */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 text-xs font-mono font-bold flex items-center gap-2">
                <span>ROOM CODE: {roomCode}</span>
                <button onClick={handleCopyCode} className="text-slate-400 hover:text-white">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <span className="text-xs font-mono text-cyan-400">
                Role: <strong className="uppercase">{userRole}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAiRecs(!showAiRecs)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  showAiRecs
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={showAiRecs ? "Hide AI Recommendations" : "Show AI Recommendations"}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showAiRecs ? 'AI Recs: Shown' : 'AI Recs: Hidden'}</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  isFullscreen
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={isFullscreen ? "Exit Full Screen Mode (Esc)" : "Enter Full Screen Mode"}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isFullscreen ? 'Exit Full Screen' : 'Full Screen'}</span>
              </button>

              <button
                onClick={() => setUserRole(r => r === 'interviewer' ? 'candidate' : 'interviewer')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Swap Roles (Turn)</span>
              </button>

              <button
                onClick={() => setJoinedRoom(false)}
                className="px-4 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white text-xs font-bold transition-colors"
              >
                Leave P2P Room
              </button>
            </div>
          </div>

          {/* WebRTC Video Feeds Grid (Split 50/50 Screen in Fullscreen Mode) */}
          <div className={
            isFullscreen 
              ? "flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full items-stretch my-2 overflow-hidden" 
              : "grid grid-cols-1 md:grid-cols-2 gap-6"
          }>
            
            {/* User Camera Feed */}
            <div className={`relative bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-xl ${
              isFullscreen ? 'h-full min-h-[300px]' : 'h-64'
            }`}>
              {/* Live Webcam Stream Video Element */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isVideoOn && !mediaError ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              />

              {/* Top Overlay Badge */}
              <div className="flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-mono font-bold backdrop-blur-md border border-slate-800">
                  You ({userRole.toUpperCase()})
                </span>
                <span className={`w-2.5 h-2.5 rounded-full ${isVideoOn && !mediaError ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              </div>

              {/* Fallback Overlay when Video is Off or Permission Denied */}
              {(!isVideoOn || mediaError) && (
                <div className="text-center space-y-2 my-auto z-10">
                  <div className="w-16 h-16 rounded-full bg-violet-600/30 border border-violet-500/50 flex items-center justify-center mx-auto text-violet-300 font-bold text-xl backdrop-blur-md">
                    YOU
                  </div>
                  <span className="text-xs text-slate-400 font-mono block">
                    {mediaError ? mediaError : 'Camera Feed Muted'}
                  </span>
                </div>
              )}

              {/* Controls Toolbar (Only shown in normal non-fullscreen mode) */}
              {!isFullscreen && (
                <div className="flex items-center justify-center gap-3 z-10 backdrop-blur-sm bg-slate-950/40 py-2 rounded-2xl border border-slate-800/50">
                  <button
                    type="button"
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`p-2.5 rounded-xl transition-all ${
                      isMicOn ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-rose-600 text-white hover:bg-rose-500'
                    }`}
                    title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-2.5 rounded-xl transition-all ${
                      isVideoOn ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-rose-600 text-white hover:bg-rose-500'
                    }`}
                    title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
                  >
                    {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Peer Candidate Feed */}
            <div className={`relative bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-xl ${
              isFullscreen ? 'h-full min-h-[300px]' : 'h-64'
            }`}>
              <div className="flex items-center justify-between z-10">
                <span className="px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-mono font-bold backdrop-blur-md border border-slate-800">
                  Peer Candidate (Online)
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>

              <div className="text-center space-y-1 my-auto">
                <div className="w-20 h-20 rounded-full bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center mx-auto text-cyan-300 font-bold text-2xl shadow-lg">
                  PEER
                </div>
                <span className="text-xs text-slate-400 font-mono block pt-2">Peer Connected • Audio Stream 100%</span>
              </div>

              <div className="flex items-center justify-center gap-2 z-10">
                <span className="text-[11px] font-mono text-emerald-400 font-bold">Latency: 12ms (P2P Mesh)</span>
              </div>
            </div>

          </div>

          {/* AI Rubric & Peer Evaluation Form (Hidden during Fullscreen for Clean 50/50 Video View) */}
          {!isFullscreen && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono text-violet-400 font-bold uppercase">AI Evaluation Co-Pilot</span>
                <h3 className="text-lg font-bold text-white">Peer Evaluation & Scoring Rubric</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-bold">Live AI Scoring Sheet</span>
            </div>

            <div className="space-y-4">
              {showAiRecs && (
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400 font-bold block">AI RECOMMENDED QUESTION FOR CANDIDATE:</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Co-Pilot Hint
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-200 leading-relaxed">
                    "Explain how Hash Maps handle collision resolution (Chaining vs Open Addressing). What is the worst-case time complexity if all keys hash to the same index?"
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-mono font-bold text-slate-300">Rate Peer Performance (1 to 5 Stars):</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl transition-all ${
                        rating >= star ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600 bg-slate-900'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                  <span className="text-xs font-mono text-amber-300 font-bold ml-2">{rating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-300 mb-1.5">Peer Feedback Notes:</label>
                <textarea
                  value={peerFeedback}
                  onChange={(e) => setPeerFeedback(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-200 focus:border-violet-500 focus:outline-none leading-relaxed font-mono"
                />
              </div>

              {submittedFeedback && (
                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono">
                  ✓ Peer evaluation submitted and recorded to candidate's history!
                </div>
              )}

              <button
                onClick={() => {
                  setSubmittedFeedback(true);
                  setTimeout(() => setSubmittedFeedback(false), 4000);
                }}
                className="w-full py-3.5 rounded-2xl glow-gradient text-white font-bold text-xs shadow-lg shadow-violet-600/30 hover:scale-[1.01] transition-transform"
              >
                Submit Peer Evaluation Score
              </button>
            </div>
          </div>
          )}

          {/* Dedicated Full-Screen Floating Video & Room Controls Bar */}
          {isFullscreen && (
            <div className="sticky bottom-4 z-50 mx-auto px-6 py-3 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center justify-center gap-3 sm:gap-4 transition-all">
              <button
                type="button"
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-full transition-all flex items-center gap-2 text-xs font-bold ${
                  isMicOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30'
                }`}
                title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isMicOn ? 'Mute Mic' : 'Unmute Mic'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-full transition-all flex items-center gap-2 text-xs font-bold ${
                  isVideoOn ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30'
                }`}
                title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{isVideoOn ? 'Camera Off' : 'Camera On'}</span>
              </button>

              <div className="h-6 w-[1px] bg-slate-700 mx-1 hidden sm:block" />

              <button
                type="button"
                onClick={() => setShowAiRecs(!showAiRecs)}
                className={`px-4 py-2.5 rounded-full border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                  showAiRecs
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                }`}
                title={showAiRecs ? "Hide AI Recommendation" : "Show AI Recommendation"}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">{showAiRecs ? 'AI Recs: Visible' : 'AI Recs: Hidden'}</span>
              </button>

              <button
                onClick={() => setUserRole(r => r === 'interviewer' ? 'candidate' : 'interviewer')}
                className="px-4 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Swap Roles</span>
              </button>

              <button
                onClick={toggleFullscreen}
                className="px-4 py-2.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2"
              >
                <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Exit Full Screen</span>
              </button>

              <button
                onClick={() => setJoinedRoom(false)}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-transform"
              >
                End / Leave Room
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
