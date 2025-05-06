Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var material_1 = require("@mui/material");
var icons_material_1 = require("@mui/icons-material");
var AuthContext_1 = require("../../contexts/AuthContext");
var user_1 = require("../../types/user");
var moment_1 = require("moment");
var NotificationsMenu = function (_a) {
    var _b;
    var anchorEl = _a.anchorEl, open = _a.open, onClose = _a.onClose;
    var { currentUser } = (0, AuthContext_1.useAuthContext)();
    var unreadCount = ((_b = currentUser === null || currentUser === void 0 ? void 0 : currentUser.notifications) === null || _b === void 0 ? void 0 : _b.filter(function (n) { return !n.read; }).length) || 0;
    var getNotificationIcon = function (type) {
        switch (type) {
            case user_1.NotificationType.SUCCESS:
                return <icons_material_1.CheckCircle color="success"/>;
            case user_1.NotificationType.WARNING:
                return <icons_material_1.Warning color="warning"/>;
            case user_1.NotificationType.ERROR:
                return <icons_material_1.Error color="error"/>;
            default:
                return <icons_material_1.Info color="info"/>;
        }
    };
    var handleClearNotification = function (notificationId) {
        console.log('Clear notification:', notificationId);
    };
    var handleMarkAllAsRead = function () {
        console.log('Mark all as read');
    };
    var renderNotification = function (notification) { return (<material_1.ListItem key={notification._id} sx={{
            opacity: notification.read ? 0.7 : 1,
            backgroundColor: notification.read ? 'transparent' : 'action.hover',
            '&:hover': {
                backgroundColor: 'action.hover',
            },
        }}>
      <material_1.ListItemIcon>{getNotificationIcon(notification.type)}</material_1.ListItemIcon>
      <material_1.ListItemText primary={notification.message} secondary={(0, moment_1.default)(notification.createdAt).fromNow()} primaryTypographyProps={{
            variant: 'body2',
            color: notification.read ? 'text.secondary' : 'text.primary',
        }}/>
      <material_1.IconButton edge="end" size="small" onClick={function () { return handleClearNotification(notification._id); }}>
        <icons_material_1.Clear fontSize="small"/>
      </material_1.IconButton>
    </material_1.ListItem>); };
    return (<material_1.Menu anchorEl={anchorEl} open={open} onClose={onClose} PaperProps={{
            sx: {
                width: 360,
                maxHeight: 480,
                overflow: 'hidden',
                mt: 1.5,
            },
        }} transformOrigin={{ horizontal: 'right', vertical: 'top' }} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
      <material_1.Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <material_1.Box sx={{ display: 'flex', alignItems: 'center' }}>
          <icons_material_1.Notifications sx={{ mr: 1 }}/>
          <material_1.Typography variant="h6">Notifications</material_1.Typography>
        </material_1.Box>
        {unreadCount > 0 && (<material_1.Button size="small" onClick={handleMarkAllAsRead}>
            Mark all as read
          </material_1.Button>)}
      </material_1.Box>
      
      <material_1.Divider />
      
      <material_1.Box sx={{ maxHeight: 360, overflow: 'auto' }}>
        {(currentUser === null || currentUser === void 0 ? void 0 : currentUser.notifications) && currentUser.notifications.length > 0 ? (<material_1.List sx={{ p: 0 }}>
            {currentUser.notifications.map(renderNotification)}
          </material_1.List>) : (<material_1.Box sx={{ p: 2, textAlign: 'center' }}>
            <material_1.Typography variant="body2" color="textSecondary">
              No notifications
            </material_1.Typography>
          </material_1.Box>)}
      </material_1.Box>
      
      <material_1.Divider />
      
      <material_1.Box sx={{ p: 1 }}>
        <material_1.Button fullWidth onClick={onClose}>
          View All Notifications
        </material_1.Button>
      </material_1.Box>
    </material_1.Menu>);
};
export default NotificationsMenu;
