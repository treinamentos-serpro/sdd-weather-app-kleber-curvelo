import { describe, expect, it } from 'vitest';
import { formatDate, formatTemperature } from '../../src/lib/format';
import { convertTemperature } from '../../src/lib/temperature';

describe('Temperaturas e datas civis', () => {
  it.each([
    [0, 32],
    [24, 75.2],
    [-40, -40],
    [100, 212],
  ])('converte %s°C para %s°F sem alterar Celsius', (celsius, fahrenheit) => {
    expect(convertTemperature(celsius, 'fahrenheit')).toBeCloseTo(fahrenheit);
    expect(convertTemperature(celsius, 'celsius')).toBe(celsius);
  });

  it('arredonda e identifica a unidade', () => {
    expect(formatTemperature(24, 'fahrenheit')).toBe('75°F');
    expect(formatTemperature(24.6, 'celsius')).toBe('25°C');
    expect(formatTemperature(-2.6, 'celsius')).toBe('-3°C');
  });

  it.each([
    [0, '32°F'],
    [-40, '-40°F'],
    [20.25, '68°F'],
    [20.3, '69°F'],
  ])('converte %s°C para Fahrenheit e arredonda ao inteiro mais próximo', (celsius, expected) => {
    expect(formatTemperature(celsius, 'fahrenheit')).toBe(expected);
  });

  it('formata a data civil em pt-BR sem depender do fuso do dispositivo', () => {
    expect(formatDate('2026-10-27')).toBe('ter., 27/10');
  });
});
