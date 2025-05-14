import { LoadItem, LoadSchedule } from '../ScheduleOfLoads/types';

/**
 * Calculate load per phase for a three-phase panel
 * @param loadSchedule The load schedule to analyze
 * @returns Phase loads in amps and imbalance information
 */
export function calculatePhaseLoads(loadSchedule: LoadSchedule): {
  phaseLoads: { A: number; B: number; C: number };
  maxImbalance: number;
  isBalanced: boolean;
  mostLoadedPhase: 'A' | 'B' | 'C';
  leastLoadedPhase: 'A' | 'B' | 'C';
  recommendations: string[];
} {
  // Default values
  const phaseLoads = { A: 0, B: 0, C: 0 };
  const recommendations: string[] = [];
  
  // Only proceed with calculation if this is a three-phase panel
  if (loadSchedule.phaseConfiguration !== 'three-phase') {
    return {
      phaseLoads,
      maxImbalance: 0,
      isBalanced: true,
      mostLoadedPhase: 'A',
      leastLoadedPhase: 'B',
      recommendations: ['This is a single-phase panel; phase balance analysis is not applicable.']
    };
  }

  // Calculate loads for each phase
  for (const loadItem of loadSchedule.loads) {
    if (!loadItem.circuitDetails?.phase || !loadItem.current) {
      continue; // Skip if phase information is missing
    }
    
    const current = loadItem.current || 0;
    
    // Assign current to appropriate phase(s)
    switch (loadItem.circuitDetails.phase) {
      case 'A':
        phaseLoads.A += current;
        break;
      case 'B':
        phaseLoads.B += current;
        break;
      case 'C':
        phaseLoads.C += current;
        break;
      case 'A-B':
        // Line-to-line load is split between phases
        phaseLoads.A += current / 2;
        phaseLoads.B += current / 2;
        break;
      case 'B-C':
        phaseLoads.B += current / 2;
        phaseLoads.C += current / 2;
        break;
      case 'C-A':
        phaseLoads.C += current / 2;
        phaseLoads.A += current / 2;
        break;
      case 'A-B-C':
        // Three-phase balanced load
        phaseLoads.A += current / 3;
        phaseLoads.B += current / 3;
        phaseLoads.C += current / 3;
        break;
    }
  }
  
  // Calculate maximum current across phases
  const maxCurrent = Math.max(phaseLoads.A, phaseLoads.B, phaseLoads.C);
  
  // Calculate minimum current across phases
  const minCurrent = Math.min(phaseLoads.A, phaseLoads.B, phaseLoads.C);
  
  // Calculate average current
  const avgCurrent = (phaseLoads.A + phaseLoads.B + phaseLoads.C) / 3;
  
  // Calculate maximum imbalance percentage
  const maxImbalance = avgCurrent > 0 ? ((maxCurrent - minCurrent) / avgCurrent) * 100 : 0;
  
  // Determine most/least loaded phases
  let mostLoadedPhase: 'A' | 'B' | 'C' = 'A';
  let leastLoadedPhase: 'A' | 'B' | 'C' = 'A';
  
  if (phaseLoads.A >= phaseLoads.B && phaseLoads.A >= phaseLoads.C) {
    mostLoadedPhase = 'A';
  } else if (phaseLoads.B >= phaseLoads.A && phaseLoads.B >= phaseLoads.C) {
    mostLoadedPhase = 'B';
  } else {
    mostLoadedPhase = 'C';
  }
  
  if (phaseLoads.A <= phaseLoads.B && phaseLoads.A <= phaseLoads.C) {
    leastLoadedPhase = 'A';
  } else if (phaseLoads.B <= phaseLoads.A && phaseLoads.B <= phaseLoads.C) {
    leastLoadedPhase = 'B';
  } else {
    leastLoadedPhase = 'C';
  }
  
  // Check if balanced (PEC 2017 recommends less than 20% imbalance)
  const isBalanced = maxImbalance < 20;
  
  // Generate recommendations if imbalance is too high
  if (!isBalanced) {
    recommendations.push(`Phase imbalance of ${maxImbalance.toFixed(1)}% exceeds recommended limit of 20%.`);
    recommendations.push(`Consider moving some loads from phase ${mostLoadedPhase} to phase ${leastLoadedPhase}.`);
    
    // Find single-phase loads on the most loaded phase that could be moved
    const movableLoads = loadSchedule.loads.filter(load => 
      load.circuitDetails?.phase === mostLoadedPhase && 
      load.circuitDetails.poles === 1
    );
    
    if (movableLoads.length > 0) {
      // Sort by current in descending order
      movableLoads.sort((a, b) => (b.current || 0) - (a.current || 0));
      
      // Recommend moving the largest loads
      const loadToMove = movableLoads[0];
      recommendations.push(`Suggest moving "${loadToMove.description}" (${loadToMove.current?.toFixed(1)}A) from phase ${mostLoadedPhase} to phase ${leastLoadedPhase}.`);
      
      if (movableLoads.length > 1) {
        const secondLoadToMove = movableLoads[1];
        recommendations.push(`Alternatively, move "${secondLoadToMove.description}" (${secondLoadToMove.current?.toFixed(1)}A) to phase ${leastLoadedPhase}.`);
      }
    }
  } else if (maxImbalance > 10) {
    // Still within limits but could be improved
    recommendations.push(`Phase imbalance of ${maxImbalance.toFixed(1)}% is acceptable but could be improved.`);
    recommendations.push(`For optimal performance, consider balancing loads more evenly across phases.`);
  } else {
    recommendations.push(`Phase balance is excellent at ${maxImbalance.toFixed(1)}%.`);
  }
  
  return {
    phaseLoads,
    maxImbalance,
    isBalanced,
    mostLoadedPhase,
    leastLoadedPhase,
    recommendations
  };
}

