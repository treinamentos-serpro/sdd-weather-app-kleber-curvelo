import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from '../../src/components/states/EmptyState';
import ErrorState from '../../src/components/states/ErrorState';
import LoadingState from '../../src/components/states/LoadingState';

describe('Estados da consulta', () => {
  it('anuncia carregamento', () => {
    render(<LoadingState />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Carregando dados meteorológicos');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
  });

  it('anuncia ausência de dados e orienta uma nova busca', () => {
    render(<EmptyState query="Recife" />);
    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma localidade encontrada');
    expect(screen.getByRole('status')).toHaveTextContent('Recife');
    expect(screen.getByRole('status')).toHaveTextContent('Tente buscar São Paulo');
  });

  it('comunica erro e permite retry por teclado', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState onRetry={onRetry} />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Não foi possível obter os dados');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).not.toContainElement(screen.getByRole('button', { name: 'Tentar novamente' }));
    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
