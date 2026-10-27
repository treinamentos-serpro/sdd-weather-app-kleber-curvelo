import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import WeatherIcon from '../../src/components/WeatherIcon';

describe('WeatherIcon', () => {
  it.each([51, 61, 80, 95])('exibe gotas para condições chuvosas: %s', (code) => {
    const { container } = render(<WeatherIcon condition={{ code, description: '' }} />);

    expect(container.querySelector('path.text-accent-400')).toBeInTheDocument();
  });

  it.each([71, 73, 75, 77, 85, 86])('não exibe gotas para condições de neve: %s', (code) => {
    const { container } = render(<WeatherIcon condition={{ code, description: '' }} />);

    expect(container.querySelector('path.text-accent-400')).not.toBeInTheDocument();
  });
});