/**
 * Suggest optimal phase for a new load based on current phase loading
 * @param loadSchedule The current load schedule
 * @param newLoadCurrent The current of the new load
 * @returns Suggested phase and reasoning
 */
export function suggestPhaseForNewLoad(
  loadSchedule: LoadSchedule, 
  newLoadCurrent: number
): { 
  suggestedPhase: 'A' | 'B' | 'C' | 'A-B' | 'B-C' | 'C-A' | 'A-B-C'; 
  reasoning: string 
} {
  // Default to phase A for single-phase panels
  if (loadSchedule.phaseConfiguration !== 'three-phase') {
    return {
      suggestedPhase: 'A',
      reasoning: 'This is a single-phase panel; all loads must be connected to phase A.'
    };
  }
  
  // Get current phase loading
  const { phaseLoads, leastLoadedPhase } = calculatePhaseLoads(loadSchedule);
  
  // If this is a very small load (less than 5% of the total), it doesn't matter much
  const totalCurrent = phaseLoads.A + phaseLoads.B + phaseLoads.C;
  if (newLoadCurrent < totalCurrent * 0.05) {
    return {
      suggestedPhase: leastLoadedPhase,
      reasoning: `This is a small load; connecting to the least loaded phase (${leastLoadedPhase}) is recommended but not critical.`
    };
  }
  
  // For larger loads, definitely use the least loaded phase
  if (newLoadCurrent > totalCurrent * 0.1) {
    return {
      suggestedPhase: leastLoadedPhase,
      reasoning: `This is a significant load; connecting to the least loaded phase (${leastLoadedPhase}) will help maintain phase balance.`
    };
  }
  
  // If we need a two-pole circuit, recommend the appropriate phase pair
  // Find the two least loaded phases
  let leastLoadedPair: 'A-B' | 'B-C' | 'C-A';
  if (phaseLoads.A + phaseLoads.B <= phaseLoads.B + phaseLoads.C && 
      phaseLoads.A + phaseLoads.B <= phaseLoads.C + phaseLoads.A) {
    leastLoadedPair = 'A-B';
  } else if (phaseLoads.B + phaseLoads.C <= phaseLoads.A + phaseLoads.B && 
             phaseLoads.B + phaseLoads.C <= phaseLoads.C + phaseLoads.A) {
    leastLoadedPair = 'B-C';
  } else {
    leastLoadedPair = 'C-A';
  }
  
  // If the load is between 5-10% of total, suggest the least loaded phase
  return {
    suggestedPhase: leastLoadedPhase,
    reasoning: `Connecting to phase ${leastLoadedPhase} will help maintain balance. For a two-pole circuit, consider using ${leastLoadedPair}.`
  };
}

