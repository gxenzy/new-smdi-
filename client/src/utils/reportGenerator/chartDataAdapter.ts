import { ChartConfiguration, ChartType } from 'chart.js';
import { chartThemes } from './chartGenerator';

// Define interfaces for data structures
interface LightingArea {
  name: string;
  currentWattage: number;
  proposedWattage: number;
  hoursPerDay: number;
}

interface HarmonicData {
  order: number;
  magnitude: number;
}

/**
 * Utility class to adapt calculator data into chart configurations
 * This makes it easy to connect various data sources to visualization components
 */
export class ChartDataAdapter {
  /**
   * Convert lighting calculator data to before/after comparison chart
   * @param calculatorData Lighting calculator data
   * @returns Chart configuration
   */
  public static lightingToComparisonChart(calculatorData: any): ChartConfiguration {
    // Extract lighting areas or use default if not available
    const areas = calculatorData?.areas || [
      { name: 'Area 1', currentWattage: 500, proposedWattage: 200, hoursPerDay: 10 },
      { name: 'Area 2', currentWattage: 750, proposedWattage: 300, hoursPerDay: 8 },
      { name: 'Area 3', currentWattage: 1200, proposedWattage: 450, hoursPerDay: 12 }
    ];
    
    // Calculate kWh for current and proposed scenarios
    const currentKWh = areas.map((area: LightingArea) => 
      (area.currentWattage / 1000) * area.hoursPerDay * 365
    );
    
    const proposedKWh = areas.map((area: LightingArea) => 
      (area.proposedWattage / 1000) * area.hoursPerDay * 365
    );
    
    // Create chart configuration
    return {
      type: 'bar',
      data: {
        labels: areas.map((area: LightingArea) => area.name),
        datasets: [
          {
            label: 'Current (kWh/year)',
            data: currentKWh,
            backgroundColor: chartThemes.default.danger,
            borderColor: chartThemes.default.danger,
            borderWidth: 1
          },
          {
            label: 'Proposed (kWh/year)',
            data: proposedKWh,
            backgroundColor: chartThemes.default.success,
            borderColor: chartThemes.default.success,
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Lighting Energy Consumption Comparison'
          },
          tooltip: {
            callbacks: {
              footer: (tooltipItems) => {
                const currentValue = Number(tooltipItems[0].raw);
                const proposedValue = tooltipItems.length > 1 ? Number(tooltipItems[1].raw) : 0;
                const savings = currentValue - proposedValue;
                const savingsPercent = currentValue > 0 
                  ? Math.round((savings / currentValue) * 100)
                  : 0;
                
                return `Savings: ${savings.toFixed(0)} kWh/year (${savingsPercent}%)`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Annual Energy (kWh)'
            }
          }
        }
      }
    };
  }
  
  /**
   * Convert HVAC calculator data to efficiency chart
   * @param calculatorData HVAC calculator data
   * @returns Chart configuration
   */
  public static hvacToEfficiencyChart(calculatorData: any): ChartConfiguration {
    // Extract HVAC data or use default if not available
    const hvacData = calculatorData || {
      currentEfficiency: 10.5,
      proposedEfficiency: 16,
      annualCoolingHours: 1200,
      coolingCapacity: 5, // tons
      energyCost: 0.12 // $/kWh
    };
    
    // Calculate energy consumption
    const currentKWh = (12000 * hvacData.coolingCapacity * hvacData.annualCoolingHours) / 
                       (hvacData.currentEfficiency * 1000);
    
    const proposedKWh = (12000 * hvacData.coolingCapacity * hvacData.annualCoolingHours) / 
                        (hvacData.proposedEfficiency * 1000);
    
    // Calculate cost
    const currentCost = currentKWh * hvacData.energyCost;
    const proposedCost = proposedKWh * hvacData.energyCost;
    
    // Create chart configuration with energy and cost comparison
    return {
      type: 'bar',
      data: {
        labels: ['Energy Consumption (kWh)', 'Annual Cost ($)'],
        datasets: [
          {
            label: `Current (EER: ${hvacData.currentEfficiency})`,
            data: [currentKWh, currentCost],
            backgroundColor: chartThemes.default.danger,
            borderColor: chartThemes.default.danger,
            borderWidth: 1
          },
          {
            label: `Proposed (EER: ${hvacData.proposedEfficiency})`,
            data: [proposedKWh, proposedCost],
            backgroundColor: chartThemes.default.success,
            borderColor: chartThemes.default.success,
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'HVAC System Efficiency Comparison'
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.raw as number;
                
                // Format based on which metric we're showing
                if (context.dataIndex === 0) {
                  return `${label}: ${value.toFixed(0)} kWh`;
                } else {
                  return `${label}: $${value.toFixed(2)}`;
                }
              },
              footer: (tooltipItems) => {
                const currentValue = Number(tooltipItems[0].raw);
                const proposedValue = tooltipItems.length > 1 ? Number(tooltipItems[1].raw) : 0;
                const savings = currentValue - proposedValue;
                const savingsPercent = currentValue > 0 
                  ? Math.round((savings / currentValue) * 100)
                  : 0;
                
                if (tooltipItems[0].dataIndex === 0) {
                  return `Savings: ${savings.toFixed(0)} kWh (${savingsPercent}%)`;
                } else {
                  return `Savings: $${savings.toFixed(2)} (${savingsPercent}%)`;
                }
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                return value;
              }
            }
          }
        }
      }
    };
  }
  
  /**
   * Convert power factor calculator data to visualization
   * @param calculatorData Power factor calculator data
   * @returns Chart configuration
   */
  public static powerFactorToChart(calculatorData: any): ChartConfiguration {
    // Extract power factor data or use default if not available
    const pfData = calculatorData || {
      currentPowerFactor: 0.82,
      targetPowerFactor: 0.95,
      apparentPower: 500, // kVA
      energyCost: 0.12, // $/kWh
      demandCharge: 15, // $/kVA
      operatingHours: 4000 // hours per year
    };
    
    // Calculate real power (kW)
    const realPower = pfData.apparentPower * pfData.currentPowerFactor;
    
    // Calculate current and proposed reactive power
    const currentReactivePower = Math.sqrt(
      Math.pow(pfData.apparentPower, 2) - Math.pow(realPower, 2)
    );
    
    const targetApparentPower = realPower / pfData.targetPowerFactor;
    const targetReactivePower = Math.sqrt(
      Math.pow(targetApparentPower, 2) - Math.pow(realPower, 2)
    );
    
    // Calculate savings from demand charges
    const demandSavings = (pfData.apparentPower - targetApparentPower) * 
                          pfData.demandCharge * 12; // monthly charge * 12 months
    
    // Create radar chart to visualize power triangle
    return {
      type: 'radar',
      data: {
        labels: ['Real Power (kW)', 'Reactive Power (kVAR)', 'Apparent Power (kVA)'],
        datasets: [
          {
            label: `Current (PF: ${pfData.currentPowerFactor})`,
            data: [realPower, currentReactivePower, pfData.apparentPower],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgb(255, 99, 132)',
            pointBackgroundColor: 'rgb(255, 99, 132)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(255, 99, 132)'
          },
          {
            label: `Target (PF: ${pfData.targetPowerFactor})`,
            data: [realPower, targetReactivePower, targetApparentPower],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgb(54, 162, 235)',
            pointBackgroundColor: 'rgb(54, 162, 235)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(54, 162, 235)'
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Power Factor Improvement Analysis'
          },
          subtitle: {
            display: true,
            text: `Annual Demand Charge Savings: $${demandSavings.toFixed(2)}`
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.raw as number;
                let unit = '';
                
                // Add appropriate units
                if (context.dataIndex === 0) {
                  unit = 'kW';
                } else if (context.dataIndex === 1) {
                  unit = 'kVAR';
                } else {
                  unit = 'kVA';
                }
                
                return `${label}: ${value.toFixed(1)} ${unit}`;
              }
            }
          }
        }
      }
    };
  }
  
  /**
   * Convert harmonic distortion data to bar chart
   * @param calculatorData Harmonic data
   * @returns Chart configuration
   */
  public static harmonicsToSpectrumChart(calculatorData: any): ChartConfiguration {
    // Extract harmonics data or use default if not available
    const harmonicData = calculatorData?.harmonics || [
      { order: 1, magnitude: 100 },   // Fundamental
      { order: 3, magnitude: 25 },    // 3rd harmonic
      { order: 5, magnitude: 18 },    // 5th harmonic
      { order: 7, magnitude: 12 },    // 7th harmonic
      { order: 9, magnitude: 8 },     // 9th harmonic
      { order: 11, magnitude: 6 },    // 11th harmonic
      { order: 13, magnitude: 4 }     // 13th harmonic
    ];
    
    // Calculate THD (Total Harmonic Distortion)
    const fundamental = harmonicData.find((h: HarmonicData) => h.order === 1)?.magnitude || 100;
    const harmonics = harmonicData.filter((h: HarmonicData) => h.order > 1);
    
    const thd = Math.sqrt(
      harmonics.reduce((sum: number, h: HarmonicData) => sum + Math.pow(h.magnitude, 2), 0)
    ) / fundamental * 100;
    
    // Create chart configuration for harmonic spectrum
    return {
      type: 'bar',
      data: {
        labels: harmonicData.map((h: HarmonicData) => h.order.toString()),
        datasets: [
          {
            label: 'Magnitude (%)',
            data: harmonicData.map((h: HarmonicData) => h.magnitude),
            backgroundColor: harmonicData.map((h: HarmonicData) => {
              // Color coding: fundamental is blue, others are increasingly red based on magnitude
              if (h.order === 1) return chartThemes.default.primary;
              
              // Higher magnitude = more intense red
              const intensity = Math.min(255, Math.round(h.magnitude * 2.55));
              return `rgba(${intensity}, 50, 50, 0.7)`;
            }),
            borderWidth: 1
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Harmonic Spectrum Analysis'
          },
          subtitle: {
            display: true,
            text: `Total Harmonic Distortion (THD): ${thd.toFixed(1)}%`
          },
          tooltip: {
            callbacks: {
              title: (tooltipItems) => {
                const order = tooltipItems[0].label;
                return `Harmonic Order: ${order}${order === '1' ? ' (Fundamental)' : ''}`;
              },
              label: (context) => {
                const magnitude = context.raw as number;
                return `Magnitude: ${magnitude.toFixed(1)}%`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Magnitude (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Harmonic Order'
            }
          }
        }
      }
    };
  }
  
  /**
   * Create a ROI analysis chart from any calculator data
   * @param initialInvestment Initial investment amount
   * @param annualSavings Annual savings amount
   * @param systemLifespan System lifespan in years
   * @param discountRate Discount rate for NPV calculation (decimal)
   * @returns Chart configuration
   */
  public static createROIChart(
    initialInvestment: number,
    annualSavings: number,
    systemLifespan: number = 10,
    discountRate: number = 0.05
  ): ChartConfiguration {
    // Calculate cumulative cash flow for each year
    const cumulativeCashFlow = [];
    let npv = -initialInvestment;
    
    for (let year = 0; year <= systemLifespan; year++) {
      if (year === 0) {
        cumulativeCashFlow.push(-initialInvestment);
      } else {
        // Calculate present value of this year's savings
        const presentValue = annualSavings / Math.pow(1 + discountRate, year);
        npv += presentValue;
        
        // Cumulative cash flow (undiscounted for simplicity)
        cumulativeCashFlow.push(
          -initialInvestment + (annualSavings * year)
        );
      }
    }
    
    // Calculate simple payback period (linear interpolation for fractional years)
    const paybackPeriod = initialInvestment / annualSavings;
    
    // Calculate IRR (simplified approximation)
    const irr = (annualSavings / initialInvestment) * 100;
    
    // Create labels for each year
    const labels = Array.from({ length: systemLifespan + 1 }, (_, i) => `Year ${i}`);
    
    // Generate threshold line at y=0 to show breakeven point
    const breakEvenConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Cumulative Cash Flow',
            data: cumulativeCashFlow,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            borderWidth: 2,
            fill: true
          },
          {
            label: 'Initial Investment',
            data: Array(systemLifespan + 1).fill(-initialInvestment),
            borderColor: 'rgba(255, 99, 132, 0.7)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Return on Investment Analysis'
          },
          subtitle: {
            display: true,
            text: `Payback Period: ${paybackPeriod.toFixed(1)} years | NPV: $${npv.toFixed(2)} | IRR: ${irr.toFixed(1)}%`
          },
          annotation: {
            annotations: {
              breakEven: {
                type: 'line',
                yMin: 0,
                yMax: 0,
                borderColor: 'rgb(0, 200, 0)',
                borderWidth: 2,
                label: {
                  display: true,
                  content: 'Break Even',
                  position: 'start'
                }
              },
              payback: {
                type: 'line',
                xMin: paybackPeriod,
                xMax: paybackPeriod,
                borderColor: 'rgb(0, 150, 0)',
                borderWidth: 2,
                borderDash: [5, 5],
                label: {
                  display: true,
                  content: `Payback: ${paybackPeriod.toFixed(1)} years`,
                  position: 'top'
                }
              }
            }
          } as any,
          tooltip: {
            callbacks: {
              label: (context) => {
                if (context.datasetIndex === 0) {
                  return `Cash Flow: $${(context.raw as number).toFixed(2)}`;
                } else {
                  return `Investment: $${(context.raw as number).toFixed(2)}`;
                }
              }
            }
          }
        },
        scales: {
          y: {
            title: {
              display: true,
              text: 'Cash Flow ($)'
            }
          }
        }
      }
    };

    return breakEvenConfig;
  }
} 