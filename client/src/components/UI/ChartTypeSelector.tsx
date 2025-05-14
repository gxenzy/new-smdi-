import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  useTheme
} from '@mui/material';
import PieChartIcon from '@mui/icons-material/PieChart';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { TableChart as TableIcon } from '@mui/icons-material';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import { ChartConfiguration } from 'chart.js';
import AccessibilityTester from './AccessibilityTester';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `chart-tab-${index}`,
    'aria-controls': `chart-tabpanel-${index}`,
  };
};

/**
 * Component that allows selection of different chart types for accessibility testing
 */
const ChartTypeSelector: React.FC = () => {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Bar chart configuration
  const barChartConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['Lighting', 'HVAC', 'Equipment', 'Plug Loads', 'Other'],
      datasets: [{
        label: 'Energy Consumption (kWh)',
        data: [12500, 28000, 9500, 8500, 3000],
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Energy Consumption by Category'
        },
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy (kWh)'
          }
        }
      }
    }
  };

  // Line chart configuration
  const lineChartConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Electricity (kWh)',
          data: [28500, 26400, 27800, 25900, 29200, 32500, 38000, 37200, 31500, 28800, 27400, 29600],
          borderColor: theme.palette.primary.main,
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.1,
          fill: true
        },
        {
          label: 'Natural Gas (kWh)',
          data: [15200, 14600, 9800, 6200, 3900, 2100, 1800, 2000, 4300, 8700, 12400, 14800],
          borderColor: theme.palette.error.main,
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          tension: 0.1,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Energy Consumption Trends'
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Energy (kWh)'
          }
        }
      }
    }
  };

  // Pie chart configuration
  const pieChartConfig: ChartConfiguration = {
    type: 'pie',
    data: {
      labels: ['Lighting', 'HVAC', 'Equipment', 'Plug Loads', 'Other'],
      datasets: [{
        data: [25, 40, 15, 15, 5],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main
        ],
        borderWidth: 1,
        borderColor: theme.palette.divider
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Energy Usage Distribution'
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  };

  // Doughnut chart configuration
  const doughnutChartConfig: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: ['Lighting', 'HVAC', 'Equipment', 'Plug Loads', 'Other'],
      datasets: [{
        data: [25, 40, 15, 15, 5],
        backgroundColor: [
          theme.palette.primary.main,
          theme.palette.secondary.main,
          theme.palette.success.main,
          theme.palette.warning.main,
          theme.palette.error.main
        ],
        borderWidth: 1,
        borderColor: theme.palette.divider
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Energy Usage Distribution'
        },
        legend: {
          position: 'bottom'
        }
      }
    }
  };

  // Scatter chart configuration
  const bubbleChartConfig: ChartConfiguration = {
    type: 'bubble',
    data: {
      datasets: [
        {
          label: 'Office Buildings',
          data: [
            { x: 45, y: 80, r: 15 },
            { x: 30, y: 60, r: 10 },
            { x: 60, y: 75, r: 20 },
            { x: 75, y: 85, r: 25 },
            { x: 40, y: 70, r: 12 }
          ],
          backgroundColor: 'rgba(33, 150, 243, 0.5)'
        },
        {
          label: 'Residential Buildings',
          data: [
            { x: 20, y: 30, r: 10 },
            { x: 25, y: 40, r: 8 },
            { x: 15, y: 25, r: 12 },
            { x: 30, y: 35, r: 15 },
            { x: 10, y: 20, r: 5 }
          ],
          backgroundColor: 'rgba(76, 175, 80, 0.5)'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Building Efficiency Comparison'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const raw = context.raw as { r: number, x: number, y: number };
              return `${context.dataset.label}: (Size: ${raw.r}, EUI: ${raw.x}, Score: ${raw.y})`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Energy Use Intensity (kBtu/sqft)'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Energy Star Score'
          }
        }
      }
    }
  };

  // Radar chart configuration
  const radarChartConfig: ChartConfiguration = {
    type: 'radar',
    data: {
      labels: ['Energy Efficiency', 'Water Usage', 'Waste Management', 'Indoor Air Quality', 'Materials', 'Site Sustainability'],
      datasets: [
        {
          label: 'Current Building',
          data: [65, 59, 90, 81, 56, 55],
          fill: true,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgb(54, 162, 235)',
          pointBackgroundColor: 'rgb(54, 162, 235)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(54, 162, 235)'
        },
        {
          label: 'Target Performance',
          data: [85, 80, 95, 90, 85, 80],
          fill: true,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgb(255, 99, 132)',
          pointBackgroundColor: 'rgb(255, 99, 132)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(255, 99, 132)'
        }
      ]
    },
    options: {
      elements: {
        line: {
          borderWidth: 3
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Building Sustainability Performance'
        }
      }
    }
  };

  return (
    <Paper sx={{ width: '100%', mb: 4 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabIndex} 
          onChange={handleTabChange} 
          aria-label="Chart type tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<BarChartIcon />} label="Bar Chart" {...a11yProps(0)} />
          <Tab icon={<ShowChartIcon />} label="Line Chart" {...a11yProps(1)} />
          <Tab icon={<PieChartIcon />} label="Pie Chart" {...a11yProps(2)} />
          <Tab icon={<DonutLargeIcon />} label="Doughnut Chart" {...a11yProps(3)} />
          <Tab icon={<BubbleChartIcon />} label="Bubble Chart" {...a11yProps(4)} />
          <Tab icon={<TableIcon />} label="Radar Chart" {...a11yProps(5)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabIndex} index={0}>
        <AccessibilityTester
          title="Bar Chart Accessibility Test"
          chartConfig={barChartConfig}
          themeName="energy"
        />
      </TabPanel>
      
      <TabPanel value={tabIndex} index={1}>
        <AccessibilityTester
          title="Line Chart Accessibility Test"
          chartConfig={lineChartConfig}
          themeName="energy"
        />
      </TabPanel>
      
      <TabPanel value={tabIndex} index={2}>
        <AccessibilityTester
          title="Pie Chart Accessibility Test"
          chartConfig={pieChartConfig}
          themeName="energy"
        />
      </TabPanel>
      
      <TabPanel value={tabIndex} index={3}>
        <AccessibilityTester
          title="Doughnut Chart Accessibility Test"
          chartConfig={doughnutChartConfig}
          themeName="energy"
        />
      </TabPanel>
      
      <TabPanel value={tabIndex} index={4}>
        <AccessibilityTester
          title="Bubble Chart Accessibility Test"
          chartConfig={bubbleChartConfig}
          themeName="financial"
        />
      </TabPanel>
      
      <TabPanel value={tabIndex} index={5}>
        <AccessibilityTester
          title="Radar Chart Accessibility Test"
          chartConfig={radarChartConfig}
          themeName="default"
        />
      </TabPanel>
    </Paper>
  );
};

export default ChartTypeSelector; 