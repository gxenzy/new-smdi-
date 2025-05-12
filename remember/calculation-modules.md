# Energy Audit Calculation Modules

This document details the calculation modules required for the energy audit platform, focusing on formulas, inputs, outputs, and standards compliance.

## 1. Lighting System Calculations

### 1.1 Illumination Level Calculator

**Purpose**: Calculate required illumination levels for different spaces based on room dimensions and usage.

**Inputs**:
- Room dimensions (length, width, height)
- Room type/purpose (classroom, office, laboratory, etc.)
- Surface reflectance values (ceiling, walls, floor)
- Maintenance factor
- Work plane height

**Formulas**:
```
E = (Φ × n × UF × MF) / A

Where:
E = Illuminance level (lux)
Φ = Luminous flux per lamp (lumens)
n = Number of lamps
UF = Utilization factor (based on room index and reflectance)
MF = Maintenance factor
A = Area of the working plane (m²)

Room Index (K) = (L × W) / [Hm × (L + W)]
Where:
L = Room length
W = Room width
Hm = Mounting height above working plane
```

**Outputs**:
- Required illumination level (lux)
- Compliance status with PEC Rule 1075
- Recommended number of fixtures
- Uniformity ratio

**Standards Reference**:
- Philippine Electrical Code (PEC) Rule 1075
- Department of Education (DepEd) standards for educational facilities
- Illuminating Engineering Society (IES) recommendations

### 1.2 Lighting Power Density Calculator

**Purpose**: Calculate and evaluate lighting power density to assess energy efficiency.

**Inputs**:
- Room area (m²)
- Fixture types and quantities
- Lamp wattage per fixture
- Ballast/driver factors

**Formulas**:
```
LPD = Total Lighting Power / Floor Area

Where:
Total Lighting Power = Σ(Fixture Quantity × Wattage per Fixture × Ballast Factor)
```

**Outputs**:
- Lighting Power Density (W/m²)
- Compliance with energy efficiency standards
- Potential energy savings with alternative fixtures
- Annual energy consumption estimate

**Standards Reference**:
- Philippine Green Building Code
- ASHRAE 90.1 Energy Standard
- Department of Energy guidelines

### 1.3 Daylight Integration Calculator

**Purpose**: Estimate daylight contribution and potential energy savings.

**Inputs**:
- Window dimensions and orientation
- Window transmittance properties
- Building location (latitude/longitude)
- Time of year/day
- Surrounding obstructions

**Formulas**:
```
DF = (Ei / Eo) × 100%

Where:
DF = Daylight Factor (%)
Ei = Interior illuminance at a point (lux)
Eo = Exterior horizontal illuminance under standard CIE overcast sky (lux)

Annual Daylight Availability = Σ(hourly daylight availability × operating hours)
```

**Outputs**:
- Daylight factor distribution
- Annual daylight availability
- Potential energy savings from daylight harvesting
- Recommended lighting controls strategy

**Standards Reference**:
- LEED daylighting requirements
- Philippine Green Building Code
- IES recommended practices for daylighting

## 2. Power Quality Analysis

### 2.1 Harmonic Distortion Calculator

**Purpose**: Analyze harmonic distortion levels and recommend mitigation measures.

**Inputs**:
- Voltage/current waveform measurements
- Load types and characteristics
- System configuration

**Formulas**:
```
THDv = √(Σ Vh² / V1²) × 100%

Where:
THDv = Total Harmonic Distortion for voltage
Vh = RMS voltage of harmonic h
V1 = RMS voltage of fundamental frequency

THDi = √(Σ Ih² / I1²) × 100%

Where:
THDi = Total Harmonic Distortion for current
Ih = RMS current of harmonic h
I1 = RMS current of fundamental frequency
```

**Outputs**:
- Total Harmonic Distortion (THD) for voltage and current
- Individual harmonic components
- Compliance status with standards
- Recommended filtering solutions

**Standards Reference**:
- IEEE 519-2014
- Philippine Distribution Code
- IEC 61000-3-2

### 2.2 Power Factor Calculator

**Purpose**: Calculate power factor and determine correction requirements.

**Inputs**:
- Active power (kW)
- Reactive power (kVAR)
- Apparent power (kVA)
- Voltage and current measurements

**Formulas**:
```
PF = P / S = cos(φ)

Where:
PF = Power Factor
P = Active Power (W)
S = Apparent Power (VA)
φ = Phase angle between voltage and current

Qc = P × [tan(φ1) - tan(φ2)]

Where:
Qc = Reactive power required for correction (VAR)
φ1 = Original phase angle
φ2 = Target phase angle
```

**Outputs**:
- Current power factor
- Target power factor
- Required capacitance for correction (kVAR)
- Annual cost savings from power factor improvement

**Standards Reference**:
- Philippine Distribution Code
- IEEE 1459-2010
- Utility company requirements

### 2.3 Voltage Regulation Calculator

**Purpose**: Assess voltage regulation and stability issues.

**Inputs**:
- Nominal voltage
- Measured voltage at various points
- Load characteristics
- Conductor properties

