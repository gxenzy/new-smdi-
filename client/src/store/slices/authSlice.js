
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearError = exports.updateUser = exports.logout = exports.loginFailure = exports.loginSuccess = exports.loginStart = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var initialState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    loading: false,
    error: null,
};
var authSlice = (0, toolkit_1.createSlice)({
    name: 'auth',
    initialState: initialState,
    reducers: {
        loginStart: function (state) {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: function (state, action) {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
            localStorage.setItem('token', action.payload.token);
        },
        loginFailure: function (state, action) {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
        },
        logout: function (state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('token');
        },
        updateUser: function (state, action) {
            state.user = action.payload;
        },
        clearError: function (state) {
            state.error = null;
        },
    },
});
exports.loginStart = authSlice.actions.loginStart;
exports.loginSuccess = authSlice.actions.loginSuccess;
exports.loginFailure = authSlice.actions.loginFailure;
exports.logout = authSlice.actions.logout;
exports.updateUser = authSlice.actions.updateUser;
exports.clearError = authSlice.actions.clearError;
exports.default = authSlice.reducer;
