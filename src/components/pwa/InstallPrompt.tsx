"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const MIN_ENGAGEMENT_FOR_PROMPT = 2;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

function isIosDevice(userAgent: string): boolean {
  return /iphone|ipad|ipod/i.test(userAgent);
}

export function InstallPrompt() {
  const { settings, updateSettings } = useStore();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === "undefined") return false;
    const standaloneDisplay = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone = Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone
    );
    return standaloneDisplay || iosStandalone;
  });

  const isIos = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return isIosDevice(navigator.userAgent);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleDisplayModeChange = () => {
      const standaloneDisplay = mediaQuery.matches;
      const iosStandalone = Boolean(
        (window.navigator as Navigator & { standalone?: boolean }).standalone
      );
      setIsStandalone(standaloneDisplay || iosStandalone);
    };

    mediaQuery.addEventListener("change", handleDisplayModeChange);
    return () => mediaQuery.removeEventListener("change", handleDisplayModeChange);
  }, []);

  useEffect(() => {
    if (!isStandalone || settings.installPromptInstalledAt) return;
    updateSettings({ installPromptInstalledAt: new Date().toISOString() });
  }, [isStandalone, settings.installPromptInstalledAt, updateSettings]);

  useEffect(() => {
    const now = Date.now();
    const lastSeen = settings.installPromptLastSeenAt
      ? Date.parse(settings.installPromptLastSeenAt)
      : Number.NaN;

    if (Number.isFinite(lastSeen) && now - lastSeen < ONE_DAY_IN_MS) return;

    updateSettings({
      installPromptLastSeenAt: new Date(now).toISOString(),
      installPromptEngagementCount: settings.installPromptEngagementCount + 1,
    });
  }, [
    settings.installPromptEngagementCount,
    settings.installPromptLastSeenAt,
    updateSettings,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      updateSettings({
        installPromptInstalledAt: new Date().toISOString(),
        installPromptDismissedAt: undefined,
      });
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [updateSettings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!settings.installPromptDismissedAt) return;

    const dismissedAtMs = Date.parse(settings.installPromptDismissedAt);
    if (!Number.isFinite(dismissedAtMs)) return;

    const cooldownMs = settings.installPromptCooldownDays * ONE_DAY_IN_MS;
    const cooldownEndsAt = dismissedAtMs + cooldownMs;
    const remainingMs = cooldownEndsAt - currentTimeMs;
    if (remainingMs <= 0) return;

    const timeoutId = window.setTimeout(() => setCurrentTimeMs(Date.now()), remainingMs);

    return () => window.clearTimeout(timeoutId);
  }, [
    currentTimeMs,
    settings.installPromptCooldownDays,
    settings.installPromptDismissedAt,
  ]);

  const dismissedAtMs = settings.installPromptDismissedAt
    ? Date.parse(settings.installPromptDismissedAt)
    : Number.NaN;
  const cooldownMs = settings.installPromptCooldownDays * ONE_DAY_IN_MS;
  const isCooldownActive =
    Number.isFinite(dismissedAtMs) && currentTimeMs - dismissedAtMs < cooldownMs;

  const hasRequiredEngagement =
    settings.installPromptEngagementCount >= MIN_ENGAGEMENT_FOR_PROMPT;

  const canShowPrompt =
    !isStandalone &&
    !settings.installPromptInstalledAt &&
    !isCooldownActive &&
    hasRequiredEngagement;

  const showInstallButton = canShowPrompt && Boolean(deferredPrompt);
  const showIosHint = canShowPrompt && !deferredPrompt && isIos;

  if (!showInstallButton && !showIosHint) return null;

  const dismissPrompt = () => {
    setCurrentTimeMs(Date.now());
    updateSettings({ installPromptDismissedAt: new Date().toISOString() });
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      updateSettings({
        installPromptInstalledAt: new Date().toISOString(),
        installPromptDismissedAt: undefined,
      });
    } else {
      dismissPrompt();
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="mt-3 border-t border-border pt-3">
      {showInstallButton ? (
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase">
          <span className="text-muted">Install for full-screen mobile access</span>
          <button
            type="button"
            onClick={() => void handleInstall()}
            className="border border-border px-2 py-1 text-foreground hover:bg-surface"
          >
            [Install App]
          </button>
          <button
            type="button"
            onClick={dismissPrompt}
            className="border border-border px-2 py-1 text-muted hover:text-foreground"
          >
            [Later]
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs uppercase">
          <span className="text-muted">
            On iPhone: Share then Add to Home Screen for app mode
          </span>
          <button
            type="button"
            onClick={dismissPrompt}
            className="border border-border px-2 py-1 text-muted hover:text-foreground"
          >
            [Later]
          </button>
        </div>
      )}
    </div>
  );
}
