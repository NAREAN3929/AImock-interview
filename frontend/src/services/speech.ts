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

  constructor(
    private onResult: (text: string) => void,
    private onStateChange: (listening: boolean) => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        this.onResult(transcript);
      };

      this.recognition.onstart = () => {
        this.isListening = true;
        this.onStateChange(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onStateChange(false);
      };

      this.recognition.onerror = () => {
        this.isListening = false;
        this.onStateChange(false);
      };
    }
  }

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (err) {
        console.error('Speech recognition start error:', err);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (err) {
        console.error('Speech recognition stop error:', err);
      }
    }
  }
}
