"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/tenant/SafeImage";
import type { TourDetailPhoto } from "@/lib/types";
import { cn } from "@/lib/utils";

type TourMediaGalleryProps = {
  photos: TourDetailPhoto[];
  tourTitle: string;
};

export function TourMediaGallery({ photos, tourTitle }: TourMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activePhoto = photos[activeIndex];

  useEffect(() => {
    if (!lightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, activeIndex]);

  if (!photos.length || !activePhoto) return null;

  function showPrevious() {
    setActiveIndex((current) => (current === 0 ? photos.length - 1 : current - 1));
  }

  function showNext() {
    setActiveIndex((current) => (current === photos.length - 1 ? 0 : current + 1));
  }

  return (
    <section>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-slate-950">Аяллын зургууд</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {photos.length} зурагтай танилцана уу.
          </p>
        </div>
        <p className="text-sm font-medium text-slate-500">
          {activeIndex + 1} / {photos.length}
        </p>
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-sm">
        <button
          type="button"
          className="group relative block aspect-[16/10] w-full bg-slate-900 text-left"
          onClick={() => setLightboxOpen(true)}
        >
          <SafeImage
            src={activePhoto.url}
            alt={activePhoto.caption || `${tourTitle} аяллын зураг`}
            sizes="(min-width: 1024px) 720px, 100vw"
            fallback={<span className="px-4 text-center text-sm font-medium text-white">{tourTitle}</span>}
          />
          <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-slate-950/85 to-transparent p-4 text-white">
            <span className="min-w-0 text-sm font-medium">
              {activePhoto.caption || "Зургийг томоор харах"}
            </span>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/15 backdrop-blur transition group-hover:bg-white/25">
              <Expand className="h-4 w-4" />
            </span>
          </span>
        </button>

        {photos.length > 1 ? (
          <div className="flex items-center justify-between gap-3 border-t border-white/10 bg-slate-950 p-3">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={showPrevious}
              aria-label="Өмнөх зураг"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto py-1">
              {photos.map((photo, index) => (
                <button
                  key={photo.id}
                  type="button"
                  className={cn(
                    "relative h-16 w-24 shrink-0 overflow-hidden rounded-md border bg-slate-800 transition",
                    index === activeIndex
                      ? "border-white ring-2 ring-white/50"
                      : "border-white/15 opacity-70 hover:opacity-100",
                  )}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`${index + 1}-р зураг`}
                >
                  <SafeImage
                    src={photo.url}
                    alt={photo.caption || `${tourTitle} аяллын зураг`}
                    sizes="96px"
                    fallback={<span className="sr-only">{photo.caption || tourTitle}</span>}
                  />
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={showNext}
              aria-label="Дараах зураг"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Аяллын зургийг томоор харах"
        >
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-4 top-4 z-10"
            onClick={() => setLightboxOpen(false)}
            aria-label="Хаах"
          >
            <X className="h-4 w-4" />
          </Button>

          {photos.length > 1 ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 sm:inline-flex"
              onClick={showPrevious}
              aria-label="Өмнөх зураг"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          ) : null}

          <figure className="w-full max-w-6xl">
            <div className="relative mx-auto aspect-[16/10] max-h-[78vh] overflow-hidden rounded-lg bg-slate-900">
              <SafeImage
                src={activePhoto.url}
                alt={activePhoto.caption || `${tourTitle} аяллын зураг`}
                sizes="100vw"
                fallback={<span className="px-4 text-center text-base font-medium text-white">{tourTitle}</span>}
              />
            </div>
            {activePhoto.caption ? (
              <figcaption className="mx-auto mt-4 max-w-3xl text-center text-sm leading-6 text-slate-200">
                {activePhoto.caption}
              </figcaption>
            ) : null}
          </figure>

          {photos.length > 1 ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 sm:inline-flex"
              onClick={showNext}
              aria-label="Дараах зураг"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
