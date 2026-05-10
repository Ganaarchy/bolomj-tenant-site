import { CalendarX } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="mt-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
      <CalendarX className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
      <p className="mx-auto mt-4 max-w-xl text-base text-slate-600">{message}</p>
    </div>
  );
}
