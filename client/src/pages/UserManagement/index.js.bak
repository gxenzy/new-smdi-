
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
var user_1 = require("../../types/user");
var UserManagement = function () {
    var _a = (0, react_1.useState)([
        {
            id: '1',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@example.com',
            role: user_1.UserRole.ADMIN,
            status: 'active',
            lastLogin: new Date(),
        },
        {
            id: '2',
            username: 'moderator',
            firstName: 'Mod',
            lastName: 'User',
            email: 'mod@example.com',
            role: user_1.UserRole.MODERATOR,
            status: 'active',
            lastLogin: new Date(),
        },
    ]), users = _a[0], setUsers = _a[1];
    var _b = (0, react_1.useState)(false), openDialog = _b[0], setOpenDialog = _b[1];
    var _c = (0, react_1.useState)(null), editingUser = _c[0], setEditingUser = _c[1];
    var _d = (0, react_1.useState)(false), showAlert = _d[0], setShowAlert = _d[1];
    var _e = (0, react_1.useState)(''), alertMessage = _e[0], setAlertMessage = _e[1];
    var _f = (0, react_1.useState)('success'), alertSeverity = _f[0], setAlertSeverity = _f[1];
    var handleAddUser = function () {
        setEditingUser(null);
        setOpenDialog(true);
    };
    var handleEditUser = function (user) {
        setEditingUser(user);
        setOpenDialog(true);
    };
    var handleDeleteUser = function (userId) {
        setUsers(function (prev) { return prev.filter(function (user) { return user.id !== userId; }); });
        showAlertMessage('User deleted successfully', 'success');
    };
    var handleToggleStatus = function (userId) {
        setUsers(function (prev) {
            return prev.map(function (user) {
                return user.id === userId
                    ? __assign(__assign({}, user), { status: user.status === 'active' ? 'inactive' : 'active' }) : user;
            });
        });
    };
    var showAlertMessage = function (message, severity) {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setShowAlert(true);
        setTimeout(function () { return setShowAlert(false); }, 3000);
    };
    var handleSaveUser = function (formData) {
        if (editingUser) {
            // Update existing user
            setUsers(function (prev) {
                return prev.map(function (user) {
                    return user.id === editingUser.id ? __assign(__assign({}, user), formData) : user;
                });
            });
            showAlertMessage('User updated successfully', 'success');
        }
        else {
            // Add new user
            var newUser_1 = __assign(__assign({ id: Math.random().toString(36).substr(2, 9) }, formData), { status: 'active' });
            setUsers(function (prev) { return __spreadArray(__spreadArray([], prev, true), [newUser_1], false); });
            showAlertMessage('User added successfully', 'success');
        }
        setOpenDialog(false);
    };
    var getRoleChip = function (role) {
        var _a;
        var roleColors = (_a = {},
            _a[user_1.UserRole.ADMIN] = 'error',
            _a[user_1.UserRole.MODERATOR] = 'warning',
            _a[user_1.UserRole.STAFF] = 'info',
            _a[user_1.UserRole.USER] = 'default',
            _a);
        return (<material_1.Chip label={role} color={roleColors[role]} size="small"/>);
    };
    return (<material_1.Box sx={{ p: 3 }}>
      {showAlert && (<material_1.Alert severity={alertSeverity} sx={{ mb: 2 }} onClose={function () { return setShowAlert(false); }}>
          {alertMessage}
        </material_1.Alert>)}

      <material_1.Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <material_1.Typography variant="h4">User Management</material_1.Typography>
        <material_1.Button variant="contained" startIcon={<icons_material_1.Add />} onClick={handleAddUser}>
          Add User
        </material_1.Button>
      </material_1.Box>

      <material_1.Card>
        <material_1.CardContent>
          <material_1.TableContainer>
            <material_1.Table>
              <material_1.TableHead>
                <material_1.TableRow>
                  <material_1.TableCell>Username</material_1.TableCell>
                  <material_1.TableCell>Name</material_1.TableCell>
                  <material_1.TableCell>Email</material_1.TableCell>
                  <material_1.TableCell>Role</material_1.TableCell>
                  <material_1.TableCell>Status</material_1.TableCell>
                  <material_1.TableCell>Last Login</material_1.TableCell>
                  <material_1.TableCell>Actions</material_1.TableCell>
                </material_1.TableRow>
              </material_1.TableHead>
              <material_1.TableBody>
                {users.map(function (user) {
            var _a;
            return (<material_1.TableRow key={user.id}>
                    <material_1.TableCell>{user.username}</material_1.TableCell>
                    <material_1.TableCell>{"".concat(user.firstName, " ").concat(user.lastName)}</material_1.TableCell>
                    <material_1.TableCell>{user.email}</material_1.TableCell>
                    <material_1.TableCell>{getRoleChip(user.role)}</material_1.TableCell>
                    <material_1.TableCell>
                      <material_1.Chip label={user.status} color={user.status === 'active' ? 'success' : 'default'} size="small"/>
                    </material_1.TableCell>
                    <material_1.TableCell>
                      {(_a = user.lastLogin) === null || _a === void 0 ? void 0 : _a.toLocaleDateString()}
                    </material_1.TableCell>
                    <material_1.TableCell>
                      <material_1.IconButton size="small" onClick={function () { return handleEditUser(user); }} sx={{ mr: 1 }}>
                        <icons_material_1.Edit />
                      </material_1.IconButton>
                      <material_1.IconButton size="small" onClick={function () { return handleToggleStatus(user.id); }} sx={{ mr: 1 }}>
                        {user.status === 'active' ? <icons_material_1.Lock /> : <icons_material_1.LockOpen />}
                      </material_1.IconButton>
                      <material_1.IconButton size="small" onClick={function () { return handleDeleteUser(user.id); }} color="error">
                        <icons_material_1.Delete />
                      </material_1.IconButton>
                    </material_1.TableCell>
                  </material_1.TableRow>);
        })}
              </material_1.TableBody>
            </material_1.Table>
          </material_1.TableContainer>
        </material_1.CardContent>
      </material_1.Card>

      <material_1.Dialog open={openDialog} onClose={function () { return setOpenDialog(false); }} maxWidth="sm" fullWidth>
        <material_1.DialogTitle>
          {editingUser ? 'Edit User' : 'Add New User'}
        </material_1.DialogTitle>
        <material_1.DialogContent>
          <material_1.Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <material_1.TextField fullWidth label="Username" defaultValue={editingUser === null || editingUser === void 0 ? void 0 : editingUser.username}/>
            <material_1.TextField fullWidth label="First Name" defaultValue={editingUser === null || editingUser === void 0 ? void 0 : editingUser.firstName}/>
            <material_1.TextField fullWidth label="Last Name" defaultValue={editingUser === null || editingUser === void 0 ? void 0 : editingUser.lastName}/>
            <material_1.TextField fullWidth label="Email" type="email" defaultValue={editingUser === null || editingUser === void 0 ? void 0 : editingUser.email}/>
            <material_1.FormControl fullWidth>
              <material_1.InputLabel>Role</material_1.InputLabel>
              <material_1.Select defaultValue={(editingUser === null || editingUser === void 0 ? void 0 : editingUser.role) || user_1.UserRole.USER} label="Role">
                {Object.values(user_1.UserRole).map(function (role) { return (<material_1.MenuItem key={role} value={role}>
                    {role}
                  </material_1.MenuItem>); })}
              </material_1.Select>
            </material_1.FormControl>
          </material_1.Box>
        </material_1.DialogContent>
        <material_1.DialogActions>
          <material_1.Button onClick={function () { return setOpenDialog(false); }}>Cancel</material_1.Button>
          <material_1.Button variant="contained" onClick={function () { return handleSaveUser({}); }} // Add form data here
    >
            Save
          </material_1.Button>
        </material_1.DialogActions>
      </material_1.Dialog>
    </material_1.Box>);
};
export default UserManagement;
