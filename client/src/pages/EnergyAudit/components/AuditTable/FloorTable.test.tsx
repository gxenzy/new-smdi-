import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FloorTable from './FloorTable';
import { Audit, categories } from './types';

describe('FloorTable', () => {
  const mockAudit: Audit = {
    id: 1,
    name: 'Test Audit',
    complianceData: {},
    ariData: {},
    probabilityData: {},
    riskSeverityData: {},
    lastSaved: null,
  };
  const updateAuditField = jest.fn();
  const calculateValue = jest.fn(() => 2);

  it('renders correct number of rows for a floor', () => {
    render(
      <FloorTable
        floor="Ground Floor"
        selectedAudit={mockAudit}
        updateAuditField={updateAuditField}
        calculateValue={calculateValue}
      />
    );
    const rows = screen.getAllByRole('row');
    // 1 header + N categories
    expect(rows.length).toBe(categories['Ground Floor'].length + 1);
  });

  it('sorts by category when header clicked', () => {
    render(
      <FloorTable
        floor="Ground Floor"
        selectedAudit={mockAudit}
        updateAuditField={updateAuditField}
        calculateValue={calculateValue}
      />
    );
    const sortButton = screen.getByText('Category');
    fireEvent.click(sortButton);
    // Should not throw, and table should re-render
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('filters by completed status', () => {
    render(
      <FloorTable
        floor="Ground Floor"
        selectedAudit={mockAudit}
        updateAuditField={updateAuditField}
        calculateValue={calculateValue}
      />
    );
    const filter = screen.getByLabelText('Filter by Status');
    fireEvent.change(filter, { target: { value: 'completed' } });
    // Should not throw
    expect(screen.getAllByRole('row').length).toBeGreaterThan(0);
  });
}); 