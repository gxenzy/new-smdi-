
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEnergyReadings = exports.wsService = void 0;
var rxjs_1 = require("rxjs");
var WebSocketService = /** @class */ (function () {
    function WebSocketService() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = 5000; // 5 seconds
        this.readingsSubject = new rxjs_1.Subject();
        this.readings$ = this.readingsSubject.asObservable();
        this.connect();
    }
    WebSocketService.prototype.connect = function () {
        var _this = this;
        try {
            var wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8000';
            this.ws = new WebSocket(wsUrl);
            this.ws.onopen = function () {
                console.log('WebSocket connected');
                _this.reconnectAttempts = 0;
            };
            this.ws.onmessage = function (event) {
                try {
                    var message = JSON.parse(event.data);
                    if (message.type === 'readings') {
                        // Convert timestamps to Date objects
                        var readings = message.data.map(function (reading) { return (__assign(__assign({}, reading), { timestamp: new Date(reading.timestamp) })); });
                        _this.readingsSubject.next(readings);
                    }
                }
                catch (error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };
            this.ws.onclose = function () {
                console.log('WebSocket disconnected');
                _this.handleReconnect();
            };
            this.ws.onerror = function (error) {
                console.error('WebSocket error:', error);
            };
        }
        catch (error) {
            console.error('Error creating WebSocket connection:', error);
            this.handleReconnect();
        }
    };
    WebSocketService.prototype.handleReconnect = function () {
        var _this = this;
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log("Attempting to reconnect (".concat(this.reconnectAttempts, "/").concat(this.maxReconnectAttempts, ")..."));
            setTimeout(function () {
                _this.connect();
            }, this.reconnectTimeout * this.reconnectAttempts);
        }
        else {
            console.error('Max reconnection attempts reached');
        }
    };
    WebSocketService.prototype.disconnect = function () {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    };
    WebSocketService.prototype.isConnected = function () {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN;
    };
    return WebSocketService;
}());
// Create singleton instance
exports.wsService = new WebSocketService();
// Energy monitoring hooks
var useEnergyReadings = function () {
    return exports.wsService.readings$;
};
exports.useEnergyReadings = useEnergyReadings;
exports.default = exports.wsService;
