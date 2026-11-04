import { useState, useCallback } from "react";
import { playBeep, playSuccessSound, playErrorSound } from "@/utils/sound";

export function useSound(initialEnabled = true) {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialEnabled);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const beep = useCallback(
    (freq = 900, duration = 0.07) => {
      playBeep(freq, duration, soundEnabled);
    },
    [soundEnabled]
  );

  const success = useCallback(() => {
    playSuccessSound(soundEnabled);
  }, [soundEnabled]);

  const error = useCallback(() => {
    playErrorSound(soundEnabled);
  }, [soundEnabled]);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    beep,
    success,
    error,
  };
}

