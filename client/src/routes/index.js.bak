Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_router_dom_1 = require("react-router-dom");
var material_1 = require("@mui/material");
var AuthContext_1 = require("../contexts/AuthContext");
var user_1 = require("../types/user");
// Lazy load components
var Login = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/Login'); }); });
var Dashboard = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/Dashboard'); }); });
var ElectricalSystem = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/ElectricalSystem'); }); });
var EnergyAudit = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/EnergyAudit'); }); });
var SystemTools = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/SystemTools'); }); });
var Testing = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/Testing'); }); });
var TamEvaluation = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/TamEvaluation'); }); });
var UserManagement = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/UserManagement'); }); });
var AdminSettings = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/AdminSettings'); }); });
var Profile = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/Profile'); }); });
var Settings = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/Settings'); }); });
var NotFound = (0, react_1.lazy)(function () { return Promise.resolve().then(function () { return require('../pages/NotFound'); }); });
// Loading component
var LoadingScreen = function () { return (<material_1.Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <material_1.CircularProgress />
  </material_1.Box>); };
var ProtectedRoute = function (_a) {
    var children = _a.children, allowedRoles = _a.allowedRoles;
    var _b = (0, AuthContext_1.useAuthContext)(), currentUser = _b.currentUser;
    if (!currentUser) {
        return <react_router_dom_1.Navigate to="/login"/>;
    }
    if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
        return <react_router_dom_1.Navigate to="/dashboard"/>;
    }
    return <>{children}</>;
};
var AppRoutes = function () {
    return (<react_1.Suspense fallback={<LoadingScreen />}>
      <react_router_dom_1.Routes>
        {/* Public Routes */}
        <react_router_dom_1.Route path="/login" element={<Login />}/>

        {/* Protected Routes */}
        <react_router_dom_1.Route path="/dashboard" element={<ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>}/>

        <react_router_dom_1.Route path="/electrical-system" element={<ProtectedRoute allowedRoles={[user_1.UserRole.ADMIN, user_1.UserRole.STAFF]}>
              <ElectricalSystem />
            </ProtectedRoute>}/>

        <react_router_dom_1.Route path="/energy-audit" element={<ProtectedRoute allowedRoles={[user_1.UserRole.ADMIN, user_1.UserRole.STAFF]}>
              <EnergyAudit />
            </ProtectedRoute>}/>

        <react_router_dom_1.Route path="/system-tools" element={<ProtectedRoute allowedRoles={[user_1.UserRole.ADMIN, user_1.UserRole.STAFF, user_1.UserRole.MODERATOR]}>
              <SystemTools />
            </ProtectedRoute>}/>

        <react_router_dom_1.Route path="/testing" element={<ProtectedRoute allowedRoles={[user_1.UserRole.ADMIN, user_1.UserRole.STAFF]}>
              <Testing />
            </ProtectedRoute>}/>

        <react_router_dom_1.Route path="/tam-evaluation" element={<ProtectedRoute allowedRoles={[user_1.UserRole.ADMIN, user_1.UserRole.MODERATOR]}>
              <TamEvaluation />
            </ProtectedRoute>}/>

        <react_router_dom_1.Route path="/users" element={<ProtectedRoute allowedRoles={[user_1.UserRole.ADMIN]}>
              <UserManagement />
            </ProtectedRoute>}/>

        <react_router_dom_1.Route path="/admin" element={<ProtectedRoute allowedRoles={[user_1.UserRole.ADMIN]}>
              <AdminSettings />
            </ProtectedRoute>}/>

        <react_router_dom_1.Route path="/profile" element={<ProtectedRoute>
              <Profile />
            </ProtectedRoute>}/>

        <react_router_dom_1.Route path="/settings" element={<ProtectedRoute>
              <Settings />
            </ProtectedRoute>}/>

        {/* Redirect root to dashboard if authenticated */}
        <react_router_dom_1.Route path="/" element={<ProtectedRoute>
              <react_router_dom_1.Navigate to="/dashboard" replace/>
            </ProtectedRoute>}/>

        {/* 404 Page */}
        <react_router_dom_1.Route path="*" element={<NotFound />}/>
      </react_router_dom_1.Routes>
    </react_1.Suspense>);
};
exports.default = AppRoutes;
