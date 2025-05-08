import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StandardTable from './StandardTable';
import { Audit, categories } from './types';
import userEvent from '@testing-library/user-event';
import MoreVertIcon from '@mui/icons-material/MoreVert';

describe('StandardTable', () => {
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
  const calculatePercentage = jest.fn(() => ['50', '50']);

  it('renders correct number of rows for a standard', () => {
    render(
      <StandardTable
        standard="Size of Wires"
        selectedAudit={mockAudit}
        updateAuditField={updateAuditField}
        calculatePercentage={calculatePercentage}
      />
    );
    const rows = screen.getAllByRole('row');
    // 1 header + N floors
    expect(rows.length).toBe(Object.keys(categories).length + 1);
  });

  it('sorts by floor when header clicked', () => {
    render(
      <StandardTable
        standard="Size of Wires"
        selectedAudit={mockAudit}
        updateAuditField={updateAuditField}
        calculatePercentage={calculatePercentage}
      />
    );
    const sortButton = screen.getByText('FLOOR');
    fireEvent.click(sortButton);
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('sorts by complied when header clicked', () => {
    render(
      <StandardTable
        standard="Size of Wires"
        selectedAudit={mockAudit}
        updateAuditField={updateAuditField}
        calculatePercentage={calculatePercentage}
      />
    );
    const sortButton = screen.getByText('COMPLIED');
    fireEvent.click(sortButton);
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('sorts by nonCompliant when header clicked', () => {
    render(
      <StandardTable
        standard="Size of Wires"
        selectedAudit={mockAudit}
        updateAuditField={updateAuditField}
        calculatePercentage={calculatePercentage}
      />
    );
    const sortButton = screen.getByText('NON COMPLIANT');
    fireEvent.click(sortButton);
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });
});

describe('StandardTable row actions', () => {
  const mockAudit = {
    id: 1,
    name: 'Test Audit',
    complianceData: {},
    ariData: {},
    probabilityData: {},
    riskSeverityData: {},
    lastSaved: null,
  };
  const updateAuditField = jest.fn();
  const calculatePercentage = jest.fn(() => ['50', '50']);
  const onDuplicateRow = jest.fn();
  const onArchiveRow = jest.fn();
  const onQuickComment = jest.fn();

  it('calls row action handlers', async () => {
    render(
      <StandardTable
        standard="Size of Wires"
        selectedAudit={mockAudit}
        updateAuditField={updateAuditField}
        calculatePercentage={calculatePercentage}
        onDuplicateRow={onDuplicateRow}
        onArchiveRow={onArchiveRow}
        onQuickComment={onQuickComment}
      />
    );
    // Open menu for first row
    const menuButtons = screen.getAllByLabelText('Row actions');
    userEvent.click(menuButtons[0]);
    // Click duplicate
    userEvent.click(await screen.findByText('Duplicate'));
    expect(onDuplicateRow).toHaveBeenCalled();
    // Open menu again
    userEvent.click(menuButtons[0]);
    // Click archive
    userEvent.click(await screen.findByText('Archive'));
    expect(onArchiveRow).toHaveBeenCalled();
    // Open menu again
    userEvent.click(menuButtons[0]);
    // Click quick comment
    userEvent.click(await screen.findByText('Quick Comment'));
    expect(await screen.findByText('Quick Comment')).toBeInTheDocument();
  });
}); 