/**
 * Calculate phase balance impact of moving a load to a different phase
 * @param loadSchedule Current load schedule
 * @param loadItem Load item to move
 * @param targetPhase Target phase to move to
 * @returns Analysis of the phase balance impact
 */
export function analyzePhaseChangeImpact(
  loadSchedule: LoadSchedule,
  loadItem: LoadItem,
  targetPhase: 'A' | 'B' | 'C' | 'A-B' | 'B-C' | 'C-A' | 'A-B-C'
): {
  currentImbalance: number;
  newImbalance: number;
  improvement: number;
  recommendation: string;
} {
  // Only analyze for three-phase panels
  if (loadSchedule.phaseConfiguration !== 'three-phase') {
    return {
      currentImbalance: 0,
      newImbalance: 0,
      improvement: 0,
      recommendation: 'Phase change analysis is not applicable for single-phase panels.'
    };
  }
  
  // Get current phase balance
  const currentPhaseAnalysis = calculatePhaseLoads(loadSchedule);
  
  // Create a deep copy of the load schedule for simulation
  const newLoadSchedule = JSON.parse(JSON.stringify(loadSchedule)) as LoadSchedule;
  
  // Find the load item to modify
  const loadIndex = newLoadSchedule.loads.findIndex(l => l.id === loadItem.id);
  if (loadIndex === -1) {
    return {
      currentImbalance: currentPhaseAnalysis.maxImbalance,
      newImbalance: currentPhaseAnalysis.maxImbalance,
      improvement: 0,
      recommendation: 'Load item not found in schedule.'
    };
  }
  
  // Update the phase
  if (!newLoadSchedule.loads[loadIndex].circuitDetails) {
    // If circuitDetails is missing, create it with defaults
    newLoadSchedule.loads[loadIndex].circuitDetails = {
      type: 'other',
      poles: 1,
      phase: targetPhase,
      wireType: 'THHN_COPPER',
      maxVoltageDropAllowed: 3
    };
  } else {
    // Make sure TypeScript knows circuitDetails is non-null by using a temporary variable
    const circuitDetails = newLoadSchedule.loads[loadIndex].circuitDetails;
    if (circuitDetails) {
      // Update phase
      circuitDetails.phase = targetPhase;
      
      // Update poles based on phase selection
      if (targetPhase === 'A' || targetPhase === 'B' || targetPhase === 'C') {
        circuitDetails.poles = 1;
      } else if (targetPhase === 'A-B' || targetPhase === 'B-C' || targetPhase === 'C-A') {
        circuitDetails.poles = 2;
      } else if (targetPhase === 'A-B-C') {
        circuitDetails.poles = 3;
      }
    }
  }
  
  // Calculate new phase balance
  const newPhaseAnalysis = calculatePhaseLoads(newLoadSchedule);
  
  // Calculate improvement
  const improvement = currentPhaseAnalysis.maxImbalance - newPhaseAnalysis.maxImbalance;
  
  // Generate recommendation
  let recommendation: string;
  if (improvement > 5) {
    recommendation = `Moving this load to phase ${targetPhase} will significantly improve phase balance by ${improvement.toFixed(1)}%.`;
  } else if (improvement > 0) {
    recommendation = `Moving this load to phase ${targetPhase} will slightly improve phase balance by ${improvement.toFixed(1)}%.`;
  } else if (improvement === 0) {
    recommendation = `Moving this load to phase ${targetPhase} will not affect phase balance.`;
  } else {
    recommendation = `Moving this load to phase ${targetPhase} will worsen phase balance by ${Math.abs(improvement).toFixed(1)}%. Not recommended.`;
  }
  
  return {
    currentImbalance: currentPhaseAnalysis.maxImbalance,
    newImbalance: newPhaseAnalysis.maxImbalance,
    improvement,
    recommendation
  };
} 