**Formulas**:
```
%VR = [(Vno-load - Vfull-load) / Vno-load] × 100%

Voltage Drop = IR × cos(φ) + IX × sin(φ)

Where:
%VR = Voltage Regulation percentage
Vno-load = No-load voltage
Vfull-load = Full-load voltage
I = Current
R = Resistance
X = Reactance
φ = Phase angle
```

**Outputs**:
- Voltage regulation percentage
- Voltage drop calculation
- Compliance with allowable limits
- Recommendations for improvement

**Standards Reference**:
- Philippine Electrical Code
- ANSI C84.1
- IEEE 1159-2019

## 3. Load Analysis and Energy Consumption

### 3.1 Load Schedule Calculator

**Purpose**: Create detailed load schedules and analyze distribution.

**Inputs**:
- Equipment list with ratings
- Operating hours
- Diversity factors
- Demand factors
- Power factors

**Formulas**:
```
Connected Load = Σ(Equipment Rating)

Maximum Demand = Connected Load × Demand Factor

Diversified Demand = Maximum Demand × Diversity Factor

Annual Energy Consumption = Σ(Power Rating × Usage Hours × Load Factor)
```

**Outputs**:
- Connected load (kW)
- Maximum demand (kVA)
- Diversified demand
- Load factor
- Annual energy consumption (kWh)

**Standards Reference**:
- Philippine Electrical Code
- IEEE 241 (Gray Book)
- NFPA 70

### 3.2 Energy Consumption Analyzer

**Purpose**: Analyze energy consumption patterns and identify savings opportunities.

**Inputs**:
- Historical energy consumption data
- Utility rate structures
- Building occupancy schedules
- Weather data

**Formulas**:
```
Energy Use Intensity (EUI) = Annual Energy Consumption / Gross Floor Area

Base Load = Minimum energy consumption during unoccupied periods

Weather-Normalized Consumption = Actual Consumption × (Typical Year HDD+CDD) / (Actual Year HDD+CDD)
```

**Outputs**:
- Energy use intensity (kWh/m²/year)
- Base load identification
- Peak demand periods
- Weather-normalized consumption
- Benchmarking comparison

**Standards Reference**:
- ASHRAE Building Energy Quotient
- Philippine Energy Efficiency Project guidelines
- ISO 50001 Energy Management System

### 3.3 Peak Demand Analyzer

**Purpose**: Analyze peak demand patterns and recommend reduction strategies.

**Inputs**:
- Interval meter data (15-minute or hourly)
- Equipment operation schedules
- Utility rate structures
- Load profiles of major equipment

**Formulas**:
```
Load Factor = Average Demand / Peak Demand

Peak Demand Savings = Original Peak - New Peak

Demand Charge Savings = Peak Reduction × Demand Rate
```

**Outputs**:
- Peak demand profile
- Load factor calculation
- Load shifting opportunities
- Potential demand charge savings
- Recommended control strategies

**Standards Reference**:
- Utility company demand response programs
- ASHRAE Guideline 14
- Department of Energy demand-side management guidelines

## 4. HVAC System Analysis

### 4.1 Cooling Load Calculator

**Purpose**: Calculate cooling requirements based on building characteristics.

**Inputs**:
- Room dimensions
- Building envelope properties
- Occupancy levels
- Equipment heat gains
- Lighting loads
- Weather data

**Formulas**:
```
Q = U × A × ΔT

Where:
Q = Heat transfer (W)
U = Overall heat transfer coefficient (W/m²·K)
A = Area (m²)
ΔT = Temperature difference (K)

Total Cooling Load = Σ(External loads + Internal loads + Ventilation loads)
```

**Outputs**:
- Cooling load requirements (BTU/h or tons)
- Load breakdown by source
- Equipment sizing recommendations
- Energy efficiency opportunities

**Standards Reference**:
- ASHRAE Fundamentals
- ASHRAE 90.1
- Philippine Green Building Code

### 4.2 HVAC Efficiency Calculator

**Purpose**: Evaluate HVAC system efficiency and improvement potential.

**Inputs**:
- Equipment specifications
- Operating conditions
- Measured performance data
- Energy consumption

**Formulas**:
```
COP = Cooling Output / Power Input

EER = BTU/h Output / Watt Input

SEER = Seasonal Cooling Output / Seasonal Energy Input

kW/ton = Power Input (kW) / Cooling Output (tons)
```

**Outputs**:
- Coefficient of Performance (COP)
- Energy Efficiency Ratio (EER)
- Seasonal Energy Efficiency Ratio (SEER)
- kW/ton efficiency metric
- Comparison to high-efficiency alternatives

**Standards Reference**:
- Philippine National Standards for air conditioners
- ASHRAE 90.1 minimum efficiency requirements
- Department of Energy guidelines

## 5. Financial Analysis

### 5.1 ROI Calculator

**Purpose**: Calculate return on investment for energy efficiency measures.

**Inputs**:
- Implementation costs
- Projected energy savings
- Utility rates
- Maintenance impacts
- Equipment lifetime
- Discount rate

