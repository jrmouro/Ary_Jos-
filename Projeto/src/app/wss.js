"use strict";
exports.__esModule = true;
exports.WSS = void 0;
var ws_1 = require("ws");
var WSS = /** @class */ (function () {
    function WSS(port) {
        this.wsclient_userkey_map = new Map();
        this.userkey_wsclient_map = new Map();
        this.clusterkey_wsclientset_map = new Map();
        this.wsclient_clusterkey_map = new Map();
        this.wss = undefined;
        this.port = port;
        if (this.port !== undefined) {
            this.launch(this.port);
        }
    }
    WSS.prototype.broadcast = function (msgObj, isBinary) {
        var _a;
        (_a = this.wss) === null || _a === void 0 ? void 0 : _a.clients.forEach(function each(client) {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(msgObj), {
                    binary: isBinary
                });
            }
        });
    };
    WSS.prototype.broadcast_cluster = function (groupkey, msgObj, isBinary) {
        var grpou = this.clusterkey_wsclientset_map.get(groupkey);
        if (grpou !== undefined) {
            grpou.forEach(function each(client) {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(JSON.stringify(msgObj), {
                        binary: isBinary
                    });
                }
            });
        }
    };
    WSS.prototype.launch = function (port) {
        this.wss = new ws_1.WebSocketServer({ port: port });
        var self = this;
        this.wss.on('connection', function connection(ws, req) {
            ws.on('message', function message(data, isBinary) {
                var _a;
                console.log("message = " + data);
                var ws_msg = JSON.parse(data.toString());
                if (ws_msg.sender !== undefined) {
                    self.userkey_wsclient_map.set(ws_msg.sender, ws);
                    self.wsclient_userkey_map.set(ws, ws_msg.sender);
                }
                if (ws_msg.sender_cluster !== undefined) {
                    if (!self.clusterkey_wsclientset_map.has(ws_msg.sender_cluster)) {
                        self.clusterkey_wsclientset_map.set(ws_msg.sender_cluster, new Set());
                    }
                    (_a = self.clusterkey_wsclientset_map.get(ws_msg.sender_cluster)) === null || _a === void 0 ? void 0 : _a.add(ws);
                    self.wsclient_clusterkey_map.set(ws, ws_msg.sender_cluster);
                }
                if (ws_msg.receiver === '__broadcast__') {
                    self.broadcast(ws_msg, isBinary);
                }
                else if (ws_msg.receiver === '__cluster__' && ws_msg.receiver_cluster !== undefined) {
                    self.broadcast_cluster(ws_msg.receiver_cluster, ws_msg, isBinary);
                }
                else if (ws_msg.receiver !== undefined && self.userkey_wsclient_map.has(ws_msg.receiver)) {
                    var ws_receiver = self.userkey_wsclient_map.get(ws_msg.receiver);
                    if ((ws_receiver === null || ws_receiver === void 0 ? void 0 : ws_receiver.readyState) === ws_1.WebSocket.OPEN) {
                        ws_receiver === null || ws_receiver === void 0 ? void 0 : ws_receiver.send(JSON.stringify(ws_msg), {
                            binary: isBinary
                        });
                    }
                }
            });
            ws.on('close', function (code, reason) {
                if (self.wsclient_userkey_map.has(ws)) {
                    var client_key = self.wsclient_userkey_map.get(ws);
                    if (client_key !== undefined)
                        self.userkey_wsclient_map["delete"](client_key);
                    self.wsclient_userkey_map["delete"](ws);
                }
            });
        });
    };
    WSS.prototype.close = function () {
        var _a;
        (_a = this.wss) === null || _a === void 0 ? void 0 : _a.close();
        this.wss = undefined;
        this.userkey_wsclient_map.clear();
        this.wsclient_userkey_map.clear();
        this.clusterkey_wsclientset_map.clear();
        this.wsclient_clusterkey_map.clear();
    };
    return WSS;
}());
exports.WSS = WSS;
var server = new WSS(5555);
