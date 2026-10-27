import type { Ref } from 'react';
import { formatTemperature } from '../lib/format';
import type { TemperatureUnit, WeatherData } from '../types/weather';
import WeatherIcon from './WeatherIcon';

interface CurrentWeatherProps {
  data: WeatherData;
  unit: TemperatureUnit;
  headingRef?: Ref<HTMLHeadingElement>;
}

export default function CurrentWeather({ data, unit, headingRef }: CurrentWeatherProps) {
  return (
    <section
      aria-labelledby="current-heading"
      className="glass flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div className="min-w-0">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-accent-400">
          Condições atuais
        </p>
        <h2
          ref={headingRef}
          id="current-heading"
          tabIndex={-1}
          className="break-words text-3xl font-semibold sm:text-4xl"
        >
          {data.city.name}
        </h2>
        <p className="mt-2 text-slate-300">
          {[data.city.region, data.city.country].filter(Boolean).join(' · ')}
        </p>
        <p className="mt-6 text-6xl font-semibold tracking-tight sm:text-7xl">
          {formatTemperature(data.current.temperatureC, unit)}
        </p>
        <p className="mt-3 text-lg text-slate-200">{data.current.condition.description}</p>
      </div>
      <WeatherIcon
        condition={data.current.condition}
        className="h-28 w-28 self-center sm:h-40 sm:w-40"
      />
    </section>
  );
}