**Formulas**:
```
Simple Payback Period = Initial Investment / Annual Savings

ROI = (Net Profit / Cost of Investment) × 100%

NPV = Σ(Ct / (1+r)^t) - C0

Where:
Ct = Net cash flow during period t
r = Discount rate
t = Time period
C0 = Initial investment
```

**Outputs**:
- Simple payback period
- Return on Investment percentage
- Net Present Value (NPV)
- Internal Rate of Return (IRR)
- Life Cycle Cost Analysis

**Standards Reference**:
- ASHRAE 90.1 Appendix G
- International Performance Measurement and Verification Protocol (IPMVP)
- Department of Energy financial analysis guidelines

### 5.2 Energy Cost Savings Calculator

**Purpose**: Project energy cost savings from efficiency improvements.

**Inputs**:
- Current energy consumption
- Projected consumption after improvements
- Utility rate structures
- Escalation rates
- Implementation timeline

**Formulas**:
```
Annual Savings = Σ[(Baseline kWh - Proposed kWh) × Rate]

Lifetime Savings = Σ(Annual Savings × (1 + Escalation Rate)^Year)
```

**Outputs**:
- Annual cost savings
- Lifetime cost savings
- Greenhouse gas emission reductions
- Sensitivity analysis with different scenarios
- Graphical representation of savings

**Standards Reference**:
- ASHRAE 14 Measurement of Energy and Demand Savings
- Federal Energy Management Program (FEMP) guidelines
- ISO 50001 Energy Management System

## 6. Standards Compliance Calculators

### 6.1 PEC Compliance Checker

**Purpose**: Verify compliance with Philippine Electrical Code requirements.

**Inputs**:
- Electrical system design parameters
- Installation details
- Equipment specifications
- Protection schemes

**Outputs**:
- Compliance status by code section
- Identified violations
- Required corrections
- Documentation for approval submissions

**Standards Reference**:
- Philippine Electrical Code (latest edition)
- Local building code requirements
- Utility company regulations

### 6.2 Green Building Compliance Calculator

**Purpose**: Assess compliance with green building standards.

**Inputs**:
- Building design parameters
- Energy efficiency measures
- Water conservation features
- Material specifications
- Indoor environmental quality factors

**Outputs**:
- Potential certification level
- Points achieved by category
- Improvement recommendations
- Documentation requirements

**Standards Reference**:
- BERDE (Building for Ecologically Responsive Design Excellence)
- LEED (Leadership in Energy and Environmental Design)
- Philippine Green Building Code

## 7. Specialized Calculators

### 7.1 Transformer Sizing Calculator

**Purpose**: Determine appropriate transformer capacity and evaluate losses.

**Inputs**:
- Connected load
- Demand factors
- Future expansion needs
- Voltage requirements
- Load characteristics

**Formulas**:
```
Transformer kVA = (Total Load kVA) / Loading Factor

Transformer Losses = No-Load Losses + (Load Losses × Load Factor²)

Annual Energy Loss = Transformer Losses × 8760 hours
```

**Outputs**:
- Required transformer capacity
- Loading percentage
- Energy losses calculation
- Efficiency at various load levels
- Cost comparison of different efficiency options

**Standards Reference**:
- IEEE C57.12 series
- Philippine Distribution Code
- Department of Energy efficiency requirements

### 7.2 Emergency Power System Calculator

**Purpose**: Size emergency power systems and evaluate backup requirements.

**Inputs**:
- Critical loads list
- Required backup time
- Starting characteristics
- Fuel consumption rates
- Transfer requirements

**Formulas**:
```
Generator Size (kVA) = Maximum Demand (kW) / Power Factor

Fuel Consumption = Generator Size × Specific Fuel Consumption × Runtime

Battery Capacity (Ah) = (Load Current × Backup Time) / (DOD × System Voltage)
```

**Outputs**:
- Required generator capacity
- Fuel storage requirements
- Battery system sizing
- Autonomy verification
- Compliance with safety standards

**Standards Reference**:
- NFPA 110 Standard for Emergency Power Systems
- Philippine Electrical Code requirements for emergency systems
- IEEE 446 (Orange Book)

### 7.3 Renewable Energy Integration Calculator

**Purpose**: Evaluate potential for renewable energy integration.

**Inputs**:
- Building location and orientation
- Available installation area
- Local climate data
- Energy consumption profile
- Utility interconnection requirements

**Formulas**:
```
Solar PV Output = Rated Capacity × PSH × System Efficiency

Where:
PSH = Peak Sun Hours

Annual Energy Production = Σ(Daily Production × 365)

Simple Payback = System Cost / (Annual Energy Production × Electricity Rate)
```

**Outputs**:
- Potential renewable energy generation
- System sizing recommendations
- Financial analysis (ROI, payback)
- Carbon emission reduction
- Grid integration requirements

**Standards Reference**:
- Philippine Renewable Energy Act guidelines
- Philippine Electrical Code provisions for renewable energy
- IEEE 1547 Standard for Interconnection 