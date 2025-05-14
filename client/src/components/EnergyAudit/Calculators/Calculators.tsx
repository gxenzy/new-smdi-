import React from 'react';
import LightingPowerDensityCalculator from './LightingPowerDensityCalculator';

export { LightingPowerDensityCalculator };

const Calculators: React.FC = () => {
  return (
    <div>
      <h2>Energy Audit Calculators</h2>
      <p>Select a calculator from the menu to perform energy calculations.</p>
    </div>
  );
};

export default Calculators; 