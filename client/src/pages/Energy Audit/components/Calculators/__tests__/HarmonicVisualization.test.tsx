import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HarmonicVisualization from '../HarmonicVisualization';

// Mock Chart.js
jest.mock('chart.js/auto', () => {
  return {
    __esModule: true,
    default: class MockChart {
      constructor() {
        this.destroy = jest.fn();
      }
      destroy() {}
    },
    register: jest.fn()
  };
});

// Mock chart.js components
jest.mock('chart.js', () => ({
  Chart: jest.fn(),
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(), 
  PointElement: jest.fn(), 
  LineElement: jest.fn(), 
  Title: jest.fn(), 
  Tooltip: jest.fn(), 
  Legend: jest.fn()
}));

describe('HarmonicVisualization Component', () => {
  const mockProps = {
    harmonics: [
      { order: 3, voltage: 10, current: 5 },
      { order: 5, voltage: 15, current: 8 },
      { order: 7, voltage: 7, current: 3 }
    ],
    fundamentalValues: {
      voltage: 220,
      current: 100
    },
    thdValues: {
      voltage: 5.5,
      current: 8.2
    },
    limits: {
      voltageLimit: 5.0,
      currentLimits: [4.0, 7.0, 2.5],
      thdVoltageLimit: 5.0,
      thdCurrentLimit: 8.0
    }
  };

  test('renders the component with tabs', () => {
    render(<HarmonicVisualization {...mockProps} />);
    
    // Check if tabs are displayed
    expect(screen.getByText('Harmonic Spectrum')).toBeInTheDocument();
    expect(screen.getByText('THD Comparison')).toBeInTheDocument();
    expect(screen.getByText('Waveform Analysis')).toBeInTheDocument();
  });

  test('renders the component with chart panels', () => {
    render(<HarmonicVisualization {...mockProps} />);
    
    // Check if chart panels are displayed
    expect(screen.getByText('Harmonic Spectrum Analysis')).toBeInTheDocument();
  });

  test('changes tabs when clicked', () => {
    render(<HarmonicVisualization {...mockProps} />);
    
    // Initial tab
    expect(screen.getByText('Harmonic Spectrum Analysis')).toBeVisible();
    
    // Click on THD Comparison tab
    fireEvent.click(screen.getByText('THD Comparison'));
    expect(screen.getByText('Total Harmonic Distortion Comparison')).toBeVisible();
    
    // Click on Waveform Analysis tab
    fireEvent.click(screen.getByText('Waveform Analysis'));
    expect(screen.getByText('Waveform Analysis')).toBeVisible();
  });

  test('renders visualization options', () => {
    render(<HarmonicVisualization {...mockProps} />);
    
    // Check if visualization options are displayed
    expect(screen.getByText('Voltage')).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Show Limits')).toBeInTheDocument();
    
    // Check color scheme buttons
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('High Contrast')).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
  });

  test('displays loading state when loading prop is true', () => {
    render(<HarmonicVisualization {...mockProps} loading={true} />);
    
    // Check if loading indicator is displayed
    const loadingIndicator = document.querySelector('circle');
    expect(loadingIndicator).toBeInTheDocument();
  });

  test('toggles visualization options when switches are clicked', () => {
    render(<HarmonicVisualization {...mockProps} />);
    
    // Get switches
    const voltageSwitch = screen.getByRole('checkbox', { name: 'Voltage' });
    const currentSwitch = screen.getByRole('checkbox', { name: 'Current' });
    const limitsSwitch = screen.getByRole('checkbox', { name: 'Show Limits' });
    
    // Test toggling switches
    expect(voltageSwitch).toBeChecked();
    fireEvent.click(voltageSwitch);
    expect(voltageSwitch).not.toBeChecked();
    
    expect(currentSwitch).toBeChecked();
    fireEvent.click(currentSwitch);
    expect(currentSwitch).not.toBeChecked();
    
    expect(limitsSwitch).toBeChecked();
    fireEvent.click(limitsSwitch);
    expect(limitsSwitch).not.toBeChecked();
  });

  test('changes color scheme when buttons are clicked', () => {
    render(<HarmonicVisualization {...mockProps} />);
    
    // Get color scheme buttons
    const defaultButton = screen.getByText('Default');
    const highContrastButton = screen.getByText('High Contrast');
    const printButton = screen.getByText('Print');
    
    // Initially, default should be selected
    expect(defaultButton).toHaveClass('MuiButton-contained');
    expect(highContrastButton).not.toHaveClass('MuiButton-contained');
    expect(printButton).not.toHaveClass('MuiButton-contained');
    
    // Click high contrast button
    fireEvent.click(highContrastButton);
    expect(defaultButton).not.toHaveClass('MuiButton-contained');
    expect(highContrastButton).toHaveClass('MuiButton-contained');
    expect(printButton).not.toHaveClass('MuiButton-contained');
    
    // Click print button
    fireEvent.click(printButton);
    expect(defaultButton).not.toHaveClass('MuiButton-contained');
    expect(highContrastButton).not.toHaveClass('MuiButton-contained');
    expect(printButton).toHaveClass('MuiButton-contained');
  });
}); 