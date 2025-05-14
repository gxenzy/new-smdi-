import React from 'react';
import { CircuitSyncProvider } from '../../../../../contexts/CircuitSynchronizationContext';
import ScheduleOfLoadsCalculator from './ScheduleOfLoadsCalculator';

// Forward all props to the inner calculator
const WrappedScheduleOfLoadsCalculator = (props: any) => (
  <CircuitSyncProvider>
    <ScheduleOfLoadsCalculator {...props} />
  </CircuitSyncProvider>
);

export default WrappedScheduleOfLoadsCalculator;
export * from './types'; 