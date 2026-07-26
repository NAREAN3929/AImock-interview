// Browser Speech Synthesis (Text-to-Speech)
export function speakText(text: string, onEnd?: () => void) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  // Try selecting a natural English voice if available
  const voices = window.speechSynthesis.getVoices();
  const selectedVoice = voices.find(v => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) || voices[0];
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Browser Speech Recognition (Speech-to-Text)
export class VoiceRecognizer {
  private recognition: any = null;
  public isListening: boolean = false;
  private isUserActive: boolean = false;

  constructor(
    private onResult: (text: string) => void,
    private onStateChange: (listening: boolean) => void,
    private onError?: (errorStr: string) => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript;
        }
        this.onResult(fullTranscript);
      };

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChange(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.isUserActive) {
          try {
            this.recognition.start();
            return;
          } catch (e) {
            console.warn('Speech recognition auto-restart failed:', e);
          }
        }
        this.onStateChange(false);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error event:', event);
        const errType = event?.error;

        if (errType === 'no-speech' && this.isUserActive) {
          // 'no-speech' happens when silence is detected. onend will handle restart if isUserActive
          return;
        }

        if (errType === 'aborted') {
          return;
        }

        let message = 'Speech recognition encountered an issue.';
        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          message = 'Microphone access denied. Please click the camera/mic icon in your address bar and select "Allow".';
        } else if (errType === 'audio-capture') {
          message = 'No microphone was found. Please ensure a microphone is connected to your device.';
        } else if (errType === 'network') {
          message = 'Network connectivity issue with browser speech service.';
        }

        this.isUserActive = false;
        this.isListening = false;
        this.onStateChange(false);

        if (this.onError) {
          this.onError(message);
        }
      };
    }
  }

  public static isSupported(): boolean {
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public async start(): Promise<boolean> {
    if (!this.recognition) {
      const errorMsg = 'Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.';
      if (this.onError) this.onError(errorMsg);
      return false;
    }

    // Explicitly prompt for mic permission via mediaDevices if available
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err: any) {
      console.warn('Microphone permission check error:', err);
      const errorMsg = 'Microphone access denied or not allowed by browser permissions.';
      if (this.onError) this.onError(errorMsg);
      return false;
    }

    if (!this.isListening) {
      this.isUserActive = true;
      try {
        this.recognition.start();
        return true;
      } catch (err: any) {
        console.error('Speech recognition start exception:', err);
        if (err.name === 'InvalidStateError') {
          this.isListening = true;
          this.onStateChange(true);
          return true;
        }
        this.isUserActive = false;
        if (this.onError) {
          this.onError('Unable to start speech recognition: ' + (err.message || 'Unknown error'));
        }
        return false;
      }
    }
    return true;
  }

  public stop() {
    this.isUserActive = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error('Speech recognition stop error:', err);
      }
    }
    this.isListening = false;
    this.onStateChange(false);
  }
}

