import ActivityGrid from '@/components/ActivityGrid';

export default function TrackPage() {
  return (
    <div className="h-full flex flex-col p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Track Activity</h1>
      <div className="flex-1 overflow-hidden">
        <ActivityGrid />
      </div>
    </div>
  );
}
