export default function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="glass p-8 text-center text-slate-200"
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-4 h-8 w-8 rounded-full border-2 border-accent-400 border-t-transparent motion-safe:animate-spin"
      />
      Carregando dados meteorológicos…
    </div>
  );
}
