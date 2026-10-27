interface ErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export default function ErrorState({
  message = 'Não foi possível obter os dados meteorológicos.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="glass space-y-4 p-8 text-center">
      <div role="alert" aria-live="assertive" aria-atomic="true">
        <h2 className="text-xl font-semibold">Não foi possível obter os dados meteorológicos.</h2>
        <p className="text-slate-300">{message}</p>
        <p className="text-slate-300">Tente novamente ou faça uma nova busca.</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 rounded-xl bg-accent-600 px-5 font-semibold text-white hover:bg-accent-500"
      >
        Tentar novamente
      </button>
    </div>
  );
}
