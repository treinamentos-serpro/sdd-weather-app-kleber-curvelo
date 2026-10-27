import { useEffect, useRef, useState } from 'react';
import CurrentWeather from './components/CurrentWeather';
import ForecastList from './components/ForecastList';
import SearchBar from './components/SearchBar';
import EmptyState from './components/states/EmptyState';
import ErrorState from './components/states/ErrorState';
import LoadingState from './components/states/LoadingState';
import UnitToggle from './components/UnitToggle';
import { useWeather } from './hooks/useWeather';
import type { TemperatureUnit } from './types/weather';

export default function App() {
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const { status, data, error, query, search, retry } = useWeather();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement>(null);
  const isLoading = status === 'loading';

  useEffect(() => {
    if (status === 'success' && data) {
      resultHeadingRef.current?.focus();
    }
  }, [status, data]);

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-12">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-night-800 focus:px-4 focus:py-3 focus:text-white"
      >
        Pular para o conteúdo principal
      </a>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium tracking-widest text-accent-400">WEATHER APP</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            O tempo, de um jeito claro.
          </h1>
        </div>
        <UnitToggle unit={unit} onChange={setUnit} />
      </header>
      <main id="main-content" tabIndex={-1} className="flex flex-col gap-8">
        <section aria-label="Busca de localidade" className="glass space-y-4 p-5 sm:p-6">
          <SearchBar inputRef={searchInputRef} onSearch={search} isLoading={isLoading} />
          <p className="text-sm leading-relaxed text-slate-300">
            Busque uma localidade para consultar as condições atuais e a previsão de cinco dias com
            dados da Open-Meteo.
          </p>
        </section>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {status === 'success' && data ? `Dados de ${data.city.name} disponíveis.` : ''}
        </div>
        {isLoading && <LoadingState />}
        <div
          role="region"
          aria-label="Resultados da busca"
          aria-busy={isLoading}
          className="space-y-8"
        >
          {status === 'idle' && <p role="status">Informe uma localidade para começar.</p>}
          {status === 'empty' && <EmptyState query={query} />}
          {status === 'error' && (
            <ErrorState
              message={error ?? 'Não foi possível obter os dados meteorológicos. Tente novamente.'}
              onRetry={() => {
                searchInputRef.current?.focus();
                void retry();
              }}
            />
          )}
          {status === 'success' && data && (
            <>
              <CurrentWeather data={data} unit={unit} headingRef={resultHeadingRef} />
              <ForecastList forecast={data.forecast} unit={unit} />
            </>
          )}
        </div>
      </main>
      <footer className="mt-auto border-t border-white/10 pt-5 text-center text-sm text-slate-400">
        Dados meteorológicos fornecidos pela{' '}
        <a href="https://open-meteo.com/" className="underline hover:text-slate-200">
          Open-Meteo
        </a>
        .
      </footer>
    </div>
  );
}
