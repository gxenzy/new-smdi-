
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
var AdminSettings = function () {
    var _a = (0, react_1.useState)({
        maxUsers: 100,
        sessionTimeout: 30,
        backupFrequency: 24,
        emailNotifications: true,
        maintenanceMode: false,
        debugMode: false,
        apiUrl: 'http://localhost:5000',
        allowRegistration: false,
    }), settings = _a[0], setSettings = _a[1];
    var _b = (0, react_1.useState)(false), saveSuccess = _b[0], setSaveSuccess = _b[1];
    var _c = (0, react_1.useState)(false), backupInProgress = _c[0], setBackupInProgress = _c[1];
    var handleSettingChange = function (key, value) {
        setSettings(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[key] = value, _a)));
        });
    };
    var handleSaveSettings = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Here you would typically make an API call to save settings
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                case 1:
                    // Here you would typically make an API call to save settings
                    _a.sent();
                    setSaveSuccess(true);
                    setTimeout(function () { return setSaveSuccess(false); }, 3000);
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error saving settings:', error_1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    var handleBackup = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    setBackupInProgress(true);
                    // Simulate backup process
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 2000); })];
                case 1:
                    // Simulate backup process
                    _a.sent();
                    setBackupInProgress(false);
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error during backup:', error_2);
                    setBackupInProgress(false);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    return (<material_1.Box sx={{ p: 3 }}>
      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <material_1.Typography variant="h4">Admin Settings</material_1.Typography>
        <material_1.Box>
          <material_1.Button variant="outlined" startIcon={backupInProgress ? <icons_material_1.Settings /> : <icons_material_1.Backup />} onClick={handleBackup} disabled={backupInProgress} sx={{ mr: 1 }}>
            {backupInProgress ? 'Backing up...' : 'Backup System'}
          </material_1.Button>
          <material_1.Button variant="contained" startIcon={<icons_material_1.Save />} onClick={handleSaveSettings}>
            Save Settings
          </material_1.Button>
        </material_1.Box>
      </material_1.Box>

      {saveSuccess && (<material_1.Alert severity="success" sx={{ mb: 3 }}>
          Settings saved successfully!
        </material_1.Alert>)}

      <material_1.Grid container spacing={3}>
        {/* System Configuration */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                System Configuration
              </material_1.Typography>
              <material_1.List>
                <material_1.ListItem>
                  <material_1.ListItemText primary="API URL" secondary="Base URL for API endpoints"/>
                  <material_1.ListItemSecondaryAction>
onChange={function (e) { 
  console.log('API URL change event:', e);
  if (e.target) {
    return handleSettingChange('apiUrl', e.target.value); 
  }
}}
                  </material_1.ListItemSecondaryAction>
                </material_1.ListItem>
                <material_1.Divider />
                <material_1.ListItem>
                  <material_1.ListItemText primary="Max Users" secondary="Maximum number of users allowed"/>
                  <material_1.ListItemSecondaryAction>
onChange={function (e) { 
  console.log('Max Users change event:', e);
  if (e.target) {
    return handleSettingChange('maxUsers', parseInt(e.target.value)); 
  }
}}
                  </material_1.ListItemSecondaryAction>
                </material_1.ListItem>
                <material_1.Divider />
                <material_1.ListItem>
                  <material_1.ListItemText primary="Session Timeout" secondary="Session timeout in minutes"/>
                  <material_1.ListItemSecondaryAction>
onChange={function (e) { 
  console.log('Session Timeout change event:', e);
  if (e.target) {
    return handleSettingChange('sessionTimeout', parseInt(e.target.value)); 
  }
}}
                  </material_1.ListItemSecondaryAction>
                </material_1.ListItem>
              </material_1.List>
            </material_1.CardContent>
          </material_1.Card>

          <material_1.Card sx={{ mt: 3 }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                Backup Settings
              </material_1.Typography>
              <material_1.List>
                <material_1.ListItem>
                  <material_1.ListItemText primary="Backup Frequency" secondary="Hours between automatic backups"/>
                  <material_1.ListItemSecondaryAction>
onChange={function (e) { 
  console.log('Backup Frequency change event:', e);
  if (e.target) {
    return handleSettingChange('backupFrequency', parseInt(e.target.value)); 
  }
}}
                  </material_1.ListItemSecondaryAction>
                </material_1.ListItem>
              </material_1.List>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* System Features */}
        <material_1.Grid item xs={12} md={6}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                System Features
              </material_1.Typography>
              <material_1.List>
                <material_1.ListItem>
                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.emailNotifications} onChange={function (e) { return handleSettingChange('emailNotifications', e.target.checked); }}/>} label="Email Notifications"/>
                </material_1.ListItem>
                <material_1.Divider />
                <material_1.ListItem>
                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.maintenanceMode} onChange={function (e) { return handleSettingChange('maintenanceMode', e.target.checked); }}/>} label="Maintenance Mode"/>
                </material_1.ListItem>
                <material_1.Divider />
                <material_1.ListItem>
                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.debugMode} onChange={function (e) { return handleSettingChange('debugMode', e.target.checked); }}/>} label="Debug Mode"/>
                </material_1.ListItem>
                <material_1.Divider />
                <material_1.ListItem>
                  <material_1.FormControlLabel control={<material_1.Switch checked={settings.allowRegistration} onChange={function (e) { return handleSettingChange('allowRegistration', e.target.checked); }}/>} label="Allow User Registration"/>
                </material_1.ListItem>
              </material_1.List>
            </material_1.CardContent>
          </material_1.Card>

          <material_1.Card sx={{ mt: 3 }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                System Maintenance
              </material_1.Typography>
              <material_1.List>
                <material_1.ListItem>
                  <material_1.Button fullWidth variant="outlined" startIcon={<icons_material_1.CloudDownload />} color="warning">
                    Restore from Backup
                  </material_1.Button>
                </material_1.ListItem>
                <material_1.ListItem>
                  <material_1.Button fullWidth variant="outlined" color="error">
                    Clear System Cache
                  </material_1.Button>
                </material_1.ListItem>
              </material_1.List>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>
    </material_1.Box>);
};
export default AdminSettings;
