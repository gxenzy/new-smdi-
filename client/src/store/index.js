
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = exports.useAppSelector = exports.useAppDispatch = void 0;
var toolkit_1 = require("@reduxjs/toolkit");
var react_redux_1 = require("react-redux");
var authSlice_1 = require("./slices/authSlice");
var store = (0, toolkit_1.configureStore)({
    reducer: {
        auth: authSlice_1.default
    },
    middleware: function (getDefaultMiddleware) {
        return getDefaultMiddleware({
            serializableCheck: {
                // Ignore these paths in the state
                ignoredPaths: [
                    'auth.user.lastLogin',
                    'auth.user.createdAt',
                    'auth.user.updatedAt',
                    'auth.user.notifications'
                ],
                // Ignore these field paths in all actions
                ignoredActionPaths: [
                    'payload.user.lastLogin',
                    'payload.user.createdAt',
                    'payload.user.updatedAt',
                    'payload.user.notifications'
                ],
            },
        });
    }
});
exports.store = store;
// Use throughout your app instead of plain `useDispatch` and `useSelector`
var useAppDispatch = function () { return (0, react_redux_1.useDispatch)(); };
exports.useAppDispatch = useAppDispatch;
exports.useAppSelector = react_redux_1.useSelector;
