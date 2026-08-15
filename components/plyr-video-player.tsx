"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "plyr/dist/plyr.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FastForward, Rewind, Settings2 } from "lucide-react";

interface PlyrVideoPlayerProps {
  videoUrl?: string;
  youtubeVideoId?: string;
  videoType?: "UPLOAD" | "YOUTUBE";
  className?: string;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
}

export const PlyrVideoPlayer = ({
  videoUrl,
  youtubeVideoId,
  videoType = "UPLOAD",
  className,
  onEnded,
  onTimeUpdate
}: PlyrVideoPlayerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const html5VideoRef = useRef<HTMLVideoElement>(null);
  const youtubeEmbedRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const onEndedRef = useRef<PlyrVideoPlayerProps["onEnded"]>(onEnded);
  const onTimeUpdateRef = useRef<PlyrVideoPlayerProps["onTimeUpdate"]>(onTimeUpdate);
  const [qualityDialogOpen, setQualityDialogOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastPersistMsRef = useRef<number>(0);
  const lastPersistTimeRef = useRef<number>(0);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  const disableYoutubeOverlay = () => {
    if (videoType !== "YOUTUBE") return;
    const iframe = playerRef.current?.elements?.container?.querySelector?.(
      "iframe"
    ) as HTMLIFrameElement | null;
    if (iframe) {
      iframe.style.pointerEvents = "none";
      iframe.setAttribute("tabindex", "-1");
    }
  };

  const resumeKey = useMemo(() => {
    const idPart =
      videoType === "YOUTUBE"
        ? youtubeVideoId
          ? `yt:${youtubeVideoId}`
          : "yt:unknown"
        : videoUrl
          ? `up:${videoUrl}`
          : "up:unknown";
    return `plyr:resume:${idPart}`;
  }, [videoType, videoUrl, youtubeVideoId]);

  const readResumeTime = () => {
    if (typeof window === "undefined") return 0;
    try {
      const raw = window.localStorage.getItem(resumeKey);
      const t = raw ? Number(raw) : 0;
      return Number.isFinite(t) && t > 0 ? t : 0;
    } catch {
      return 0;
    }
  };

  const persistResumeTime = (t: number) => {
    if (typeof window === "undefined") return;
    if (!Number.isFinite(t) || t <= 0) return;
    try {
      window.localStorage.setItem(resumeKey, String(Math.floor(t)));
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  };

  const clearResumeTime = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(resumeKey);
    } catch {
      // ignore
    }
  };

  // Initialize Plyr when source changes; keep callbacks stable via refs
  useEffect(() => {
    let isCancelled = false;

    async function setupPlayer() {
      const targetEl =
        videoType === "YOUTUBE" ? youtubeEmbedRef.current : html5VideoRef.current;
      if (!targetEl) return;

      // Dynamically import Plyr to be SSR-safe
      const plyrModule: any = await import("plyr");
      const Plyr: any = plyrModule.default ?? plyrModule;

      if (isCancelled) return;

      // Destroy any previous instance
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      const player = new Plyr(targetEl, {
        controls: [
          "play-large",
          "play",
          "progress",
          "current-time",
          "duration",
          "mute",
          "volume",
          "captions",
          "settings",
          "pip",
          "airplay",
          "fullscreen"
        ],
        settings: ["speed", "quality", "loop"],
        speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
        youtube: { rel: 0, modestbranding: 1 },
        ratio: "16:9"
      });

      playerRef.current = player;

      const maybeSeekToResume = () => {
        const resumeAt = readResumeTime();
        if (!resumeAt) return;
        try {
          const duration = Number(player.duration || 0);
          // Avoid resuming at the very end; also avoid tiny offsets.
          if (duration > 0 && resumeAt >= Math.max(0, duration - 2)) {
            clearResumeTime();
            return;
          }
          if (resumeAt >= 3) {
            player.currentTime = resumeAt;
          }
        } catch {
          // ignore
        }
      };

      player.on("ended", () => {
        clearResumeTime();
        onEndedRef.current?.();
      });

      player.on("timeupdate", () => {
        const t = Number(player.currentTime || 0);
        onTimeUpdateRef.current?.(t);

        const now = Date.now();
        // Persist every ~2 seconds, and only if time moved meaningfully
        if (now - lastPersistMsRef.current < 2000) return;
        if (Math.abs(t - lastPersistTimeRef.current) < 1) return;
        lastPersistMsRef.current = now;
        lastPersistTimeRef.current = t;
        persistResumeTime(t);
      });

      player.on("ready", () => {
        disableYoutubeOverlay();
        // Some providers report duration late; try twice.
        maybeSeekToResume();
        setTimeout(() => {
          if (!isCancelled) maybeSeekToResume();
        }, 600);
      });
      disableYoutubeOverlay();

      player.on("enterfullscreen", () => setIsFullscreen(true));
      player.on("exitfullscreen", () => setIsFullscreen(false));
    }

    setupPlayer();

    return () => {
      isCancelled = true;
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
      playerRef.current = null;
    };
  }, [videoUrl, youtubeVideoId, videoType]);

  const hasVideo = (videoType === "YOUTUBE" && !!youtubeVideoId) || !!videoUrl;
  const wrapperClassName = useMemo(() => {
    const base = "relative w-full";
    // If a parent controls height (e.g. `h-full`), don't force our own aspect ratio.
    const shouldUseAspect = !className || !/\bh-\S+/.test(className);
    const layout = shouldUseAspect ? "aspect-video" : "";
    return [base, layout, className].filter(Boolean).join(" ");
  }, [className]);

  const canControlQuality = videoType === "YOUTUBE" && !!youtubeVideoId;

  const seekBy = (deltaSeconds: number) => {
    const player = playerRef.current;
    if (!player) return;
    const next = Math.max(0, (player.currentTime || 0) + deltaSeconds);
    player.currentTime = next;
    persistResumeTime(next);
  };

  // Kept for future: programmatic quality switching (if you want it back later).
  // const setQuality = (q: number | "auto") => {
  //   const player = playerRef.current;
  //   setCurrentQuality(q);
  //   try {
  //     (player as any).quality = q === "auto" ? 0 : q;
  //   } catch {}
  // };

  if (!hasVideo) {
    return (
      <div className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${className || ""}`}>
        <div className="text-muted-foreground">لا يوجد فيديو</div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={wrapperClassName}>
      {videoType === "YOUTUBE" && youtubeVideoId ? (
        <div
          ref={youtubeEmbedRef}
          data-plyr-provider="youtube"
          data-plyr-embed-id={youtubeVideoId}
          className="w-full h-full"
        />
      ) : (
        <video ref={html5VideoRef} className="w-full h-full" playsInline crossOrigin="anonymous">
          {videoUrl ? <source src={videoUrl} type="video/mp4" /> : null}
        </video>
      )}

      {/* Overlay controls (normal + fullscreen) */}
      {(() => {
        const overlay = (
          <div
            dir="rtl"
            className={[
              "pointer-events-none absolute right-3 z-[60] flex flex-row-reverse items-center gap-2",
              // Note: `sm:*` overrides base, so keep it higher on desktop too.
              isFullscreen ? "bottom-16 sm:bottom-16" : "bottom-12 sm:bottom-12",
            ].join(" ")}
          >
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className={[
                "pointer-events-auto rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/70",
                isFullscreen ? "!h-12 !w-12 !p-0" : "h-9 w-9 !p-0",
              ].join(" ")}
              onClick={() => seekBy(-10)}
              title="رجوع 10 ثواني"
            >
              <Rewind className={isFullscreen ? "h-5 w-5" : "h-4 w-4"} />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="secondary"
              className={[
                "pointer-events-auto rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/70",
                // Plyr fullscreen styles can override padding/size; force our icon-button sizing.
                isFullscreen ? "!h-12 !w-12 !p-0" : "h-9 w-9 !p-0",
              ].join(" ")}
              onClick={() => seekBy(10)}
              title="تقديم 10 ثواني"
            >
              <FastForward className={isFullscreen ? "h-5 w-5" : "h-4 w-4"} />
            </Button>

            <Button
              type="button"
              size="icon"
              variant="secondary"
              disabled={!canControlQuality}
              className={[
                "pointer-events-auto rounded-full bg-black/55 text-white backdrop-blur hover:bg-black/70 disabled:opacity-40",
                isFullscreen ? "!h-12 !w-12 !p-0" : "h-9 w-9 !p-0",
              ].join(" ")}
              onClick={() => setQualityDialogOpen(true)}
              title="تغيير الجودة"
            >
              <Settings2 className={isFullscreen ? "h-5 w-5" : "h-4 w-4"} />
            </Button>
          </div>
        );

        const fullscreenMount =
          isFullscreen && playerRef.current?.elements?.container
            ? (playerRef.current.elements.container as HTMLElement)
            : null;

        if (fullscreenMount) {
          return createPortal(overlay, fullscreenMount);
        }
        return overlay;
      })()}

      <Dialog open={qualityDialogOpen} onOpenChange={setQualityDialogOpen}>
        <DialogContent
          className="max-w-none overflow-y-auto max-h-[90vh] w-[96vw] sm:w-[92vw] lg:w-[98vw] xl:w-[min(2200px,98vw)] 2xl:w-[min(2400px,98vw)]"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle>تغيير جودة الفيديو</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reference video (full width) */}
            <div className="w-full overflow-hidden rounded-xl border bg-black">
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/hZulbl4ht4k?start=1"
                  title="How to change YouTube quality"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              هذا فيديو توضيحي لتغيير جودة YouTube.
            </p>

            {/* Tutorial (below the video) */}
            <div className="rounded-xl border bg-muted/20 p-4 text-sm leading-relaxed">
              <div className="mb-2 text-base font-semibold">شرح سريع</div>
              <ol className="list-decimal space-y-2 ps-5">
                <li>اضغط زر الإعدادات داخل فيديو YouTube.</li>
                <li>اختر <span className="font-semibold">الجودة</span>.</li>
                <li>اختر الدقة المناسبة (مثل 720p أو 1080p).</li>
                <li>غيّر الجودة من داخل YouTube وسيؤثر ذلك على فيديو الدرس.</li>
              </ol>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQualityDialogOpen(false)}
              >
                إغلاق
              </Button>
              <Button
                type="button"
                className="bg-brand hover:bg-brand/90"
                onClick={() => {
                  // Persist exact second before refresh so playback resumes.
                  const player = playerRef.current;
                  const t = Number(player?.currentTime || 0);
                  if (t > 0) persistResumeTime(t);
                  setQualityDialogOpen(false);
                  // Full reload so any provider-level quality change is reflected.
                  window.location.reload();
                }}
              >
                حفظ وتحديث
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};