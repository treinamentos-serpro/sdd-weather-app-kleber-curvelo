import type { FormEvent, Ref } from 'react';
import { useId, useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  inputRef?: Ref<HTMLInputElement>;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, inputRef, isLoading = false }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const inputId = useId();
  const errorId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    if (!query.trim()) {
      setError('Informe uma localidade para buscar.');
      return;
    }
    setError('');
    onSearch(query.trim());
  }

  return (
    <form onSubmit={handleSubmit} role="search" className="space-y-2" noValidate>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-200">
        Buscar localidade
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setError('');
          }}
          placeholder="Digite o nome da cidade"
          autoComplete="off"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-white/15 bg-night-900/60 px-4 text-white placeholder:text-slate-400"
        />
        <button
          type="submit"
          aria-disabled={isLoading}
          className="min-h-12 rounded-xl bg-accent-600 px-6 font-semibold text-white aria-[disabled=false]:hover:bg-accent-600 aria-disabled:cursor-wait aria-disabled:opacity-60"
        >
          {isLoading ? 'Buscando…' : 'Buscar'}
        </button>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-sm text-rose-300">
          {error}
        </p>
      )}
    </form>
  );
}
