
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material");
var SystemTools = function () {
    var _a = (0, react_1.useState)({
        optimize: {
            id: 'optimize',
            running: false,
            progress: 0,
        },
        analyze: {
            id: 'analyze',
            running: false,
            progress: 0,
        },
        backup: {
            id: 'backup',
            running: false,
            progress: 0,
        },
    }), toolStatus = _a[0], setToolStatus = _a[1];
    var runTool = function (toolId_1) {
        var args_1 = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args_1[_i - 1] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([toolId_1], args_1, true), void 0, function (toolId, duration) {
            var interval, success;
            if (duration === void 0) { duration = 2000; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (toolStatus[toolId].running)
                            return [2 /*return*/];
                        setToolStatus(function (prev) {
                            var _a;
                            return (__assign(__assign({}, prev), (_a = {}, _a[toolId] = __assign(__assign({}, prev[toolId]), { running: true, progress: 0, result: undefined, message: undefined }), _a)));
                        });
                        interval = setInterval(function () {
                            setToolStatus(function (prev) {
                                var _a;
                                return (__assign(__assign({}, prev), (_a = {}, _a[toolId] = __assign(__assign({}, prev[toolId]), { progress: Math.min(prev[toolId].progress + 5, 100) }), _a)));
                            });
                        }, duration / 20);
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, duration); })];
                    case 1:
                        _a.sent();
                        clearInterval(interval);
                        success = Math.random() > 0.2;
                        setToolStatus(function (prev) {
                            var _a;
                            return (__assign(__assign({}, prev), (_a = {}, _a[toolId] = __assign(__assign({}, prev[toolId]), { running: false, progress: 100, result: success ? 'success' : 'error', message: success
                                    ? 'Operation completed successfully'
                                    : 'An error occurred during operation' }), _a)));
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    var renderToolCard = function (title, description, icon, toolId, actions) { return (<material_1.Card>
      <material_1.CardContent>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <material_1.Box sx={{ mr: 2 }}>{icon}</material_1.Box>
          <material_1.Box>
            <material_1.Typography variant="h6">{title}</material_1.Typography>
            <material_1.Typography variant="body2" color="textSecondary">
              {description}
            </material_1.Typography>
          </material_1.Box>
        </material_1.Box>

        {toolStatus[toolId].running && (<material_1.Box sx={{ mb: 2 }}>
            <material_1.LinearProgress variant="determinate" value={toolStatus[toolId].progress}/>
            <material_1.Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
              Progress: {Math.round(toolStatus[toolId].progress)}%
            </material_1.Typography>
          </material_1.Box>)}

        {toolStatus[toolId].result && (<material_1.Alert severity={toolStatus[toolId].result} sx={{ mb: 2 }}>
            {toolStatus[toolId].message}
          </material_1.Alert>)}

        <material_1.Box sx={{ display: 'flex', gap: 1 }}>
          {actions.map(function (action, index) { return (<material_1.Button key={index} variant="outlined" color={action.color || 'primary'} startIcon={action.icon} onClick={action.onClick} disabled={toolStatus[toolId].running}>
              {action.label}
            </material_1.Button>); })}
        </material_1.Box>
      </material_1.CardContent>
    </material_1.Card>); };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Typography variant="h4" sx={{ mb: 3 }}>
        System Tools
      </material_1.Typography>

      <material_1.Grid container spacing={3}>
        {/* System Optimization */}
        <material_1.Grid item xs={12} md={6}>
          {renderToolCard('System Optimization', 'Optimize system performance and clean up temporary files', <icons_material_1.BuildCircle color="primary" sx={{ fontSize: 40 }}/>, 'optimize', [
            {
                label: 'Run Optimization',
                icon: <icons_material_1.Speed />,
                onClick: function () { return runTool('optimize'); },
            },
        ])}
        </material_1.Grid>

        {/* System Analysis */}
        <material_1.Grid item xs={12} md={6}>
          {renderToolCard('System Analysis', 'Analyze system health and generate reports', <icons_material_1.Memory color="secondary" sx={{ fontSize: 40 }}/>, 'analyze', [
            {
                label: 'Run Analysis',
                icon: <icons_material_1.Check />,
                onClick: function () { return runTool('analyze', 3000); },
            },
            {
                label: 'Export Report',
                icon: <icons_material_1.CloudUpload />,
                onClick: function () { return console.log('Export report'); },
                color: 'secondary',
            },
        ])}
        </material_1.Grid>

        {/* Database Tools */}
        <material_1.Grid item xs={12}>
          {renderToolCard('Database Management', 'Manage database operations and maintenance', <icons_material_1.Storage color="info" sx={{ fontSize: 40 }}/>, 'backup', [
            {
                label: 'Backup Database',
                icon: <icons_material_1.CloudUpload />,
                onClick: function () { return runTool('backup'); },
            },
            {
                label: 'Import Data',
                icon: <icons_material_1.CloudDownload />,
                onClick: function () { return console.log('Import data'); },
                color: 'secondary',
            },
            {
                label: 'Sync Data',
                icon: <icons_material_1.Refresh />,
                onClick: function () { return console.log('Sync data'); },
                color: 'secondary',
            },
        ])}
        </material_1.Grid>
      </material_1.Grid>

      {/* System Status */}
      <material_1.Card sx={{ mt: 3 }}>
        <material_1.CardContent>
          <material_1.Typography variant="h6" gutterBottom>
            System Status
          </material_1.Typography>
          <material_1.List>
            <material_1.ListItem>
              <material_1.ListItemIcon>
                <icons_material_1.Speed color="primary"/>
              </material_1.ListItemIcon>
              <material_1.ListItemText primary="System Performance" secondary="CPU Usage: 45% | Memory Usage: 60%"/>
              <material_1.Chip label="Good" color="success" size="small"/>
            </material_1.ListItem>
            <material_1.Divider />
            <material_1.ListItem>
              <material_1.ListItemIcon>
                <icons_material_1.Storage color="info"/>
              </material_1.ListItemIcon>
              <material_1.ListItemText primary="Database Status" secondary="Last Backup: 2 hours ago"/>
              <material_1.Chip label="Healthy" color="success" size="small"/>
            </material_1.ListItem>
            <material_1.Divider />
            <material_1.ListItem>
              <material_1.ListItemIcon>
                <icons_material_1.Memory color="warning"/>
              </material_1.ListItemIcon>
              <material_1.ListItemText primary="Storage Status" secondary="Used: 75% | Available: 25%"/>
              <material_1.Chip label="Warning" color="warning" size="small"/>
            </material_1.ListItem>
          </material_1.List>
        </material_1.CardContent>
      </material_1.Card>
    </material_1.Box>);
};
export default SystemTools;
