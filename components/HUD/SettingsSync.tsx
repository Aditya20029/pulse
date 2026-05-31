"use client";

import { useEffect, useRef } from "react";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

export function SettingsSync() {
  const hydratedRef = useRef(false);
  const setViewMode = useGlobeStore((s) => s.setViewMode);
  const setSoundEnabled = useGlobeStore((s) => s.setSoundEnabled);
  const setAutoRotate = useGlobeStore((s) => s.setAutoRotate);

  const settingsViewMode = useSettingsStore((s) => s.defaultViewMode);
  const settingsSound = useSettingsStore((s) => s.defaultSoundEnabled);
  const settingsRotate = useSettingsStore((s) => s.defaultAutoRotate);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    setViewMode(settingsViewMode);
    setSoundEnabled(settingsSound);
    setAutoRotate(settingsRotate);
  }, [settingsViewMode, settingsSound, settingsRotate, setViewMode, setSoundEnabled, setAutoRotate]);

  const viewMode = useGlobeStore((s) => s.viewMode);
  const soundEnabled = useGlobeStore((s) => s.soundEnabled);
  const autoRotate = useGlobeStore((s) => s.autoRotate);

  useEffect(() => {
    if (!hydratedRef.current) return;
    useSettingsStore.getState().setDefaultViewMode(viewMode);
  }, [viewMode]);
  useEffect(() => {
    if (!hydratedRef.current) return;
    useSettingsStore.getState().setDefaultSoundEnabled(soundEnabled);
  }, [soundEnabled]);
  useEffect(() => {
    if (!hydratedRef.current) return;
    useSettingsStore.getState().setDefaultAutoRotate(autoRotate);
  }, [autoRotate]);

  return null;
}
