interface EmptyStateProps {
  query: string;
}

export default function EmptyState({ query }: EmptyStateProps) {
  return (
    <div role="status" className="glass space-y-2 break-words p-8 text-center">
      <h2 className="text-xl font-semibold">Nenhuma localidade encontrada</h2>
      <p className="text-slate-300">
        Não há dados de demonstração para “{query}”. Tente buscar São Paulo.
      </p>
    </div>
  );
}
