
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationType = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MODERATOR"] = "MODERATOR";
    UserRole["STAFF"] = "STAFF";
    UserRole["USER"] = "USER";
})(UserRole || (exports.UserRole = UserRole = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["INFO"] = "INFO";
    NotificationType["SUCCESS"] = "SUCCESS";
    NotificationType["WARNING"] = "WARNING";
    NotificationType["ERROR"] = "ERROR";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
