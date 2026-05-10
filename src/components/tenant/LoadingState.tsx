import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState() {
  return (
    <main className="min-h-screen bg-white">
      <Skeleton className="h-16 w-full rounded-none" />
      <Skeleton className="h-[560px] w-full rounded-none" />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </main>
  );
}
