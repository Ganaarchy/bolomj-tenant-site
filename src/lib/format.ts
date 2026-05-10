const UNKNOWN = "Тодорхойгүй";

export function formatPrice(price: string | number | null | undefined, currency = "MNT") {
  if (price === null || price === undefined || price === "") return UNKNOWN;

  const amount = Number(price);
  if (!Number.isFinite(amount)) return `${price} ${currency}`;

  return new Intl.NumberFormat("mn-MN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | null | undefined) {
  if (!date) return UNKNOWN;

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return UNKNOWN;

  return new Intl.DateTimeFormat("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(value);
}

export function formatDuration(days: number | null | undefined) {
  if (!days) return UNKNOWN;
  return `${days} өдөр`;
}

export function formatDestination(country: string | null | undefined, city: string | null | undefined) {
  const parts = [city, country].filter(Boolean);
  return parts.length ? parts.join(", ") : UNKNOWN;
}

export function formatBookingStatus(status: string | null | undefined) {
  const labels: Record<string, string> = {
    pending: "Хүлээгдэж байна",
    confirmed: "Баталгаажсан",
    paid: "Төлбөр төлсөн",
    cancelled: "Цуцлагдсан",
    completed: "Дууссан",
  };

  return status ? labels[status] ?? status : UNKNOWN;
}
