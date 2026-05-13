import { useCallback, useEffect, useRef, useState } from "react";

type SpeakOptions = {
  interrupt?: boolean;
};

function getChineseVoice() {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  return (
    voices.find((voice) => voice.lang.toLowerCase().startsWith("zh-cn")) ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("zh")) ||
    null
  );
}

export function useSpeechGuide(defaultEnabled = true) {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [enabled, setEnabled] = useState(defaultEnabled && supported);
  const [speaking, setSpeaking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (supported) window.speechSynthesis.cancel();
    };
  }, [supported]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, [supported]);

  const speak = useCallback((text: string, options: SpeakOptions = {}) => {
    if (!supported || !enabled) return false;

    const content = text.replace(/\s+/g, " ").trim();
    if (!content) return false;

    const synth = window.speechSynthesis;
    if (options.interrupt ?? true) synth.cancel();

    const utterance = new SpeechSynthesisUtterance(content);
    utterance.lang = "zh-CN";
    utterance.rate = 0.92;
    utterance.pitch = 1.02;
    utterance.volume = 0.9;

    const voice = getChineseVoice();
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      if (mountedRef.current) setSpeaking(true);
    };
    utterance.onend = () => {
      if (mountedRef.current) setSpeaking(false);
    };
    utterance.onerror = () => {
      if (mountedRef.current) setSpeaking(false);
    };

    synth.speak(utterance);
    return true;
  }, [enabled, supported]);

  const toggle = useCallback(() => {
    if (!supported) return false;

    setEnabled((current) => {
      const next = !current;
      if (!next) window.speechSynthesis.cancel();
      return next;
    });

    return true;
  }, [supported]);

  return {
    enabled,
    setEnabled,
    supported,
    speaking,
    speak,
    stop,
    toggle,
  };
}
