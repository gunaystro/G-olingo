let currentUtterance: SpeechSynthesisUtterance | null = null;

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakEnglish(
  text: string,
  options?: {
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
  },
): boolean {
  if (!isSpeechSupported() || !text.trim()) {
    options?.onEnd?.();
    return false;
  }

  try {
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = "en-US";
    utterance.rate = options?.rate ?? 0.92;
    utterance.pitch = 1.0;

    const voices = synth.getVoices();
    const preferredVoice =
      voices.find((v) => v.lang === "en-US" && /natural|google|samantha|daniel|karen/i.test(v.name)) ||
      voices.find((v) => v.lang.startsWith("en-US")) ||
      voices.find((v) => v.lang.startsWith("en-GB")) ||
      voices.find((v) => v.lang.startsWith("en"));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      utterance.lang = preferredVoice.lang;
    }

    utterance.onstart = () => options?.onStart?.();
    utterance.onend = () => {
      currentUtterance = null;
      options?.onEnd?.();
    };
    utterance.onerror = () => {
      currentUtterance = null;
      options?.onEnd?.();
    };

    currentUtterance = utterance;
    synth.speak(utterance);
    return true;
  } catch {
    options?.onEnd?.();
    return false;
  }
}

export function stopSpeech(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore synthesis cancellation errors
    }
  }
  currentUtterance = null;
}
