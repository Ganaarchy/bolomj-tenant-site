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
  const previousPhoto = photos[activeIndex === 0 ? photos.length - 1 : activeIndex - 1];
  const nextPhoto = photos[activeIndex === photos.length - 1 ? 0 : activeIndex + 1];

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
        <div className="relative h-[280px] overflow-hidden bg-slate-950 sm:h-[380px] lg:h-[460px]">
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-0 top-1/2 hidden h-[68%] w-[34%] -translate-y-1/2 overflow-hidden opacity-60 transition hover:opacity-80 sm:block"
                onClick={showPrevious}
                aria-label="Өмнөх зураг харах"
              >
                <SlideImage photo={previousPhoto} tourTitle={tourTitle} dimmed />
              </button>
              <button
                type="button"
                className="absolute right-0 top-1/2 hidden h-[68%] w-[34%] -translate-y-1/2 overflow-hidden opacity-60 transition hover:opacity-80 sm:block"
                onClick={showNext}
                aria-label="Дараах зураг харах"
              >
                <SlideImage photo={nextPhoto} tourTitle={tourTitle} dimmed />
              </button>
            </>
          ) : null}

          <button
            type="button"
            className="group absolute left-1/2 top-1/2 z-10 h-[86%] w-[82%] -translate-x-1/2 -translate-y-1/2 overflow-hidden bg-slate-900 text-left shadow-2xl sm:w-[72%]"
            onClick={() => setLightboxOpen(true)}
          >
            <SlideImage photo={activePhoto} tourTitle={tourTitle} />
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-slate-950/85 to-transparent p-4 text-white sm:p-5">
              <span className="min-w-0">
                <span className="block truncate text-base font-medium sm:text-lg">
                  {activePhoto.caption || "Зургийг томоор харах"}
                </span>
              </span>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white/15 backdrop-blur transition group-hover:bg-white/25">
                <Expand className="h-4 w-4" />
              </span>
            </span>
          </button>

          {photos.length > 1 ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 z-20 h-14 w-14 -translate-y-1/2 rounded-none border-2 border-amber-400 bg-slate-950/35 text-white backdrop-blur hover:bg-slate-950/55 hover:text-white sm:left-[8%]"
                onClick={showPrevious}
                aria-label="Өмнөх зураг"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 z-20 h-14 w-14 -translate-y-1/2 rounded-none border-2 border-amber-400 bg-slate-950/35 text-white backdrop-blur hover:bg-slate-950/55 hover:text-white sm:right-[8%]"
                onClick={showNext}
                aria-label="Дараах зураг"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          ) : null}
        </div>

        {photos.length > 1 ? (
          <div className="flex items-center gap-2 overflow-x-auto border-t border-white/10 bg-slate-950 px-3 py-3">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className={cn(
                  "h-1.5 shrink-0 rounded-full transition",
                  index === activeIndex ? "w-8 bg-amber-400" : "w-3 bg-white/35 hover:bg-white/60",
                )}
                onClick={() => setActiveIndex(index)}
                aria-label={`${index + 1}-р зураг`}
              />
            ))}
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

function SlideImage({
  photo,
  tourTitle,
  dimmed,
}: {
  photo: TourDetailPhoto;
  tourTitle: string;
  dimmed?: boolean;
}) {
  return (
    <>
      <SafeImage
        src={photo.url}
        alt={photo.caption || `${tourTitle} аяллын зураг`}
        sizes="(min-width: 1024px) 760px, 100vw"
        fallback={<span className="px-4 text-center text-sm font-medium text-white">{photo.caption || tourTitle}</span>}
      />
      {dimmed ? <span className="absolute inset-0 bg-slate-950/45" /> : null}
    </>
  );
}
