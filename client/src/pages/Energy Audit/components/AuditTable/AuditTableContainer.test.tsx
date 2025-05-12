import React from 'react';
import { render, screen } from '@testing-library/react';
import AuditTableContainer from './AuditTableContainer';
import { AuditRow } from './types';

describe('AuditTableContainer', () => {
  const makeRows = (n: number, completedEvery = 2): AuditRow[] =>
    Array.from({ length: n }, (_, i) => ({
      id: String(i + 1),
      category: `Cat${i + 1}`,
      conditions: ['Cond1'],
      referenceStandards: ['Ref1'],
      completed: i % completedEvery === 0,
      riskIndex: { PO: 1, SO: 'A', ARI: '1A', value: 1 },
      comments: '',
    }));

  it('shows summary bar with correct values', () => {
    render(
      <AuditTableContainer
        rows={makeRows(10)}
        onRowChange={jest.fn()}
        onAddRow={jest.fn()}
        onDeleteRow={jest.fn()}
      />
    );
    expect(screen.getByText(/Total Rows: 10/)).toBeInTheDocument();
    expect(screen.getByText(/Completed: 5/)).toBeInTheDocument();
    expect(screen.getByText(/Completion Rate: 50%/)).toBeInTheDocument();
  });

  it('shows virtualization indicator when rows exceed threshold', () => {
    render(
      <AuditTableContainer
        rows={makeRows(100)}
        onRowChange={jest.fn()}
        onAddRow={jest.fn()}
        onDeleteRow={jest.fn()}
      />
    );
    expect(screen.getByText(/Virtualization active/)).toBeInTheDocument();
  });

  it('does not show virtualization indicator for small tables', () => {
    render(
      <AuditTableContainer
        rows={makeRows(10)}
        onRowChange={jest.fn()}
        onAddRow={jest.fn()}
        onDeleteRow={jest.fn()}
      />
    );
    expect(screen.queryByText(/Virtualization active/)).not.toBeInTheDocument();
  });
}); 