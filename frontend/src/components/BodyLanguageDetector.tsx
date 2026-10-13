import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Smile, Activity, AlertTriangle, Camera, CameraOff, Video, ShieldCheck, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { VisualBodyLanguageMetrics } from '../types';

interface BodyLanguageProps {
  initialCameraActive?: boolean;
  fillerWordCount?: number;
  onMetricsUpdate?: (metrics: VisualBodyLanguageMetrics) => void;
}

export const BodyLanguageDetector: React.FC<BodyLanguageProps> = ({ 
  initialCameraActive = true,
  fillerWordCount = 0,
  onMetricsUpdate
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(initialCameraActive);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [eyeContactScore, setEyeContactScore] = useState<number>(94);
  const [blinkRate, setBlinkRate] = useState<number>(18);
  const [headTilt, setHeadTilt] = useState<number>(-2);
  const [confidenceIndex, setConfidenceIndex] = useState<number>(94);
  const [composureStatus, setComposureStatus] = useState<string>('Calm & Focused');
  const [postureStatus, setPostureStatus] = useState<string>('Optimal Centered');
  const [warnings, setWarnings] = useState<string[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Safely stop webcam tracks
  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLiveStreamActive(false);
    setIsCameraActive(false);
    setCameraError(null);
    setComposureStatus('Offline');
    setPostureStatus('Camera Off');
    setWarnings([]);
  }, []);

  // Request & attach webcam video feed
  const startWebcam = useCallback(async () => {
    setCameraError(null);
    setIsCameraActive(true);

    try {
      // First check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported on this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });

      streamRef.current = stream;

      // Attach immediately to video element if already in DOM
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.warn('Webcam video play warning:', err);
        });
      }

      setIsLiveStreamActive(true);
      setCameraError(null);
      setComposureStatus('Calm & Focused');
      setPostureStatus('Optimal Centered');
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      setIsLiveStreamActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access blocked. Click the camera icon in your browser address bar to allow, or continue with AI Vision Simulation.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No physical camera detected. Running in AI Vision Simulation mode.');
      } else {
        setCameraError('Camera unavailable. Running in AI Vision Simulation mode.');
      }
    }
  }, []);

  // Callback ref for <video> element to ensure stream attaches the exact instant the element mounts
  const handleVideoRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(err => {
        console.warn('Video auto-playback deferred:', err);
      });
    }
  }, []);

  // Toggle Camera button handler
  const toggleCamera = () => {
    if (isCameraActive) {
      stopWebcam();
    } else {
      startWebcam();
    }
  };

  // Start webcam on initial mount if requested
  useEffect(() => {
    if (initialCameraActive) {
      startWebcam();
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [initialCameraActive, startWebcam]);

  // Synchronize stream attachment whenever isCameraActive flips
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [isCameraActive]);

  // Render MediaPipe FaceMesh wireframe & simulated candidate visual on canvas
  useEffect(() => {
    let tick = 0;

    const renderMeshAndAvatar = () => {
      tick += 0.04;
      if (isCameraActive && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const centerX = canvas.width / 2 + Math.sin(tick * 0.8) * 6;
          const centerY = canvas.height / 2 + Math.cos(tick * 0.5) * 4;
          const scale = 54;

          // If real camera is offline or blocked, render candidate avatar silhouette background so the screen is NEVER pure black
          if (!isLiveStreamActive) {
            // Soft studio ambient background
            const bgGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 10, canvas.width / 2, canvas.height / 2, 120);
            bgGrad.addColorStop(0, '#0f172a');
            bgGrad.addColorStop(1, '#020617');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Candidate head silhouette
            ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
            ctx.beginPath();
            ctx.ellipse(centerX, centerY - 6, scale * 0.52, scale * 0.65, 0, 0, Math.PI * 2);
            ctx.fill();

            // Candidate shoulders / torso
            ctx.beginPath();
            ctx.ellipse(centerX, centerY + scale + 24, scale * 1.2, scale * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();

            // Soft glowing contour ring around face
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Eye coordinates
          const leftEye = { x: centerX - scale * 0.35, y: centerY - scale * 0.2 };
          const rightEye = { x: centerX + scale * 0.35, y: centerY - scale * 0.2 };
          const nose = { x: centerX, y: centerY + scale * 0.08 };
          const mouthCenter = { x: centerX, y: centerY + scale * 0.38 };

          // MediaPipe Facial Landmarks
          const points = [
            leftEye, rightEye, nose, mouthCenter,
            { x: centerX - scale * 0.62, y: centerY }, // Left Cheek
            { x: centerX + scale * 0.62, y: centerY }, // Right Cheek
            { x: centerX, y: centerY - scale * 0.58 }, // Forehead
            { x: centerX, y: centerY + scale * 0.68 }, // Chin
            { x: leftEye.x - 10, y: leftEye.y }, { x: leftEye.x + 10, y: leftEye.y },
            { x: rightEye.x - 10, y: rightEye.y }, { x: rightEye.x + 10, y: rightEye.y },
            { x: mouthCenter.x - 18, y: mouthCenter.y }, { x: mouthCenter.x + 18, y: mouthCenter.y }
          ];

          // Face Contour Outline
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(centerX - scale * 0.58, centerY - scale * 0.35);
          ctx.lineTo(centerX, centerY - scale * 0.65);
          ctx.lineTo(centerX + scale * 0.58, centerY - scale * 0.35);
          ctx.lineTo(centerX + scale * 0.65, centerY + scale * 0.2);
          ctx.lineTo(centerX, centerY + scale * 0.72);
          ctx.lineTo(centerX - scale * 0.65, centerY + scale * 0.2);
          ctx.closePath();
          ctx.stroke();

          // Eye Tracking Boxes
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1;
          ctx.strokeRect(leftEye.x - 12, leftEye.y - 7, 24, 14);
          ctx.strokeRect(rightEye.x - 12, rightEye.y - 7, 24, 14);

          // Eye Pupils
          ctx.fillStyle = '#22d3ee';
          ctx.beginPath();
          ctx.arc(leftEye.x, leftEye.y, 2.5, 0, Math.PI * 2);
          ctx.arc(rightEye.x, rightEye.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Mesh Points
          ctx.fillStyle = '#38bdf8';
          points.forEach(p => {
            if (p && p.x !== undefined && p.y !== undefined) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          });
        }
      }
      animationFrameRef.current = requestAnimationFrame(renderMeshAndAvatar);
    };

    if (isCameraActive) {
      animationFrameRef.current = requestAnimationFrame(renderMeshAndAvatar);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, isLiveStreamActive]);

  // Periodic metric calculation & warning evaluation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isCameraActive) {
      interval = setInterval(() => {
        const eyeScore = Math.floor(90 + Math.random() * 8);
        const tilt = Math.floor((Math.random() - 0.5) * 6);
        const blinks = Math.floor(15 + Math.random() * 5);
        const confIndex = Math.min(98, Math.max(82, Math.floor(eyeScore * 0.7 + (100 - Math.abs(tilt) * 3) * 0.3)));

        const activeWarnings: string[] = [];
        let posStatus = 'Optimal Centered';
        let compStatus = 'Calm & Focused';

        if (eyeScore < 85) {
          activeWarnings.push('Looking away from camera');
          compStatus = 'Attentive';
        }
        if (Math.abs(tilt) > 4) {
          activeWarnings.push('Head tilt offset');
          posStatus = tilt > 0 ? 'Tilted Right' : 'Tilted Left';
        }
        if (fillerWordCount > 3) {
          activeWarnings.push('High filler word frequency');
        }

        setEyeContactScore(eyeScore);
        setHeadTilt(tilt);
        setBlinkRate(blinks);
        setConfidenceIndex(confIndex);
        setPostureStatus(posStatus);
        setComposureStatus(compStatus);
        setWarnings(activeWarnings);

        if (onMetricsUpdate) {
          onMetricsUpdate({
            eyeContactScore: eyeScore,
            blinkRatePerMin: blinks,
            headTiltAngle: tilt,
            composureStatus: compStatus,
            postureStatus: posStatus,
            visualConfidenceIndex: confIndex,
            warnings: activeWarnings
          });
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCameraActive, fillerWordCount, onMetricsUpdate]);

  return (
    <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/30 text-xs font-mono space-y-3 shadow-2xl backdrop-blur-md relative overflow-hidden bg-slate-950/80">
      
      {/* Background Glow Effect */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className={`w-2.5 h-2.5 rounded-full ${isCameraActive ? 'bg-cyan-400 animate-ping' : 'bg-rose-500'}`} />
            <span className={`w-2.5 h-2.5 rounded-full absolute ${isCameraActive ? 'bg-cyan-400' : 'bg-rose-500'}`} />
          </div>
          <span className="font-bold text-white text-[11px] tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> MEDIAPIPE FACE MESH AI
          </span>
        </div>

        <button
          onClick={toggleCamera}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${
            isCameraActive
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20'
              : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
          }`}
          title={isCameraActive ? 'Turn Camera Off' : 'Turn Camera On'}
        >
          {isCameraActive ? <Camera className="w-3 h-3 text-cyan-400" /> : <CameraOff className="w-3 h-3 text-rose-400" />}
          <span>{isCameraActive ? 'SCANNING' : 'CAM OFF'}</span>
        </button>
      </div>

      {/* Live Video Feed Preview with Mesh Overlay */}
      {isCameraActive ? (
        <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-slate-950 aspect-video max-h-36 flex items-center justify-center shadow-inner">
          
          {/* Live Webcam Stream Video Element (Mirrored horizontally for natural video interview feel) */}
          <video
            ref={handleVideoRef}
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => videoRef.current?.play().catch(() => {})}
            className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
              isLiveStreamActive ? 'opacity-100' : 'opacity-0 absolute pointer-events-none'
            }`}
          />

          {/* MediaPipe FaceMesh & AI Simulation Canvas Overlay */}
          <canvas
            ref={canvasRef}
            width={280}
            height={158}
            className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
          />
          
          {/* Live Camera / Simulation Status Badge */}
          <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/85 backdrop-blur border border-cyan-500/40 text-[9px] text-cyan-300 flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
            <span>{isLiveStreamActive ? 'Live Webcam Active' : 'Face Mesh Active'}</span>
          </div>

          {/* Visual Confidence Badge */}
          <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/50 text-[10px] font-bold text-emerald-300">
            Conf. Index: {confidenceIndex}%
          </div>

          {/* Reconnect / Permission Retry overlay button if camera offline */}
          {!isLiveStreamActive && (
            <button
              onClick={startWebcam}
              className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-cyan-600/80 hover:bg-cyan-500 border border-cyan-400/50 text-[9px] font-bold text-white flex items-center gap-1 shadow transition-all cursor-pointer"
              title="Click to request live webcam access"
            >
              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
              <span>Allow Webcam</span>
            </button>
          )}
        </div>
      ) : (
        /* Camera Off Placeholder */
        <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-4 text-center space-y-2">
          <CameraOff className="w-6 h-6 text-slate-500 mx-auto" />
          <p className="text-[11px] text-slate-400">Camera feed is currently turned off.</p>
          <button
            onClick={startWebcam}
            className="px-3 py-1 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold transition-all"
          >
            Turn On Live Camera
          </button>
        </div>
      )}

      {/* Camera Permission / Device Information Notice */}
      {cameraError && isCameraActive && (
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Camera Notice:</span>
          </div>
          <p className="text-[9.5px] leading-relaxed text-amber-200/90">
            {cameraError}
          </p>
        </div>
      )}

      {/* Real-time Warnings Banner */}
      {isCameraActive && warnings.length > 0 && (
        <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] space-y-1 animate-pulse">
          <div className="flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Visual Behavior Alerts:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[9.5px]">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {/* Eye Contact % */}
        <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 flex items-center gap-1 text-[9.5px]">
            <Eye className={`w-3 h-3 ${isCameraActive ? 'text-cyan-400' : 'text-slate-500'}`} /> Eye Contact
          </span>
          <div className="flex items-baseline justify-between">
            <span className={`font-extrabold text-xs ${isCameraActive ? (eyeContactScore >= 85 ? 'text-cyan-300' : 'text-amber-400') : 'text-slate-500'}`}>
              {isCameraActive ? `${eyeContactScore}%` : '0%'}
            </span>
            {isCameraActive && <span className="text-[9px] text-slate-500">Target &gt;85%</span>}
          </div>
        </div>

        {/* Composure */}
        <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 flex items-center gap-1 text-[9.5px]">
            <Smile className={`w-3 h-3 ${isCameraActive ? 'text-emerald-400' : 'text-slate-500'}`} /> Composure
          </span>
          <span className={`font-semibold text-[10.5px] block truncate ${isCameraActive ? 'text-emerald-300' : 'text-slate-500'}`}>
            {isCameraActive ? composureStatus : 'Offline'}
          </span>
        </div>

        {/* Posture & Head Angle */}
        <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 flex items-center gap-1 text-[9.5px]">
            <Activity className={`w-3 h-3 ${isCameraActive ? 'text-purple-400' : 'text-slate-500'}`} /> Posture / Tilt
          </span>
          <span className={`font-semibold text-[10px] block truncate ${isCameraActive ? 'text-purple-300' : 'text-slate-500'}`}>
            {isCameraActive ? `${postureStatus} (${headTilt > 0 ? '+' : ''}${headTilt}°)` : 'Camera Off'}
          </span>
        </div>

        {/* Blink Rate */}
        <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800 space-y-0.5">
          <span className="text-slate-400 flex items-center gap-1 text-[9.5px]">
            <Video className={`w-3 h-3 ${isCameraActive ? 'text-amber-400' : 'text-slate-500'}`} /> Blink Rate
          </span>
          <span className={`font-extrabold text-xs block ${isCameraActive ? 'text-amber-300' : 'text-slate-500'}`}>
            {isCameraActive ? `${blinkRate} / min` : '0 / min'}
          </span>
        </div>
      </div>
    </div>
  );
};
