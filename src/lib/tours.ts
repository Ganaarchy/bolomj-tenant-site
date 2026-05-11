import type { TenantPublicTour, TourDetailPhoto, TourDetailVideo } from "@/lib/types";

type ApiTourMedia = {
  id?: string | null;
  url?: string | null;
  caption?: string | null;
  sortOrder?: number | null;
  sort_order?: number | null;
};

type TenantPublicTourApi = TenantPublicTour & {
  detailPhotos?: ApiTourMedia[] | null;
  detail_photos?: ApiTourMedia[] | null;
  detailVideo?: ApiTourMedia | null;
  detail_video?: ApiTourMedia | null;
};

export function normalizeTenantPublicTour(tour: TenantPublicTourApi): TenantPublicTour {
  const coverImageUrl = tour.coverImageUrl || tour.cover_image_url || null;
  const detailPhotos = normalizePhotos(tour.detailPhotos || tour.detail_photos || []);
  const detailVideo = normalizeVideo(tour.detailVideo || tour.detail_video || null);

  return {
    ...tour,
    cover_image_url: coverImageUrl,
    coverImageUrl,
    detailPhotos,
    detail_photos: detailPhotos,
    detailVideo,
    detail_video: detailVideo,
  };
}

function normalizePhotos(media: ApiTourMedia[]): TourDetailPhoto[] {
  return media
    .map(normalizePhoto)
    .filter((photo): photo is TourDetailPhoto => Boolean(photo))
    .sort((first, second) => first.sortOrder - second.sortOrder);
}

function normalizePhoto(media: ApiTourMedia): TourDetailPhoto | null {
  const url = media.url?.trim();
  if (!url) return null;

  const sortOrder = media.sortOrder ?? media.sort_order ?? 0;

  return {
    id: media.id || url,
    url,
    caption: media.caption || null,
    sortOrder,
    sort_order: sortOrder,
  };
}

function normalizeVideo(media: ApiTourMedia | null): TourDetailVideo | null {
  if (!media) return null;

  const url = media.url?.trim();
  if (!url) return null;

  const sortOrder = media.sortOrder ?? media.sort_order ?? 0;

  return {
    id: media.id || url,
    url,
    caption: media.caption || null,
    sortOrder,
    sort_order: sortOrder,
  };
}
