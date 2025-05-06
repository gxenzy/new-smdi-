
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
var ElectricalSystem = function () {
    var _a = (0, react_1.useState)([]), components = _a[0], setComponents = _a[1];
    var _b = (0, react_1.useState)([]), dialuxModels = _b[0], setDialuxModels = _b[1];
    var _c = (0, react_1.useState)(false), openAddDialog = _c[0], setOpenAddDialog = _c[1];
    var _d = (0, react_1.useState)(null), selectedComponent = _d[0], setSelectedComponent = _d[1];
    var fileInputRef = (0, react_1.useRef)(null);
    var _e = (0, react_1.useState)(null), alert = _e[0], setAlert = _e[1];
    var handleAddComponent = function () {
        setSelectedComponent(null);
        setOpenAddDialog(true);
    };
    var handleEditComponent = function (component) {
        setSelectedComponent(component);
        setOpenAddDialog(true);
    };
    var handleSaveComponent = function (formData) {
        try {
            if (selectedComponent) {
                // Update existing component
                setComponents(function (prev) {
                    return prev.map(function (comp) {
                        return comp.id === selectedComponent.id
                            ? __assign(__assign(__assign({}, comp), formData), { lastUpdated: new Date() }) : comp;
                    });
                });
            }
            else {
                // Add new component
                var newComponent_1 = __assign(__assign({ id: Math.random().toString(36).substr(2, 9) }, formData), { status: 'active', lastUpdated: new Date() });
                setComponents(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newComponent_1], false); });
            }
            setOpenAddDialog(false);
            setAlert({ type: 'success', message: 'Component saved successfully' });
        }
        catch (error) {
            setAlert({ type: 'error', message: 'Error saving component' });
        }
    };
    var handleDeleteComponent = function (id) {
        setComponents(function (prev) { return prev.filter(function (comp) { return comp.id !== id; }); });
        setAlert({ type: 'success', message: 'Component deleted successfully' });
    };
    var handleImportLayout = function () {
        var _a;
        (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
    };
    var handleFileUpload = function (event) {
        var _a;
        var file = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (file) {
            // Handle DIALux file import
            var reader = new FileReader();
            reader.onload = function (e) {
                var _a;
                try {
                    // Process DIALux file
                    var newModel_1 = {
                        id: Math.random().toString(36).substr(2, 9),
                        name: file.name,
                        createdAt: new Date(),
                        fileUrl: (_a = e.target) === null || _a === void 0 ? void 0 : _a.result,
                    };
                    setDialuxModels(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newModel_1], false); });
                    setAlert({ type: 'success', message: 'DIALux model imported successfully' });
                }
                catch (error) {
                    setAlert({ type: 'error', message: 'Error importing DIALux model' });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    var handleExportLayout = function () {
        try {
            var layoutData = {
                components: components,
                dialuxModels: dialuxModels,
                exportDate: new Date(),
            };
            var blob = new Blob([JSON.stringify(layoutData, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = "electrical-layout-".concat(new Date().toISOString(), ".json");
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setAlert({ type: 'success', message: 'Layout exported successfully' });
        }
        catch (error) {
            setAlert({ type: 'error', message: 'Error exporting layout' });
        }
    };
    var getTotalLoad = function () {
        return components.reduce(function (total, component) { return total + component.load; }, 0);
    };
    var getComponentIcon = function (type) {
        return type === 'lighting' ? (<icons_material_1.Lightbulb color="primary"/>) : (<icons_material_1.PowerSettingsNew color="secondary"/>);
    };
    return (<material_1.Box sx={{ p: 3 }}>
      {alert && (<material_1.Typography variant="body2" color={alert.type === 'success' ? 'green' : 'red'} sx={{ mb: 3 }}>
          {alert.message}
        </material_1.Typography>)}

      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <material_1.Typography variant="h4">Electrical System Layout</material_1.Typography>
        <material_1.Box>
          <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} onClick={handleAddComponent} sx={{ mr: 1 }}>
            Add Component
          </material_1.Button>
          <material_1.Button variant="outlined" startIcon={<icons_material_1.Upload />} onClick={handleImportLayout} sx={{ mr: 1 }}>
            Import DIALux
          </material_1.Button>
          <material_1.Button variant="outlined" startIcon={<icons_material_1.Save />} onClick={handleExportLayout}>
            Export Layout
          </material_1.Button>
          <input type="file" ref={fileInputRef} accept=".stf,.evo" style={{ display: 'none' }} onChange={handleFileUpload}/>
        </material_1.Box>
      </material_1.Box>

      <material_1.Grid container spacing={3}>
        {/* System Overview */}
        <material_1.Grid item xs={12} md={4}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                System Overview
              </material_1.Typography>
              <material_1.List>
                <material_1.ListItem>
                  <material_1.ListItemText primary="Total Components" secondary={components.length}/>
                </material_1.ListItem>
                <material_1.ListItem>
                  <material_1.ListItemText primary="Total Load" secondary={"".concat(getTotalLoad(), " W")}/>
                </material_1.ListItem>
                <material_1.ListItem>
                  <material_1.ListItemText primary="Active Components" secondary={components.filter(function (c) { return c.status === 'active'; }).length}/>
                </material_1.ListItem>
                <material_1.ListItem>
                  <material_1.ListItemText primary="DIALux Models" secondary={dialuxModels.length}/>
                </material_1.ListItem>
              </material_1.List>
            </material_1.CardContent>
          </material_1.Card>

          {/* DIALux Models */}
          <material_1.Card sx={{ mt: 3 }}>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                3D Models (DIALux)
              </material_1.Typography>
              <material_1.List>
                {dialuxModels.map(function (model) { return (<react_1.default.Fragment key={model.id}>
                    <material_1.ListItem>
                      <material_1.ListItemIcon>
                        <icons_material_1.ThreeDRotation />
                      </material_1.ListItemIcon>
                      <material_1.ListItemText primary={model.name} secondary={new Date(model.createdAt).toLocaleDateString()}/>
                      <material_1.ListItemSecondaryAction>
                        <material_1.IconButton size="small" onClick={function () { }}>
                          <icons_material_1.Download />
                        </material_1.IconButton>
                      </material_1.ListItemSecondaryAction>
                    </material_1.ListItem>
                    <material_1.Divider />
                  </react_1.default.Fragment>); })}
              </material_1.List>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>

        {/* Component List */}
        <material_1.Grid item xs={12} md={8}>
          <material_1.Card>
            <material_1.CardContent>
              <material_1.Typography variant="h6" gutterBottom>
                Components
              </material_1.Typography>
              <material_1.List>
                {components.map(function (component) { return (<react_1.default.Fragment key={component.id}>
                    <material_1.ListItem>
                      <material_1.Box sx={{ mr: 2 }}>
                        {getComponentIcon(component.type)}
                      </material_1.Box>
                      <material_1.ListItemText primary={component.name} secondary={<>
                            <material_1.Typography variant="body2">
                              Location: {component.location}
                            </material_1.Typography>
                            <material_1.Typography variant="body2">
                              Load: {component.load}W | Voltage: {component.voltage}V | Current: {component.current}A
                            </material_1.Typography>
                            <material_1.Typography variant="body2">
                              Power Factor: {component.powerFactor} | Status: {component.status}
                            </material_1.Typography>
                            <material_1.Typography variant="body2" color="textSecondary">
                              Last Updated: {new Date(component.lastUpdated).toLocaleString()}
                            </material_1.Typography>
                          </>}/>
                      <material_1.ListItemSecondaryAction>
                        <material_1.IconButton size="small" onClick={function () { return handleEditComponent(component); }} sx={{ mr: 1 }}>
                          <icons_material_1.Edit />
                        </material_1.IconButton>
                        <material_1.IconButton size="small" onClick={function () { return handleDeleteComponent(component.id); }} color="error">
                          <icons_material_1.Delete />
                        </material_1.IconButton>
                      </material_1.ListItemSecondaryAction>
                    </material_1.ListItem>
                    <material_1.Divider />
                  </react_1.default.Fragment>); })}
              </material_1.List>
            </material_1.CardContent>
          </material_1.Card>
        </material_1.Grid>
      </material_1.Grid>

      {/* Add/Edit Component Dialog */}
      <material_1.Dialog open={openAddDialog} onClose={function () { return setOpenAddDialog(false); }} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>
          {selectedComponent ? 'Edit Component' : 'Add New Component'}
        </material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <material_1.TextField fullWidth label="Component Name" defaultValue={selectedComponent === null || selectedComponent === void 0 ? void 0 : selectedComponent.name}/>
            <material_1.FormControl fullWidth>
              <material_1.InputLabel>Type</material_1.InputLabel>
              <material_1.Select defaultValue={(selectedComponent === null || selectedComponent === void 0 ? void 0 : selectedComponent.type) || 'lighting'} label="Type">
                <material_1.MenuItem value="lighting">Lighting</material_1.MenuItem>
                <material_1.MenuItem value="power">Power</material_1.MenuItem>
              </material_1.Select>
            </material_1.FormControl>
            <material_1.TextField fullWidth label="Location" defaultValue={selectedComponent === null || selectedComponent === void 0 ? void 0 : selectedComponent.location}/>
            <material_1.TextField fullWidth label="Load (W)" type="number" defaultValue={selectedComponent === null || selectedComponent === void 0 ? void 0 : selectedComponent.load}/>
            <material_1.TextField fullWidth label="Voltage (V)" type="number" defaultValue={selectedComponent === null || selectedComponent === void 0 ? void 0 : selectedComponent.voltage}/>
            <material_1.TextField fullWidth label="Current (A)" type="number" defaultValue={selectedComponent === null || selectedComponent === void 0 ? void 0 : selectedComponent.current}/>
            <material_1.TextField fullWidth label="Power Factor" type="number" defaultValue={selectedComponent === null || selectedComponent === void 0 ? void 0 : selectedComponent.powerFactor} inputProps={{ step: 0.01, min: 0, max: 1 }}/>
          </material_1.Box>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={function () { return setOpenAddDialog(false); }}>Cancel</material_1.Button>
          <material_1.Button variant="contained" onClick={function () { return handleSaveComponent({}); }} // Add form data here
    >
            Save
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
export default ElectricalSystem;
