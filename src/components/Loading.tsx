export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center py-16 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cream-200 border-t-sage-500" />
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm text-red-500">{message}</p>
    </div>
  );
}
