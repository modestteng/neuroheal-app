import { useEffect, useRef } from "react";

type AudioWindow = Window & typeof globalThis & {
  webkitAudioContext?: typeof AudioContext;
};

const INTERACTIVE_SELECTOR = [
  "button",
  "a",
  "[role='button']",
  "[data-click-sound]",
  "input[type='button']",
  "input[type='submit']",
  "input[type='reset']",
].join(",");

function isDisabledElement(element: Element) {
  return (
    element.hasAttribute("disabled") ||
    element.getAttribute("aria-disabled") === "true" ||
    element.classList.contains("disabled")
  );
}

function shouldPlayClickSound(event: PointerEvent) {
  if (event.button !== 0) return false;

  const target = event.target;
  if (!(target instanceof Element)) return false;

  const interactive = target.closest(INTERACTIVE_SELECTOR);
  if (!interactive || isDisabledElement(interactive)) return false;

  const tag = interactive.tagName.toLowerCase();
  const inputType = interactive instanceof HTMLInputElement ? interactive.type : "";
  const isTextField =
    tag === "textarea" ||
    tag === "select" ||
    (tag === "input" && !["button", "submit", "reset"].includes(inputType));

  return !isTextField;
}

function playSoftClick(context: AudioContext, volume: number) {
  const now = context.currentTime;

  const master = context.createGain();
  master.gain.setValueAtTime(volume, now);
  master.connect(context.destination);

  const tap = context.createOscillator();
  const tapGain = context.createGain();
  tap.type = "sine";
  tap.frequency.setValueAtTime(760, now);
  tap.frequency.exponentialRampToValueAtTime(520, now + 0.045);
  tapGain.gain.setValueAtTime(0.0001, now);
  tapGain.gain.exponentialRampToValueAtTime(0.26, now + 0.006);
  tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.052);
  tap.connect(tapGain).connect(master);

  const shine = context.createOscillator();
  const shineGain = context.createGain();
  shine.type = "triangle";
  shine.frequency.setValueAtTime(1280, now + 0.002);
  shine.frequency.exponentialRampToValueAtTime(930, now + 0.035);
  shineGain.gain.setValueAtTime(0.0001, now);
  shineGain.gain.exponentialRampToValueAtTime(0.075, now + 0.004);
  shineGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);
  shine.connect(shineGain).connect(master);

  tap.start(now);
  shine.start(now + 0.002);
  tap.stop(now + 0.07);
  shine.stop(now + 0.055);
}

export function useClickSound(volume = 0.18) {
  const audioRef = useRef<AudioContext | null>(null);
  const lastPlayedRef = useRef(0);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!shouldPlayClickSound(event)) return;

      const nowMs = performance.now();
      if (nowMs - lastPlayedRef.current < 42) return;
      lastPlayedRef.current = nowMs;

      const AudioCtor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
      if (!AudioCtor) return;

      const context = audioRef.current ?? new AudioCtor();
      audioRef.current = context;

      if (context.state === "suspended") {
        void context.resume();
      }

      playSoftClick(context, volume);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true, capture: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      void audioRef.current?.close();
      audioRef.current = null;
    };
  }, [volume]);
}
