import type { TemperatureUnit, WeatherData } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: WeatherData['forecast'];
  unit: TemperatureUnit;
}

export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-labelledby="forecast-heading" className="space-y-4">
      <h2 id="forecast-heading" className="text-xl font-semibold">
        Previsão de 5 dias
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {forecast.map((day) => (
          <ForecastCard key={day.date} day={day} unit={unit} />
        ))}
      </ul>
    </section>
  );
}
