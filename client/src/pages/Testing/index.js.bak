
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create(Object.prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _ = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material");
const TestingPage = () => {
    var _a = (0, react_1.useState)([
        {
            id: '1',
            category: 'Load Calculation',
            name: 'Load Calculation Accuracy',
            description: 'Verify the accuracy of electrical load calculations against PEC standards',
            status: 'pending',
            steps: [
                {
                    id: '1.1',
                    description: 'Calculate total connected load',
                    status: 'pending',
                    input: {
                        lights: 1200,
                        outlets: 2400,
                        hvac: 3500,
                    },
                    expectedOutput: 7100,
                },
                {
                    id: '1.2',
                    description: 'Apply demand factors',
                    status: 'pending',
                    input: {
                        demandFactor: 0.8,
                    },
                    expectedOutput: 5680,
                },
                {
                    id: '1.3',
                    description: 'Verify voltage drop calculations',
                    status: 'pending',
                    input: {
                        current: 25,
                        length: 50,
                        voltage: 230,
                    },
                    expectedOutput: '< 3%',
                },
            ],
            requirements: [
                'Total load must be calculated with ±2% accuracy',
                'Demand factors must comply with PEC Table 3.2',
                'Voltage drop must not exceed 3%',
            ],
            standards: [
                'PEC 1 Section 3.1.2 - Load Calculations',
                'PEC 1 Table 3.2 - Demand Factors',
            ],
        },
        {
            id: '2',
            category: 'PEC Compliance',
            name: 'PEC Standards Compliance',
            description: 'Evaluate compliance with Philippine Electrical Code requirements',
            status: 'pending',
            steps: [
                {
                    id: '2.1',
                    description: 'Verify conductor sizing',
                    status: 'pending',
                    input: {
                        current: 30,
                        temperature: 75,
                        material: 'copper',
                    },
                    expectedOutput: '10 AWG',
                },
                {
                    id: '2.2',
                    description: 'Check overcurrent protection',
                    status: 'pending',
                    input: {
                        conductorAmpacity: 30,
                        load: 25,
                    },
                    expectedOutput: '30A breaker',
                },
                {
                    id: '2.3',
                    description: 'Validate grounding system',
                    status: 'pending',
                    input: {
                        systemType: 'TN-S',
                        voltage: 230,
                    },
                    expectedOutput: 'Compliant',
                },
            ],
            requirements: [
                'Conductor sizes must meet minimum PEC requirements',
                'Overcurrent protection must be properly coordinated',
                'Grounding system must comply with PEC Article 5.0',
            ],
            standards: [
                'PEC 1 Article 3.0 - Wiring and Protection',
                'PEC 1 Article 5.0 - Grounding',
            ],
        },
        {
            id: '3',
            category: 'Energy Management',
            name: 'Energy Management Guidelines',
            description: 'Validate adherence to energy management handbook guidelines',
            status: 'pending',
            steps: [
                {
                    id: '3.1',
                    description: 'Check power factor correction',
                    status: 'pending',
                    input: {
                        actualPF: 0.85,
                        targetPF: 0.95,
                    },
                    expectedOutput: 'Correction needed',
                },
                {
                    id: '3.2',
                    description: 'Evaluate lighting efficiency',
                    status: 'pending',
                    input: {
                        area: 100,
                        wattage: 1000,
                    },
                    expectedOutput: '10 W/m²',
                },
                {
                    id: '3.3',
                    description: 'Assess HVAC performance',
                    status: 'pending',
                    input: {
                        cooling: 36000,
                        power: 3500,
                    },
                    expectedOutput: 'EER > 10',
                },
            ],
            requirements: [
                'Power factor must be at least 0.95',
                'Lighting power density must meet energy code',
                'HVAC systems must meet minimum efficiency ratings',
            ],
            standards: [
                'Energy Management Handbook Ch. 4 - Power Factor',
                'Energy Management Handbook Ch. 7 - Lighting',
                'Energy Management Handbook Ch. 9 - HVAC',
            ],
        },
    ]), testCases = _a[0] || [], setTestCases = _a[1];
    var _b = (0, react_1.useState)(null), activeTest = _b[0], setActiveTest = _b[1];
    var _c = (0, react_1.useState)(0), progress = _c[0], setProgress = _c[1];
    var runTest = function (testId) { return __awaiter(void 0, void 0, void 0, function () {
        var test, _i, _a, step, allStepsPassed;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setActiveTest(testId);
                    test = testCases.find(function (t) { return t.id === testId; });
                    if (!test)
                        return [2 /*return*/];
                    // Update test status to running
                    updateTestStatus(testId, 'running');
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    step = _a[_i];
                    return [4 /*yield*/, runTestStep(testId, step.id)];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    allStepsPassed = test.steps.every(function (step) { return step.status === 'completed'; });
                    updateTestStatus(testId, allStepsPassed ? 'passed' : 'failed');
                    setActiveTest(null);
                    return [2 /*return*/];
            }
        });
    }); };
    var runTestStep = function (testId, stepId) { return __awaiter(void 0, void 0, void 0, function () {
        var success, test, completedSteps;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                    // Simulate step execution
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 1:
                    // Simulate step execution
                    _a.sent();
                    success = Math.random() > 0.3;
                    updateStepStatus(testId, stepId, success ? 'completed' : 'failed');
                    test = testCases.find(function (t) { return t.id === testId; });
                    if (test) {
                        completedSteps = test.steps.filter(function (s) { return s.status === 'completed'; }).length;
                        setProgress((completedSteps / test.steps.length) * 100);
                    }
                    return [2 /*return*/];
            }
        });
    }); };
    var updateTestStatus = function (testId, status) {
        setTestCases(function (prev) {
            return prev.map(function (test) {
                return test.id === testId
                    ? __assign(__assign({}, test), { status: status }) : test;
            });
        });
    };
    var updateStepStatus = function (testId, stepId, status) {
        setTestCases(function (prev) {
            return prev.map(function (test) {
                return test.id === testId
                    ? __assign(__assign({}, test), { steps: test.steps.map(function (step) {
                            return step.id === stepId
                                ? __assign(__assign({}, step), { status: status }) : step;
                        }) }) : test;
            });
        });
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case 'passed':
                return <icons_material_1.CheckCircle color="success"/>;
            case 'failed':
                return <icons_material_1.Error color="error"/>;
            case 'warning':
                return <icons_material_1.Warning color="warning"/>;
            case 'running':
                return <icons_material_1.Speed color="info"/>;
            default:
                return null;
        }
    };
    var getCategoryIcon = function (category) {
        switch (category) {
            case 'Load Calculation':
                return <icons_material_1.Calculate />;
            case 'PEC Compliance':
                return <icons_material_1.Rule />;
            case 'Energy Management':
                return <icons_material_1.MenuBook />;
            default:
                return null;
        }
    };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <material_1.Typography variant="h4">Testing</material_1.Typography>
        <material_1.Button variant="contained" startIcon={<icons_material_1.Save />} disabled={!testCases.some(function (t) { return t.status === 'passed' || t.status === 'failed'; })}>
          Export Results
        </material_1.Button>
      </material_1.Box>

      <material_1.Grid container spacing={3}>
        {testCases.map(function (test) { return (<material_1.Grid item xs={12} key={test.id}>
            <material_1.Card>
              <material_1.CardContent>
                <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <material_1.Box sx={{ mr: 2 }}>{getCategoryIcon(test.category)}</material_1.Box>
                  <material_1.Box sx={{ flexGrow: 1 }}>
                    <material_1.Typography variant="h6">
                      {test.name}
                      {test.status !== 'pending' && (<material_1.Box component="span" sx={{ ml: 2 }}>
                          {getStatusIcon(test.status)}
                        </material_1.Box>)}
                    </material_1.Typography>
                    <material_1.Typography color="textSecondary">{test.description}</material_1.Typography>
                  </material_1.Box>
                  <material_1.Button variant="contained" startIcon={test.status === 'running' ? <icons_material_1.Stop /> : <icons_material_1.PlayArrow />} onClick={function () { return runTest(test.id); }} disabled={test.status === 'running' || activeTest !== null}>
                    {test.status === 'running' ? 'Running...' : 'Run Test'}
                  </material_1.Button>
                </material_1.Box>

                {test.status === 'running' && (<material_1.Box sx={{ mb: 2 }}>
                    <material_1.LinearProgress variant="determinate" value={progress}/>
                  </material_1.Box>)}

                <material_1.Stepper orientation="vertical">
                  {test.steps.map(function (step) { return (<material_1.Step key={step.id} active={step.status !== 'pending'} completed={step.status === 'completed'}>
                      <material_1.StepLabel error={step.status === 'failed'}>
                        {step.description}
                      </material_1.StepLabel>
                      <material_1.StepContent>
                        <material_1.Box sx={{ mb: 2 }}>
                          <material_1.Typography variant="subtitle2">Input Parameters:</material_1.Typography>
                          <pre>{JSON.stringify(step.input, null, 2)}</pre>
                          <material_1.Typography variant="subtitle2">Expected Output:</material_1.Typography>
                          <pre>{JSON.stringify(step.expectedOutput, null, 2)}</pre>
                        </material_1.Box>
                      </material_1.StepContent>
                    </material_1.Step>); })}
                </material_1.Stepper>

                <material_1.Divider sx={{ my: 2 }}/>

                <material_1.Box>
                  <material_1.Typography variant="subtitle2" gutterBottom>
                    Requirements:
                  </material_1.Typography>
                  <material_1.List dense>
                    {test.requirements.map(function (req, index) { return (<material_1.ListItem key={index}>
                        <material_1.ListItemIcon>
                          <icons_material_1.CheckCircle color="primary"/>
                        </material_1.ListItemIcon>
                        <material_1.ListItemText primary={req}/>
                      </material_1.ListItem>); })}
                  </material_1.List>
                </material_1.Box>

                <material_1.Box sx={{ mt: 2 }}>
                  <material_1.Typography variant="subtitle2" gutterBottom>
                    Applicable Standards:
                  </material_1.Typography>
                  <material_1.List dense>
                    {test.standards.map(function (std, index) { return (<material_1.ListItem key={index}>
                        <material_1.ListItemIcon>
                          <icons_material_1.Rule color="secondary"/>
                        </material_1.ListItemIcon>
                        <material_1.ListItemText primary={std}/>
                      </material_1.ListItem>); })}
                  </material_1.List>
                </material_1.Box>
              </material_1.CardContent>
            </material_1.Card>
          </material_1.Grid>); })}
      </material_1.Grid>
    </material_1.Box>);
};
export default TestingPage;
