! function () {
    var e, t = [];

    function r(e) {
        var r = this,
            n = {},
            i = -1;
        this.parameters.forEach(function (e, o) {
            var a = t[++i] || (t[i] = new Float32Array(r.bufferSize));
            a.fill(e.value), n[o] = a
        }), this.processor.realm.exec("self.sampleRate=sampleRate=" + this.context.sampleRate + ";self.currentTime=currentTime=" + this.context.currentTime);
        var a = o(e.inputBuffer),
            s = o(e.outputBuffer);
        this.instance.process([a], [s], n)
    }

    function o(e) {
        for (var t = [], r = 0; r < e.numberOfChannels; r++) t[r] = e.getChannelData(r);
        return t
    }

    function n(e) {
        return e.$$processors || (e.$$processors = {})
    }
    "function" == typeof AudioWorkletNode && "audioWorklet" in AudioContext.prototype || (self.AudioWorkletNode = function (t, o, i) {
        var a = n(t)[o],
            s = t.createScriptProcessor(void 0, 2, i && i.outputChannelCount ? i.outputChannelCount[0] : 2);
        if (s.parameters = new Map, a.properties)
            for (var u = 0; u < a.properties.length; u++) {
                var c = a.properties[u],
                    l = t.createGain().gain;
                l.value = c.defaultValue, s.parameters.set(c.name, l)
            }
        var p = new MessageChannel;
        e = p.port2;
        var f = new a.Processor(i || {});
        return e = null, s.port = p.port1, s.processor = a, s.instance = f, s.onaudioprocess = r, s
    }, Object.defineProperty((self.AudioContext || self.webkitAudioContext).prototype, "audioWorklet", {
        get: function () {
            return this.$$audioWorklet || (this.$$audioWorklet = new self.AudioWorklet(this))
        }
    }), self.AudioWorklet = function () {
        function t(e) {
            this.$$context = e
        }
        return t.prototype.addModule = function (t, r) {
            var o = this;
            return fetch(t).then(function (e) {
                if (!e.ok) throw Error(e.status);
                return e.text()
            }).then(function (t) {
                var i = {
                    sampleRate: o.$$context.sampleRate,
                    currentTime: o.$$context.currentTime,
                    AudioWorkletProcessor: function () {
                        this.port = e
                    },
                    registerProcessor: function (e, t) {
                        n(o.$$context)[e] = {
                            realm: a,
                            context: i,
                            Processor: t,
                            properties: t.parameterDescriptors || []
                        }
                    }
                };
                i.self = i;
                var a = new function (e, t) {
                    var r = document.createElement("iframe");
                    r.style.cssText = "position:absolute;left:0;top:-999px;width:1px;height:1px;", t.appendChild(r);
                    var o = r.contentWindow,
                        n = o.document,
                        i = "var window,$hook";
                    for (var a in o) a in e || "eval" === a || (i += ",", i += a);
                    for (var s in e) i += ",", i += s, i += "=self.", i += s;
                    var u = n.createElement("script");
                    u.appendChild(n.createTextNode('function $hook(self,console) {"use strict";\n        ' + i + ";return function() {return eval(arguments[0])}}")), n.body.appendChild(u), this.exec = o.$hook.call(e, e, console)
                }(i, document.documentElement);
                return a.exec((r && r.transpile || String)(t)), null
            })
        }, t
    }())
}();
//# sourceMappingURL=audioworklet-polyfill.js.map