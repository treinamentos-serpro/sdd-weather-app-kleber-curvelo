import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('envia a localidade sem espaços por teclado', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);
    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar localidade' }),
      ' São Paulo {Enter}',
    );
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('São Paulo');
  });

  it.each(['', '   '])('orienta para entrada vazia: "%s"', async (query) => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: query } });
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma localidade');
    expect(screen.getByRole('searchbox')).toHaveAttribute('aria-invalid', 'true');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it.each(['', '   '])('rejeita entrada vazia por teclado: "%s"', async (query) => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} />);
    const searchbox = screen.getByRole('searchbox', { name: 'Buscar localidade' });
    await user.tab();
    expect(searchbox).toHaveFocus();
    if (query) await user.type(searchbox, query);
    await user.keyboard('{Enter}');

    expect(screen.getByRole('alert')).toHaveTextContent('Informe uma localidade');
    expect(searchbox).toHaveAttribute('aria-invalid', 'true');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('bloqueia submissão durante carregamento', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    render(<SearchBar onSearch={onSearch} isLoading />);
    await user.type(screen.getByRole('searchbox'), 'São Paulo{Enter}');
    const button = screen.getByRole('button', { name: 'Buscando…' });
    await user.click(button);
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    fireEvent.submit(screen.getByRole('search'));
    expect(screen.getByRole('button', { name: 'Buscando…' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('libera o envio e preserva o texto e o foco quando o carregamento termina', async () => {
    const onSearch = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<SearchBar onSearch={onSearch} isLoading />);
    await user.type(screen.getByRole('searchbox'), 'Recife');
    await user.click(screen.getByRole('button', { name: 'Buscando…' }));
    rerender(<SearchBar onSearch={onSearch} isLoading={false} />);
    const button = screen.getByRole('button', { name: 'Buscar' });
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('aria-disabled', 'false');
    await user.keyboard('{Enter}');
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('Recife');
  });
});
