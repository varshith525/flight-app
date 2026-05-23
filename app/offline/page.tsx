export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
      <h1 className="text-5xl font-bold">
        You&apos;re Offline
      </h1>

      <p className="mt-6 max-w-md text-gray-400">
        Internet connection lost.
        Cached bookings and flight
        data may still be available.
      </p>
    </div>
  );
}