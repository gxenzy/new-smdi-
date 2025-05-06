
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
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
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
var TamEvaluation = function () {
    var _a = (0, react_1.useState)([
        // Perceived Usefulness
        {
            id: 'pu1',
            category: 'Perceived Usefulness',
            question: 'The energy audit tool helps me be more effective in my work',
            type: 'rating',
            value: 0,
        },
        {
            id: 'pu2',
            category: 'Perceived Usefulness',
            question: 'The tool provides valuable insights for energy management',
            type: 'rating',
            value: 0,
        },
        // Perceived Ease of Use
        {
            id: 'peou1',
            category: 'Perceived Ease of Use',
            question: 'The tool is easy to use and navigate',
            type: 'rating',
            value: 0,
        },
        {
            id: 'peou2',
            category: 'Perceived Ease of Use',
            question: 'Learning to use the tool was easy for me',
            type: 'rating',
            value: 0,
        },
        // Attitude Toward Using
        {
            id: 'att1',
            category: 'Attitude Toward Using',
            question: 'How satisfied are you with the tool overall?',
            type: 'radio',
            options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'],
            value: '',
        },
        // Behavioral Intention to Use
        {
            id: 'bi1',
            category: 'Behavioral Intention to Use',
            question: 'I intend to continue using the tool in the future',
            type: 'rating',
            value: 0,
        },
        // Feedback
        {
            id: 'fb1',
            category: 'Feedback',
            question: 'What improvements would you suggest for the tool?',
            type: 'text',
            value: '',
        },
    ]), questions = _a[0], setQuestions = _a[1];
    var _b = (0, react_1.useState)(false), submitting = _b[0], setSubmitting = _b[1];
    var _c = (0, react_1.useState)(false), submitted = _c[0], setSubmitted = _c[1];
    var handleValueChange = function (questionId, value) {
        setQuestions(function (prev) {
            return prev.map(function (q) {
                return q.id === questionId ? __assign(__assign({}, q), { value: value }) : q;
            });
        });
    };
    var calculateProgress = function () {
        var answered = questions.filter(function (q) {
            if (q.type === 'rating')
                return q.value > 0;
            if (q.type === 'radio')
                return q.value !== '';
            if (q.type === 'text')
                return q.value.trim() !== '';
            return false;
        }).length;
        return (answered / questions.length) * 100;
    };
    var handleSubmit = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setSubmitting(true);
                    // Simulate API call
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 1:
                    // Simulate API call
                    _a.sent();
                    setSubmitted(true);
                    setSubmitting(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var renderQuestion = function (question) {
        var _a;
        switch (question.type) {
            case 'rating':
                return (<material_1.Rating value={question.value} onChange={function (_, value) { return handleValueChange(question.id, value); }} size="large"/>);
            case 'radio':
                return (<material_1.FormControl component="fieldset">
            <material_1.RadioGroup value={question.value} onChange={function (e) { return handleValueChange(question.id, e.target.value); }}>
              {(_a = question.options) === null || _a === void 0 ? void 0 : _a.map(function (option) { return (<material_1.FormControlLabel key={option} value={option} control={<material_1.Radio />} label={option}/>); })}
            </material_1.RadioGroup>
          </material_1.FormControl>);
            case 'text':
                return (<material_1.TextField fullWidth multiline rows={4} value={question.value} onChange={function (e) { return handleValueChange(question.id, e.target.value); }} placeholder="Enter your feedback here..."/>);
            default:
                return null;
        }
    };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <material_1.Typography variant="h4">TAM Evaluation</material_1.Typography>
        <material_1.Box>
          <material_1.Button variant="contained" startIcon={<icons_material_1.Send />} onClick={handleSubmit} disabled={submitting || submitted || calculateProgress() < 100} sx={{ mr: 1 }}>
            {submitting ? 'Submitting...' : 'Submit Evaluation'}
          </material_1.Button>
          <material_1.Button variant="outlined" startIcon={<icons_material_1.Save />} disabled={submitting}>
            Save Draft
          </material_1.Button>
        </material_1.Box>
      </material_1.Box>

      <material_1.Box sx={{ mb: 3 }}>
        <material_1.Typography variant="body2" color="textSecondary" gutterBottom>
          Completion Progress
        </material_1.Typography>
        <material_1.LinearProgress variant="determinate" value={calculateProgress()} sx={{ mb: 1 }}/>
        <material_1.Typography variant="body2" color="textSecondary">
          {Math.round(calculateProgress())}% Complete
        </material_1.Typography>
      </material_1.Box>

      {submitted ? (<material_1.Card>
          <material_1.CardContent>
            <material_1.Box sx={{ textAlign: 'center', py: 3 }}>
              <icons_material_1.Assessment color="success" sx={{ fontSize: 60, mb: 2 }}/>
              <material_1.Typography variant="h5" gutterBottom>
                Thank you for your evaluation!
              </material_1.Typography>
              <material_1.Typography color="textSecondary">
                Your feedback will help us improve the energy audit tool.
              </material_1.Typography>
            </material_1.Box>
          </material_1.CardContent>
        </material_1.Card>) : (<material_1.Grid container spacing={3}>
          {questions.map(function (question, index) { return (<material_1.Grid item xs={12} key={question.id}>
              <material_1.Card>
                <material_1.CardContent>
                  <material_1.Box sx={{ mb: 2 }}>
                    <material_1.Chip label={question.category} color="primary" size="small" sx={{ mb: 1 }}/>
                    <material_1.Typography variant="h6" gutterBottom>
                      {index + 1}. {question.question}
                    </material_1.Typography>
                  </material_1.Box>
                  {renderQuestion(question)}
                </material_1.CardContent>
              </material_1.Card>
            </material_1.Grid>); })}
        </material_1.Grid>)}
    </material_1.Box>);
};
export default TamEvaluation;
