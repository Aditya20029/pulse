"use client";

import dynamic from "next/dynamic";
import { GlobeErrorBoundary } from "@/components/Globe/GlobeErrorBoundary";
import { TopBar } from "@/components/HUD/TopBar";
import { FilterPanel } from "@/components/HUD/FilterPanel";
import { BottomStats } from "@/components/HUD/BottomStats";
import { VelocitySparkline } from "@/components/HUD/VelocitySparkline";
import { NewsTicker } from "@/components/HUD/NewsTicker";
import { TacticalBoard } from "@/components/HUD/TacticalBoard";
import { RegionalBars } from "@/components/HUD/RegionalBars";
import { BriefingPanel } from "@/components/Briefing/BriefingPanel";
import { IntelligencePanel } from "@/components/Intelligence/IntelligencePanel";
import { CoordinateReadout } from "@/components/HUD/CoordinateReadout";
import { TimeScrubSlider } from "@/components/HUD/TimeScrubSlider";
import { RegionPanel } from "@/components/Region/RegionPanel";
import { SentimentTimeline } from "@/components/HUD/SentimentTimeline";
import { NotificationStream } from "@/components/HUD/NotificationStream";
import { KeyboardShortcuts } from "@/components/HUD/KeyboardShortcuts";
import { DeepLinkSync } from "@/components/HUD/DeepLinkSync";
import { PinnedCompare } from "@/components/HUD/PinnedCompare";
import { AudioEngine } from "@/components/HUD/AudioEngine";
import { AskClaude } from "@/components/Chat/AskClaude";
import { BookmarksPanel } from "@/components/HUD/BookmarksPanel";
import { OnboardingTour } from "@/components/HUD/OnboardingTour";
import { ClusterQueue } from "@/components/HUD/ClusterQueue";
import { SettingsSync } from "@/components/HUD/SettingsSync";
import { HoveredCountryLabel } from "@/components/HUD/HoveredCountryLabel";
import { useGlobeStore } from "@/stores/useGlobeStore";
import { BootScreen } from "@/components/HUD/BootScreen";
import { useIsMobile } from "@/lib/useIsMobile";
import { MobileApp } from "@/components/Mobile/MobileApp";

const Globe = dynamic(
  () => import("@/components/Globe/Globe").then((m) => m.Globe),
  {
    ssr: false,
    loading: () => <BootScreen />,
  },
);

export default function Home() {
  const hudHidden = useGlobeStore((s) => s.hudHidden);
  const isMobile = useIsMobile();

  return (
    <>
    <main className="relative h-screen w-screen overflow-hidden">
      <div className="terminal-grid" />
      <div className="absolute inset-0 z-10">
        <GlobeErrorBoundary>
          <Globe />
        </GlobeErrorBoundary>
      </div>

      {/* MOBILE / TABLET (<=1024px): dedicated layout. Desktop tree below is untouched. */}
      {isMobile === true && <MobileApp />}

      {/* DESKTOP (>1024px): original layout, unchanged. */}
      {isMobile === false && (
      <>
      <div
        className={`hud-tinted pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 ${
          hudHidden ? "opacity-0" : "opacity-100"
        }`}
        style={{ pointerEvents: hudHidden ? "none" : undefined }}
      >
        <TopBar />
        <div className="pointer-events-none absolute left-1/2 top-16 z-20 w-[340px] -translate-x-1/2">
          <SentimentTimeline />
        </div>
        <div className="pointer-events-none absolute left-1/2 top-32 z-20 -translate-x-1/2">
          <HoveredCountryLabel />
        </div>
        <FilterPanel />
        <IntelligencePanel />
        <RegionPanel />
        <BriefingPanel />
        <CoordinateReadout />
        <div className="pointer-events-none absolute bottom-56 left-1/2 z-20 w-full max-w-3xl -translate-x-1/2 px-4">
          <TimeScrubSlider />
        </div>
        <div className="pointer-events-none absolute inset-x-4 bottom-3 z-20 space-y-1.5">
          <NewsTicker />
          <VelocitySparkline />
          <BottomStats />
        </div>
        <NotificationStream />
        <PinnedCompare />
        <BookmarksPanel />
        <ClusterQueue />
        <AskClaude />
        <OnboardingTour />
      </div>
      <KeyboardShortcuts />
      </>
      )}

      {/* Shared on every layout */}
      <DeepLinkSync />
      <SettingsSync />
      <AudioEngine />
    </main>

    {/* Desktop-only rails: siblings of main so the main zoom never shrinks them */}
    {isMobile === false && (
      <>
        <div className="side-rail">
          <TacticalBoard />
        </div>
        <div className="bottom-rail">
          <RegionalBars />
        </div>
      </>
    )}
    </>
  );
}
