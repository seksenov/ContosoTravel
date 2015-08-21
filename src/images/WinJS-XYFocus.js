
/*! Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information. */
(function (global) {

    (function (factory) {
        if (typeof define === 'function' && define.amd) {
            define([], factory);
        } else {
            global.msWriteProfilerMark && msWriteProfilerMark('WinJS.4.0 4.0.0-preview.winjs.2015.3.25 WinJS-custom.js,StartTM');
            factory(global.WinJS);
            global.msWriteProfilerMark && msWriteProfilerMark('WinJS.4.0 4.0.0-preview.winjs.2015.3.25 WinJS-custom.js,StopTM');
        }
    }(function (WinJS) {

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
/*jshint ignore:start */
var require;
var define;
/*jshint ignore:end */

(function () {
    "use strict";

    var defined = {};
    define = function (id, dependencies, factory) {
        if (!Array.isArray(dependencies)) {
            factory = dependencies;
            dependencies = [];
        }

        var mod = {
            dependencies: normalize(id, dependencies),
            factory: factory
        };

        if (dependencies.indexOf('exports') !== -1) {
            mod.exports = {};
        }

        defined[id] = mod;
    };

    // WinJS/Core depends on ./Core/_Base
    // should return WinJS/Core/_Base
    function normalize(id, dependencies) {
        id = id || "";
        var parent = id.split('/');
        parent.pop();
        return dependencies.map(function (dep) {
            if (dep[0] === '.') {
                var parts = dep.split('/');
                var current = parent.slice(0);
                parts.forEach(function (part) {
                    if (part === '..') {
                        current.pop();
                    } else if (part !== '.') {
                        current.push(part);
                    }
                });
                return current.join('/');
            } else {
                return dep;
            }
        });
    }

    function resolve(dependencies, parent, exports) {
        return dependencies.map(function (depName) {
            if (depName === 'exports') {
                return exports;
            }

            if (depName === 'require') {
                return function (dependencies, factory) {
                    require(normalize(parent, dependencies), factory);
                };
            }

            var dep = defined[depName];
            if (!dep) {
                throw new Error("Undefined dependency: " + depName);
            }

            if (!dep.resolved) {
                dep.resolved = load(dep.dependencies, dep.factory, depName, dep.exports);
                if (typeof dep.resolved === "undefined") {
                    dep.resolved = dep.exports;
                }
            }

            return dep.resolved;
        });
    }

    function load(dependencies, factory, parent, exports) {
        var deps = resolve(dependencies, parent, exports);
        if (factory && factory.apply) {
            return factory.apply(null, deps);
        } else {
            return factory;
        }
    }
    require = function (dependencies, factory) { //jshint ignore:line
        if (!Array.isArray(dependencies)) {
            dependencies = [dependencies];
        }
        load(dependencies, factory);
    };


})();
define("amd", function(){});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_WinJS',{});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
(function (global) {
    "use strict";

    define('WinJS/Core/_Global',global);
}(this));

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_BaseCoreUtils',[
    './_Global'
    ], function baseCoreUtilsInit(_Global) {
    "use strict";

    var hasWinRT = !!_Global.Windows;

    function markSupportedForProcessing(func) {
        /// <signature helpKeyword="WinJS.Utilities.markSupportedForProcessing">
        /// <summary locid="WinJS.Utilities.markSupportedForProcessing">
        /// Marks a function as being compatible with declarative processing, such as WinJS.UI.processAll
        /// or WinJS.Binding.processAll.
        /// </summary>
        /// <param name="func" type="Function" locid="WinJS.Utilities.markSupportedForProcessing_p:func">
        /// The function to be marked as compatible with declarative processing.
        /// </param>
        /// <returns type="Function" locid="WinJS.Utilities.markSupportedForProcessing_returnValue">
        /// The input function.
        /// </returns>
        /// </signature>
        func.supportedForProcessing = true;
        return func;
    }

    return {
        hasWinRT: hasWinRT,
        markSupportedForProcessing: markSupportedForProcessing,
        _setImmediate: _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (handler) {
            _Global.setTimeout(handler, 0);
        }
    };
});
// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_WriteProfilerMark',[
    './_Global'
], function profilerInit(_Global) {
    "use strict";

    return _Global.msWriteProfilerMark || function () { };
});
// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_Base',[
    './_WinJS',
    './_Global',
    './_BaseCoreUtils',
    './_WriteProfilerMark'
    ], function baseInit(_WinJS, _Global, _BaseCoreUtils, _WriteProfilerMark) {
    "use strict";

    function initializeProperties(target, members, prefix) {
        var keys = Object.keys(members);
        var isArray = Array.isArray(target);
        var properties;
        var i, len;
        for (i = 0, len = keys.length; i < len; i++) {
            var key = keys[i];
            var enumerable = key.charCodeAt(0) !== /*_*/95;
            var member = members[key];
            if (member && typeof member === 'object') {
                if (member.value !== undefined || typeof member.get === 'function' || typeof member.set === 'function') {
                    if (member.enumerable === undefined) {
                        member.enumerable = enumerable;
                    }
                    if (prefix && member.setName && typeof member.setName === 'function') {
                        member.setName(prefix + "." + key);
                    }
                    properties = properties || {};
                    properties[key] = member;
                    continue;
                }
            }
            if (!enumerable) {
                properties = properties || {};
                properties[key] = { value: member, enumerable: enumerable, configurable: true, writable: true };
                continue;
            }
            if (isArray) {
                target.forEach(function (target) {
                    target[key] = member;
                });
            } else {
                target[key] = member;
            }
        }
        if (properties) {
            if (isArray) {
                target.forEach(function (target) {
                    Object.defineProperties(target, properties);
                });
            } else {
                Object.defineProperties(target, properties);
            }
        }
    }

    (function () {

        var _rootNamespace = _WinJS;
        if (!_rootNamespace.Namespace) {
            _rootNamespace.Namespace = Object.create(Object.prototype);
        }

        function createNamespace(parentNamespace, name) {
            var currentNamespace = parentNamespace || {};
            if (name) {
                var namespaceFragments = name.split(".");
                if (currentNamespace === _Global && namespaceFragments[0] === "WinJS") {
                    currentNamespace = _WinJS;
                    namespaceFragments.splice(0, 1);
                }
                for (var i = 0, len = namespaceFragments.length; i < len; i++) {
                    var namespaceName = namespaceFragments[i];
                    if (!currentNamespace[namespaceName]) {
                        Object.defineProperty(currentNamespace, namespaceName,
                            { value: {}, writable: false, enumerable: true, configurable: true }
                        );
                    }
                    currentNamespace = currentNamespace[namespaceName];
                }
            }
            return currentNamespace;
        }

        function defineWithParent(parentNamespace, name, members) {
            /// <signature helpKeyword="WinJS.Namespace.defineWithParent">
            /// <summary locid="WinJS.Namespace.defineWithParent">
            /// Defines a new namespace with the specified name under the specified parent namespace.
            /// </summary>
            /// <param name="parentNamespace" type="Object" locid="WinJS.Namespace.defineWithParent_p:parentNamespace">
            /// The parent namespace.
            /// </param>
            /// <param name="name" type="String" locid="WinJS.Namespace.defineWithParent_p:name">
            /// The name of the new namespace.
            /// </param>
            /// <param name="members" type="Object" locid="WinJS.Namespace.defineWithParent_p:members">
            /// The members of the new namespace.
            /// </param>
            /// <returns type="Object" locid="WinJS.Namespace.defineWithParent_returnValue">
            /// The newly-defined namespace.
            /// </returns>
            /// </signature>
            var currentNamespace = createNamespace(parentNamespace, name);

            if (members) {
                initializeProperties(currentNamespace, members, name || "<ANONYMOUS>");
            }

            return currentNamespace;
        }

        function define(name, members) {
            /// <signature helpKeyword="WinJS.Namespace.define">
            /// <summary locid="WinJS.Namespace.define">
            /// Defines a new namespace with the specified name.
            /// </summary>
            /// <param name="name" type="String" locid="WinJS.Namespace.define_p:name">
            /// The name of the namespace. This could be a dot-separated name for nested namespaces.
            /// </param>
            /// <param name="members" type="Object" locid="WinJS.Namespace.define_p:members">
            /// The members of the new namespace.
            /// </param>
            /// <returns type="Object" locid="WinJS.Namespace.define_returnValue">
            /// The newly-defined namespace.
            /// </returns>
            /// </signature>
            return defineWithParent(_Global, name, members);
        }

        var LazyStates = {
            uninitialized: 1,
            working: 2,
            initialized: 3,
        };

        function lazy(f) {
            var name;
            var state = LazyStates.uninitialized;
            var result;
            return {
                setName: function (value) {
                    name = value;
                },
                get: function () {
                    switch (state) {
                        case LazyStates.initialized:
                            return result;

                        case LazyStates.uninitialized:
                            state = LazyStates.working;
                            try {
                                _WriteProfilerMark("WinJS.Namespace._lazy:" + name + ",StartTM");
                                result = f();
                            } finally {
                                _WriteProfilerMark("WinJS.Namespace._lazy:" + name + ",StopTM");
                                state = LazyStates.uninitialized;
                            }
                            f = null;
                            state = LazyStates.initialized;
                            return result;

                        case LazyStates.working:
                            throw "Illegal: reentrancy on initialization";

                        default:
                            throw "Illegal";
                    }
                },
                set: function (value) {
                    switch (state) {
                        case LazyStates.working:
                            throw "Illegal: reentrancy on initialization";

                        default:
                            state = LazyStates.initialized;
                            result = value;
                            break;
                    }
                },
                enumerable: true,
                configurable: true,
            };
        }

        // helper for defining AMD module members
        function moduleDefine(exports, name, members) {
            var target = [exports];
            var publicNS = null;
            if (name) {
                publicNS = createNamespace(_Global, name);
                target.push(publicNS);
            }
            initializeProperties(target, members, name || "<ANONYMOUS>");
            return publicNS;
        }

        // Establish members of the "WinJS.Namespace" namespace
        Object.defineProperties(_rootNamespace.Namespace, {

            defineWithParent: { value: defineWithParent, writable: true, enumerable: true, configurable: true },

            define: { value: define, writable: true, enumerable: true, configurable: true },

            _lazy: { value: lazy, writable: true, enumerable: true, configurable: true },

            _moduleDefine: { value: moduleDefine, writable: true, enumerable: true, configurable: true }

        });

    })();

    (function () {

        function define(constructor, instanceMembers, staticMembers) {
            /// <signature helpKeyword="WinJS.Class.define">
            /// <summary locid="WinJS.Class.define">
            /// Defines a class using the given constructor and the specified instance members.
            /// </summary>
            /// <param name="constructor" type="Function" locid="WinJS.Class.define_p:constructor">
            /// A constructor function that is used to instantiate this class.
            /// </param>
            /// <param name="instanceMembers" type="Object" locid="WinJS.Class.define_p:instanceMembers">
            /// The set of instance fields, properties, and methods made available on the class.
            /// </param>
            /// <param name="staticMembers" type="Object" locid="WinJS.Class.define_p:staticMembers">
            /// The set of static fields, properties, and methods made available on the class.
            /// </param>
            /// <returns type="Function" locid="WinJS.Class.define_returnValue">
            /// The newly-defined class.
            /// </returns>
            /// </signature>
            constructor = constructor || function () { };
            _BaseCoreUtils.markSupportedForProcessing(constructor);
            if (instanceMembers) {
                initializeProperties(constructor.prototype, instanceMembers);
            }
            if (staticMembers) {
                initializeProperties(constructor, staticMembers);
            }
            return constructor;
        }

        function derive(baseClass, constructor, instanceMembers, staticMembers) {
            /// <signature helpKeyword="WinJS.Class.derive">
            /// <summary locid="WinJS.Class.derive">
            /// Creates a sub-class based on the supplied baseClass parameter, using prototypal inheritance.
            /// </summary>
            /// <param name="baseClass" type="Function" locid="WinJS.Class.derive_p:baseClass">
            /// The class to inherit from.
            /// </param>
            /// <param name="constructor" type="Function" locid="WinJS.Class.derive_p:constructor">
            /// A constructor function that is used to instantiate this class.
            /// </param>
            /// <param name="instanceMembers" type="Object" locid="WinJS.Class.derive_p:instanceMembers">
            /// The set of instance fields, properties, and methods to be made available on the class.
            /// </param>
            /// <param name="staticMembers" type="Object" locid="WinJS.Class.derive_p:staticMembers">
            /// The set of static fields, properties, and methods to be made available on the class.
            /// </param>
            /// <returns type="Function" locid="WinJS.Class.derive_returnValue">
            /// The newly-defined class.
            /// </returns>
            /// </signature>
            if (baseClass) {
                constructor = constructor || function () { };
                var basePrototype = baseClass.prototype;
                constructor.prototype = Object.create(basePrototype);
                _BaseCoreUtils.markSupportedForProcessing(constructor);
                Object.defineProperty(constructor.prototype, "constructor", { value: constructor, writable: true, configurable: true, enumerable: true });
                if (instanceMembers) {
                    initializeProperties(constructor.prototype, instanceMembers);
                }
                if (staticMembers) {
                    initializeProperties(constructor, staticMembers);
                }
                return constructor;
            } else {
                return define(constructor, instanceMembers, staticMembers);
            }
        }

        function mix(constructor) {
            /// <signature helpKeyword="WinJS.Class.mix">
            /// <summary locid="WinJS.Class.mix">
            /// Defines a class using the given constructor and the union of the set of instance members
            /// specified by all the mixin objects. The mixin parameter list is of variable length.
            /// </summary>
            /// <param name="constructor" locid="WinJS.Class.mix_p:constructor">
            /// A constructor function that is used to instantiate this class.
            /// </param>
            /// <returns type="Function" locid="WinJS.Class.mix_returnValue">
            /// The newly-defined class.
            /// </returns>
            /// </signature>
            constructor = constructor || function () { };
            var i, len;
            for (i = 1, len = arguments.length; i < len; i++) {
                initializeProperties(constructor.prototype, arguments[i]);
            }
            return constructor;
        }

        // Establish members of "WinJS.Class" namespace
        _WinJS.Namespace.define("WinJS.Class", {
            define: define,
            derive: derive,
            mix: mix
        });

    })();

    return {
        Namespace: _WinJS.Namespace,
        Class: _WinJS.Class
    };

});
// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_ErrorFromName',[
    './_Base'
    ], function errorsInit(_Base) {
    "use strict";

    var ErrorFromName = _Base.Class.derive(Error, function (name, message) {
        /// <signature helpKeyword="WinJS.ErrorFromName">
        /// <summary locid="WinJS.ErrorFromName">
        /// Creates an Error object with the specified name and message properties.
        /// </summary>
        /// <param name="name" type="String" locid="WinJS.ErrorFromName_p:name">The name of this error. The name is meant to be consumed programmatically and should not be localized.</param>
        /// <param name="message" type="String" optional="true" locid="WinJS.ErrorFromName_p:message">The message for this error. The message is meant to be consumed by humans and should be localized.</param>
        /// <returns type="Error" locid="WinJS.ErrorFromName_returnValue">Error instance with .name and .message properties populated</returns>
        /// </signature>
        this.name = name;
        this.message = message || name;
    }, {
        /* empty */
    }, {
        supportedForProcessing: false,
    });

    _Base.Namespace.define("WinJS", {
        // ErrorFromName establishes a simple pattern for returning error codes.
        //
        ErrorFromName: ErrorFromName
    });

    return ErrorFromName;

});


// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_WinRT',[
    'exports',
    './_Global',
    './_Base',
], function winrtInit(exports, _Global, _Base) {
    "use strict";

    exports.msGetWeakWinRTProperty = _Global.msGetWeakWinRTProperty;
    exports.msSetWeakWinRTProperty = _Global.msSetWeakWinRTProperty;

    var APIs = [
        "Windows.ApplicationModel.DesignMode.designModeEnabled",
        "Windows.ApplicationModel.Resources.Core.ResourceContext",
        "Windows.ApplicationModel.Resources.Core.ResourceManager",
        "Windows.ApplicationModel.Search.Core.SearchSuggestionManager",
        "Windows.ApplicationModel.Search.SearchQueryLinguisticDetails",
        "Windows.Data.Text.SemanticTextQuery",
        "Windows.Foundation.Collections.CollectionChange",
        "Windows.Foundation.Diagnostics",
        "Windows.Foundation.Uri",
        "Windows.Globalization.ApplicationLanguages",
        "Windows.Globalization.Calendar",
        "Windows.Globalization.DateTimeFormatting",
        "Windows.Globalization.Language",
        "Windows.Phone.UI.Input.HardwareButtons",
        "Windows.Storage.ApplicationData",
        "Windows.Storage.CreationCollisionOption",
        "Windows.Storage.BulkAccess.FileInformationFactory",
        "Windows.Storage.FileIO",
        "Windows.Storage.FileProperties.ThumbnailType",
        "Windows.Storage.FileProperties.ThumbnailMode",
        "Windows.Storage.FileProperties.ThumbnailOptions",
        "Windows.Storage.KnownFolders",
        "Windows.Storage.Search.FolderDepth",
        "Windows.Storage.Search.IndexerOption",
        "Windows.Storage.Streams.RandomAccessStreamReference",
        "Windows.UI.ApplicationSettings.SettingsEdgeLocation",
        "Windows.UI.ApplicationSettings.SettingsCommand",
        "Windows.UI.ApplicationSettings.SettingsPane",
        "Windows.UI.Core.AnimationMetrics",
        "Windows.UI.Input.EdgeGesture",
        "Windows.UI.Input.EdgeGestureKind",
        "Windows.UI.Input.PointerPoint",
        "Windows.UI.ViewManagement.HandPreference",
        "Windows.UI.ViewManagement.InputPane",
        "Windows.UI.ViewManagement.UISettings",
        "Windows.UI.WebUI.Core.WebUICommandBar",
        "Windows.UI.WebUI.Core.WebUICommandBarBitmapIcon",
        "Windows.UI.WebUI.Core.WebUICommandBarClosedDisplayMode",
        "Windows.UI.WebUI.Core.WebUICommandBarIconButton",
        "Windows.UI.WebUI.Core.WebUICommandBarSymbolIcon",
        "Windows.UI.WebUI.WebUIApplication",
    ];

    APIs.forEach(function (api) {
        var parts = api.split(".");
        var leaf = {};
        leaf[parts[parts.length - 1]] = {
            get: function () {
                return parts.reduce(function (current, part) { return current ? current[part] : null; }, _Global);
            }
        };
        _Base.Namespace.defineWithParent(exports, parts.slice(0, -1).join("."), leaf);
    });

});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_Events',[
    'exports',
    './_Base'
    ], function eventsInit(exports, _Base) {
    "use strict";


    function createEventProperty(name) {
        var eventPropStateName = "_on" + name + "state";

        return {
            get: function () {
                var state = this[eventPropStateName];
                return state && state.userHandler;
            },
            set: function (handler) {
                var state = this[eventPropStateName];
                if (handler) {
                    if (!state) {
                        state = { wrapper: function (evt) { return state.userHandler(evt); }, userHandler: handler };
                        Object.defineProperty(this, eventPropStateName, { value: state, enumerable: false, writable:true, configurable: true });
                        this.addEventListener(name, state.wrapper, false);
                    }
                    state.userHandler = handler;
                } else if (state) {
                    this.removeEventListener(name, state.wrapper, false);
                    this[eventPropStateName] = null;
                }
            },
            enumerable: true
        };
    }

    function createEventProperties() {
        /// <signature helpKeyword="WinJS.Utilities.createEventProperties">
        /// <summary locid="WinJS.Utilities.createEventProperties">
        /// Creates an object that has one property for each name passed to the function.
        /// </summary>
        /// <param name="events" locid="WinJS.Utilities.createEventProperties_p:events">
        /// A variable list of property names.
        /// </param>
        /// <returns type="Object" locid="WinJS.Utilities.createEventProperties_returnValue">
        /// The object with the specified properties. The names of the properties are prefixed with 'on'.
        /// </returns>
        /// </signature>
        var props = {};
        for (var i = 0, len = arguments.length; i < len; i++) {
            var name = arguments[i];
            props["on" + name] = createEventProperty(name);
        }
        return props;
    }

    var EventMixinEvent = _Base.Class.define(
        function EventMixinEvent_ctor(type, detail, target) {
            this.detail = detail;
            this.target = target;
            this.timeStamp = Date.now();
            this.type = type;
        },
        {
            bubbles: { value: false, writable: false },
            cancelable: { value: false, writable: false },
            currentTarget: {
                get: function () { return this.target; }
            },
            defaultPrevented: {
                get: function () { return this._preventDefaultCalled; }
            },
            trusted: { value: false, writable: false },
            eventPhase: { value: 0, writable: false },
            target: null,
            timeStamp: null,
            type: null,

            preventDefault: function () {
                this._preventDefaultCalled = true;
            },
            stopImmediatePropagation: function () {
                this._stopImmediatePropagationCalled = true;
            },
            stopPropagation: function () {
            }
        }, {
            supportedForProcessing: false,
        }
    );

    var eventMixin = {
        _listeners: null,

        addEventListener: function (type, listener, useCapture) {
            /// <signature helpKeyword="WinJS.Utilities.eventMixin.addEventListener">
            /// <summary locid="WinJS.Utilities.eventMixin.addEventListener">
            /// Adds an event listener to the control.
            /// </summary>
            /// <param name="type" locid="WinJS.Utilities.eventMixin.addEventListener_p:type">
            /// The type (name) of the event.
            /// </param>
            /// <param name="listener" locid="WinJS.Utilities.eventMixin.addEventListener_p:listener">
            /// The listener to invoke when the event is raised.
            /// </param>
            /// <param name="useCapture" locid="WinJS.Utilities.eventMixin.addEventListener_p:useCapture">
            /// if true initiates capture, otherwise false.
            /// </param>
            /// </signature>
            useCapture = useCapture || false;
            this._listeners = this._listeners || {};
            var eventListeners = (this._listeners[type] = this._listeners[type] || []);
            for (var i = 0, len = eventListeners.length; i < len; i++) {
                var l = eventListeners[i];
                if (l.useCapture === useCapture && l.listener === listener) {
                    return;
                }
            }
            eventListeners.push({ listener: listener, useCapture: useCapture });
        },
        dispatchEvent: function (type, details) {
            /// <signature helpKeyword="WinJS.Utilities.eventMixin.dispatchEvent">
            /// <summary locid="WinJS.Utilities.eventMixin.dispatchEvent">
            /// Raises an event of the specified type and with the specified additional properties.
            /// </summary>
            /// <param name="type" locid="WinJS.Utilities.eventMixin.dispatchEvent_p:type">
            /// The type (name) of the event.
            /// </param>
            /// <param name="details" locid="WinJS.Utilities.eventMixin.dispatchEvent_p:details">
            /// The set of additional properties to be attached to the event object when the event is raised.
            /// </param>
            /// <returns type="Boolean" locid="WinJS.Utilities.eventMixin.dispatchEvent_returnValue">
            /// true if preventDefault was called on the event.
            /// </returns>
            /// </signature>
            var listeners = this._listeners && this._listeners[type];
            if (listeners) {
                var eventValue = new EventMixinEvent(type, details, this);
                // Need to copy the array to protect against people unregistering while we are dispatching
                listeners = listeners.slice(0, listeners.length);
                for (var i = 0, len = listeners.length; i < len && !eventValue._stopImmediatePropagationCalled; i++) {
                    listeners[i].listener(eventValue);
                }
                return eventValue.defaultPrevented || false;
            }
            return false;
        },
        removeEventListener: function (type, listener, useCapture) {
            /// <signature helpKeyword="WinJS.Utilities.eventMixin.removeEventListener">
            /// <summary locid="WinJS.Utilities.eventMixin.removeEventListener">
            /// Removes an event listener from the control.
            /// </summary>
            /// <param name="type" locid="WinJS.Utilities.eventMixin.removeEventListener_p:type">
            /// The type (name) of the event.
            /// </param>
            /// <param name="listener" locid="WinJS.Utilities.eventMixin.removeEventListener_p:listener">
            /// The listener to remove.
            /// </param>
            /// <param name="useCapture" locid="WinJS.Utilities.eventMixin.removeEventListener_p:useCapture">
            /// Specifies whether to initiate capture.
            /// </param>
            /// </signature>
            useCapture = useCapture || false;
            var listeners = this._listeners && this._listeners[type];
            if (listeners) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    var l = listeners[i];
                    if (l.listener === listener && l.useCapture === useCapture) {
                        listeners.splice(i, 1);
                        if (listeners.length === 0) {
                            delete this._listeners[type];
                        }
                        // Only want to remove one element for each call to removeEventListener
                        break;
                    }
                }
            }
        }
    };

    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        _createEventProperty: createEventProperty,
        createEventProperties: createEventProperties,
        eventMixin: eventMixin
    });

});


// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
// RequireJS plugin to handle embedding JSON files (such as for string resources)
define('require-json',['require'], function (req) {
    "use strict";

    var api = {};
    var content = {};

    // Called to load a resource. This is the only mandatory API method that
    // needs to be implemented for the plugin to be useful.
    api.load = function (name, parentRequire, onLoad, config) {
        // Do nothing outside of optimized build
        if (!config.isBuild) {
            onLoad();
            return;
        }

        var fs = require.nodeRequire('fs');
        var filePath = parentRequire.toUrl(name);
        content[name] = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, '');
        onLoad();
    };

    // Used by the optimizer to indicate when the plugin should write out
    // a representation of the the resource in the optimized file.
    api.write = function (pluginName, moduleName, write) {
        write.asModule(pluginName + '!' + moduleName, 'define(' + content[moduleName] + ')');
    };

    return api;
});

define('require-json!en-US/ui.resjson',{
    "appBarAriaLabel": "App Bar",
    "appBarCommandAriaLabel": "App Bar Item",
    "autoSuggestBoxAriaLabel": "Autosuggestbox",
    "autoSuggestBoxAriaLabelInputNoPlaceHolder": "Autosuggestbox, enter to submit query, esc to clear text",
    "autoSuggestBoxAriaLabelInputPlaceHolder": "Autosuggestbox, {0}, enter to submit query, esc to clear text",
    "autoSuggestBoxAriaLabelQuery": "Suggestion: {0}",
    "_autoSuggestBoxAriaLabelQuery.comment": "Suggestion: query text (example: Suggestion: contoso)",
    "autoSuggestBoxAriaLabelSeparator": "Separator: {0}",
    "_autoSuggestBoxAriaLabelSeparator.comment": "Separator: separator text (example: Separator: People or Separator: Apps)",
    "autoSuggestBoxAriaLabelResult": "Result: {0}, {1}",
    "_autoSuggestBoxAriaLabelResult.comment": "Result: text, detailed text (example: Result: contoso, www.contoso.com)",
    "averageRating": "Average Rating",
    "backbuttonarialabel": "Back",
    "clearYourRating" : "Clear your rating",
    "closeOverlay" : "Close",
    "datePicker": "Date Picker",
    "flipViewPanningContainerAriaLabel": "Scrolling Container",
    "flyoutAriaLabel": "Flyout",
    "hubViewportAriaLabel": "Scrolling Container",
    "listViewViewportAriaLabel": "Scrolling Container",
    "menuCommandAriaLabel": "Menu Item",
    "menuAriaLabel": "Menu",
    "navBarContainerViewportAriaLabel": "Scrolling Container",
    "off" : "Off",
    "on" : "On",
    "pivotAriaLabel": "Pivot",
    "pivotViewportAriaLabel": "Scrolling Container",
    "searchBoxAriaLabel": "Searchbox",
    "searchBoxAriaLabelInputNoPlaceHolder": "Searchbox, enter to submit query, esc to clear text",
    "searchBoxAriaLabelInputPlaceHolder": "Searchbox, {0}, enter to submit query, esc to clear text",
    "searchBoxAriaLabelButton": "Click to submit query",
    "selectAMPM": "Select A.M P.M",
    "selectDay": "Select Day",
    "selectHour": "Select Hour",
    "selectMinute": "Select Minute",
    "selectMonth": "Select Month",
    "selectYear": "Select Year",
    "settingsFlyoutAriaLabel": "Settings Flyout",
    "tentativeRating": "Tentative Rating",
    "timePicker": "Time Picker",
    "toolbarAriaLabel": "ToolBar",
    "toolbarOverflowButtonAriaLabel": "View more",
    "unrated": "Unrated",
    "userRating": "User Rating",
    // AppBar Icons follow, the format of the ui.js and ui.resjson differ for
    // the AppBarIcon namespace.  The remainder of the file therefore differs.
    // Code point comments are the icon glyphs in the 'Segoe UI Symbol' font.
    "appBarIcons\\previous":                            "\uE100", //  group:Media
    "_appBarIcons\\previous.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\next":                                "\uE101", //  group:Media
    "_appBarIcons\\next.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\play":                                "\uE102", //  group:Media
    "_appBarIcons\\play.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\pause":                               "\uE103", //  group:Media
    "_appBarIcons\\pause.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\edit":                                "\uE104", //  group:File
    "_appBarIcons\\edit.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\save":                                "\uE105", //  group:File
    "_appBarIcons\\save.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\clear":                               "\uE106", //  group:File
    "_appBarIcons\\clear.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\delete":                              "\uE107", //  group:File
    "_appBarIcons\\delete.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\remove":                              "\uE108", //  group:File
    "_appBarIcons\\remove.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\add":                                 "\uE109", //  group:File
    "_appBarIcons\\add.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\cancel":                              "\uE10A", //  group:Editing
    "_appBarIcons\\cancel.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\accept":                              "\uE10B", //  group:General
    "_appBarIcons\\accept.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\more":                                "\uE10C", //  group:General
    "_appBarIcons\\more.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\redo":                                "\uE10D", //  group:Editing
    "_appBarIcons\\redo.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\undo":                                "\uE10E", //  group:Editing
    "_appBarIcons\\undo.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\home":                                "\uE10F", //  group:General
    "_appBarIcons\\home.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\up":                                  "\uE110", //  group:General
    "_appBarIcons\\up.comment":                         "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\forward":                             "\uE111", //  group:General
    "_appBarIcons\\forward.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\right":                               "\uE111", //  group:General
    "_appBarIcons\\right.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\back":                                "\uE112", //  group:General
    "_appBarIcons\\back.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\left":                                "\uE112", //  group:General
    "_appBarIcons\\left.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\favorite":                            "\uE113", //  group:Media
    "_appBarIcons\\favorite.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\camera":                              "\uE114", //  group:System
    "_appBarIcons\\camera.comment":                     "{Locked:qps-ploc,qps-plocm}",    
    "appBarIcons\\settings":                            "\uE115", //  group:System
    "_appBarIcons\\settings.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\video":                               "\uE116", //  group:Media
    "_appBarIcons\\video.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\sync":                                "\uE117", //  group:Media
    "_appBarIcons\\sync.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\download":                            "\uE118", //  group:Media
    "_appBarIcons\\download.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mail":                                "\uE119", //  group:Mail and calendar
    "_appBarIcons\\mail.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\find":                                "\uE11A", //  group:Data
    "_appBarIcons\\find.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\help":                                "\uE11B", //  group:General
    "_appBarIcons\\help.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\upload":                              "\uE11C", //  group:Media
    "_appBarIcons\\upload.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\emoji":                               "\uE11D", //  group:Communications
    "_appBarIcons\\emoji.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\twopage":                             "\uE11E", //  group:Layout
    "_appBarIcons\\twopage.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\leavechat":                           "\uE11F", //  group:Communications
    "_appBarIcons\\leavechat.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mailforward":                         "\uE120", //  group:Mail and calendar
    "_appBarIcons\\mailforward.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\clock":                               "\uE121", //  group:General
    "_appBarIcons\\clock.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\send":                                "\uE122", //  group:Mail and calendar
    "_appBarIcons\\send.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\crop":                                "\uE123", //  group:Editing
    "_appBarIcons\\crop.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\rotatecamera":                        "\uE124", //  group:System
    "_appBarIcons\\rotatecamera.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\people":                              "\uE125", //  group:Communications
    "_appBarIcons\\people.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\closepane":                           "\uE126", //  group:Layout
    "_appBarIcons\\closepane.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\openpane":                            "\uE127", //  group:Layout
    "_appBarIcons\\openpane.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\world":                               "\uE128", //  group:General
    "_appBarIcons\\world.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\flag":                                "\uE129", //  group:Mail and calendar
    "_appBarIcons\\flag.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\previewlink":                         "\uE12A", //  group:General
    "_appBarIcons\\previewlink.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\globe":                               "\uE12B", //  group:Communications
    "_appBarIcons\\globe.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\trim":                                "\uE12C", //  group:Editing
    "_appBarIcons\\trim.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\attachcamera":                        "\uE12D", //  group:System
    "_appBarIcons\\attachcamera.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\zoomin":                              "\uE12E", //  group:Layout
    "_appBarIcons\\zoomin.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\bookmarks":                           "\uE12F", //  group:Editing
    "_appBarIcons\\bookmarks.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\document":                            "\uE130", //  group:File
    "_appBarIcons\\document.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\protecteddocument":                   "\uE131", //  group:File
    "_appBarIcons\\protecteddocument.comment":          "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\page":                                "\uE132", //  group:Layout
    "_appBarIcons\\page.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\bullets":                             "\uE133", //  group:Editing
    "_appBarIcons\\bullets.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\comment":                             "\uE134", //  group:Communications
    "_appBarIcons\\comment.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mail2":                               "\uE135", //  group:Mail and calendar
    "_appBarIcons\\mail2.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\contactinfo":                         "\uE136", //  group:Communications
    "_appBarIcons\\contactinfo.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\hangup":                              "\uE137", //  group:Communications
    "_appBarIcons\\hangup.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\viewall":                             "\uE138", //  group:Data
    "_appBarIcons\\viewall.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mappin":                              "\uE139", //  group:General
    "_appBarIcons\\mappin.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\phone":                               "\uE13A", //  group:Communications
    "_appBarIcons\\phone.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\videochat":                           "\uE13B", //  group:Communications
    "_appBarIcons\\videochat.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\switch":                              "\uE13C", //  group:Communications
    "_appBarIcons\\switch.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\contact":                             "\uE13D", //  group:Communications
    "_appBarIcons\\contact.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\rename":                              "\uE13E", //  group:File
    "_appBarIcons\\rename.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\pin":                                 "\uE141", //  group:System
    "_appBarIcons\\pin.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\musicinfo":                           "\uE142", //  group:Media
    "_appBarIcons\\musicinfo.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\go":                                  "\uE143", //  group:General
    "_appBarIcons\\go.comment":                         "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\keyboard":                            "\uE144", //  group:System
    "_appBarIcons\\keyboard.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\dockleft":                            "\uE145", //  group:Layout
    "_appBarIcons\\dockleft.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\dockright":                           "\uE146", //  group:Layout
    "_appBarIcons\\dockright.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\dockbottom":                          "\uE147", //  group:Layout
    "_appBarIcons\\dockbottom.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\remote":                              "\uE148", //  group:System
    "_appBarIcons\\remote.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\refresh":                             "\uE149", //  group:Data
    "_appBarIcons\\refresh.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\rotate":                              "\uE14A", //  group:Layout
    "_appBarIcons\\rotate.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\shuffle":                             "\uE14B", //  group:Media
    "_appBarIcons\\shuffle.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\list":                                "\uE14C", //  group:Editing
    "_appBarIcons\\list.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\shop":                                "\uE14D", //  group:General
    "_appBarIcons\\shop.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\selectall":                           "\uE14E", //  group:Data
    "_appBarIcons\\selectall.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\orientation":                         "\uE14F", //  group:Layout
    "_appBarIcons\\orientation.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\import":                              "\uE150", //  group:Data
    "_appBarIcons\\import.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\importall":                           "\uE151", //  group:Data
    "_appBarIcons\\importall.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\browsephotos":                        "\uE155", //  group:Media
    "_appBarIcons\\browsephotos.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\webcam":                              "\uE156", //  group:System
    "_appBarIcons\\webcam.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\pictures":                            "\uE158", //  group:Media
    "_appBarIcons\\pictures.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\savelocal":                           "\uE159", //  group:File
    "_appBarIcons\\savelocal.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\caption":                             "\uE15A", //  group:Media
    "_appBarIcons\\caption.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\stop":                                "\uE15B", //  group:Media
    "_appBarIcons\\stop.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\showresults":                         "\uE15C", //  group:Data
    "_appBarIcons\\showresults.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\volume":                              "\uE15D", //  group:Media
    "_appBarIcons\\volume.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\repair":                              "\uE15E", //  group:System
    "_appBarIcons\\repair.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\message":                             "\uE15F", //  group:Communications
    "_appBarIcons\\message.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\page2":                               "\uE160", //  group:Layout
    "_appBarIcons\\page2.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calendarday":                         "\uE161", //  group:Mail and calendar
    "_appBarIcons\\calendarday.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calendarweek":                        "\uE162", //  group:Mail and calendar
    "_appBarIcons\\calendarweek.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calendar":                            "\uE163", //  group:Mail and calendar
    "_appBarIcons\\calendar.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\characters":                          "\uE164", //  group:Editing
    "_appBarIcons\\characters.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mailreplyall":                        "\uE165", //  group:Mail and calendar
    "_appBarIcons\\mailreplyall.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\read":                                "\uE166", //  group:Mail and calendar
    "_appBarIcons\\read.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\link":                                "\uE167", //  group:Communications
    "_appBarIcons\\link.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\accounts":                            "\uE168", //  group:Communications
    "_appBarIcons\\accounts.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\showbcc":                             "\uE169", //  group:Mail and calendar
    "_appBarIcons\\showbcc.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\hidebcc":                             "\uE16A", //  group:Mail and calendar
    "_appBarIcons\\hidebcc.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\cut":                                 "\uE16B", //  group:Editing
    "_appBarIcons\\cut.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\attach":                              "\uE16C", //  group:Mail and calendar
    "_appBarIcons\\attach.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\paste":                               "\uE16D", //  group:Editing
    "_appBarIcons\\paste.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\filter":                              "\uE16E", //  group:Data
    "_appBarIcons\\filter.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\copy":                                "\uE16F", //  group:Editing
    "_appBarIcons\\copy.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\emoji2":                              "\uE170", //  group:Mail and calendar
    "_appBarIcons\\emoji2.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\important":                           "\uE171", //  group:Mail and calendar
    "_appBarIcons\\important.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mailreply":                           "\uE172", //  group:Mail and calendar
    "_appBarIcons\\mailreply.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\slideshow":                           "\uE173", //  group:Media
    "_appBarIcons\\slideshow.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\sort":                                "\uE174", //  group:Data
    "_appBarIcons\\sort.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\manage":                              "\uE178", //  group:System
    "_appBarIcons\\manage.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\allapps":                             "\uE179", //  group:System
    "_appBarIcons\\allapps.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\disconnectdrive":                     "\uE17A", //  group:System
    "_appBarIcons\\disconnectdrive.comment":            "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mapdrive":                            "\uE17B", //  group:System
    "_appBarIcons\\mapdrive.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\newwindow":                           "\uE17C", //  group:System
    "_appBarIcons\\newwindow.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\openwith":                            "\uE17D", //  group:System
    "_appBarIcons\\openwith.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\contactpresence":                     "\uE181", //  group:Communications
    "_appBarIcons\\contactpresence.comment":            "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\priority":                            "\uE182", //  group:Mail and calendar
    "_appBarIcons\\priority.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\uploadskydrive":                      "\uE183", //  group:File
    "_appBarIcons\\uploadskydrive.comment":             "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\gototoday":                           "\uE184", //  group:Mail and calendar
    "_appBarIcons\\gototoday.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\font":                                "\uE185", //  group:Editing
    "_appBarIcons\\font.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fontcolor":                           "\uE186", //  group:Editing
    "_appBarIcons\\fontcolor.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\contact2":                            "\uE187", //  group:Communications
    "_appBarIcons\\contact2.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\folder":                              "\uE188", //  group:File
    "_appBarIcons\\folder.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\audio":                               "\uE189", //  group:Media
    "_appBarIcons\\audio.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\placeholder":                         "\uE18A", //  group:General
    "_appBarIcons\\placeholder.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\view":                                "\uE18B", //  group:Layout
    "_appBarIcons\\view.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\setlockscreen":                       "\uE18C", //  group:System
    "_appBarIcons\\setlockscreen.comment":              "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\settile":                             "\uE18D", //  group:System
    "_appBarIcons\\settile.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\cc":                                  "\uE190", //  group:Media
    "_appBarIcons\\cc.comment":                         "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\stopslideshow":                       "\uE191", //  group:Media
    "_appBarIcons\\stopslideshow.comment":              "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\permissions":                         "\uE192", //  group:System
    "_appBarIcons\\permissions.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\highlight":                           "\uE193", //  group:Editing
    "_appBarIcons\\highlight.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\disableupdates":                      "\uE194", //  group:System
    "_appBarIcons\\disableupdates.comment":             "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\unfavorite":                          "\uE195", //  group:Media
    "_appBarIcons\\unfavorite.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\unpin":                               "\uE196", //  group:System
    "_appBarIcons\\unpin.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\openlocal":                           "\uE197", //  group:File
    "_appBarIcons\\openlocal.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\mute":                                "\uE198", //  group:Media
    "_appBarIcons\\mute.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\italic":                              "\uE199", //  group:Editing
    "_appBarIcons\\italic.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\underline":                           "\uE19A", //  group:Editing
    "_appBarIcons\\underline.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\bold":                                "\uE19B", //  group:Editing
    "_appBarIcons\\bold.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\movetofolder":                        "\uE19C", //  group:File
    "_appBarIcons\\movetofolder.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\likedislike":                         "\uE19D", //  group:Data
    "_appBarIcons\\likedislike.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\dislike":                             "\uE19E", //  group:Data
    "_appBarIcons\\dislike.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\like":                                "\uE19F", //  group:Data
    "_appBarIcons\\like.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\alignright":                          "\uE1A0", //  group:Editing
    "_appBarIcons\\alignright.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\aligncenter":                         "\uE1A1", //  group:Editing
    "_appBarIcons\\aligncenter.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\alignleft":                           "\uE1A2", //  group:Editing
    "_appBarIcons\\alignleft.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\zoom":                                "\uE1A3", //  group:Layout
    "_appBarIcons\\zoom.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\zoomout":                             "\uE1A4", //  group:Layout
    "_appBarIcons\\zoomout.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\openfile":                            "\uE1A5", //  group:File
    "_appBarIcons\\openfile.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\otheruser":                           "\uE1A6", //  group:System
    "_appBarIcons\\otheruser.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\admin":                               "\uE1A7", //  group:System
    "_appBarIcons\\admin.comment":                      "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\street":                              "\uE1C3", //  group:General
    "_appBarIcons\\street.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\map":                                 "\uE1C4", //  group:General
    "_appBarIcons\\map.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\clearselection":                      "\uE1C5", //  group:Data
    "_appBarIcons\\clearselection.comment":             "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fontdecrease":                        "\uE1C6", //  group:Editing
    "_appBarIcons\\fontdecrease.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fontincrease":                        "\uE1C7", //  group:Editing
    "_appBarIcons\\fontincrease.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fontsize":                            "\uE1C8", //  group:Editing
    "_appBarIcons\\fontsize.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\cellphone":                           "\uE1C9", //  group:Communications
    "_appBarIcons\\cellphone.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\reshare":                             "\uE1CA", //  group:Communications
    "_appBarIcons\\reshare.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\tag":                                 "\uE1CB", //  group:Data
    "_appBarIcons\\tag.comment":                        "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\repeatone":                           "\uE1CC", //  group:Media
    "_appBarIcons\\repeatone.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\repeatall":                           "\uE1CD", //  group:Media
    "_appBarIcons\\repeatall.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\outlinestar":                         "\uE1CE", //  group:Data
    "_appBarIcons\\outlinestar.comment":                "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\solidstar":                           "\uE1CF", //  group:Data
    "_appBarIcons\\solidstar.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calculator":                          "\uE1D0", //  group:General
    "_appBarIcons\\calculator.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\directions":                          "\uE1D1", //  group:General
    "_appBarIcons\\directions.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\target":                              "\uE1D2", //  group:General
    "_appBarIcons\\target.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\library":                             "\uE1D3", //  group:Media
    "_appBarIcons\\library.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\phonebook":                           "\uE1D4", //  group:Communications
    "_appBarIcons\\phonebook.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\memo":                                "\uE1D5", //  group:Communications
    "_appBarIcons\\memo.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\microphone":                          "\uE1D6", //  group:System
    "_appBarIcons\\microphone.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\postupdate":                          "\uE1D7", //  group:Communications
    "_appBarIcons\\postupdate.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\backtowindow":                        "\uE1D8", //  group:Layout
    "_appBarIcons\\backtowindow.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fullscreen":                          "\uE1D9", //  group:Layout
    "_appBarIcons\\fullscreen.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\newfolder":                           "\uE1DA", //  group:File
    "_appBarIcons\\newfolder.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\calendarreply":                       "\uE1DB", //  group:Mail and calendar
    "_appBarIcons\\calendarreply.comment":              "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\unsyncfolder":                        "\uE1DD", //  group:File
    "_appBarIcons\\unsyncfolder.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\reporthacked":                        "\uE1DE", //  group:Communications
    "_appBarIcons\\reporthacked.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\syncfolder":                          "\uE1DF", //  group:File
    "_appBarIcons\\syncfolder.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\blockcontact":                        "\uE1E0", //  group:Communications
    "_appBarIcons\\blockcontact.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\switchapps":                          "\uE1E1", //  group:System
    "_appBarIcons\\switchapps.comment":                 "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\addfriend":                           "\uE1E2", //  group:Communications
    "_appBarIcons\\addfriend.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\touchpointer":                        "\uE1E3", //  group:System
    "_appBarIcons\\touchpointer.comment":               "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\gotostart":                           "\uE1E4", //  group:System
    "_appBarIcons\\gotostart.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\zerobars":                            "\uE1E5", //  group:System
    "_appBarIcons\\zerobars.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\onebar":                              "\uE1E6", //  group:System
    "_appBarIcons\\onebar.comment":                     "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\twobars":                             "\uE1E7", //  group:System
    "_appBarIcons\\twobars.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\threebars":                           "\uE1E8", //  group:System
    "_appBarIcons\\threebars.comment":                  "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\fourbars":                            "\uE1E9", //  group:System
    "_appBarIcons\\fourbars.comment":                   "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\scan":                                "\uE294", //  group:General
    "_appBarIcons\\scan.comment":                       "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\preview":                             "\uE295", //  group:General
    "_appBarIcons\\preview.comment":                    "{Locked:qps-ploc,qps-plocm}",
    "appBarIcons\\hamburger":                           "\uE700", //  group:General
    "_appBarIcons\\hamburger.comment":                  "{Locked:qps-ploc,qps-plocm}"
}
);
// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_Resources',[
    'exports',
    './_Global',
    './_WinRT',
    './_Base',
    './_Events',
    'require-json!en-US/ui.resjson',
    ], function resourcesInit(exports, _Global, _WinRT, _Base, _Events, defaultStrings) {
    "use strict";

    var appxVersion = "WinJS.4.0";
    var developerPrefix = "Developer.";
    if (appxVersion.indexOf(developerPrefix) === 0) {
        appxVersion = appxVersion.substring(developerPrefix.length);
    }

    function _getWinJSString(id) {
        var result = getString("ms-resource://" + appxVersion + "/" + id);

        if (result.empty) {
            result = _getStringBuiltIn(id);
        }

        return result;
    }

    function _getStringBuiltIn(resourceId) {

        var parts = resourceId.split("/");
        parts.shift(); // ignore the leading ui/

        var str = defaultStrings[parts.join("\\")];

        if (typeof str === "string") {
            str = { value: str };
        }

        return str || { value: resourceId, empty: true };
    }

    var resourceMap;
    var mrtEventHook = false;
    var contextChangedET = "contextchanged";
    var resourceContext;

    var ListenerType = _Base.Class.mix(_Base.Class.define(null, { /* empty */ }, { supportedForProcessing: false }), _Events.eventMixin);
    var listeners = new ListenerType();
    var createEvent = _Events._createEventProperty;

    var strings = {
        get malformedFormatStringInput() { return "Malformed, did you mean to escape your '{0}'?"; },
    };

    _Base.Namespace.define("WinJS.Resources", {
        _getWinJSString: _getWinJSString
    });

    function formatString(string) {
        var args = arguments;
        if (args.length > 1) {
            string = string.replace(/({{)|(}})|{(\d+)}|({)|(})/g, function (unused, left, right, index, illegalLeft, illegalRight) {
                if (illegalLeft || illegalRight) { throw formatString(strings.malformedFormatStringInput, illegalLeft || illegalRight); }
                return (left && "{") || (right && "}") || args[(index | 0) + 1];
            });
        }
        return string;
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.Resources", {
        addEventListener: function (type, listener, useCapture) {
            /// <signature helpKeyword="WinJS.Resources.addEventListener">
            /// <summary locid="WinJS.Resources.addEventListener">
            /// Registers an event handler for the specified event.
            /// </summary>
            /// <param name='type' type="String" locid='WinJS.Resources.addEventListener_p:type'>
            /// The name of the event to handle.
            /// </param>
            /// <param name='listener' type="Function" locid='WinJS.Resources.addEventListener_p:listener'>
            /// The listener to invoke when the event gets raised.
            /// </param>
            /// <param name='useCapture' type="Boolean" locid='WinJS.Resources.addEventListener_p:useCapture'>
            /// Set to true to register the event handler for the capturing phase; set to false to register for the bubbling phase.
            /// </param>
            /// </signature>
            if (_WinRT.Windows.ApplicationModel.Resources.Core.ResourceManager && !mrtEventHook) {
                if (type === contextChangedET) {
                    try {
                        var resContext = exports._getResourceContext();
                        if (resContext) {
                            resContext.qualifierValues.addEventListener("mapchanged", function (e) {
                                exports.dispatchEvent(contextChangedET, { qualifier: e.key, changed: e.target[e.key] });
                            }, false);

                        } else {
                            // The API can be called in the Background thread (web worker).
                            _WinRT.Windows.ApplicationModel.Resources.Core.ResourceManager.current.defaultContext.qualifierValues.addEventListener("mapchanged", function (e) {
                                exports.dispatchEvent(contextChangedET, { qualifier: e.key, changed: e.target[e.key] });
                            }, false);
                        }
                        mrtEventHook = true;
                    } catch (e) {
                    }
                }
            }
            listeners.addEventListener(type, listener, useCapture);
        },
        removeEventListener: listeners.removeEventListener.bind(listeners),
        dispatchEvent: listeners.dispatchEvent.bind(listeners),

        _formatString: formatString,

        _getStringWinRT: function (resourceId) {
            if (!resourceMap) {
                var mainResourceMap = _WinRT.Windows.ApplicationModel.Resources.Core.ResourceManager.current.mainResourceMap;
                try {
                    resourceMap = mainResourceMap.getSubtree('Resources');
                }
                catch (e) {
                }
                if (!resourceMap) {
                    resourceMap = mainResourceMap;
                }
            }

            var stringValue;
            var langValue;
            var resCandidate;
            try {
                var resContext = exports._getResourceContext();
                if (resContext) {
                    resCandidate = resourceMap.getValue(resourceId, resContext);
                } else {
                    resCandidate = resourceMap.getValue(resourceId);
                }

                if (resCandidate) {
                    stringValue = resCandidate.valueAsString;
                    if (stringValue === undefined) {
                        stringValue = resCandidate.toString();
                    }
                }
            }
            catch (e) { }

            if (!stringValue) {
                return exports._getStringJS(resourceId);
            }

            try {
                langValue = resCandidate.getQualifierValue("Language");
            }
            catch (e) {
                return { value: stringValue };
            }

            return { value: stringValue, lang: langValue };
        },

        _getStringJS: function (resourceId) {
            var str = _Global.strings && _Global.strings[resourceId];
            if (typeof str === "string") {
                str = { value: str };
            }
            return str || { value: resourceId, empty: true };
        },

        _getResourceContext: function () {
            if (_Global.document) {
                if (typeof (resourceContext) === 'undefined') {
                    var context = _WinRT.Windows.ApplicationModel.Resources.Core.ResourceContext;
                    if (context.getForCurrentView) {
                        resourceContext = context.getForCurrentView();
                    } else {
                        resourceContext = null;
                    }

                }
            }
            return resourceContext;
        },

        oncontextchanged: createEvent(contextChangedET)

    });

    var getStringImpl = _WinRT.Windows.ApplicationModel.Resources.Core.ResourceManager ? exports._getStringWinRT : exports._getStringJS;

    var getString = function (resourceId) {
        /// <signature helpKeyword="WinJS.Resources.getString">
        /// <summary locid='WinJS.Resources.getString'>
        /// Retrieves the resource string that has the specified resource id.
        /// </summary>
        /// <param name='resourceId' type="Number" locid='WinJS.Resources.getString._p:resourceId'>
        /// The resource id of the string to retrieve.
        /// </param>
        /// <returns type='Object' locid='WinJS.Resources.getString_returnValue'>
        /// An object that can contain these properties:
        ///
        /// value:
        /// The value of the requested string. This property is always present.
        ///
        /// empty:
        /// A value that specifies whether the requested string wasn't found.
        /// If its true, the string wasn't found. If its false or undefined,
        /// the requested string was found.
        ///
        /// lang:
        /// The language of the string, if specified. This property is only present
        /// for multi-language resources.
        ///
        /// </returns>
        /// </signature>

        return getStringImpl(resourceId);
    };

    _Base.Namespace._moduleDefine(exports, null, {
        _formatString: formatString,
        _getWinJSString: _getWinJSString
    });

    _Base.Namespace._moduleDefine(exports, "WinJS.Resources", {
        getString: {
            get: function () {
                return getString;
            },
            set: function (value) {
                getString = value;
            }
        }
    });

});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_Trace',[
    './_Global'
    ], function traceInit(_Global) {
    "use strict";

    function nop(v) {
        return v;
    }

    return {
        _traceAsyncOperationStarting: (_Global.Debug && _Global.Debug.msTraceAsyncOperationStarting && _Global.Debug.msTraceAsyncOperationStarting.bind(_Global.Debug)) || nop,
        _traceAsyncOperationCompleted: (_Global.Debug && _Global.Debug.msTraceAsyncOperationCompleted && _Global.Debug.msTraceAsyncOperationCompleted.bind(_Global.Debug)) || nop,
        _traceAsyncCallbackStarting: (_Global.Debug && _Global.Debug.msTraceAsyncCallbackStarting && _Global.Debug.msTraceAsyncCallbackStarting.bind(_Global.Debug)) || nop,
        _traceAsyncCallbackCompleted: (_Global.Debug && _Global.Debug.msTraceAsyncCallbackCompleted && _Global.Debug.msTraceAsyncCallbackCompleted.bind(_Global.Debug)) || nop
    };
});
// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Promise/_StateMachine',[
    '../Core/_Global',
    '../Core/_BaseCoreUtils',
    '../Core/_Base',
    '../Core/_ErrorFromName',
    '../Core/_Events',
    '../Core/_Trace'
    ], function promiseStateMachineInit(_Global, _BaseCoreUtils, _Base, _ErrorFromName, _Events, _Trace) {
    "use strict";

    _Global.Debug && (_Global.Debug.setNonUserCodeExceptions = true);

    var ListenerType = _Base.Class.mix(_Base.Class.define(null, { /*empty*/ }, { supportedForProcessing: false }), _Events.eventMixin);
    var promiseEventListeners = new ListenerType();
    // make sure there is a listeners collection so that we can do a more trivial check below
    promiseEventListeners._listeners = {};
    var errorET = "error";
    var canceledName = "Canceled";
    var tagWithStack = false;
    var tag = {
        promise: 0x01,
        thenPromise: 0x02,
        errorPromise: 0x04,
        exceptionPromise: 0x08,
        completePromise: 0x10,
    };
    tag.all = tag.promise | tag.thenPromise | tag.errorPromise | tag.exceptionPromise | tag.completePromise;

    //
    // Global error counter, for each error which enters the system we increment this once and then
    // the error number travels with the error as it traverses the tree of potential handlers.
    //
    // When someone has registered to be told about errors (WinJS.Promise.callonerror) promises
    // which are in error will get tagged with a ._errorId field. This tagged field is the
    // contract by which nested promises with errors will be identified as chaining for the
    // purposes of the callonerror semantics. If a nested promise in error is encountered without
    // a ._errorId it will be assumed to be foreign and treated as an interop boundary and
    // a new error id will be minted.
    //
    var error_number = 1;

    //
    // The state machine has a interesting hiccup in it with regards to notification, in order
    // to flatten out notification and avoid recursion for synchronous completion we have an
    // explicit set of *_notify states which are responsible for notifying their entire tree
    // of children. They can do this because they know that immediate children are always
    // ThenPromise instances and we can therefore reach into their state to access the
    // _listeners collection.
    //
    // So, what happens is that a Promise will be fulfilled through the _completed or _error
    // messages at which point it will enter a *_notify state and be responsible for to move
    // its children into an (as appropriate) success or error state and also notify that child's
    // listeners of the state transition, until leaf notes are reached.
    //

    var state_created,              // -> working
        state_working,              // -> error | error_notify | success | success_notify | canceled | waiting
        state_waiting,              // -> error | error_notify | success | success_notify | waiting_canceled
        state_waiting_canceled,     // -> error | error_notify | success | success_notify | canceling
        state_canceled,             // -> error | error_notify | success | success_notify | canceling
        state_canceling,            // -> error_notify
        state_success_notify,       // -> success
        state_success,              // -> .
        state_error_notify,         // -> error
        state_error;                // -> .

    // Noop function, used in the various states to indicate that they don't support a given
    // message. Named with the somewhat cute name '_' because it reads really well in the states.

    function _() { }

    // Initial state
    //
    state_created = {
        name: "created",
        enter: function (promise) {
            promise._setState(state_working);
        },
        cancel: _,
        done: _,
        then: _,
        _completed: _,
        _error: _,
        _notify: _,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Ready state, waiting for a message (completed/error/progress), able to be canceled
    //
    state_working = {
        name: "working",
        enter: _,
        cancel: function (promise) {
            promise._setState(state_canceled);
        },
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Waiting state, if a promise is completed with a value which is itself a promise
    // (has a then() method) it signs up to be informed when that child promise is
    // fulfilled at which point it will be fulfilled with that value.
    //
    state_waiting = {
        name: "waiting",
        enter: function (promise) {
            var waitedUpon = promise._value;
            // We can special case our own intermediate promises which are not in a
            //  terminal state by just pushing this promise as a listener without
            //  having to create new indirection functions
            if (waitedUpon instanceof ThenPromise &&
                waitedUpon._state !== state_error &&
                waitedUpon._state !== state_success) {
                pushListener(waitedUpon, { promise: promise });
            } else {
                var error = function (value) {
                    if (waitedUpon._errorId) {
                        promise._chainedError(value, waitedUpon);
                    } else {
                        // Because this is an interop boundary we want to indicate that this
                        //  error has been handled by the promise infrastructure before we
                        //  begin a new handling chain.
                        //
                        callonerror(promise, value, detailsForHandledError, waitedUpon, error);
                        promise._error(value);
                    }
                };
                error.handlesOnError = true;
                waitedUpon.then(
                    promise._completed.bind(promise),
                    error,
                    promise._progress.bind(promise)
                );
            }
        },
        cancel: function (promise) {
            promise._setState(state_waiting_canceled);
        },
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Waiting canceled state, when a promise has been in a waiting state and receives a
    // request to cancel its pending work it will forward that request to the child promise
    // and then waits to be informed of the result. This promise moves itself into the
    // canceling state but understands that the child promise may instead push it to a
    // different state.
    //
    state_waiting_canceled = {
        name: "waiting_canceled",
        enter: function (promise) {
            // Initiate a transition to canceling. Triggering a cancel on the promise
            // that we are waiting upon may result in a different state transition
            // before the state machine pump runs again.
            promise._setState(state_canceling);
            var waitedUpon = promise._value;
            if (waitedUpon.cancel) {
                waitedUpon.cancel();
            }
        },
        cancel: _,
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Canceled state, moves to the canceling state and then tells the promise to do
    // whatever it might need to do on cancelation.
    //
    state_canceled = {
        name: "canceled",
        enter: function (promise) {
            // Initiate a transition to canceling. The _cancelAction may change the state
            // before the state machine pump runs again.
            promise._setState(state_canceling);
            promise._cancelAction();
        },
        cancel: _,
        done: done,
        then: then,
        _completed: completed,
        _error: error,
        _notify: _,
        _progress: progress,
        _setCompleteValue: setCompleteValue,
        _setErrorValue: setErrorValue
    };

    // Canceling state, commits to the promise moving to an error state with an error
    // object whose 'name' and 'message' properties contain the string "Canceled"
    //
    state_canceling = {
        name: "canceling",
        enter: function (promise) {
            var error = new Error(canceledName);
            error.name = error.message;
            promise._value = error;
            promise._setState(state_error_notify);
        },
        cancel: _,
        done: _,
        then: _,
        _completed: _,
        _error: _,
        _notify: _,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Success notify state, moves a promise to the success state and notifies all children
    //
    state_success_notify = {
        name: "complete_notify",
        enter: function (promise) {
            promise.done = CompletePromise.prototype.done;
            promise.then = CompletePromise.prototype.then;
            if (promise._listeners) {
                var queue = [promise];
                var p;
                while (queue.length) {
                    p = queue.shift();
                    p._state._notify(p, queue);
                }
            }
            promise._setState(state_success);
        },
        cancel: _,
        done: null, /*error to get here */
        then: null, /*error to get here */
        _completed: _,
        _error: _,
        _notify: notifySuccess,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Success state, moves a promise to the success state and does NOT notify any children.
    // Some upstream promise is owning the notification pass.
    //
    state_success = {
        name: "success",
        enter: function (promise) {
            promise.done = CompletePromise.prototype.done;
            promise.then = CompletePromise.prototype.then;
            promise._cleanupAction();
        },
        cancel: _,
        done: null, /*error to get here */
        then: null, /*error to get here */
        _completed: _,
        _error: _,
        _notify: notifySuccess,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Error notify state, moves a promise to the error state and notifies all children
    //
    state_error_notify = {
        name: "error_notify",
        enter: function (promise) {
            promise.done = ErrorPromise.prototype.done;
            promise.then = ErrorPromise.prototype.then;
            if (promise._listeners) {
                var queue = [promise];
                var p;
                while (queue.length) {
                    p = queue.shift();
                    p._state._notify(p, queue);
                }
            }
            promise._setState(state_error);
        },
        cancel: _,
        done: null, /*error to get here*/
        then: null, /*error to get here*/
        _completed: _,
        _error: _,
        _notify: notifyError,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    // Error state, moves a promise to the error state and does NOT notify any children.
    // Some upstream promise is owning the notification pass.
    //
    state_error = {
        name: "error",
        enter: function (promise) {
            promise.done = ErrorPromise.prototype.done;
            promise.then = ErrorPromise.prototype.then;
            promise._cleanupAction();
        },
        cancel: _,
        done: null, /*error to get here*/
        then: null, /*error to get here*/
        _completed: _,
        _error: _,
        _notify: notifyError,
        _progress: _,
        _setCompleteValue: _,
        _setErrorValue: _
    };

    //
    // The statemachine implementation follows a very particular pattern, the states are specified
    // as static stateless bags of functions which are then indirected through the state machine
    // instance (a Promise). As such all of the functions on each state have the promise instance
    // passed to them explicitly as a parameter and the Promise instance members do a little
    // dance where they indirect through the state and insert themselves in the argument list.
    //
    // We could instead call directly through the promise states however then every caller
    // would have to remember to do things like pumping the state machine to catch state transitions.
    //

    var PromiseStateMachine = _Base.Class.define(null, {
        _listeners: null,
        _nextState: null,
        _state: null,
        _value: null,

        cancel: function () {
            /// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
            /// <summary locid="WinJS.PromiseStateMachine.cancel">
            /// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
            /// already been fulfilled and cancellation is supported, the promise enters
            /// the error state with a value of Error("Canceled").
            /// </summary>
            /// </signature>
            this._state.cancel(this);
            this._run();
        },
        done: function Promise_done(onComplete, onError, onProgress) {
            /// <signature helpKeyword="WinJS.PromiseStateMachine.done">
            /// <summary locid="WinJS.PromiseStateMachine.done">
            /// Allows you to specify the work to be done on the fulfillment of the promised value,
            /// the error handling to be performed if the promise fails to fulfill
            /// a value, and the handling of progress notifications along the way.
            ///
            /// After the handlers have finished executing, this function throws any error that would have been returned
            /// from then() as a promise in the error state.
            /// </summary>
            /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
            /// The function to be called if the promise is fulfilled successfully with a value.
            /// The fulfilled value is passed as the single argument. If the value is null,
            /// the fulfilled value is returned. The value returned
            /// from the function becomes the fulfilled value of the promise returned by
            /// then(). If an exception is thrown while executing the function, the promise returned
            /// by then() moves into the error state.
            /// </param>
            /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
            /// The function to be called if the promise is fulfilled with an error. The error
            /// is passed as the single argument. If it is null, the error is forwarded.
            /// The value returned from the function is the fulfilled value of the promise returned by then().
            /// </param>
            /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
            /// the function to be called if the promise reports progress. Data about the progress
            /// is passed as the single argument. Promises are not required to support
            /// progress.
            /// </param>
            /// </signature>
            this._state.done(this, onComplete, onError, onProgress);
        },
        then: function Promise_then(onComplete, onError, onProgress) {
            /// <signature helpKeyword="WinJS.PromiseStateMachine.then">
            /// <summary locid="WinJS.PromiseStateMachine.then">
            /// Allows you to specify the work to be done on the fulfillment of the promised value,
            /// the error handling to be performed if the promise fails to fulfill
            /// a value, and the handling of progress notifications along the way.
            /// </summary>
            /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
            /// The function to be called if the promise is fulfilled successfully with a value.
            /// The value is passed as the single argument. If the value is null, the value is returned.
            /// The value returned from the function becomes the fulfilled value of the promise returned by
            /// then(). If an exception is thrown while this function is being executed, the promise returned
            /// by then() moves into the error state.
            /// </param>
            /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
            /// The function to be called if the promise is fulfilled with an error. The error
            /// is passed as the single argument. If it is null, the error is forwarded.
            /// The value returned from the function becomes the fulfilled value of the promise returned by then().
            /// </param>
            /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
            /// The function to be called if the promise reports progress. Data about the progress
            /// is passed as the single argument. Promises are not required to support
            /// progress.
            /// </param>
            /// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
            /// The promise whose value is the result of executing the complete or
            /// error function.
            /// </returns>
            /// </signature>
            return this._state.then(this, onComplete, onError, onProgress);
        },

        _chainedError: function (value, context) {
            var result = this._state._error(this, value, detailsForChainedError, context);
            this._run();
            return result;
        },
        _completed: function (value) {
            var result = this._state._completed(this, value);
            this._run();
            return result;
        },
        _error: function (value) {
            var result = this._state._error(this, value, detailsForError);
            this._run();
            return result;
        },
        _progress: function (value) {
            this._state._progress(this, value);
        },
        _setState: function (state) {
            this._nextState = state;
        },
        _setCompleteValue: function (value) {
            this._state._setCompleteValue(this, value);
            this._run();
        },
        _setChainedErrorValue: function (value, context) {
            var result = this._state._setErrorValue(this, value, detailsForChainedError, context);
            this._run();
            return result;
        },
        _setExceptionValue: function (value) {
            var result = this._state._setErrorValue(this, value, detailsForException);
            this._run();
            return result;
        },
        _run: function () {
            while (this._nextState) {
                this._state = this._nextState;
                this._nextState = null;
                this._state.enter(this);
            }
        }
    }, {
        supportedForProcessing: false
    });

    //
    // Implementations of shared state machine code.
    //

    function completed(promise, value) {
        var targetState;
        if (value && typeof value === "object" && typeof value.then === "function") {
            targetState = state_waiting;
        } else {
            targetState = state_success_notify;
        }
        promise._value = value;
        promise._setState(targetState);
    }
    function createErrorDetails(exception, error, promise, id, parent, handler) {
        return {
            exception: exception,
            error: error,
            promise: promise,
            handler: handler,
            id: id,
            parent: parent
        };
    }
    function detailsForHandledError(promise, errorValue, context, handler) {
        var exception = context._isException;
        var errorId = context._errorId;
        return createErrorDetails(
            exception ? errorValue : null,
            exception ? null : errorValue,
            promise,
            errorId,
            context,
            handler
        );
    }
    function detailsForChainedError(promise, errorValue, context) {
        var exception = context._isException;
        var errorId = context._errorId;
        setErrorInfo(promise, errorId, exception);
        return createErrorDetails(
            exception ? errorValue : null,
            exception ? null : errorValue,
            promise,
            errorId,
            context
        );
    }
    function detailsForError(promise, errorValue) {
        var errorId = ++error_number;
        setErrorInfo(promise, errorId);
        return createErrorDetails(
            null,
            errorValue,
            promise,
            errorId
        );
    }
    function detailsForException(promise, exceptionValue) {
        var errorId = ++error_number;
        setErrorInfo(promise, errorId, true);
        return createErrorDetails(
            exceptionValue,
            null,
            promise,
            errorId
        );
    }
    function done(promise, onComplete, onError, onProgress) {
        var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Promise.done");
        pushListener(promise, { c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
    }
    function error(promise, value, onerrorDetails, context) {
        promise._value = value;
        callonerror(promise, value, onerrorDetails, context);
        promise._setState(state_error_notify);
    }
    function notifySuccess(promise, queue) {
        var value = promise._value;
        var listeners = promise._listeners;
        if (!listeners) {
            return;
        }
        promise._listeners = null;
        var i, len;
        for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
            var listener = len === 1 ? listeners : listeners[i];
            var onComplete = listener.c;
            var target = listener.promise;

            _Trace._traceAsyncOperationCompleted(listener.asyncOpID, _Global.Debug && _Global.Debug.MS_ASYNC_OP_STATUS_SUCCESS);

            if (target) {
                _Trace._traceAsyncCallbackStarting(listener.asyncOpID);
                try {
                    target._setCompleteValue(onComplete ? onComplete(value) : value);
                } catch (ex) {
                    target._setExceptionValue(ex);
                } finally {
                    _Trace._traceAsyncCallbackCompleted();
                }
                if (target._state !== state_waiting && target._listeners) {
                    queue.push(target);
                }
            } else {
                CompletePromise.prototype.done.call(promise, onComplete);
            }
        }
    }
    function notifyError(promise, queue) {
        var value = promise._value;
        var listeners = promise._listeners;
        if (!listeners) {
            return;
        }
        promise._listeners = null;
        var i, len;
        for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
            var listener = len === 1 ? listeners : listeners[i];
            var onError = listener.e;
            var target = listener.promise;

            var errorID = _Global.Debug && (value && value.name === canceledName ? _Global.Debug.MS_ASYNC_OP_STATUS_CANCELED : _Global.Debug.MS_ASYNC_OP_STATUS_ERROR);
            _Trace._traceAsyncOperationCompleted(listener.asyncOpID, errorID);

            if (target) {
                var asyncCallbackStarted = false;
                try {
                    if (onError) {
                        _Trace._traceAsyncCallbackStarting(listener.asyncOpID);
                        asyncCallbackStarted = true;
                        if (!onError.handlesOnError) {
                            callonerror(target, value, detailsForHandledError, promise, onError);
                        }
                        target._setCompleteValue(onError(value));
                    } else {
                        target._setChainedErrorValue(value, promise);
                    }
                } catch (ex) {
                    target._setExceptionValue(ex);
                } finally {
                    if (asyncCallbackStarted) {
                        _Trace._traceAsyncCallbackCompleted();
                    }
                }
                if (target._state !== state_waiting && target._listeners) {
                    queue.push(target);
                }
            } else {
                ErrorPromise.prototype.done.call(promise, null, onError);
            }
        }
    }
    function callonerror(promise, value, onerrorDetailsGenerator, context, handler) {
        if (promiseEventListeners._listeners[errorET]) {
            if (value instanceof Error && value.message === canceledName) {
                return;
            }
            promiseEventListeners.dispatchEvent(errorET, onerrorDetailsGenerator(promise, value, context, handler));
        }
    }
    function progress(promise, value) {
        var listeners = promise._listeners;
        if (listeners) {
            var i, len;
            for (i = 0, len = Array.isArray(listeners) ? listeners.length : 1; i < len; i++) {
                var listener = len === 1 ? listeners : listeners[i];
                var onProgress = listener.p;
                if (onProgress) {
                    try { onProgress(value); } catch (ex) { }
                }
                if (!(listener.c || listener.e) && listener.promise) {
                    listener.promise._progress(value);
                }
            }
        }
    }
    function pushListener(promise, listener) {
        var listeners = promise._listeners;
        if (listeners) {
            // We may have either a single listener (which will never be wrapped in an array)
            // or 2+ listeners (which will be wrapped). Since we are now adding one more listener
            // we may have to wrap the single listener before adding the second.
            listeners = Array.isArray(listeners) ? listeners : [listeners];
            listeners.push(listener);
        } else {
            listeners = listener;
        }
        promise._listeners = listeners;
    }
    // The difference beween setCompleteValue()/setErrorValue() and complete()/error() is that setXXXValue() moves
    // a promise directly to the success/error state without starting another notification pass (because one
    // is already ongoing).
    function setErrorInfo(promise, errorId, isException) {
        promise._isException = isException || false;
        promise._errorId = errorId;
    }
    function setErrorValue(promise, value, onerrorDetails, context) {
        promise._value = value;
        callonerror(promise, value, onerrorDetails, context);
        promise._setState(state_error);
    }
    function setCompleteValue(promise, value) {
        var targetState;
        if (value && typeof value === "object" && typeof value.then === "function") {
            targetState = state_waiting;
        } else {
            targetState = state_success;
        }
        promise._value = value;
        promise._setState(targetState);
    }
    function then(promise, onComplete, onError, onProgress) {
        var result = new ThenPromise(promise);
        var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Promise.then");
        pushListener(promise, { promise: result, c: onComplete, e: onError, p: onProgress, asyncOpID: asyncOpID });
        return result;
    }

    //
    // Internal implementation detail promise, ThenPromise is created when a promise needs
    // to be returned from a then() method.
    //
    var ThenPromise = _Base.Class.derive(PromiseStateMachine,
        function (creator) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.thenPromise))) {
                this._stack = Promise._getStack();
            }

            this._creator = creator;
            this._setState(state_created);
            this._run();
        }, {
            _creator: null,

            _cancelAction: function () { if (this._creator) { this._creator.cancel(); } },
            _cleanupAction: function () { this._creator = null; }
        }, {
            supportedForProcessing: false
        }
    );

    //
    // Slim promise implementations for already completed promises, these are created
    // under the hood on synchronous completion paths as well as by WinJS.Promise.wrap
    // and WinJS.Promise.wrapError.
    //

    var ErrorPromise = _Base.Class.define(
        function ErrorPromise_ctor(value) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.errorPromise))) {
                this._stack = Promise._getStack();
            }

            this._value = value;
            callonerror(this, value, detailsForError);
        }, {
            cancel: function () {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
                /// <summary locid="WinJS.PromiseStateMachine.cancel">
                /// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
                /// already been fulfilled and cancellation is supported, the promise enters
                /// the error state with a value of Error("Canceled").
                /// </summary>
                /// </signature>
            },
            done: function ErrorPromise_done(unused, onError) {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.done">
                /// <summary locid="WinJS.PromiseStateMachine.done">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                ///
                /// After the handlers have finished executing, this function throws any error that would have been returned
                /// from then() as a promise in the error state.
                /// </summary>
                /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The fulfilled value is passed as the single argument. If the value is null,
                /// the fulfilled value is returned. The value returned
                /// from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while executing the function, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function is the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
                /// the function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// </signature>
                var value = this._value;
                if (onError) {
                    try {
                        if (!onError.handlesOnError) {
                            callonerror(null, value, detailsForHandledError, this, onError);
                        }
                        var result = onError(value);
                        if (result && typeof result === "object" && typeof result.done === "function") {
                            // If a promise is returned we need to wait on it.
                            result.done();
                        }
                        return;
                    } catch (ex) {
                        value = ex;
                    }
                }
                if (value instanceof Error && value.message === canceledName) {
                    // suppress cancel
                    return;
                }
                // force the exception to be thrown asyncronously to avoid any try/catch blocks
                //
                Promise._doneHandler(value);
            },
            then: function ErrorPromise_then(unused, onError) {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.then">
                /// <summary locid="WinJS.PromiseStateMachine.then">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                /// </summary>
                /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The value is passed as the single argument. If the value is null, the value is returned.
                /// The value returned from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while this function is being executed, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function becomes the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
                /// The promise whose value is the result of executing the complete or
                /// error function.
                /// </returns>
                /// </signature>

                // If the promise is already in a error state and no error handler is provided
                // we optimize by simply returning the promise instead of creating a new one.
                //
                if (!onError) { return this; }
                var result;
                var value = this._value;
                try {
                    if (!onError.handlesOnError) {
                        callonerror(null, value, detailsForHandledError, this, onError);
                    }
                    result = new CompletePromise(onError(value));
                } catch (ex) {
                    // If the value throw from the error handler is the same as the value
                    // provided to the error handler then there is no need for a new promise.
                    //
                    if (ex === value) {
                        result = this;
                    } else {
                        result = new ExceptionPromise(ex);
                    }
                }
                return result;
            }
        }, {
            supportedForProcessing: false
        }
    );

    var ExceptionPromise = _Base.Class.derive(ErrorPromise,
        function ExceptionPromise_ctor(value) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.exceptionPromise))) {
                this._stack = Promise._getStack();
            }

            this._value = value;
            callonerror(this, value, detailsForException);
        }, {
            /* empty */
        }, {
            supportedForProcessing: false
        }
    );

    var CompletePromise = _Base.Class.define(
        function CompletePromise_ctor(value) {

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.completePromise))) {
                this._stack = Promise._getStack();
            }

            if (value && typeof value === "object" && typeof value.then === "function") {
                var result = new ThenPromise(null);
                result._setCompleteValue(value);
                return result;
            }
            this._value = value;
        }, {
            cancel: function () {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.cancel">
                /// <summary locid="WinJS.PromiseStateMachine.cancel">
                /// Attempts to cancel the fulfillment of a promised value. If the promise hasn't
                /// already been fulfilled and cancellation is supported, the promise enters
                /// the error state with a value of Error("Canceled").
                /// </summary>
                /// </signature>
            },
            done: function CompletePromise_done(onComplete) {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.done">
                /// <summary locid="WinJS.PromiseStateMachine.done">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                ///
                /// After the handlers have finished executing, this function throws any error that would have been returned
                /// from then() as a promise in the error state.
                /// </summary>
                /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.done_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The fulfilled value is passed as the single argument. If the value is null,
                /// the fulfilled value is returned. The value returned
                /// from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while executing the function, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function is the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.done_p:onProgress">
                /// the function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// </signature>
                if (!onComplete) { return; }
                try {
                    var result = onComplete(this._value);
                    if (result && typeof result === "object" && typeof result.done === "function") {
                        result.done();
                    }
                } catch (ex) {
                    // force the exception to be thrown asynchronously to avoid any try/catch blocks
                    Promise._doneHandler(ex);
                }
            },
            then: function CompletePromise_then(onComplete) {
                /// <signature helpKeyword="WinJS.PromiseStateMachine.then">
                /// <summary locid="WinJS.PromiseStateMachine.then">
                /// Allows you to specify the work to be done on the fulfillment of the promised value,
                /// the error handling to be performed if the promise fails to fulfill
                /// a value, and the handling of progress notifications along the way.
                /// </summary>
                /// <param name='onComplete' type='Function' locid="WinJS.PromiseStateMachine.then_p:onComplete">
                /// The function to be called if the promise is fulfilled successfully with a value.
                /// The value is passed as the single argument. If the value is null, the value is returned.
                /// The value returned from the function becomes the fulfilled value of the promise returned by
                /// then(). If an exception is thrown while this function is being executed, the promise returned
                /// by then() moves into the error state.
                /// </param>
                /// <param name='onError' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onError">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument. If it is null, the error is forwarded.
                /// The value returned from the function becomes the fulfilled value of the promise returned by then().
                /// </param>
                /// <param name='onProgress' type='Function' optional='true' locid="WinJS.PromiseStateMachine.then_p:onProgress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.PromiseStateMachine.then_returnValue">
                /// The promise whose value is the result of executing the complete or
                /// error function.
                /// </returns>
                /// </signature>
                try {
                    // If the value returned from the completion handler is the same as the value
                    // provided to the completion handler then there is no need for a new promise.
                    //
                    var newValue = onComplete ? onComplete(this._value) : this._value;
                    return newValue === this._value ? this : new CompletePromise(newValue);
                } catch (ex) {
                    return new ExceptionPromise(ex);
                }
            }
        }, {
            supportedForProcessing: false
        }
    );

    //
    // Promise is the user-creatable WinJS.Promise object.
    //

    function timeout(timeoutMS) {
        var id;
        return new Promise(
            function (c) {
                if (timeoutMS) {
                    id = _Global.setTimeout(c, timeoutMS);
                } else {
                    _BaseCoreUtils._setImmediate(c);
                }
            },
            function () {
                if (id) {
                    _Global.clearTimeout(id);
                }
            }
        );
    }

    function timeoutWithPromise(timeout, promise) {
        var cancelPromise = function () { promise.cancel(); };
        var cancelTimeout = function () { timeout.cancel(); };
        timeout.then(cancelPromise);
        promise.then(cancelTimeout, cancelTimeout);
        return promise;
    }

    var staticCanceledPromise;

    var Promise = _Base.Class.derive(PromiseStateMachine,
        function Promise_ctor(init, oncancel) {
            /// <signature helpKeyword="WinJS.Promise">
            /// <summary locid="WinJS.Promise">
            /// A promise provides a mechanism to schedule work to be done on a value that
            /// has not yet been computed. It is a convenient abstraction for managing
            /// interactions with asynchronous APIs.
            /// </summary>
            /// <param name="init" type="Function" locid="WinJS.Promise_p:init">
            /// The function that is called during construction of the  promise. The function
            /// is given three arguments (complete, error, progress). Inside this function
            /// you should add event listeners for the notifications supported by this value.
            /// </param>
            /// <param name="oncancel" optional="true" locid="WinJS.Promise_p:oncancel">
            /// The function to call if a consumer of this promise wants
            /// to cancel its undone work. Promises are not required to
            /// support cancellation.
            /// </param>
            /// </signature>

            if (tagWithStack && (tagWithStack === true || (tagWithStack & tag.promise))) {
                this._stack = Promise._getStack();
            }

            this._oncancel = oncancel;
            this._setState(state_created);
            this._run();

            try {
                var complete = this._completed.bind(this);
                var error = this._error.bind(this);
                var progress = this._progress.bind(this);
                init(complete, error, progress);
            } catch (ex) {
                this._setExceptionValue(ex);
            }
        }, {
            _oncancel: null,

            _cancelAction: function () {
                if (this._oncancel) {
                    try { this._oncancel(); } catch (ex) { }
                }
            },
            _cleanupAction: function () { this._oncancel = null; }
        }, {

            addEventListener: function Promise_addEventListener(eventType, listener, capture) {
                /// <signature helpKeyword="WinJS.Promise.addEventListener">
                /// <summary locid="WinJS.Promise.addEventListener">
                /// Adds an event listener to the control.
                /// </summary>
                /// <param name="eventType" locid="WinJS.Promise.addEventListener_p:eventType">
                /// The type (name) of the event.
                /// </param>
                /// <param name="listener" locid="WinJS.Promise.addEventListener_p:listener">
                /// The listener to invoke when the event is raised.
                /// </param>
                /// <param name="capture" locid="WinJS.Promise.addEventListener_p:capture">
                /// Specifies whether or not to initiate capture.
                /// </param>
                /// </signature>
                promiseEventListeners.addEventListener(eventType, listener, capture);
            },
            any: function Promise_any(values) {
                /// <signature helpKeyword="WinJS.Promise.any">
                /// <summary locid="WinJS.Promise.any">
                /// Returns a promise that is fulfilled when one of the input promises
                /// has been fulfilled.
                /// </summary>
                /// <param name="values" type="Array" locid="WinJS.Promise.any_p:values">
                /// An array that contains promise objects or objects whose property
                /// values include promise objects.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.any_returnValue">
                /// A promise that on fulfillment yields the value of the input (complete or error).
                /// </returns>
                /// </signature>
                return new Promise(
                    function (complete, error) {
                        var keys = Object.keys(values);
                        if (keys.length === 0) {
                            complete();
                        }
                        var canceled = 0;
                        keys.forEach(function (key) {
                            Promise.as(values[key]).then(
                                function () { complete({ key: key, value: values[key] }); },
                                function (e) {
                                    if (e instanceof Error && e.name === canceledName) {
                                        if ((++canceled) === keys.length) {
                                            complete(Promise.cancel);
                                        }
                                        return;
                                    }
                                    error({ key: key, value: values[key] });
                                }
                            );
                        });
                    },
                    function () {
                        var keys = Object.keys(values);
                        keys.forEach(function (key) {
                            var promise = Promise.as(values[key]);
                            if (typeof promise.cancel === "function") {
                                promise.cancel();
                            }
                        });
                    }
                );
            },
            as: function Promise_as(value) {
                /// <signature helpKeyword="WinJS.Promise.as">
                /// <summary locid="WinJS.Promise.as">
                /// Returns a promise. If the object is already a promise it is returned;
                /// otherwise the object is wrapped in a promise.
                /// </summary>
                /// <param name="value" locid="WinJS.Promise.as_p:value">
                /// The value to be treated as a promise.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.as_returnValue">
                /// A promise.
                /// </returns>
                /// </signature>
                if (value && typeof value === "object" && typeof value.then === "function") {
                    return value;
                }
                return new CompletePromise(value);
            },
            /// <field type="WinJS.Promise" helpKeyword="WinJS.Promise.cancel" locid="WinJS.Promise.cancel">
            /// Canceled promise value, can be returned from a promise completion handler
            /// to indicate cancelation of the promise chain.
            /// </field>
            cancel: {
                get: function () {
                    return (staticCanceledPromise = staticCanceledPromise || new ErrorPromise(new _ErrorFromName(canceledName)));
                }
            },
            dispatchEvent: function Promise_dispatchEvent(eventType, details) {
                /// <signature helpKeyword="WinJS.Promise.dispatchEvent">
                /// <summary locid="WinJS.Promise.dispatchEvent">
                /// Raises an event of the specified type and properties.
                /// </summary>
                /// <param name="eventType" locid="WinJS.Promise.dispatchEvent_p:eventType">
                /// The type (name) of the event.
                /// </param>
                /// <param name="details" locid="WinJS.Promise.dispatchEvent_p:details">
                /// The set of additional properties to be attached to the event object.
                /// </param>
                /// <returns type="Boolean" locid="WinJS.Promise.dispatchEvent_returnValue">
                /// Specifies whether preventDefault was called on the event.
                /// </returns>
                /// </signature>
                return promiseEventListeners.dispatchEvent(eventType, details);
            },
            is: function Promise_is(value) {
                /// <signature helpKeyword="WinJS.Promise.is">
                /// <summary locid="WinJS.Promise.is">
                /// Determines whether a value fulfills the promise contract.
                /// </summary>
                /// <param name="value" locid="WinJS.Promise.is_p:value">
                /// A value that may be a promise.
                /// </param>
                /// <returns type="Boolean" locid="WinJS.Promise.is_returnValue">
                /// true if the specified value is a promise, otherwise false.
                /// </returns>
                /// </signature>
                return value && typeof value === "object" && typeof value.then === "function";
            },
            join: function Promise_join(values) {
                /// <signature helpKeyword="WinJS.Promise.join">
                /// <summary locid="WinJS.Promise.join">
                /// Creates a promise that is fulfilled when all the values are fulfilled.
                /// </summary>
                /// <param name="values" type="Object" locid="WinJS.Promise.join_p:values">
                /// An object whose fields contain values, some of which may be promises.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.join_returnValue">
                /// A promise whose value is an object with the same field names as those of the object in the values parameter, where
                /// each field value is the fulfilled value of a promise.
                /// </returns>
                /// </signature>
                return new Promise(
                    function (complete, error, progress) {
                        var keys = Object.keys(values);
                        var errors = Array.isArray(values) ? [] : {};
                        var results = Array.isArray(values) ? [] : {};
                        var undefineds = 0;
                        var pending = keys.length;
                        var argDone = function (key) {
                            if ((--pending) === 0) {
                                var errorCount = Object.keys(errors).length;
                                if (errorCount === 0) {
                                    complete(results);
                                } else {
                                    var canceledCount = 0;
                                    keys.forEach(function (key) {
                                        var e = errors[key];
                                        if (e instanceof Error && e.name === canceledName) {
                                            canceledCount++;
                                        }
                                    });
                                    if (canceledCount === errorCount) {
                                        complete(Promise.cancel);
                                    } else {
                                        error(errors);
                                    }
                                }
                            } else {
                                progress({ Key: key, Done: true });
                            }
                        };
                        keys.forEach(function (key) {
                            var value = values[key];
                            if (value === undefined) {
                                undefineds++;
                            } else {
                                Promise.then(value,
                                    function (value) { results[key] = value; argDone(key); },
                                    function (value) { errors[key] = value; argDone(key); }
                                );
                            }
                        });
                        pending -= undefineds;
                        if (pending === 0) {
                            complete(results);
                            return;
                        }
                    },
                    function () {
                        Object.keys(values).forEach(function (key) {
                            var promise = Promise.as(values[key]);
                            if (typeof promise.cancel === "function") {
                                promise.cancel();
                            }
                        });
                    }
                );
            },
            removeEventListener: function Promise_removeEventListener(eventType, listener, capture) {
                /// <signature helpKeyword="WinJS.Promise.removeEventListener">
                /// <summary locid="WinJS.Promise.removeEventListener">
                /// Removes an event listener from the control.
                /// </summary>
                /// <param name='eventType' locid="WinJS.Promise.removeEventListener_eventType">
                /// The type (name) of the event.
                /// </param>
                /// <param name='listener' locid="WinJS.Promise.removeEventListener_listener">
                /// The listener to remove.
                /// </param>
                /// <param name='capture' locid="WinJS.Promise.removeEventListener_capture">
                /// Specifies whether or not to initiate capture.
                /// </param>
                /// </signature>
                promiseEventListeners.removeEventListener(eventType, listener, capture);
            },
            supportedForProcessing: false,
            then: function Promise_then(value, onComplete, onError, onProgress) {
                /// <signature helpKeyword="WinJS.Promise.then">
                /// <summary locid="WinJS.Promise.then">
                /// A static version of the promise instance method then().
                /// </summary>
                /// <param name="value" locid="WinJS.Promise.then_p:value">
                /// the value to be treated as a promise.
                /// </param>
                /// <param name="onComplete" type="Function" locid="WinJS.Promise.then_p:complete">
                /// The function to be called if the promise is fulfilled with a value.
                /// If it is null, the promise simply
                /// returns the value. The value is passed as the single argument.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="WinJS.Promise.then_p:error">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument.
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="WinJS.Promise.then_p:progress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.then_returnValue">
                /// A promise whose value is the result of executing the provided complete function.
                /// </returns>
                /// </signature>
                return Promise.as(value).then(onComplete, onError, onProgress);
            },
            thenEach: function Promise_thenEach(values, onComplete, onError, onProgress) {
                /// <signature helpKeyword="WinJS.Promise.thenEach">
                /// <summary locid="WinJS.Promise.thenEach">
                /// Performs an operation on all the input promises and returns a promise
                /// that has the shape of the input and contains the result of the operation
                /// that has been performed on each input.
                /// </summary>
                /// <param name="values" locid="WinJS.Promise.thenEach_p:values">
                /// A set of values (which could be either an array or an object) of which some or all are promises.
                /// </param>
                /// <param name="onComplete" type="Function" locid="WinJS.Promise.thenEach_p:complete">
                /// The function to be called if the promise is fulfilled with a value.
                /// If the value is null, the promise returns the value.
                /// The value is passed as the single argument.
                /// </param>
                /// <param name="onError" type="Function" optional="true" locid="WinJS.Promise.thenEach_p:error">
                /// The function to be called if the promise is fulfilled with an error. The error
                /// is passed as the single argument.
                /// </param>
                /// <param name="onProgress" type="Function" optional="true" locid="WinJS.Promise.thenEach_p:progress">
                /// The function to be called if the promise reports progress. Data about the progress
                /// is passed as the single argument. Promises are not required to support
                /// progress.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.thenEach_returnValue">
                /// A promise that is the result of calling Promise.join on the values parameter.
                /// </returns>
                /// </signature>
                var result = Array.isArray(values) ? [] : {};
                Object.keys(values).forEach(function (key) {
                    result[key] = Promise.as(values[key]).then(onComplete, onError, onProgress);
                });
                return Promise.join(result);
            },
            timeout: function Promise_timeout(time, promise) {
                /// <signature helpKeyword="WinJS.Promise.timeout">
                /// <summary locid="WinJS.Promise.timeout">
                /// Creates a promise that is fulfilled after a timeout.
                /// </summary>
                /// <param name="timeout" type="Number" optional="true" locid="WinJS.Promise.timeout_p:timeout">
                /// The timeout period in milliseconds. If this value is zero or not specified
                /// setImmediate is called, otherwise setTimeout is called.
                /// </param>
                /// <param name="promise" type="Promise" optional="true" locid="WinJS.Promise.timeout_p:promise">
                /// A promise that will be canceled if it doesn't complete before the
                /// timeout has expired.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.timeout_returnValue">
                /// A promise that is completed asynchronously after the specified timeout.
                /// </returns>
                /// </signature>
                var to = timeout(time);
                return promise ? timeoutWithPromise(to, promise) : to;
            },
            wrap: function Promise_wrap(value) {
                /// <signature helpKeyword="WinJS.Promise.wrap">
                /// <summary locid="WinJS.Promise.wrap">
                /// Wraps a non-promise value in a promise. You can use this function if you need
                /// to pass a value to a function that requires a promise.
                /// </summary>
                /// <param name="value" locid="WinJS.Promise.wrap_p:value">
                /// Some non-promise value to be wrapped in a promise.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.wrap_returnValue">
                /// A promise that is successfully fulfilled with the specified value
                /// </returns>
                /// </signature>
                return new CompletePromise(value);
            },
            wrapError: function Promise_wrapError(error) {
                /// <signature helpKeyword="WinJS.Promise.wrapError">
                /// <summary locid="WinJS.Promise.wrapError">
                /// Wraps a non-promise error value in a promise. You can use this function if you need
                /// to pass an error to a function that requires a promise.
                /// </summary>
                /// <param name="error" locid="WinJS.Promise.wrapError_p:error">
                /// A non-promise error value to be wrapped in a promise.
                /// </param>
                /// <returns type="WinJS.Promise" locid="WinJS.Promise.wrapError_returnValue">
                /// A promise that is in an error state with the specified value.
                /// </returns>
                /// </signature>
                return new ErrorPromise(error);
            },

            _veryExpensiveTagWithStack: {
                get: function () { return tagWithStack; },
                set: function (value) { tagWithStack = value; }
            },
            _veryExpensiveTagWithStack_tag: tag,
            _getStack: function () {
                if (_Global.Debug && _Global.Debug.debuggerEnabled) {
                    try { throw new Error(); } catch (e) { return e.stack; }
                }
            },

            _cancelBlocker: function Promise__cancelBlocker(input, oncancel) {
                //
                // Returns a promise which on cancelation will still result in downstream cancelation while
                //  protecting the promise 'input' from being  canceled which has the effect of allowing
                //  'input' to be shared amoung various consumers.
                //
                if (!Promise.is(input)) {
                    return Promise.wrap(input);
                }
                var complete;
                var error;
                var output = new Promise(
                    function (c, e) {
                        complete = c;
                        error = e;
                    },
                    function () {
                        complete = null;
                        error = null;
                        oncancel && oncancel();
                    }
                );
                input.then(
                    function (v) { complete && complete(v); },
                    function (e) { error && error(e); }
                );
                return output;
            },

        }
    );
    Object.defineProperties(Promise, _Events.createEventProperties(errorET));

    Promise._doneHandler = function (value) {
        _BaseCoreUtils._setImmediate(function Promise_done_rethrow() {
            throw value;
        });
    };

    return {
        PromiseStateMachine: PromiseStateMachine,
        Promise: Promise,
        state_created: state_created
    };
});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Promise',[
    './Core/_Base',
    './Promise/_StateMachine'
    ], function promiseInit( _Base, _StateMachine) {
    "use strict";

    _Base.Namespace.define("WinJS", {
        Promise: _StateMachine.Promise
    });

    return _StateMachine.Promise;
});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_Log',[
    'exports',
    './_Global',
    './_Base',
    ], function logInit(exports, _Global, _Base) {
    "use strict";

    var spaceR = /\s+/g;
    var typeR = /^(error|warn|info|log)$/;
    var WinJSLog = null;

    function format(message, tag, type) {
        /// <signature helpKeyword="WinJS.Utilities.formatLog">
        /// <summary locid="WinJS.Utilities.formatLog">
        /// Adds tags and type to a logging message.
        /// </summary>
        /// <param name="message" type="String" locid="WinJS.Utilities.startLog_p:message">The message to format.</param>
        /// <param name="tag" type="String" locid="WinJS.Utilities.startLog_p:tag">
        /// The tag(s) to apply to the message. Separate multiple tags with spaces.
        /// </param>
        /// <param name="type" type="String" locid="WinJS.Utilities.startLog_p:type">The type of the message.</param>
        /// <returns type="String" locid="WinJS.Utilities.startLog_returnValue">The formatted message.</returns>
        /// </signature>
        var m = message;
        if (typeof (m) === "function") { m = m(); }

        return ((type && typeR.test(type)) ? ("") : (type ? (type + ": ") : "")) +
            (tag ? tag.replace(spaceR, ":") + ": " : "") +
            m;
    }
    function defAction(message, tag, type) {
        var m = exports.formatLog(message, tag, type);
        if (_Global.console) {
            _Global.console[(type && typeR.test(type)) ? type : "log"](m);
        }
    }
    function escape(s) {
        // \s (whitespace) is used as separator, so don't escape it
        return s.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
    }
    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        startLog: function (options) {
            /// <signature helpKeyword="WinJS.Utilities.startLog">
            /// <summary locid="WinJS.Utilities.startLog">
            /// Configures a logger that writes messages containing the specified tags from WinJS.log to console.log.
            /// </summary>
            /// <param name="options" type="String" locid="WinJS.Utilities.startLog_p:options">
            /// The tags for messages to log. Separate multiple tags with spaces.
            /// </param>
            /// </signature>
            /// <signature>
            /// <summary locid="WinJS.Utilities.startLog2">
            /// Configure a logger to write WinJS.log output.
            /// </summary>
            /// <param name="options" type="Object" locid="WinJS.Utilities.startLog_p:options2">
            /// May contain .type, .tags, .excludeTags and .action properties.
            ///  - .type is a required tag.
            ///  - .excludeTags is a space-separated list of tags, any of which will result in a message not being logged.
            ///  - .tags is a space-separated list of tags, any of which will result in a message being logged.
            ///  - .action is a function that, if present, will be called with the log message, tags and type. The default is to log to the console.
            /// </param>
            /// </signature>
            options = options || {};
            if (typeof options === "string") {
                options = { tags: options };
            }
            var el = options.type && new RegExp("^(" + escape(options.type).replace(spaceR, " ").split(" ").join("|") + ")$");
            var not = options.excludeTags && new RegExp("(^|\\s)(" + escape(options.excludeTags).replace(spaceR, " ").split(" ").join("|") + ")(\\s|$)", "i");
            var has = options.tags && new RegExp("(^|\\s)(" + escape(options.tags).replace(spaceR, " ").split(" ").join("|") + ")(\\s|$)", "i");
            var action = options.action || defAction;

            if (!el && !not && !has && !exports.log) {
                exports.log = action;
                return;
            }

            var result = function (message, tag, type) {
                if (!((el && !el.test(type))          // if the expected log level is not satisfied
                    || (not && not.test(tag))         // if any of the excluded categories exist
                    || (has && !has.test(tag)))) {    // if at least one of the included categories doesn't exist
                        action(message, tag, type);
                    }

                result.next && result.next(message, tag, type);
            };
            result.next = exports.log;
            exports.log = result;
        },
        stopLog: function () {
            /// <signature helpKeyword="WinJS.Utilities.stopLog">
            /// <summary locid="WinJS.Utilities.stopLog">
            /// Removes the previously set up logger.
            /// </summary>
            /// </signature>
            exports.log = null;
        },
        formatLog: format
    });

    _Base.Namespace._moduleDefine(exports, "WinJS", {
        log: {
            get: function () {
                return WinJSLog;
            },
            set: function (value) {
                WinJSLog = value;
            }
        }
    });
});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Scheduler',[
    'exports',
    './Core/_Global',
    './Core/_Base',
    './Core/_ErrorFromName',
    './Core/_Log',
    './Core/_Resources',
    './Core/_Trace',
    './Core/_WriteProfilerMark',
    './Promise'
    ], function schedulerInit(exports, _Global, _Base, _ErrorFromName, _Log, _Resources, _Trace, _WriteProfilerMark, Promise) {
    "use strict";

    function linkedListMixin(name) {
        var mixin = {};
        var PREV = "_prev" + name;
        var NEXT = "_next" + name;
        mixin["_remove" + name] = function () {
            // Assumes we always have a static head and tail.
            //
            var prev = this[PREV];
            var next = this[NEXT];
            // PREV <-> NEXT
            //
            next && (next[PREV] = prev);
            prev && (prev[NEXT] = next);
            // null <- this -> null
            //
            this[PREV] = null;
            this[NEXT] = null;
        };
        mixin["_insert" + name + "Before"] = function (node) {
            var prev = this[PREV];
            // PREV -> node -> this
            //
            prev && (prev[NEXT] = node);
            node[NEXT] = this;
            // PREV <- node <- this
            //
            node[PREV] = prev;
            this[PREV] = node;

            return node;
        };
        mixin["_insert" + name + "After"] = function (node) {
            var next = this[NEXT];
            // this -> node -> NEXT
            //
            this[NEXT] = node;
            node[NEXT] = next;
            // this <- node <- NEXT
            //
            node[PREV] = this;
            next && (next[PREV] = node);

            return node;
        };
        return mixin;
    }

    _Base.Namespace.define("WinJS.Utilities", {

        _linkedListMixin: linkedListMixin

    });

    var strings = {
        get jobInfoIsNoLongerValid() { return "The job info object can only be used while the job is running"; }
    };

    //
    // Profiler mark helpers
    //
    // markerType must be one of the following: info, StartTM, StopTM
    //

    function profilerMarkArgs(arg0, arg1, arg2) {
        if (arg2 !== undefined) {
            return "(" + arg0 + ";" + arg1 + ";" + arg2 + ")";
        } else if (arg1 !== undefined) {
            return "(" + arg0 + ";" + arg1 + ")";
        } else if (arg0 !== undefined) {
            return "(" + arg0 + ")";
        } else {
            return "";
        }
    }

    function schedulerProfilerMark(operation, markerType, arg0, arg1) {
        _WriteProfilerMark(
            "WinJS.Scheduler:" + operation +
            profilerMarkArgs(arg0, arg1) +
            "," + markerType
        );
    }

    function jobProfilerMark(job, operation, markerType, arg0, arg1) {
        var argProvided = job.name || arg0 !== undefined || arg1 !== undefined;

        _WriteProfilerMark(
            "WinJS.Scheduler:" + operation + ":" + job.id +
            (argProvided ? profilerMarkArgs(job.name, arg0, arg1) : "") +
            "," + markerType
        );
    }

    //
    // Job type. This cannot be instantiated by developers and is instead handed back by the scheduler
    //  schedule method. Its public interface is what is used when interacting with a job.
    //

    var JobNode = _Base.Class.define(function (id, work, priority, context, name, asyncOpID) {
        this._id = id;
        this._work = work;
        this._context = context;
        this._name = name;
        this._asyncOpID = asyncOpID;
        this._setPriority(priority);
        this._setState(state_created);
        jobProfilerMark(this, "job-scheduled", "info");
    }, {

        /// <field type="Boolean" locid="WinJS.Utilities.Scheduler._JobNode.completed" helpKeyword="WinJS.Utilities.Scheduler._JobNode.completed">
        /// Gets a value that indicates whether the job has completed. This value is true if job has run to completion
        /// and false if it hasn't yet run or was canceled.
        /// </field>
        completed: {
            get: function () { return !!this._state.completed; }
        },

        /// <field type="Number" locid="WinJS.Utilities.Scheduler._JobNode.id" helpKeyword="WinJS.Utilities.Scheduler._JobNode.id">
        /// Gets the unique identifier for this job.
        /// </field>
        id: {
            get: function () { return this._id; }
        },

        /// <field type="String" locid="WinJS.Utilities.Scheduler._JobNode.name" helpKeyword="WinJS.Utilities.Scheduler._JobNode.name">
        /// Gets or sets a string that specifies the diagnostic name for this job.
        /// </field>
        name: {
            get: function () { return this._name; },
            set: function (value) { this._name = value; }
        },

        /// <field type="WinJS.Utilities.Scheduler._OwnerToken" locid="WinJS.Utilities.Scheduler._JobNode.owner" helpKeyword="WinJS.Utilities.Scheduler._JobNode.owner">
        /// Gets an owner token for the job. You can use this owner token's cancelAll method to cancel related jobs.
        /// </field>
        owner: {
            get: function () { return this._owner; },
            set: function (value) {
                this._owner && this._owner._remove(this);
                this._owner = value;
                this._owner && this._owner._add(this);
            }
        },

        /// <field type="WinJS.Utilities.Scheduler.Priority" locid="WinJS.Utilities.Scheduler._JobNode.priority" helpKeyword="WinJS.Utilities.Scheduler._JobNode.priority">
        /// Gets or sets the priority at which this job is executed by the scheduler.
        /// </field>
        priority: {
            get: function () { return this._priority; },
            set: function (value) {
                value = clampPriority(value);
                this._state.setPriority(this, value);
            }
        },

        cancel: function () {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobNode.cancel">
            /// <summary locid="WinJS.Utilities.Scheduler._JobNode.cancel">Cancels the job.</summary>
            /// </signature>
            this._state.cancel(this);
        },

        pause: function () {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobNode.pause">
            /// <summary locid="WinJS.Utilities.Scheduler._JobNode.pause">Pauses the job.</summary>
            /// </signature>
            this._state.pause(this);
        },

        resume: function () {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobNode.resume">
            /// <summary locid="WinJS.Utilities.Scheduler._JobNode.resume">Resumes the job if it's been paused.</summary>
            /// </signature>
            this._state.resume(this);
        },

        _execute: function (shouldYield) {
            this._state.execute(this, shouldYield);
        },

        _executeDone: function (result) {
            return this._state.executeDone(this, result);
        },

        _blockedDone: function (result) {
            return this._state.blockedDone(this, result);
        },

        _setPriority: function (value) {
            if (+this._priority === this._priority && this._priority !== value) {
                jobProfilerMark(this, "job-priority-changed", "info",
                    markerFromPriority(this._priority).name,
                    markerFromPriority(value).name);
            }
            this._priority = value;
        },

        _setState: function (state, arg0, arg1) {
            if (this._state) {
                _Log.log && _Log.log("Transitioning job (" + this.id + ") from: " + this._state.name + " to: " + state.name, "winjs scheduler", "log");
            }
            this._state = state;
            this._state.enter(this, arg0, arg1);
        },

    });
    _Base.Class.mix(JobNode, linkedListMixin("Job"));

    var YieldPolicy = {
        complete: 1,
        continue: 2,
        block: 3,
    };

    //
    // JobInfo object is passed to a work item when it is executed and allows the work to ask whether it
    //  should cooperatively yield and in that event provide a continuation work function to run the
    //  next time this job is scheduled. The JobInfo object additionally allows access to the job itself
    //  and the ability to provide a Promise for a future continuation work function in order to have
    //  jobs easily block on async work.
    //

    var JobInfo = _Base.Class.define(function (shouldYield, job) {
        this._job = job;
        this._result = null;
        this._yieldPolicy = YieldPolicy.complete;
        this._shouldYield = shouldYield;
    }, {

        /// <field type="WinJS.Utilities.Scheduler._JobNode" locid="WinJS.Utilities.Scheduler._JobInfo.job" helpKeyword="WinJS.Utilities.Scheduler._JobInfo.job">
        /// The job instance for which the work is currently being executed.
        /// </field>
        job: {
            get: function () {
                this._throwIfDisabled();
                return this._job;
            }
        },

        /// <field type="Boolean" locid="WinJS.Utilities.Scheduler._JobInfo.shouldYield" helpKeyword="WinJS.Utilities.Scheduler._JobInfo.shouldYield">
        /// A boolean which will become true when the work item is requested to cooperatively yield by the scheduler.
        /// </field>
        shouldYield: {
            get: function () {
                this._throwIfDisabled();
                return this._shouldYield();
            }
        },

        setPromise: function (promise) {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobInfo.setPromise">
            /// <summary locid="WinJS.Utilities.Scheduler._JobInfo.setPromise">
            /// Called when the  work item is blocked on asynchronous work.
            /// The scheduler waits for the specified Promise to complete before rescheduling the job.
            /// </summary>
            /// <param name="promise" type="WinJS.Promise" locid="WinJS.Utilities.Scheduler._JobInfo.setPromise_p:promise">
            /// A Promise value which, when completed, provides a work item function to be re-scheduled.
            /// </param>
            /// </signature>
            this._throwIfDisabled();
            this._result = promise;
            this._yieldPolicy = YieldPolicy.block;
        },

        setWork: function (work) {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._JobInfo.setWork">
            /// <summary locid="WinJS.Utilities.Scheduler._JobInfo.setWork">
            /// Called  when the work item is cooperatively yielding to the scheduler and has more work to complete in the future.
            /// Use this method to schedule additonal work for when the work item is about to yield.
            /// </summary>
            /// <param name="work" type="Function" locid="WinJS.Utilities.Scheduler._JobInfo.setWork_p:work">
            /// The work function which will be re-scheduled.
            /// </param>
            /// </signature>
            this._throwIfDisabled();
            this._result = work;
            this._yieldPolicy = YieldPolicy.continue;
        },

        _disablePublicApi: function () {
            // _disablePublicApi should be called as soon as the job yields. This
            //  says that the job info object should no longer be used by the
            //  job and if the job tries to use it, job info will throw.
            //
            this._publicApiDisabled = true;
        },

        _throwIfDisabled: function () {
            if (this._publicApiDisabled) {
                throw new _ErrorFromName("WinJS.Utilities.Scheduler.JobInfoIsNoLongerValid", strings.jobInfoIsNoLongerValid);
            }
        }

    });

    //
    // Owner type. Made available to developers through the createOwnerToken method.
    //  Allows cancelation of jobs in bulk.
    //

    var OwnerToken = _Base.Class.define(function OwnerToken_ctor() {
        this._jobs = {};
    }, {
        cancelAll: function OwnerToken_cancelAll() {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler._OwnerToken.cancelAll">
            /// <summary locid="WinJS.Utilities.Scheduler._OwnerToken.cancelAll">
            /// Cancels all jobs that are associated with this owner token.
            /// </summary>
            /// </signature>
            var jobs = this._jobs,
                jobIds = Object.keys(jobs);
            this._jobs = {};

            for (var i = 0, len = jobIds.length; i < len; i++) {
                jobs[jobIds[i]].cancel();
            }
        },

        _add: function OwnerToken_add(job) {
            this._jobs[job.id] = job;
        },

        _remove: function OwnerToken_remove(job) {
            delete this._jobs[job.id];
        }
    });

    function _() {
        // Noop function, used in the various states to indicate that they don't support a given
        // message. Named with the somewhat cute name '_' because it reads really well in the states.
        //
        return false;
    }
    function illegal(job) {
        /*jshint validthis: true */
        throw "Illegal call by job(" + job.id + ") in state: " + this.name;
    }

    //
    // Scheduler job state machine.
    //
    // A job normally goes through a lifecycle which is created -> scheduled -> running -> complete. The
    //  Scheduler decides when to transition a job from scheduled to running based on its policies and
    //  the other work which is scheduled.
    //
    // Additionally there are various operations which can be performed on a job which will change its
    //  state like: cancel, pause, resume and setting the job's priority.
    //
    // Additionally when in the running state a job may either cooperatively yield, or block.
    //
    // The job state machine accounts for these various states and interactions.
    //

    var State = _Base.Class.define(function (name) {
        this.name = name;
        this.enter = illegal;
        this.execute = illegal;
        this.executeDone = illegal;
        this.blockedDone = illegal;
        this.cancel = illegal;
        this.pause = illegal;
        this.resume = illegal;
        this.setPriority = illegal;
    });

    var state_created = new State("created"),                                   // -> scheduled
        state_scheduled = new State("scheduled"),                               // -> running | canceled | paused
        state_paused = new State("paused"),                                     // -> canceled | scheduled
        state_canceled = new State("canceled"),                                 // -> .
        state_running = new State("running"),                                   // -> cooperative_yield | blocked | complete | running_canceled | running_paused
        state_running_paused = new State("running_paused"),                     // -> cooperative_yield_paused | blocked_paused | complete | running_canceled | running_resumed
        state_running_resumed = new State("running_resumed"),                   // -> cooperative_yield | blocked | complete | running_canceled | running_paused
        state_running_canceled = new State("running_canceled"),                 // -> canceled | running_canceled_blocked
        state_running_canceled_blocked = new State("running_canceled_blocked"), // -> canceled
        state_cooperative_yield = new State("cooperative_yield"),               // -> scheduled
        state_cooperative_yield_paused = new State("cooperative_yield_paused"), // -> paused
        state_blocked = new State("blocked"),                                   // -> blocked_waiting
        state_blocked_waiting = new State("blocked_waiting"),                   // -> cooperative_yield | complete | blocked_canceled | blocked_paused_waiting
        state_blocked_paused = new State("blocked_paused"),                     // -> blocked_paused_waiting
        state_blocked_paused_waiting = new State("blocked_paused_waiting"),     // -> cooperative_yield_paused | complete | blocked_canceled | blocked_waiting
        state_blocked_canceled = new State("blocked_canceled"),                 // -> canceled
        state_complete = new State("complete");                                 // -> .

    // A given state may include implementations for the following operations:
    //
    //  - enter(job, arg0, arg1)
    //  - execute(job, shouldYield)
    //  - executeDone(job, result) --> next state
    //  - blockedDone(job, result, initialPriority)
    //  - cancel(job)
    //  - pause(job)
    //  - resume(job)
    //  - setPriority(job, priority)
    //
    // Any functions which are not implemented are illegal in that state.
    // Any functions which have an implementation of _ are a nop in that state.
    //

    // Helper which yields a function that transitions to the specified state
    //
    function setState(state) {
        return function (job, arg0, arg1) {
            job._setState(state, arg0, arg1);
        };
    }

    // Helper which sets the priority of a job.
    //
    function changePriority(job, priority) {
        job._setPriority(priority);
    }

    // Created
    //
    state_created.enter = function (job) {
        addJobAtTailOfPriority(job, job.priority);
        job._setState(state_scheduled);
    };

    // Scheduled
    //
    state_scheduled.enter = function () {
        startRunning();
    };
    state_scheduled.execute = setState(state_running);
    state_scheduled.cancel = setState(state_canceled);
    state_scheduled.pause = setState(state_paused);
    state_scheduled.resume = _;
    state_scheduled.setPriority = function (job, priority) {
        if (job.priority !== priority) {
            job._setPriority(priority);
            job.pause();
            job.resume();
        }
    };

    // Paused
    //
    state_paused.enter = function (job) {
        jobProfilerMark(job, "job-paused", "info");
        job._removeJob();
    };
    state_paused.cancel = setState(state_canceled);
    state_paused.pause = _;
    state_paused.resume = function (job) {
        jobProfilerMark(job, "job-resumed", "info");
        addJobAtTailOfPriority(job, job.priority);
        job._setState(state_scheduled);
    };
    state_paused.setPriority = changePriority;

    // Canceled
    //
    state_canceled.enter = function (job) {
        jobProfilerMark(job, "job-canceled", "info");
        _Trace._traceAsyncOperationCompleted(job._asyncOpID, _Global.Debug && _Global.Debug.MS_ASYNC_OP_STATUS_CANCELED);
        job._removeJob();
        job._work = null;
        job._context = null;
        job.owner = null;
    };
    state_canceled.cancel = _;
    state_canceled.pause = _;
    state_canceled.resume = _;
    state_canceled.setPriority = _;

    // Running
    //
    state_running.enter = function (job, shouldYield) {
        // Remove the job from the list in case it throws an exception, this means in the
        //  yield case we have to add it back.
        //
        job._removeJob();

        var priority = job.priority;
        var work = job._work;
        var context = job._context;

        // Null out the work and context so they aren't leaked if the job throws an exception.
        //
        job._work = null;
        job._context = null;

        var jobInfo = new JobInfo(shouldYield, job);

        _Trace._traceAsyncCallbackStarting(job._asyncOpID);
        try {
            MSApp.execAtPriority(function () {
                work.call(context, jobInfo);
            }, toWwaPriority(priority));
        } finally {
            _Trace._traceAsyncCallbackCompleted();
            jobInfo._disablePublicApi();
        }

        // Restore the context in case it is needed due to yielding or blocking.
        //
        job._context = context;

        var targetState = job._executeDone(jobInfo._yieldPolicy);

        job._setState(targetState, jobInfo._result, priority);
    };
    state_running.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
                return state_complete;
            case YieldPolicy.continue:
                return state_cooperative_yield;
            case YieldPolicy.block:
                return state_blocked;
        }
    };
    state_running.cancel = function (job) {
        // Interaction with the singleton scheduler. The act of canceling a job pokes the scheduler
        //  and tells it to start asking the job to yield.
        //
        immediateYield = true;
        job._setState(state_running_canceled);
    };
    state_running.pause = function (job) {
        // Interaction with the singleton scheduler. The act of pausing a job pokes the scheduler
        //  and tells it to start asking the job to yield.
        //
        immediateYield = true;
        job._setState(state_running_paused);
    };
    state_running.resume = _;
    state_running.setPriority = changePriority;

    // Running paused
    //
    state_running_paused.enter = _;
    state_running_paused.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
                return state_complete;
            case YieldPolicy.continue:
                return state_cooperative_yield_paused;
            case YieldPolicy.block:
                return state_blocked_paused;
        }
    };
    state_running_paused.cancel = setState(state_running_canceled);
    state_running_paused.pause = _;
    state_running_paused.resume = setState(state_running_resumed);
    state_running_paused.setPriority = changePriority;

    // Running resumed
    //
    state_running_resumed.enter = _;
    state_running_resumed.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
                return state_complete;
            case YieldPolicy.continue:
                return state_cooperative_yield;
            case YieldPolicy.block:
                return state_blocked;
        }
    };
    state_running_resumed.cancel = setState(state_running_canceled);
    state_running_resumed.pause = setState(state_running_paused);
    state_running_resumed.resume = _;
    state_running_resumed.setPriority = changePriority;

    // Running canceled
    //
    state_running_canceled.enter = _;
    state_running_canceled.executeDone = function (job, yieldPolicy) {
        switch (yieldPolicy) {
            case YieldPolicy.complete:
            case YieldPolicy.continue:
                return state_canceled;
            case YieldPolicy.block:
                return state_running_canceled_blocked;
        }
    };
    state_running_canceled.cancel = _;
    state_running_canceled.pause = _;
    state_running_canceled.resume = _;
    state_running_canceled.setPriority = _;

    // Running canceled -> blocked
    //
    state_running_canceled_blocked.enter = function (job, work) {
        work.cancel();
        job._setState(state_canceled);
    };

    // Cooperative yield
    //
    state_cooperative_yield.enter = function (job, work, initialPriority) {
        jobProfilerMark(job, "job-yielded", "info");
        if (initialPriority === job.priority) {
            addJobAtHeadOfPriority(job, job.priority);
        } else {
            addJobAtTailOfPriority(job, job.priority);
        }
        job._work = work;
        job._setState(state_scheduled);
    };

    // Cooperative yield paused
    //
    state_cooperative_yield_paused.enter = function (job, work) {
        jobProfilerMark(job, "job-yielded", "info");
        job._work = work;
        job._setState(state_paused);
    };

    // Blocked
    //
    state_blocked.enter = function (job, work, initialPriority) {
        jobProfilerMark(job, "job-blocked", "StartTM");
        job._work = work;
        job._setState(state_blocked_waiting);

        // Sign up for a completion from the provided promise, after the completion occurs
        //  transition from the current state at the completion time to the target state
        //  depending on the completion value.
        //
        work.done(
            function (newWork) {
                jobProfilerMark(job, "job-blocked", "StopTM");
                var targetState = job._blockedDone(newWork);
                job._setState(targetState, newWork, initialPriority);
            },
            function (error) {
                if (!(error && error.name === "Canceled")) {
                    jobProfilerMark(job, "job-error", "info");
                }
                jobProfilerMark(job, "job-blocked", "StopTM");
                job._setState(state_canceled);
                return Promise.wrapError(error);
            }
        );
    };

    // Blocked waiting
    //
    state_blocked_waiting.enter = _;
    state_blocked_waiting.blockedDone = function (job, result) {
        if (typeof result === "function") {
            return state_cooperative_yield;
        } else {
            return state_complete;
        }
    };
    state_blocked_waiting.cancel = setState(state_blocked_canceled);
    state_blocked_waiting.pause = setState(state_blocked_paused_waiting);
    state_blocked_waiting.resume = _;
    state_blocked_waiting.setPriority = changePriority;

    // Blocked paused
    //
    state_blocked_paused.enter = function (job, work, initialPriority) {
        jobProfilerMark(job, "job-blocked", "StartTM");
        job._work = work;
        job._setState(state_blocked_paused_waiting);

        // Sign up for a completion from the provided promise, after the completion occurs
        //  transition from the current state at the completion time to the target state
        //  depending on the completion value.
        //
        work.done(
            function (newWork) {
                jobProfilerMark(job, "job-blocked", "StopTM");
                var targetState = job._blockedDone(newWork);
                job._setState(targetState, newWork, initialPriority);
            },
            function (error) {
                if (!(error && error.name === "Canceled")) {
                    jobProfilerMark(job, "job-error", "info");
                }
                jobProfilerMark(job, "job-blocked", "StopTM");
                job._setState(state_canceled);
                return Promise.wrapError(error);
            }
        );
    };

    // Blocked paused waiting
    //
    state_blocked_paused_waiting.enter = _;
    state_blocked_paused_waiting.blockedDone = function (job, result) {
        if (typeof result === "function") {
            return state_cooperative_yield_paused;
        } else {
            return state_complete;
        }
    };
    state_blocked_paused_waiting.cancel = setState(state_blocked_canceled);
    state_blocked_paused_waiting.pause = _;
    state_blocked_paused_waiting.resume = setState(state_blocked_waiting);
    state_blocked_paused_waiting.setPriority = changePriority;

    // Blocked canceled
    //
    state_blocked_canceled.enter = function (job) {
        // Cancel the outstanding promise and then eventually it will complete, presumably with a 'canceled'
        //  error at which point we will transition to the canceled state.
        //
        job._work.cancel();
        job._work = null;
    };
    state_blocked_canceled.blockedDone = function () {
        return state_canceled;
    };
    state_blocked_canceled.cancel = _;
    state_blocked_canceled.pause = _;
    state_blocked_canceled.resume = _;
    state_blocked_canceled.setPriority = _;

    // Complete
    //
    state_complete.completed = true;
    state_complete.enter = function (job) {
        _Trace._traceAsyncOperationCompleted(job._asyncOpID, _Global.Debug && _Global.Debug.MS_ASYNC_OP_STATUS_SUCCESS);
        job._work = null;
        job._context = null;
        job.owner = null;
        jobProfilerMark(job, "job-completed", "info");
    };
    state_complete.cancel = _;
    state_complete.pause = _;
    state_complete.resume = _;
    state_complete.setPriority = _;

    // Private Priority marker node in the Job list. The marker nodes are linked both into the job
    //  list and a separate marker list. This is used so that jobs can be easily added into a given
    //  priority level by simply traversing to the next marker in the list and inserting before it.
    //
    // Markers may either be "static" or "dynamic". Static markers are the set of things which are
    //  named and are always in the list, they may exist with or without jobs at their priority
    //  level. Dynamic markers are added as needed.
    //
    // @NOTE: Dynamic markers are NYI
    //
    var MarkerNode = _Base.Class.define(function (priority, name) {
        this.priority = priority;
        this.name = name;
    }, {

        // NYI
        //
        //dynamic: {
        //    get: function () { return !this.name; }
        //},

    });
    _Base.Class.mix(MarkerNode, linkedListMixin("Job"), linkedListMixin("Marker"));

    //
    // Scheduler state
    //

    // Unique ID per job.
    //
    var globalJobId = 0;

    // Unique ID per drain request.
    var globalDrainId = 0;

    // Priority is: -15 ... 0 ... 15 where that maps to: 'min' ... 'normal' ... 'max'
    //
    var MIN_PRIORITY = -15;
    var MAX_PRIORITY = 15;

    // Named priorities
    //
    var Priority = {
        max: 15,
        high: 13,
        aboveNormal: 9,
        normal: 0,
        belowNormal: -9,
        idle: -13,
        min: -15,
    };

    // Definition of the priorities, named have static markers.
    //
    var priorities = [
        new MarkerNode(15, "max"),          // Priority.max
        new MarkerNode(14, "14"),
        new MarkerNode(13, "high"),         // Priority.high
        new MarkerNode(12, "12"),
        new MarkerNode(11, "11"),
        new MarkerNode(10, "10"),
        new MarkerNode(9, "aboveNormal"),   // Priority.aboveNormal
        new MarkerNode(8, "8"),
        new MarkerNode(7, "7"),
        new MarkerNode(6, "6"),
        new MarkerNode(5, "5"),
        new MarkerNode(4, "4"),
        new MarkerNode(3, "3"),
        new MarkerNode(2, "2"),
        new MarkerNode(1, "1"),
        new MarkerNode(0, "normal"),        // Priority.normal
        new MarkerNode(-1, "-1"),
        new MarkerNode(-2, "-2"),
        new MarkerNode(-3, "-3"),
        new MarkerNode(-4, "-4"),
        new MarkerNode(-5, "-5"),
        new MarkerNode(-6, "-6"),
        new MarkerNode(-7, "-7"),
        new MarkerNode(-8, "-8"),
        new MarkerNode(-9, "belowNormal"),  // Priority.belowNormal
        new MarkerNode(-10, "-10"),
        new MarkerNode(-11, "-11"),
        new MarkerNode(-12, "-12"),
        new MarkerNode(-13, "idle"),        // Priority.idle
        new MarkerNode(-14, "-14"),
        new MarkerNode(-15, "min"),         // Priority.min
        new MarkerNode(-16, "<TAIL>")
    ];

    function dumpList(type, reverse) {
        function dumpMarker(marker, pos) {
            _Log.log && _Log.log(pos + ": MARKER: " + marker.name, "winjs scheduler", "log");
        }
        function dumpJob(job, pos) {
            _Log.log && _Log.log(pos + ": JOB(" + job.id + "): state: " + (job._state ? job._state.name : "") + (job.name ? ", name: " + job.name : ""), "winjs scheduler", "log");
        }
        _Log.log && _Log.log("highWaterMark: " + highWaterMark, "winjs scheduler", "log");
        var pos = 0;
        var head = reverse ? priorities[priorities.length - 1] : priorities[0];
        var current = head;
        do {
            if (current instanceof MarkerNode) {
                dumpMarker(current, pos);
            }
            if (current instanceof JobNode) {
                dumpJob(current, pos);
            }
            pos++;
            current = reverse ? current["_prev" + type] : current["_next" + type];
        } while (current);
    }

    function retrieveState() {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.retrieveState">
        /// <summary locid="WinJS.Utilities.Scheduler.retrieveState">
        /// Returns a string representation of the scheduler's state for diagnostic
        /// purposes. The jobs and drain requests are displayed in the order in which
        /// they are currently expected to be processed. The current job and drain
        /// request are marked by an asterisk.
        /// </summary>
        /// </signature>
        var output = "";

        function logJob(job, isRunning) {
            output +=
                "    " + (isRunning ? "*" : " ") +
                "id: " + job.id +
                ", priority: " + markerFromPriority(job.priority).name +
                (job.name ? ", name: " + job.name : "") +
                "\n";
        }

        output += "Jobs:\n";
        var current = markerFromPriority(highWaterMark);
        var jobCount = 0;
        if (runningJob) {
            logJob(runningJob, true);
            jobCount++;
        }
        while (current.priority >= Priority.min) {
            if (current instanceof JobNode) {
                logJob(current, false);
                jobCount++;
            }
            current = current._nextJob;
        }
        if (jobCount === 0) {
            output += "     None\n";
        }

        output += "Drain requests:\n";
        for (var i = 0, len = drainQueue.length; i < len; i++) {
            output +=
                "    " + (i === 0 ? "*" : " ") +
                "priority: " + markerFromPriority(drainQueue[i].priority).name +
                ", name: " + drainQueue[i].name +
                "\n";
        }
        if (drainQueue.length === 0) {
            output += "     None\n";
        }

        return output;
    }

    function isEmpty() {
        var current = priorities[0];
        do {
            if (current instanceof JobNode) {
                return false;
            }
            current = current._nextJob;
        } while (current);

        return true;
    }

    // The WWA priority at which the pump is currently scheduled on the WWA scheduler.
    //  null when the pump is not scheduled.
    //
    var scheduledWwaPriority = null;

    // Whether the scheduler pump is currently on the stack
    //
    var pumping;
    // What priority is currently being pumped
    //
    var pumpingPriority;

    // A reference to the job object that is currently running.
    //  null when no job is running.
    //
    var runningJob = null;

    // Whether we are using the WWA scheduler.
    //
    var usingWwaScheduler = !!(_Global.MSApp && _Global.MSApp.execAtPriority);

    // Queue of drain listeners
    //
    var drainQueue = [];

    // Bit indicating that we should yield immediately
    //
    var immediateYield;

    // time slice for scheduler
    //
    var TIME_SLICE = 30;

    // high-water-mark is maintained any time priorities are adjusted, new jobs are
    //  added or the scheduler pumps itself down through a priority marker. The goal
    //  of the high-water-mark is to be a fast check as to whether a job may exist
    //  at a higher priority level than we are currently at. It may be wrong but it
    //  may only be wrong by being higher than the current highest priority job, not
    //  lower as that would cause the system to pump things out of order.
    //
    var highWaterMark = Priority.min;

    //
    // Initialize the scheduler
    //

    // Wire up the markers
    //
    priorities.reduce(function (prev, current) {
        if (prev) {
            prev._insertJobAfter(current);
            prev._insertMarkerAfter(current);
        }
        return current;
    });

    //
    // Draining mechanism
    //
    // For each active drain request, there is a unique drain listener in the
    //  drainQueue. Requests are processed in FIFO order. The scheduler is in
    //  drain mode precisely when the drainQueue is non-empty.
    //

    // Returns priority of the current drain request
    //
    function currentDrainPriority() {
        return drainQueue.length === 0 ? null : drainQueue[0].priority;
    }

    function drainStarting(listener) {
        schedulerProfilerMark("drain", "StartTM", listener.name, markerFromPriority(listener.priority).name);
    }
    function drainStopping(listener, canceled) {
        if (canceled) {
            schedulerProfilerMark("drain-canceled", "info", listener.name, markerFromPriority(listener.priority).name);
        }
        schedulerProfilerMark("drain", "StopTM", listener.name, markerFromPriority(listener.priority).name);
    }

    function addDrainListener(priority, complete, name) {
        drainQueue.push({ priority: priority, complete: complete, name: name });
        if (drainQueue.length === 1) {
            drainStarting(drainQueue[0]);
            if (priority > highWaterMark) {
                highWaterMark = priority;
                immediateYield = true;
            }
        }
    }

    function removeDrainListener(complete, canceled) {
        var i,
            len = drainQueue.length;

        for (i = 0; i < len; i++) {
            if (drainQueue[i].complete === complete) {
                if (i === 0) {
                    drainStopping(drainQueue[0], canceled);
                    drainQueue[1] && drainStarting(drainQueue[1]);
                }
                drainQueue.splice(i, 1);
                break;
            }
        }
    }

    // Notifies and removes the current drain listener
    //
    function notifyCurrentDrainListener() {
        var listener = drainQueue.shift();

        if (listener) {
            drainStopping(listener);
            drainQueue[0] && drainStarting(drainQueue[0]);
            listener.complete();
        }
    }

    // Notifies all drain listeners which are at a priority > highWaterMark.
    //  Returns whether or not any drain listeners were notified. This
    //  function sets pumpingPriority and reads highWaterMark. Note that
    //  it may call into user code which may call back into the scheduler.
    //
    function notifyDrainListeners() {
        var notifiedSomebody = false;
        if (!!drainQueue.length) {
            // As we exhaust priority levels, notify the appropriate drain listeners.
            //
            var drainPriority = currentDrainPriority();
            while (+drainPriority === drainPriority && drainPriority > highWaterMark) {
                pumpingPriority = drainPriority;
                notifyCurrentDrainListener();
                notifiedSomebody = true;
                drainPriority = currentDrainPriority();
            }
        }
        return notifiedSomebody;
    }

    //
    // Interfacing with the WWA Scheduler
    //

    // The purpose of yielding to the host is to give the host the opportunity to do some work.
    // setImmediate has this guarantee built-in so we prefer that. Otherwise, we do setTimeout 16
    // which should give the host a decent amount of time to do work.
    //
    var scheduleWithHost = _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (callback) {
        _Global.setTimeout(callback, 16);
    };

    // Stubs for the parts of the WWA scheduler APIs that we use. These stubs are
    //  used in contexts where the WWA scheduler is not available.
    //
    var MSAppStubs = {
        execAsyncAtPriority: function (callback, priority) {
            // If it's a high priority callback then we additionally schedule using setTimeout(0)
            //
            if (priority === MSApp.HIGH) {
                _Global.setTimeout(callback, 0);
            }
            // We always schedule using setImmediate
            //
            scheduleWithHost(callback);
        },

        execAtPriority: function (callback) {
            return callback();
        },

        getCurrentPriority: function () {
            return MSAppStubs.NORMAL;
        },

        isTaskScheduledAtPriorityOrHigher: function () {
            return false;
        },

        HIGH: "high",
        NORMAL: "normal",
        IDLE: "idle"
    };

    var MSApp = (usingWwaScheduler ? _Global.MSApp : MSAppStubs);

    function toWwaPriority(winjsPriority) {
        if (winjsPriority >= Priority.aboveNormal + 1) { return MSApp.HIGH; }
        if (winjsPriority >= Priority.belowNormal) { return MSApp.NORMAL; }
        return MSApp.IDLE;
    }

    var wwaPriorityToInt = {};
    wwaPriorityToInt[MSApp.IDLE] = 1;
    wwaPriorityToInt[MSApp.NORMAL] = 2;
    wwaPriorityToInt[MSApp.HIGH] = 3;

    function isEqualOrHigherWwaPriority(priority1, priority2) {
        return wwaPriorityToInt[priority1] >= wwaPriorityToInt[priority2];
    }

    function isHigherWwaPriority(priority1, priority2) {
        return wwaPriorityToInt[priority1] > wwaPriorityToInt[priority2];
    }

    function wwaTaskScheduledAtPriorityHigherThan(wwaPriority) {
        switch (wwaPriority) {
            case MSApp.HIGH:
                return false;
            case MSApp.NORMAL:
                return MSApp.isTaskScheduledAtPriorityOrHigher(MSApp.HIGH);
            case MSApp.IDLE:
                return MSApp.isTaskScheduledAtPriorityOrHigher(MSApp.NORMAL);
        }
    }

    //
    // Mechanism for the scheduler
    //

    function addJobAtHeadOfPriority(node, priority) {
        var marker = markerFromPriority(priority);
        if (marker.priority > highWaterMark) {
            highWaterMark = marker.priority;
            immediateYield = true;
        }
        marker._insertJobAfter(node);
    }

    function addJobAtTailOfPriority(node, priority) {
        var marker = markerFromPriority(priority);
        if (marker.priority > highWaterMark) {
            highWaterMark = marker.priority;
            immediateYield = true;
        }
        marker._nextMarker._insertJobBefore(node);
    }

    function clampPriority(priority) {
        priority = priority | 0;
        priority = Math.max(priority, MIN_PRIORITY);
        priority = Math.min(priority, MAX_PRIORITY);
        return priority;
    }

    function markerFromPriority(priority) {
        priority = clampPriority(priority);

        // The priority skip list is from high -> idle, add the offset and then make it positive.
        //
        return priorities[-1 * (priority - MAX_PRIORITY)];
    }

    // Performance.now is not defined in web workers.
    //
    var now = (_Global.performance && _Global.performance.now && _Global.performance.now.bind(_Global.performance)) || Date.now.bind(Date);

    // Main scheduler pump.
    //
    function run(scheduled) {
        pumping = true;
        schedulerProfilerMark("timeslice", "StartTM");
        var didWork;
        var ranJobSuccessfully = true;
        var current;
        var lastLoggedPriority;
        var timesliceExhausted = false;
        var yieldForPriorityBoundary = false;

        // Reset per-run state
        //
        immediateYield = false;

        try {
            var start = now();
            var end = start + TIME_SLICE;

            // Yielding policy
            //
            // @TODO, should we have a different scheduler policy when the debugger is attached. Today if you
            //  break in user code we will generally yield immediately after that job due to the fact that any
            //  breakpoint will take longer than TIME_SLICE to process.
            //

            var shouldYield = function () {
                timesliceExhausted = false;
                if (immediateYield) { return true; }
                if (wwaTaskScheduledAtPriorityHigherThan(toWwaPriority(highWaterMark))) { return true; }
                if (!!drainQueue.length) { return false; }
                if (now() > end) {
                    timesliceExhausted = true;
                    return true;
                }
                return false;
            };

            // Run until we run out of jobs or decide it is time to yield
            //
            while (highWaterMark >= Priority.min && !shouldYield() && !yieldForPriorityBoundary) {

                didWork = false;
                current = markerFromPriority(highWaterMark)._nextJob;
                do {
                    // Record the priority currently being pumped
                    //
                    pumpingPriority = current.priority;

                    if (current instanceof JobNode) {
                        if (lastLoggedPriority !== current.priority) {
                            if (+lastLoggedPriority === lastLoggedPriority) {
                                schedulerProfilerMark("priority", "StopTM", markerFromPriority(lastLoggedPriority).name);
                            }
                            schedulerProfilerMark("priority", "StartTM", markerFromPriority(current.priority).name);
                            lastLoggedPriority = current.priority;
                        }

                        // Important that we update this state before calling execute because the
                        //  job may throw an exception and we don't want to stall the queue.
                        //
                        didWork = true;
                        ranJobSuccessfully = false;
                        runningJob = current;
                        jobProfilerMark(runningJob, "job-running", "StartTM", markerFromPriority(pumpingPriority).name);
                        current._execute(shouldYield);
                        jobProfilerMark(runningJob, "job-running", "StopTM", markerFromPriority(pumpingPriority).name);
                        runningJob = null;
                        ranJobSuccessfully = true;
                    } else {
                        // As we pass marker nodes update our high water mark. It's important to do
                        //  this before notifying drain listeners because they may schedule new jobs
                        //  which will affect the highWaterMark.
                        //
                        var wwaPrevHighWaterMark = toWwaPriority(highWaterMark);
                        highWaterMark = current.priority;

                        didWork = notifyDrainListeners();

                        var wwaHighWaterMark = toWwaPriority(highWaterMark);
                        if (isHigherWwaPriority(wwaPrevHighWaterMark, wwaHighWaterMark) &&
                                (!usingWwaScheduler || MSApp.isTaskScheduledAtPriorityOrHigher(wwaHighWaterMark))) {
                            // Timeslice is moving to a lower WWA priority and the host
                            //  has equally or more important work to do. Time to yield.
                            //
                            yieldForPriorityBoundary = true;
                        }
                    }

                    current = current._nextJob;

                    // When didWork is true we exit the loop because:
                    //  - We've called into user code which may have modified the
                    //    scheduler's queue. We need to restart at the high water mark.
                    //  - We need to check if it's time for the scheduler to yield.
                    //
                } while (current && !didWork && !yieldForPriorityBoundary && !wwaTaskScheduledAtPriorityHigherThan(toWwaPriority(highWaterMark)));

                // Reset per-item state
                //
                immediateYield = false;

            }

        } finally {
            runningJob = null;

            // If a job was started and did not run to completion due to an exception
            //  we should transition it to a terminal state.
            //
            if (!ranJobSuccessfully) {
                jobProfilerMark(current, "job-error", "info");
                jobProfilerMark(current, "job-running", "StopTM", markerFromPriority(pumpingPriority).name);
                current.cancel();
            }

            if (+lastLoggedPriority === lastLoggedPriority) {
                schedulerProfilerMark("priority", "StopTM", markerFromPriority(lastLoggedPriority).name);
            }
            // Update high water mark to be the priority of the highest priority job.
            //
            var foundAJob = false;
            while (highWaterMark >= Priority.min && !foundAJob) {

                didWork = false;
                current = markerFromPriority(highWaterMark)._nextJob;
                do {

                    if (current instanceof JobNode) {
                        // We found a job. High water mark is now set to the priority
                        //  of this job.
                        //
                        foundAJob = true;
                    } else {
                        // As we pass marker nodes update our high water mark. It's important to do
                        //  this before notifying drain listeners because they may schedule new jobs
                        //  which will affect the highWaterMark.
                        //
                        highWaterMark = current.priority;

                        didWork = notifyDrainListeners();
                    }

                    current = current._nextJob;

                    // When didWork is true we exit the loop because:
                    //  - We've called into user code which may have modified the
                    //    scheduler's queue. We need to restart at the high water mark.
                    //
                } while (current && !didWork && !foundAJob);
            }

            var reasonForYielding;
            if (!ranJobSuccessfully) {
                reasonForYielding = "job error";
            } else if (timesliceExhausted) {
                reasonForYielding = "timeslice exhausted";
            } else if (highWaterMark < Priority.min) {
                reasonForYielding = "jobs exhausted";
            } else if (yieldForPriorityBoundary) {
                reasonForYielding = "reached WWA priority boundary";
            } else {
                reasonForYielding = "WWA host work";
            }

            // If this was a scheduled call to the pump, then the pump is no longer
            //  scheduled to be called and we should clear its scheduled priority.
            //
            if (scheduled) {
                scheduledWwaPriority = null;
            }

            // If the high water mark has not reached the end of the queue then
            //  we re-queue in order to see if there are more jobs to run.
            //
            pumping = false;
            if (highWaterMark >= Priority.min) {
                startRunning();
            }
            schedulerProfilerMark("yielding", "info", reasonForYielding);
            schedulerProfilerMark("timeslice", "StopTM");
        }
    }

    // When we schedule the pump we assign it a version. When we start executing one we check
    //  to see what the max executed version is. If we have superseded it then we skip the call.
    //
    var scheduledVersion = 0;
    var executedVersion = 0;

    function startRunning(priority) {
        if (+priority !== priority) {
            priority = highWaterMark;
        }
        var priorityWwa = toWwaPriority(priority);

        // Don't schedule the pump while pumping. The pump will be scheduled
        //  immediately before yielding if necessary.
        //
        if (pumping) {
            return;
        }

        // If the pump is already scheduled at priority or higher, then there
        //  is no need to schedule the pump again.
        // However, when we're not using the WWA scheduler, we fallback to immediate/timeout
        //  which do not have a notion of priority. In this case, if the pump is scheduled,
        //  there is no need to schedule another pump.
        //
        if (scheduledWwaPriority && (!usingWwaScheduler || isEqualOrHigherWwaPriority(scheduledWwaPriority, priorityWwa))) {
            return;
        }
        var current = ++scheduledVersion;
        var runner = function () {
            if (executedVersion < current) {
                executedVersion = scheduledVersion;
                run(true);
            }
        };

        MSApp.execAsyncAtPriority(runner, priorityWwa);
        scheduledWwaPriority = priorityWwa;
    }

    function requestDrain(priority, name) {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.requestDrain">
        /// <summary locid="WinJS.Utilities.Scheduler.requestDrain">
        /// Runs jobs in the scheduler without timeslicing until all jobs at the
        /// specified priority and higher have executed.
        /// </summary>
        /// <param name="priority" isOptional="true" type="WinJS.Utilities.Scheduler.Priority" locid="WinJS.Utilities.Scheduler.requestDrain_p:priority">
        /// The priority to which the scheduler should drain. The default is Priority.min, which drains all jobs in the queue.
        /// </param>
        /// <param name="name" isOptional="true" type="String" locid="WinJS.Utilities.Scheduler.requestDrain_p:name">
        /// An optional description of the drain request for diagnostics.
        /// </param>
        /// <returns type="WinJS.Promise" locid="WinJS.Utilities.Scheduler.requestDrain_returnValue">
        /// A promise which completes when the drain has finished. Canceling this
        /// promise cancels the drain request. This promise will never enter an error state.
        /// </returns>
        /// </signature>

        var id = globalDrainId++;
        if (name === undefined) {
            name = "Drain Request " + id;
        }
        priority = (+priority === priority) ? priority : Priority.min;
        priority = clampPriority(priority);

        var complete;
        var promise = new Promise(function (c) {
            complete = c;
            addDrainListener(priority, complete, name);
        }, function () {
            removeDrainListener(complete, true);
        });

        if (!pumping) {
            startRunning();
        }

        return promise;
    }

    function execHigh(callback) {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.execHigh">
        /// <summary locid="WinJS.Utilities.Scheduler.execHigh">
        /// Runs the specified callback in a high priority context.
        /// </summary>
        /// <param name="callback" type="Function" locid="WinJS.Utilities.Scheduler.execHigh_p:callback">
        /// The callback to run in a high priority context.
        /// </param>
        /// <returns type="Object" locid="WinJS.Utilities.Scheduler.execHigh_returnValue">
        /// The return value of the callback.
        /// </returns>
        /// </signature>

        return MSApp.execAtPriority(callback, MSApp.HIGH);
    }

    function createOwnerToken() {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.createOwnerToken">
        /// <summary locid="WinJS.Utilities.Scheduler.createOwnerToken">
        /// Creates and returns a new owner token which can be set to the owner property of one or more jobs.
        /// It can then be used to cancel all jobs it "owns".
        /// </summary>
        /// <returns type="WinJS.Utilities.Scheduler._OwnerToken" locid="WinJS.Utilities.Scheduler.createOwnerToken_returnValue">
        /// The new owner token. You can use this token to control jobs that it owns.
        /// </returns>
        /// </signature>

        return new OwnerToken();
    }

    function schedule(work, priority, thisArg, name) {
        /// <signature helpKeyword="WinJS.Utilities.Scheduler.schedule">
        /// <summary locid="WinJS.Utilities.Scheduler.schedule">
        /// Schedules the specified function to execute asynchronously.
        /// </summary>
        /// <param name="work" type="Function" locid="WinJS.Utilities.Scheduler.schedule_p:work">
        /// A function that represents the work item to be scheduled. When called the work item will receive as its first argument
        /// a JobInfo object which allows the work item to ask the scheduler if it should yield cooperatively and if so allows the
        /// work item to either provide a function to be run as a continuation or a WinJS.Promise which will when complete
        /// provide a function to run as a continuation.
        /// </param>
        /// <param name="priority" isOptional="true" type="WinJS.Utilities.Scheduler.Priority" locid="WinJS.Utilities.Scheduler.schedule_p:priority">
        /// The priority at which to schedule the work item. The default value is Priority.normal.
        /// </param>
        /// <param name="thisArg" isOptional="true" type="Object" locid="WinJS.Utilities.Scheduler.schedule_p:thisArg">
        /// A 'this' instance to be bound into the work item. The default value is null.
        /// </param>
        /// <param name="name" isOptional="true" type="String" locid="WinJS.Utilities.Scheduler.schedule_p:name">
        /// A description of the work item for diagnostics. The default value is an empty string.
        /// </param>
        /// <returns type="WinJS.Utilities.Scheduler._JobNode" locid="WinJS.Utilities.Scheduler.schedule_returnValue">
        /// The Job instance which represents this work item.
        /// </returns>
        /// </signature>

        priority = priority || Priority.normal;
        thisArg = thisArg || null;
        var jobId = ++globalJobId;
        var asyncOpID = _Trace._traceAsyncOperationStarting("WinJS.Utilities.Scheduler.schedule: " + jobId + profilerMarkArgs(name));
        name = name || "";
        return new JobNode(jobId, work, priority, thisArg, name, asyncOpID);
    }

    function getCurrentPriority() {
        if (pumping) {
            return pumpingPriority;
        } else {
            switch (MSApp.getCurrentPriority()) {
                case MSApp.HIGH: return Priority.high;
                case MSApp.NORMAL: return Priority.normal;
                case MSApp.IDLE: return Priority.idle;
            }
        }
    }

    function makeSchedulePromise(priority) {
        return function (promiseValue, jobName) {
            /// <signature helpKeyword="WinJS.Utilities.Scheduler.schedulePromise">
            /// <summary locid="WinJS.Utilities.Scheduler.schedulePromise">
            /// Schedules a job to complete a returned Promise.
            /// There are four versions of this method for different commonly used priorities: schedulePromiseHigh,
            /// schedulePromiseAboveNormal, schedulePromiseNormal, schedulePromiseBelowNormal,
            /// and schedulePromiseIdle.
            /// Example usage which shows how to
            /// ensure that the last link in a promise chain is run on the scheduler at high priority:
            /// asyncOp().then(Scheduler.schedulePromiseHigh).then(function (valueOfAsyncOp) { });
            /// </summary>
            /// <param name="promiseValue" isOptional="true" type="Object" locid="WinJS.Utilities.Scheduler.schedulePromise_p:promiseValue">
            /// The value with which the returned promise will complete.
            /// </param>
            /// <param name="jobName" isOptional="true" type="String" locid="WinJS.Utilities.Scheduler.schedulePromise_p:jobName">
            /// A string that describes the job for diagnostic purposes.
            /// </param>
            /// <returns type="WinJS.Promise" locid="WinJS.Utilities.Scheduler.schedulePromise_returnValue">
            /// A promise which completes within a job of the desired priority.
            /// </returns>
            /// </signature>
            var job;
            return new Promise(
                function (c) {
                    job = schedule(function schedulePromise() {
                        c(promiseValue);
                    }, priority, null, jobName);
                },
                function () {
                    job.cancel();
                }
            );
        };
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities.Scheduler", {

        Priority: Priority,

        schedule: schedule,

        createOwnerToken: createOwnerToken,

        execHigh: execHigh,

        requestDrain: requestDrain,

        /// <field type="WinJS.Utilities.Scheduler.Priority" locid="WinJS.Utilities.Scheduler.currentPriority" helpKeyword="WinJS.Utilities.Scheduler.currentPriority">
        /// Gets the current priority at which the caller is executing.
        /// </field>
        currentPriority: {
            get: getCurrentPriority
        },

        // Promise helpers
        //
        schedulePromiseHigh: makeSchedulePromise(Priority.high),
        schedulePromiseAboveNormal: makeSchedulePromise(Priority.aboveNormal),
        schedulePromiseNormal: makeSchedulePromise(Priority.normal),
        schedulePromiseBelowNormal: makeSchedulePromise(Priority.belowNormal),
        schedulePromiseIdle: makeSchedulePromise(Priority.idle),

        retrieveState: retrieveState,

        _JobNode: JobNode,

        _JobInfo: JobInfo,

        _OwnerToken: OwnerToken,

        _dumpList: dumpList,

        _isEmpty: {
            get: isEmpty
        },

        // The properties below are used for testing.
        //

        _usingWwaScheduler: {
            get: function () {
                return usingWwaScheduler;
            },
            set: function (value) {
                usingWwaScheduler = value;
                MSApp = (usingWwaScheduler ? _Global.MSApp : MSAppStubs);
            }
        },

        _MSApp: {
            get: function () {
                return MSApp;
            },
            set: function (value) {
                MSApp = value;
            }
        },

        _TIME_SLICE: TIME_SLICE

    });

});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Core/_BaseUtils',[
    'exports',
    './_Global',
    './_Base',
    './_BaseCoreUtils',
    './_ErrorFromName',
    './_Resources',
    './_Trace',
    '../Promise',
    '../Scheduler'
    ], function baseUtilsInit(exports, _Global, _Base, _BaseCoreUtils, _ErrorFromName, _Resources, _Trace, Promise, Scheduler) {
    "use strict";

    var strings = {
        get notSupportedForProcessing() { return "Value is not supported within a declarative processing context, if you want it to be supported mark it using WinJS.Utilities.markSupportedForProcessing. The value was: '{0}'"; }
    };

    var requestAnimationWorker;
    var requestAnimationId = 0;
    var requestAnimationHandlers = {};
    var validation = false;
    var platform = _Global.navigator.platform;
    var isiOS = platform === "iPhone" || platform === "iPad" || platform === "iPod";

    function nop(v) {
        return v;
    }

    function getMemberFiltered(name, root, filter) {
        return name.split(".").reduce(function (currentNamespace, name) {
            if (currentNamespace) {
                return filter(currentNamespace[name]);
            }
            return null;
        }, root);
    }

    function getMember(name, root) {
        /// <signature helpKeyword="WinJS.Utilities.getMember">
        /// <summary locid="WinJS.Utilities.getMember">
        /// Gets the leaf-level type or namespace specified by the name parameter.
        /// </summary>
        /// <param name="name" locid="WinJS.Utilities.getMember_p:name">
        /// The name of the member.
        /// </param>
        /// <param name="root" locid="WinJS.Utilities.getMember_p:root">
        /// The root to start in. Defaults to the global object.
        /// </param>
        /// <returns type="Object" locid="WinJS.Utilities.getMember_returnValue">
        /// The leaf-level type or namespace in the specified parent namespace.
        /// </returns>
        /// </signature>
        if (!name) {
            return null;
        }
        return getMemberFiltered(name, root || _Global, nop);
    }

    function getCamelCasedName(styleName) {
        // special case -moz prefixed styles because their JS property name starts with Moz
        if (styleName.length > 0 && styleName.indexOf("-moz") !== 0 && styleName.charAt(0) === "-") {
            styleName = styleName.slice(1);
        }
        return styleName.replace(/\-[a-z]/g, function (x) { return x[1].toUpperCase(); });
    }

    function addPrefixToCamelCasedName(prefix, name) {
        if (prefix === "") {
            return name;
        }

        return prefix + name.charAt(0).toUpperCase() + name.slice(1);
    }

    function addPrefixToCSSName(prefix, name) {
        return (prefix !== "" ? "-" + prefix.toLowerCase() + "-" : "") + name;
    }

    function getBrowserStyleEquivalents() {
        // not supported in WebWorker
        if (!_Global.document) {
            return {};
        }

        var equivalents = {},
            docStyle = _Global.document.documentElement.style,
            stylePrefixesToTest = ["", "webkit", "ms", "Moz"],
            styles = ["animation",
                "transition",
                "transform",
                "animation-name",
                "animation-duration",
                "animation-delay",
                "animation-timing-function",
                "animation-iteration-count",
                "animation-direction",
                "animation-fill-mode",
                "grid-column",
                "grid-columns",
                "grid-column-span",
                "grid-row",
                "grid-rows",
                "grid-row-span",
                "transform-origin",
                "transition-property",
                "transition-duration",
                "transition-delay",
                "transition-timing-function",
                "scroll-snap-points-x",
                "scroll-snap-points-y",
                "scroll-chaining",
                "scroll-limit",
                "scroll-limit-x-max",
                "scroll-limit-x-min",
                "scroll-limit-y-max",
                "scroll-limit-y-min",
                "scroll-snap-type",
                "scroll-snap-x",
                "scroll-snap-y",
                "touch-action",
                "overflow-style",
                "user-select" // used for Template Compiler test
            ],
            prefixesUsedOnStyles = {};

        for (var i = 0, len = styles.length; i < len; i++) {
            var originalName = styles[i],
                styleToTest = getCamelCasedName(originalName);
            for (var j = 0, prefixLen = stylePrefixesToTest.length; j < prefixLen; j++) {
                var prefix = stylePrefixesToTest[j];
                var styleName = addPrefixToCamelCasedName(prefix, styleToTest);
                if (styleName in docStyle) {
                    // Firefox doesn't support dashed style names being get/set via script. (eg, something like element.style["transform-origin"] = "" wouldn't work).
                    // For each style translation we create, we'll make a CSS name version and a script name version for it so each can be used where appropriate.
                    var cssName = addPrefixToCSSName(prefix, originalName);
                    equivalents[originalName] = {
                        cssName: cssName,
                        scriptName: styleName
                    };
                    prefixesUsedOnStyles[originalName] = prefix;
                    break;
                }
            }
        }

        // Special cases:
        equivalents.animationPrefix = addPrefixToCSSName(prefixesUsedOnStyles["animation"], "");
        equivalents.keyframes = addPrefixToCSSName(prefixesUsedOnStyles["animation"], "keyframes");

        return equivalents;
    }

    function getBrowserEventEquivalents() {
        var equivalents = {};
        var animationEventPrefixes = ["", "WebKit"],
            animationEvents = [
                {
                    eventObject: "TransitionEvent",
                    events: ["transitionStart", "transitionEnd"]
                },
                {
                    eventObject: "AnimationEvent",
                    events: ["animationStart", "animationEnd"]
                }
            ];

        for (var i = 0, len = animationEvents.length; i < len; i++) {
            var eventToTest = animationEvents[i],
                chosenPrefix = "";
            for (var j = 0, prefixLen = animationEventPrefixes.length; j < prefixLen; j++) {
                var prefix = animationEventPrefixes[j];
                if ((prefix + eventToTest.eventObject) in _Global) {
                    chosenPrefix = prefix.toLowerCase();
                    break;
                }
            }
            for (var j = 0, eventsLen = eventToTest.events.length; j < eventsLen; j++) {
                var eventName = eventToTest.events[j];
                equivalents[eventName] = addPrefixToCamelCasedName(chosenPrefix, eventName);
                if (chosenPrefix === "") {
                    // Transition and animation events are case sensitive. When there's no prefix, the event name should be in lowercase.
                    // In IE, Chrome and Firefox, an event handler listening to transitionend will be triggered properly, but transitionEnd will not.
                    // When a prefix is provided, though, the event name needs to be case sensitive.
                    // IE and Firefox will trigger an animationend event handler correctly, but Chrome won't trigger webkitanimationend -- it has to be webkitAnimationEnd.
                    equivalents[eventName] = equivalents[eventName].toLowerCase();
                }
            }
        }

        // Non-standardized events
        equivalents["manipulationStateChanged"] = ("MSManipulationEvent" in _Global ? "ManipulationEvent" : null);
        return equivalents;
    }

    // Returns a function which, when called, will call *fn*. However,
    // if called multiple times, it will only call *fn* at most once every
    // *delay* milliseconds. Multiple calls during the throttling period
    // will be coalesced into a single call to *fn* with the arguments being
    // the ones from the last call received during the throttling period.
    // Note that, due to the throttling period, *fn* may be invoked asynchronously
    // relative to the time it was called so make sure its arguments are still valid
    // (for example, eventObjects will not be valid).
    //
    // Example usage. If you want your key down handler to run once every 100 ms,
    // you could do this:
    //   var onKeyDown = throttledFunction(function (keyCode) {
    //     // do something with keyCode
    //   });
    //   element.addEventListener("keydown", function (eventObject) { onKeyDown(eventObject.keyCode); });
    //
    function throttledFunction(delay, fn) {
        var throttlePromise = null;
        var pendingCallPromise = null;
        var nextContext = null;
        var nextArgs = null;

        function makeThrottlePromise() {
            return Promise.timeout(delay).then(function () {
                throttlePromise = null;
            });
        }

        return function () {
            if (pendingCallPromise) {
                nextContext = this;
                nextArgs = [].slice.call(arguments, 0);
            } else if (throttlePromise) {
                nextContext = this;
                nextArgs = [].slice.call(arguments, 0);
                pendingCallPromise = throttlePromise.then(function () {
                    var context = nextContext;
                    nextContext = null;
                    var args = nextArgs;
                    nextArgs = null;
                    throttlePromise = makeThrottlePromise();
                    pendingCallPromise = null;
                    fn.apply(context, args);
                });
            } else {
                throttlePromise = makeThrottlePromise();
                fn.apply(this, arguments);
            }
        };
    }

    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        // Used for mocking in tests
        _setHasWinRT: {
            value: function (value) {
                _BaseCoreUtils.hasWinRT = value;
            },
            configurable: false,
            writable: false,
            enumerable: false
        },

        /// <field type="Boolean" locid="WinJS.Utilities.hasWinRT" helpKeyword="WinJS.Utilities.hasWinRT">Determine if WinRT is accessible in this script context.</field>
        hasWinRT: {
            get: function () { return _BaseCoreUtils.hasWinRT; },
            configurable: false,
            enumerable: true
        },

        // Used for mocking in tests
        _setIsiOS: {
            value: function (value) {
                isiOS = value;
            },
            configurable: false,
            writable: false,
            enumerable: false
        },

        _isiOS: {
            get: function () { return isiOS; },
            configurable: false,
            enumerable: true
        },

        _getMemberFiltered: getMemberFiltered,

        getMember: getMember,

        _browserStyleEquivalents: getBrowserStyleEquivalents(),
        _browserEventEquivalents: getBrowserEventEquivalents(),
        _getCamelCasedName: getCamelCasedName,

        ready: function ready(callback, async) {
            /// <signature helpKeyword="WinJS.Utilities.ready">
            /// <summary locid="WinJS.Utilities.ready">
            /// Ensures that the specified function executes only after the DOMContentLoaded event has fired
            /// for the current page.
            /// </summary>
            /// <returns type="WinJS.Promise" locid="WinJS.Utilities.ready_returnValue">A promise that completes after DOMContentLoaded has occurred.</returns>
            /// <param name="callback" optional="true" locid="WinJS.Utilities.ready_p:callback">
            /// A function that executes after DOMContentLoaded has occurred.
            /// </param>
            /// <param name="async" optional="true" locid="WinJS.Utilities.ready_p:async">
            /// If true, the callback is executed asynchronously.
            /// </param>
            /// </signature>
            return new Promise(function (c, e) {
                function complete() {
                    if (callback) {
                        try {
                            callback();
                            c();
                        }
                        catch (err) {
                            e(err);
                        }
                    } else {
                        c();
                    }
                }

                var readyState = ready._testReadyState;
                if (!readyState) {
                    if (_Global.document) {
                        readyState = _Global.document.readyState;
                    } else {
                        readyState = "complete";
                    }
                }
                if (readyState === "complete" || (_Global.document && _Global.document.body !== null)) {
                    if (async) {
                        Scheduler.schedule(function WinJS_Utilities_ready() {
                            complete();
                        }, Scheduler.Priority.normal, null, "WinJS.Utilities.ready");
                    } else {
                        complete();
                    }
                } else {
                    _Global.addEventListener("DOMContentLoaded", complete, false);
                }
            });
        },

        /// <field type="Boolean" locid="WinJS.Utilities.strictProcessing" helpKeyword="WinJS.Utilities.strictProcessing">Determines if strict declarative processing is enabled in this script context.</field>
        strictProcessing: {
            get: function () { return true; },
            configurable: false,
            enumerable: true,
        },

        markSupportedForProcessing: {
            value: _BaseCoreUtils.markSupportedForProcessing,
            configurable: false,
            writable: false,
            enumerable: true
        },

        requireSupportedForProcessing: {
            value: function (value) {
                /// <signature helpKeyword="WinJS.Utilities.requireSupportedForProcessing">
                /// <summary locid="WinJS.Utilities.requireSupportedForProcessing">
                /// Asserts that the value is compatible with declarative processing, such as WinJS.UI.processAll
                /// or WinJS.Binding.processAll. If it is not compatible an exception will be thrown.
                /// </summary>
                /// <param name="value" type="Object" locid="WinJS.Utilities.requireSupportedForProcessing_p:value">
                /// The value to be tested for compatibility with declarative processing. If the
                /// value is a function it must be marked with a property 'supportedForProcessing'
                /// with a value of true.
                /// </param>
                /// <returns type="Object" locid="WinJS.Utilities.requireSupportedForProcessing_returnValue">
                /// The input value.
                /// </returns>
                /// </signature>
                var supportedForProcessing = true;

                supportedForProcessing = supportedForProcessing && value !== _Global;
                supportedForProcessing = supportedForProcessing && value !== _Global.location;
                supportedForProcessing = supportedForProcessing && !(value instanceof _Global.HTMLIFrameElement);
                supportedForProcessing = supportedForProcessing && !(typeof value === "function" && !value.supportedForProcessing);

                switch (_Global.frames.length) {
                    case 0:
                        break;

                    case 1:
                        supportedForProcessing = supportedForProcessing && value !== _Global.frames[0];
                        break;

                    default:
                        for (var i = 0, len = _Global.frames.length; supportedForProcessing && i < len; i++) {
                            supportedForProcessing = supportedForProcessing && value !== _Global.frames[i];
                        }
                        break;
                }

                if (supportedForProcessing) {
                    return value;
                }

                throw new _ErrorFromName("WinJS.Utilities.requireSupportedForProcessing", _Resources._formatString(strings.notSupportedForProcessing, value));
            },
            configurable: false,
            writable: false,
            enumerable: true
        },

        _setImmediate: _BaseCoreUtils._setImmediate,

        _requestAnimationFrame: _Global.requestAnimationFrame ? _Global.requestAnimationFrame.bind(_Global) : function (handler) {
            var handle = ++requestAnimationId;
            requestAnimationHandlers[handle] = handler;
            requestAnimationWorker = requestAnimationWorker || _Global.setTimeout(function () {
                var toProcess = requestAnimationHandlers;
                var now = Date.now();
                requestAnimationHandlers = {};
                requestAnimationWorker = null;
                Object.keys(toProcess).forEach(function (key) {
                    toProcess[key](now);
                });
            }, 16);
            return handle;
        },

        _cancelAnimationFrame: _Global.cancelAnimationFrame ? _Global.cancelAnimationFrame.bind(_Global) : function (handle) {
            delete requestAnimationHandlers[handle];
        },

        // Allows the browser to finish dispatching its current set of events before running
        // the callback.
        _yieldForEvents: _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (handler) {
            _Global.setTimeout(handler, 0);
        },

        // Allows the browser to notice a DOM modification before running the callback.
        _yieldForDomModification: _Global.setImmediate ? _Global.setImmediate.bind(_Global) : function (handler) {
            _Global.setTimeout(handler, 0);
        },

        _throttledFunction: throttledFunction,

        _shallowCopy: function _shallowCopy(a) {
            // Shallow copy a single object.
            return this._mergeAll([a]);
        },

        _merge: function _merge(a, b) {
            // Merge 2 objects together into a new object
            return this._mergeAll([a, b]);
        },

        _mergeAll: function _mergeAll(list) {
            // Merge a list of objects together
            var o = {};
            list.forEach(function (part) {
                Object.keys(part).forEach(function (k) {
                    o[k] = part[k];
                });
            });
            return o;
        },

        _getProfilerMarkIdentifier: function _getProfilerMarkIdentifier(element) {
            var profilerMarkIdentifier = "";
            if (element.id) {
                profilerMarkIdentifier += " id='" + element.id + "'";
            }
            if (element.className) {
                profilerMarkIdentifier += " class='" + element.className + "'";
            }
            return profilerMarkIdentifier;
        },

        _now: function _now() {
            return (_Global.performance && _Global.performance.now && _Global.performance.now()) || Date.now();
        },

        _traceAsyncOperationStarting: _Trace._traceAsyncOperationStarting,
        _traceAsyncOperationCompleted: _Trace._traceAsyncOperationCompleted,
        _traceAsyncCallbackStarting: _Trace._traceAsyncCallbackStarting,
        _traceAsyncCallbackCompleted: _Trace._traceAsyncCallbackCompleted,

        _version: "4.0.0-preview"
    });

    _Base.Namespace._moduleDefine(exports, "WinJS", {
        validation: {
            get: function () {
                return validation;
            },
            set: function (value) {
                validation = value;
            }
        }
    });

    // strictProcessing also exists as a module member
    _Base.Namespace.define("WinJS", {
        strictProcessing: {
            value: function () {
                /// <signature helpKeyword="WinJS.strictProcessing">
                /// <summary locid="WinJS.strictProcessing">
                /// Strict processing is always enforced, this method has no effect.
                /// </summary>
                /// </signature>
            },
            configurable: false,
            writable: false,
            enumerable: false
        }
    });
});


define('WinJS/Core',[
    './Core/_Base',
    './Core/_BaseCoreUtils',
    './Core/_BaseUtils',
    './Core/_ErrorFromName',
    './Core/_Events',
    './Core/_Global',
    './Core/_Log',
    './Core/_Resources',
    './Core/_Trace',
    './Core/_WinRT',
    './Core/_WriteProfilerMark'
    ], function () {
    // Wrapper module
});
// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/Utilities/_ElementUtilities',[
    'exports',
    '../Core/_Global',
    '../Core/_Base',
    '../Core/_BaseUtils',
    '../Core/_WinRT',
    '../Promise',
    '../Scheduler'
], function elementUtilities(exports, _Global, _Base, _BaseUtils, _WinRT, Promise, Scheduler) {
    "use strict";

    // not supported in WebWorker
    if (!_Global.document) {
        return;
    }

    var _zoomToDuration = 167;

    function removeEmpties(arr) {
        var len = arr.length;
        for (var i = len - 1; i >= 0; i--) {
            if (!arr[i]) {
                arr.splice(i, 1);
                len--;
            }
        }
        return len;
    }

    function getClassName(e) {
        var name = e.className || "";
        if (typeof (name) === "string") {
            return name;
        } else {
            return name.baseVal || "";
        }
    }
    function setClassName(e, value) {
        // SVG elements (which use e.className.baseVal) are never undefined,
        // so this logic makes the comparison a bit more compact.
        //
        var name = e.className || "";
        if (typeof (name) === "string") {
            e.className = value;
        } else {
            e.className.baseVal = value;
        }
        return e;
    }
    function addClass(e, name) {
        /// <signature helpKeyword="WinJS.Utilities.addClass">
        /// <summary locid="WinJS.Utilities.addClass">
        /// Adds the specified class(es) to the specified element. Multiple classes can be added using space delimited names.
        /// </summary>
        /// <param name="e" type="HTMLElement" locid="WinJS.Utilities.addClass_p:e">
        /// The element to which to add the class.
        /// </param>
        /// <param name="name" type="String" locid="WinJS.Utilities.addClass_p:name">
        /// The name of the class to add, multiple classes can be added using space delimited names
        /// </param>
        /// <returns type="HTMLElement" locid="WinJS.Utilities.addClass_returnValue">
        /// The element.
        /// </returns>
        /// </signature>
        if (e.classList) {
            // Fastpath: adding a single class, no need to string split the argument
            if (name.indexOf(" ") < 0) {
                e.classList.add(name);
            } else {
                var namesToAdd = name.split(" ");
                removeEmpties(namesToAdd);

                for (var i = 0, len = namesToAdd.length; i < len; i++) {
                    e.classList.add(namesToAdd[i]);
                }
            }
            return e;
        } else {
            var className = getClassName(e);
            var names = className.split(" ");
            var l = removeEmpties(names);
            var toAdd;

            // we have a fast path for the common case of a single name in the class name
            //
            if (name.indexOf(" ") >= 0) {
                var namesToAdd = name.split(" ");
                removeEmpties(namesToAdd);
                for (var i = 0; i < l; i++) {
                    var found = namesToAdd.indexOf(names[i]);
                    if (found >= 0) {
                        namesToAdd.splice(found, 1);
                    }
                }
                if (namesToAdd.length > 0) {
                    toAdd = namesToAdd.join(" ");
                }
            } else {
                var saw = false;
                for (var i = 0; i < l; i++) {
                    if (names[i] === name) {
                        saw = true;
                        break;
                    }
                }
                if (!saw) { toAdd = name; }

            }
            if (toAdd) {
                if (l > 0 && names[0].length > 0) {
                    setClassName(e, className + " " + toAdd);
                } else {
                    setClassName(e, toAdd);
                }
            }
            return e;
        }
    }
    function removeClass(e, name) {
        /// <signature helpKeyword="WinJS.Utilities.removeClass">
        /// <summary locid="WinJS.Utilities.removeClass">
        /// Removes the specified class from the specified element.
        /// </summary>
        /// <param name="e" type="HTMLElement" locid="WinJS.Utilities.removeClass_p:e">
        /// The element from which to remove the class.
        /// </param>
        /// <param name="name" type="String" locid="WinJS.Utilities.removeClass_p:name">
        /// The name of the class to remove.
        /// </param>
        /// <returns type="HTMLElement" locid="WinJS.Utilities.removeClass_returnValue">
        /// The element.
        /// </returns>
        /// </signature>
        if (e.classList) {

            // Fastpath: Nothing to remove
            if (e.classList.length === 0) {
                return e;
            }
            var namesToRemove = name.split(" ");
            removeEmpties(namesToRemove);

            for (var i = 0, len = namesToRemove.length; i < len; i++) {
                e.classList.remove(namesToRemove[i]);
            }
            return e;
        } else {
            var original = getClassName(e);
            var namesToRemove;
            var namesToRemoveLen;

            if (name.indexOf(" ") >= 0) {
                namesToRemove = name.split(" ");
                namesToRemoveLen = removeEmpties(namesToRemove);
            } else {
                // early out for the case where you ask to remove a single
                // name and that name isn't found.
                //
                if (original.indexOf(name) < 0) {
                    return e;
                }
                namesToRemove = [name];
                namesToRemoveLen = 1;
            }
            var removed;
            var names = original.split(" ");
            var namesLen = removeEmpties(names);

            for (var i = namesLen - 1; i >= 0; i--) {
                if (namesToRemove.indexOf(names[i]) >= 0) {
                    names.splice(i, 1);
                    removed = true;
                }
            }

            if (removed) {
                setClassName(e, names.join(" "));
            }
            return e;
        }
    }
    function toggleClass(e, name) {
        /// <signature helpKeyword="WinJS.Utilities.toggleClass">
        /// <summary locid="WinJS.Utilities.toggleClass">
        /// Toggles (adds or removes) the specified class on the specified element.
        /// If the class is present, it is removed; if it is absent, it is added.
        /// </summary>
        /// <param name="e" type="HTMLElement" locid="WinJS.Utilities.toggleClass_p:e">
        /// The element on which to toggle the class.
        /// </param>
        /// <param name="name" type="String" locid="WinJS.Utilities.toggleClass_p:name">
        /// The name of the class to toggle.
        /// </param>
        /// <returns type="HTMLElement" locid="WinJS.Utilities.toggleClass_returnValue">
        /// The element.
        /// </returns>
        /// </signature>
        if (e.classList) {
            e.classList.toggle(name);
            return e;
        } else {
            var className = getClassName(e);
            var names = className.trim().split(" ");
            var l = names.length;
            var found = false;
            for (var i = 0; i < l; i++) {
                if (names[i] === name) {
                    found = true;
                }
            }
            if (!found) {
                if (l > 0 && names[0].length > 0) {
                    setClassName(e, className + " " + name);
                } else {
                    setClassName(e, className + name);
                }
            } else {
                setClassName(e, names.reduce(function (r, e) {
                    if (e === name) {
                        return r;
                    } else if (r && r.length > 0) {
                        return r + " " + e;
                    } else {
                        return e;
                    }
                }, ""));
            }
            return e;
        }
    }

    // Only set the attribute if its value has changed
    function setAttribute(element, attribute, value) {
        if (element.getAttribute(attribute) !== "" + value) {
            element.setAttribute(attribute, value);
        }
    }

    function _clamp(value, lowerBound, upperBound, defaultValue) {
        var n = Math.max(lowerBound, Math.min(upperBound, +value));
        return n === 0 ? 0 : n || Math.max(lowerBound, Math.min(upperBound, defaultValue));
    }
    var _pixelsRE = /^-?\d+\.?\d*(px)?$/i;
    var _numberRE = /^-?\d+/i;
    function convertToPixels(element, value) {
        /// <signature helpKeyword="WinJS.Utilities.convertToPixels">
        /// <summary locid="WinJS.Utilities.convertToPixels">
        /// Converts a CSS positioning string for the specified element to pixels.
        /// </summary>
        /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.convertToPixels_p:element">
        /// The element.
        /// </param>
        /// <param name="value" type="String" locid="WinJS.Utilities.convertToPixels_p:value">
        /// The CSS positioning string.
        /// </param>
        /// <returns type="Number" locid="WinJS.Utilities.convertToPixels_returnValue">
        /// The number of pixels.
        /// </returns>
        /// </signature>
        if (!_pixelsRE.test(value) && _numberRE.test(value)) {
            var previousValue = element.style.left;

            element.style.left = value;
            value = element.style.pixelLeft;

            element.style.left = previousValue;

            return value;
        } else {
            return Math.round(parseFloat(value)) || 0;
        }
    }
    function getDimension(element, property) {
        return convertToPixels(element, _Global.getComputedStyle(element, null)[property]);
    }

    var _MSGestureEvent = _Global.MSGestureEvent || {
        MSGESTURE_FLAG_BEGIN: 1,
        MSGESTURE_FLAG_CANCEL: 4,
        MSGESTURE_FLAG_END: 2,
        MSGESTURE_FLAG_INERTIA: 8,
        MSGESTURE_FLAG_NONE: 0
    };

    var _MSManipulationEvent = _Global.MSManipulationEvent || {
        MS_MANIPULATION_STATE_ACTIVE: 1,
        MS_MANIPULATION_STATE_CANCELLED: 6,
        MS_MANIPULATION_STATE_COMMITTED: 7,
        MS_MANIPULATION_STATE_DRAGGING: 5,
        MS_MANIPULATION_STATE_INERTIA: 2,
        MS_MANIPULATION_STATE_PRESELECT: 3,
        MS_MANIPULATION_STATE_SELECTING: 4,
        MS_MANIPULATION_STATE_STOPPED: 0
    };

    var _MSPointerEvent = _Global.MSPointerEvent || {
        MSPOINTER_TYPE_TOUCH: "touch",
        MSPOINTER_TYPE_PEN: "pen",
        MSPOINTER_TYPE_MOUSE: "mouse",
    };

    // Helpers for managing element._eventsMap for custom events
    //

    function addListenerToEventMap(element, type, listener, useCapture, data) {
        var eventNameLowercase = type.toLowerCase();
        if (!element._eventsMap) {
            element._eventsMap = {};
        }
        if (!element._eventsMap[eventNameLowercase]) {
            element._eventsMap[eventNameLowercase] = [];
        }
        element._eventsMap[eventNameLowercase].push({
            listener: listener,
            useCapture: useCapture,
            data: data
        });
    }

    function removeListenerFromEventMap(element, type, listener, useCapture) {
        var eventNameLowercase = type.toLowerCase();
        var mappedEvents = element._eventsMap && element._eventsMap[eventNameLowercase];
        if (mappedEvents) {
            for (var i = mappedEvents.length - 1; i >= 0; i--) {
                var mapping = mappedEvents[i];
                if (mapping.listener === listener && (!!useCapture === !!mapping.useCapture)) {
                    mappedEvents.splice(i, 1);
                    return mapping;
                }
            }
        }
        return null;
    }

    function lookupListeners(element, type) {
        var eventNameLowercase = type.toLowerCase();
        return element._eventsMap && element._eventsMap[eventNameLowercase] && element._eventsMap[eventNameLowercase].slice(0) || [];
    }

    // Custom focusin/focusout events
    // Generally, use these instead of using the browser's blur/focus/focusout/focusin events directly.
    // However, this doesn't support the window object. If you need to listen to focus events on the window,
    // use the browser's events directly.
    //
    // In order to send our custom focusin/focusout events synchronously on every browser, we feature detect
    // for native "focusin" and "focusout" since every browser that supports them will fire them synchronously.
    // Every browser in our support matrix, except for IE, also fires focus/blur synchronously, we fall back to
    // those events in browsers such as Firefox that do not have native support for focusin/focusout.

    function bubbleEvent(element, type, eventObject) {
        while (element) {
            var handlers = lookupListeners(element, type);
            for (var i = 0, len = handlers.length; i < len; i++) {
                handlers[i].listener.call(element, eventObject);
            }

            element = element.parentNode;
        }
    }

    function prepareFocusEvent(eventObject) {
        // If an iframe is involved, then relatedTarget should be null.
        if (eventObject.relatedTarget && eventObject.relatedTarget.tagName === "IFRAME" ||
                eventObject.target && eventObject.target.tagName === "IFRAME") {
            eventObject.relatedTarget = null;
        }

        return eventObject;
    }

    var nativeSupportForFocusIn = "onfocusin" in _Global.document.documentElement;
    var activeElement = null;
    _Global.addEventListener(nativeSupportForFocusIn ? "focusout" : "blur", function (eventObject) {
        // Fires focusout when focus move to another window or into an iframe.
        if (eventObject.target === _Global) {
            var previousActiveElement = activeElement;
            if (previousActiveElement) {
                bubbleEvent(previousActiveElement, "focusout", prepareFocusEvent({
                    type: "focusout",
                    target: previousActiveElement,
                    relatedTarget: null
                }));
            }
            activeElement = null;
        }
    });

    _Global.document.documentElement.addEventListener(nativeSupportForFocusIn ? "focusin" : "focus", function (eventObject) {
        var previousActiveElement = activeElement;
        activeElement = eventObject.target;
        if (previousActiveElement) {
            bubbleEvent(previousActiveElement, "focusout", prepareFocusEvent({
                type: "focusout",
                target: previousActiveElement,
                relatedTarget: activeElement
            }));
        }
        if (activeElement) {
            bubbleEvent(activeElement, "focusin", prepareFocusEvent({
                type: "focusin",
                target: activeElement,
                relatedTarget: previousActiveElement
            }));
        }
    }, true);

    function registerBubbleListener(element, type, listener, useCapture) {
        if (useCapture) {
            throw "This custom WinJS event only supports bubbling";
        }
        addListenerToEventMap(element, type, listener, useCapture);
    }

    // Custom pointer events
    //

    // Sets the properties in *overrideProperties* on the object. Delegates all other
    // property accesses to *eventObject*.
    //
    // The purpose of PointerEventProxy is that it allows us to customize properties on
    // an eventObject despite those properties being unwritable and unconfigurable.
    var PointerEventProxy = function (eventObject, overrideProperties) {
        overrideProperties = overrideProperties || {};
        this.__eventObject = eventObject;
        var that = this;
        Object.keys(overrideProperties).forEach(function (propertyName) {
            Object.defineProperty(that, propertyName, {
                value: overrideProperties[propertyName]
            });
        });
    };

    // Define PointerEventProxy properties which should be delegated to the original eventObject.
    [
        "altKey", "AT_TARGET", "bubbles", "BUBBLING_PHASE", "button", "buttons",
        "cancelable", "cancelBubble", "CAPTURING_PHASE", "clientX", "clientY",
        "ctrlKey", "currentTarget", "defaultPrevented", "detail", "eventPhase",
        "fromElement", "getModifierState", "height", "hwTimestamp", "initEvent",
        "initMouseEvent", "initPointerEvent", "initUIEvent", "isPrimary", "isTrusted",
        "layerX", "layerY", "metaKey", "offsetX", "offsetY", "pageX", "pageY",
        "pointerId", "pointerType", "pressure", "preventDefault", "relatedTarget",
        "rotation", "screenX", "screenY", "shiftKey", "srcElement", "stopImmediatePropagation",
        "stopPropagation", "target", "tiltX", "tiltY", "timeStamp", "toElement", "type",
        "view", "which", "width", "x", "y", "_normalizedType", "_fakedBySemanticZoom"
    ].forEach(function (propertyName) {
        Object.defineProperty(PointerEventProxy.prototype, propertyName, {
            get: function () {
                var value = this.__eventObject[propertyName];
                return typeof value === "function" ? value.bind(this.__eventObject) : value;
            },
            configurable: true
        });
    });

    function touchEventTranslator(callback, eventObject) {
        var changedTouches = eventObject.changedTouches,
            retVal = null;

        if (!changedTouches) {
            return retVal;
        }

        for (var i = 0, len = changedTouches.length; i < len; i++) {
            var touchObject = changedTouches[i];
            var pointerEventObject = new PointerEventProxy(eventObject, {
                pointerType: _MSPointerEvent.MSPOINTER_TYPE_TOUCH,
                pointerId: touchObject.identifier,
                isPrimary: i === 0,
                screenX: touchObject.screenX,
                screenY: touchObject.screenY,
                clientX: touchObject.clientX,
                clientY: touchObject.clientY,
                pageX: touchObject.pageX,
                pageY: touchObject.pageY,
                radiusX: touchObject.radiusX,
                radiusY: touchObject.radiusY,
                rotationAngle: touchObject.rotationAngle,
                force: touchObject.force,
                _currentTouch: touchObject
            });
            var newRetVal = callback(pointerEventObject);
            retVal = retVal || newRetVal;
        }
        return retVal;
    }

    function mouseEventTranslator(callback, eventObject) {
        eventObject.pointerType = _MSPointerEvent.MSPOINTER_TYPE_MOUSE;
        eventObject.pointerId = -1;
        eventObject.isPrimary = true;
        return callback(eventObject);
    }

    function mspointerEventTranslator(callback, eventObject) {
        return callback(eventObject);
    }

    var eventTranslations = {
        pointerdown: {
            touch: "touchstart",
            mspointer: "MSPointerDown",
            mouse: "mousedown"
        },
        pointerup: {
            touch: "touchend",
            mspointer: "MSPointerUp",
            mouse: "mouseup"
        },
        pointermove: {
            touch: "touchmove",
            mspointer: "MSPointerMove",
            mouse: "mousemove"
        },
        pointerenter: {
            touch: "touchenter",
            mspointer: "MSPointerEnter",
            mouse: "mouseenter"
        },
        pointerover: {
            touch: null,
            mspointer: "MSPointerOver",
            mouse: "mouseover"
        },
        pointerout: {
            touch: "touchleave",
            mspointer: "MSPointerOut",
            mouse: "mouseout"
        },
        pointercancel: {
            touch: "touchcancel",
            mspointer: "MSPointerCancel",
            mouse: null
        }
    };

    function registerPointerEvent(element, type, callback, capture) {
        var eventNameLowercase = type.toLowerCase();

        var mouseWrapper,
            touchWrapper,
            mspointerWrapper;
        var translations = eventTranslations[eventNameLowercase];

        // Browsers fire a touch event and then a mouse event when the input is touch. touchHandled is used to prevent invoking the pointer callback twice.
        var touchHandled;

        // If we are in IE10, we should use MSPointer as it provides a better interface than touch events
        if (_Global.MSPointerEvent) {
            mspointerWrapper = function (eventObject) {
                eventObject._normalizedType = eventNameLowercase;
                touchHandled = true;
                return mspointerEventTranslator(callback, eventObject);
            };
            element.addEventListener(translations.mspointer, mspointerWrapper, capture);
        } else {
            // Otherwise, use a mouse and touch event
            if (translations.mouse) {
                mouseWrapper = function (eventObject) {
                    eventObject._normalizedType = eventNameLowercase;
                    if (!touchHandled) {
                        return mouseEventTranslator(callback, eventObject);
                    }
                    touchHandled = false;
                };
                element.addEventListener(translations.mouse, mouseWrapper, capture);
            }
            if (translations.touch) {
                touchWrapper = function (eventObject) {
                    eventObject._normalizedType = eventNameLowercase;
                    touchHandled = true;
                    return touchEventTranslator(callback, eventObject);
                };
                element.addEventListener(translations.touch, touchWrapper, capture);
            }
        }

        addListenerToEventMap(element, type, callback, capture, {
            mouseWrapper: mouseWrapper,
            touchWrapper: touchWrapper,
            mspointerWrapper: mspointerWrapper
        });
    }

    function unregisterPointerEvent(element, type, callback, capture) {
        var eventNameLowercase = type.toLowerCase();

        var mapping = removeListenerFromEventMap(element, type, callback, capture);
        if (mapping) {
            var translations = eventTranslations[eventNameLowercase];
            if (mapping.data.mouseWrapper) {
                element.removeEventListener(translations.mouse, mapping.data.mouseWrapper, capture);
            }
            if (mapping.data.touchWrapper) {
                element.removeEventListener(translations.touch, mapping.data.touchWrapper, capture);
            }
            if (mapping.data.mspointerWrapper) {
                element.removeEventListener(translations.mspointer, mapping.data.mspointerWrapper, capture);
            }
        }
    }

    // Custom events dispatch table. Event names should be lowercased.
    //

    var customEvents = {
        focusout: {
            register: registerBubbleListener,
            unregister: removeListenerFromEventMap
        },
        focusin: {
            register: registerBubbleListener,
            unregister: removeListenerFromEventMap
        }
    };
    if (!_Global.PointerEvent) {
        var pointerEventEntry = {
            register: registerPointerEvent,
            unregister: unregisterPointerEvent
        };

        customEvents.pointerdown = pointerEventEntry;
        customEvents.pointerup = pointerEventEntry;
        customEvents.pointermove = pointerEventEntry;
        customEvents.pointerenter = pointerEventEntry;
        customEvents.pointerover = pointerEventEntry;
        customEvents.pointerout = pointerEventEntry;
        customEvents.pointercancel = pointerEventEntry;
    }

    // The MutationObserverShim only supports the following configuration:
    //  attributes
    //  attributeFilter
    var MutationObserverShim = _Base.Class.define(
        function MutationObserverShim_ctor(callback) {
            this._callback = callback;
            this._toDispose = [];
            this._attributeFilter = [];
            this._scheduled = false;
            this._pendingChanges = [];
            this._observerCount = 0;
            this._handleCallback = this._handleCallback.bind(this);
            this._targetElements = [];
        },
        {
            observe: function MutationObserverShim_observe(element, configuration) {
                if (this._targetElements.indexOf(element) === -1) {
                    this._targetElements.push(element);
                }
                this._observerCount++;
                if (configuration.attributes) {
                    this._addRemovableListener(element, "DOMAttrModified", this._handleCallback);
                }
                if (configuration.attributeFilter) {
                    this._attributeFilter = configuration.attributeFilter;
                }
            },
            disconnect: function MutationObserverShim_disconnect() {
                this._observerCount = 0;
                this._targetElements = [];
                this._toDispose.forEach(function (disposeFunc) {
                    disposeFunc();
                });
            },
            _addRemovableListener: function MutationObserverShim_addRemovableListener(target, event, listener) {
                target.addEventListener(event, listener);
                this._toDispose.push(function () {
                    target.removeEventListener(event, listener);
                });
            },
            _handleCallback: function MutationObserverShim_handleCallback(evt) {

                // prevent multiple events from firing when nesting observers
                evt.stopPropagation();

                var attrName = evt.attrName;
                if (this._attributeFilter.length && this._attributeFilter.indexOf(attrName) === -1) {
                    return;
                }

                // subtree:true is not currently supported
                if (this._targetElements.indexOf(evt.target) === -1) {
                    return;
                }

                var isAriaMutation = attrName.indexOf("aria") >= 0;

                // DOM mutation events use different naming for this attribute
                if (attrName === 'tabindex') {
                    attrName = 'tabIndex';
                }

                this._pendingChanges.push({
                    type: 'attributes',
                    target: evt.target,
                    attributeName: attrName
                });

                if (this._observerCount === 1 && !isAriaMutation) {
                    this._dispatchEvent();
                } else if (this._scheduled === false) {
                    this._scheduled = true;
                    _BaseUtils._setImmediate(this._dispatchEvent.bind(this));
                }

            },
            _dispatchEvent: function MutationObserverShim_dispatchEvent() {
                try {
                    this._callback(this._pendingChanges);
                }
                finally {
                    this._pendingChanges = [];
                    this._scheduled = false;
                }
            }
        },
        {
            _isShim: true
        }
    );

    var _MutationObserver = _Global.MutationObserver || MutationObserverShim;

    // Lazily init singleton on first access.
    var _resizeNotifier = null;

    // Class to provide a global listener for window.onresize events.
    // This keeps individual elements from having to listen to window.onresize
    // and having to dispose themselves to avoid leaks.
    var ResizeNotifier = _Base.Class.define(
        function ElementResizer_ctor() {
            _Global.addEventListener("resize", this._handleResize.bind(this));
        },
        {
            subscribe: function ElementResizer_subscribe(element, handler) {
                element.addEventListener(this._resizeEvent, handler);
                addClass(element, this._resizeClass);
            },
            unsubscribe: function ElementResizer_unsubscribe(element, handler) {
                removeClass(element, this._resizeClass);
                element.removeEventListener(this._resizeEvent, handler);
            },
            _handleResize: function ElementResizer_handleResize() {
                var resizables = _Global.document.querySelectorAll('.' + this._resizeClass);
                var length = resizables.length;
                for (var i = 0; i < length; i++) {
                    var event = _Global.document.createEvent("Event");
                    event.initEvent(this._resizeEvent, false, true);
                    resizables[i].dispatchEvent(event);
                }
            },
            _resizeClass: { get: function () { return 'win-element-resize'; } },
            _resizeEvent: { get: function () { return 'WinJSElementResize'; } }
        }
    );

    // - object: The object on which GenericListener will listen for events.
    // - objectName: A string representing the name of *object*. This will be
    //   incorporated into the names of the events and classNames created by
    //   GenericListener.
    // - options
    //   - registerThruWinJSCustomEvents: If true, will register for events using
    //     _exports._addEventListener so that you can take advantage of WinJS's custom
    //     events (e.g. focusin, pointer*). Otherwise, registers directly on *object*
    //     using its add/removeEventListener methods.
    var GenericListener = _Base.Class.define(
        function GenericListener_ctor(objectName, object, options) {
            options = options || {};
            this.registerThruWinJSCustomEvents = !!options.registerThruWinJSCustomEvents;

            this.objectName = objectName;
            this.object = object;
            this.capture = {};
            this.bubble = {};
        },
        {
            addEventListener: function GenericListener_addEventListener(element, name, listener, capture) {
                name = name.toLowerCase();
                var handlers = this._getHandlers(capture);
                var handler = handlers[name];

                if (!handler) {
                    handler = this._getListener(name, capture);
                    handler.refCount = 0;
                    handlers[name] = handler;

                    if (this.registerThruWinJSCustomEvents) {
                        exports._addEventListener(this.object, name, handler, capture);
                    } else {
                        this.object.addEventListener(name, handler, capture);
                    }
                }

                handler.refCount++;
                element.addEventListener(this._getEventName(name, capture), listener);
                addClass(element, this._getClassName(name, capture));
            },
            removeEventListener: function GenericListener_removeEventListener(element, name, listener, capture) {
                name = name.toLowerCase();
                var handlers = this._getHandlers(capture);
                var handler = handlers[name];

                if (handler) {
                    handler.refCount--;
                    if (handler.refCount === 0) {
                        if (this.registerThruWinJSCustomEvents) {
                            exports._removeEventListener(this.object, name, handler, capture);
                        } else {
                            this.object.removeEventListener(name, handler, capture);
                        }
                        delete handlers[name];
                    }
                }

                removeClass(element, this._getClassName(name, capture));
                element.removeEventListener(this._getEventName(name, capture), listener);
            },

            _getHandlers: function GenericListener_getHandlers(capture) {
                if (capture) {
                    return this.capture;
                } else {
                    return this.bubble;
                }
            },

            _getClassName: function GenericListener_getClassName(name, capture) {
                var captureSuffix = capture ? 'capture' : 'bubble';
                return 'win-' + this.objectName.toLowerCase() + '-event-' + name + captureSuffix;
            },

            _getEventName: function GenericListener_getEventName(name, capture) {
                var captureSuffix = capture ? 'capture' : 'bubble';
                return 'WinJS' + this.objectName + 'Event-' + name + captureSuffix;
            },

            _getListener: function GenericListener_getListener(name, capture) {
                var listener = function GenericListener_generatedListener(ev) {

                    var targets = _Global.document.querySelectorAll('.' + this._getClassName(name, capture));
                    var length = targets.length;
                    var handled = false;
                    for (var i = 0; i < length; i++) {
                        var event = _Global.document.createEvent("Event");
                        event.initEvent(this._getEventName(name, capture), false, true);
                        event.detail = { originalEvent: ev };
                        var doDefault = targets[i].dispatchEvent(event);
                        handled = handled || !doDefault;
                    }
                    return handled;
                };

                return listener.bind(this);
            }
        }
    );

    var determinedRTLEnvironment = false,
        usingWebkitScrollCoordinates = false,
        usingFirefoxScrollCoordinates = false;
    function determineRTLEnvironment() {
        var element = _Global.document.createElement("div");
        element.style.direction = "rtl";
        element.innerHTML = "" +
            "<div style='width: 100px; height: 100px; overflow: scroll; visibility:hidden'>" +
                "<div style='width: 10000px; height: 100px;'></div>" +
            "</div>";
        _Global.document.body.appendChild(element);
        var elementScroller = element.firstChild;
        if (elementScroller.scrollLeft > 0) {
            usingWebkitScrollCoordinates = true;
        }
        elementScroller.scrollLeft += 100;
        if (elementScroller.scrollLeft === 0) {
            usingFirefoxScrollCoordinates = true;
        }
        _Global.document.body.removeChild(element);
        determinedRTLEnvironment = true;
    }

    function getAdjustedScrollPosition(element) {
        var computedStyle = _Global.getComputedStyle(element),
            scrollLeft = element.scrollLeft;
        if (computedStyle.direction === "rtl") {
            if (!determinedRTLEnvironment) {
                determineRTLEnvironment();
            }
            if (usingWebkitScrollCoordinates) {
                scrollLeft = element.scrollWidth - element.clientWidth - scrollLeft;
            }
            scrollLeft = Math.abs(scrollLeft);
        }

        return {
            scrollLeft: scrollLeft,
            scrollTop: element.scrollTop
        };
    }

    function setAdjustedScrollPosition(element, scrollLeft, scrollTop) {
        if (scrollLeft !== undefined) {
            var computedStyle = _Global.getComputedStyle(element);
            if (computedStyle.direction === "rtl") {
                if (!determinedRTLEnvironment) {
                    determineRTLEnvironment();
                }
                if (usingFirefoxScrollCoordinates) {
                    scrollLeft = -scrollLeft;
                } else if (usingWebkitScrollCoordinates) {
                    scrollLeft = element.scrollWidth - element.clientWidth - scrollLeft;
                }
            }
            element.scrollLeft = scrollLeft;
        }

        if (scrollTop !== undefined) {
            element.scrollTop = scrollTop;
        }
    }

    function getScrollPosition(element) {
        /// <signature helpKeyword="WinJS.Utilities.getScrollPosition">
        /// <summary locid="WinJS.Utilities.getScrollPosition">
        /// Gets the scrollLeft and scrollTop of the specified element, adjusting the scrollLeft to change from browser specific coordinates to logical coordinates when in RTL.
        /// </summary>
        /// <param name="element" type="HTMLElement" domElement="true" locid="WinJS.Utilities.getScrollPosition_p:element">
        /// The element.
        /// </param>
        /// <returns type="Object" locid="WinJS.Utilities.getScrollPosition_returnValue">
        /// An object with two properties: scrollLeft and scrollTop
        /// </returns>
        /// </signature>
        return getAdjustedScrollPosition(element);
    }

    function setScrollPosition(element, position) {
        /// <signature helpKeyword="WinJS.Utilities.setScrollPosition">
        /// <summary locid="WinJS.Utilities.setScrollPosition">
        /// Sets the scrollLeft and scrollTop of the specified element, changing the scrollLeft from logical coordinates to browser-specific coordinates when in RTL.
        /// </summary>
        /// <param name="element" type="HTMLElement" domElement="true" locid="WinJS.Utilities.setScrollPosition_p:element">
        /// The element.
        /// </param>
        /// <param name="position" type="Object" domElement="true" locid="WinJS.Utilities.setScrollPosition_p:position">
        /// The element.
        /// </param>
        /// </signature>
        position = position || {};
        setAdjustedScrollPosition(element, position.scrollLeft, position.scrollTop);
    }

    // navigator.msManipulationViewsEnabled tells us whether snap points work or not regardless of whether the style properties exist, however,
    // on Phone WWAs, this check returns false even though snap points are supported. To work around this bug, we check for the presence of
    // 'MSAppHost' in the user agent string which indicates that we are in a WWA environment; all WWA environments support snap points.
    var supportsSnapPoints = _Global.navigator.msManipulationViewsEnabled || _Global.navigator.userAgent.indexOf("MSAppHost") >= 0;
    var supportsTouchDetection = !!(_Global.MSPointerEvent || _Global.TouchEvent);

    var uniqueElementIDCounter = 0;

    function uniqueID(e) {
        if (!(e.uniqueID || e._uniqueID)) {
            e._uniqueID = "element__" + (++uniqueElementIDCounter);
        }

        return e.uniqueID || e._uniqueID;
    }

    function ensureId(element) {
        if (!element.id) {
            element.id = uniqueID(element);
        }
    }

    function _getCursorPos(eventObject) {
        var docElement = _Global.document.documentElement;
        var docScrollPos = getScrollPosition(docElement);

        return {
            left: eventObject.clientX + (_Global.document.body.dir === "rtl" ? -docScrollPos.scrollLeft : docScrollPos.scrollLeft),
            top: eventObject.clientY + docElement.scrollTop
        };
    }

    function _getElementsByClasses(parent, classes) {
        var retVal = [];

        for (var i = 0, len = classes.length; i < len; i++) {
            var element = parent.querySelector("." + classes[i]);
            if (element) {
                retVal.push(element);
            }
        }
        return retVal;
    }

    var _selectionPartsSelector = ".win-selectionborder, .win-selectionbackground, .win-selectioncheckmark, .win-selectioncheckmarkbackground";
    var _dataKey = "_msDataKey";
    _Base.Namespace._moduleDefine(exports, "WinJS.Utilities", {
        _dataKey: _dataKey,

        _supportsSnapPoints: {
            get: function () {
                return supportsSnapPoints;
            }
        },

        _supportsTouchDetection: {
            get: function () {
                return supportsTouchDetection;
            }
        },

        _uniqueID: uniqueID,

        _ensureId: ensureId,

        _clamp: _clamp,

        _getCursorPos: _getCursorPos,

        _getElementsByClasses: _getElementsByClasses,

        _createGestureRecognizer: function () {
            if (_Global.MSGesture) {
                return new _Global.MSGesture();
            }

            var doNothing = function () {
            };
            return {
                addEventListener: doNothing,
                removeEventListener: doNothing,
                addPointer: doNothing,
                stop: doNothing
            };
        },

        _MSGestureEvent: _MSGestureEvent,
        _MSManipulationEvent: _MSManipulationEvent,

        _elementsFromPoint: function (x, y) {
            if (_Global.document.msElementsFromPoint) {
                return _Global.document.msElementsFromPoint(x, y);
            } else {
                var element = _Global.document.elementFromPoint(x, y);
                return element ? [element] : null;
            }
        },

        _matchesSelector: function _matchesSelector(element, selectorString) {
            var matchesSelector = element.matches
                    || element.msMatchesSelector
                    || element.mozMatchesSelector
                    || element.webkitMatchesSelector;
            return matchesSelector.call(element, selectorString);
        },

        _selectionPartsSelector: _selectionPartsSelector,

        _isSelectionRendered: function _isSelectionRendered(itemBox) {
            // The tree is changed at pointerDown but _selectedClass is added only when the user drags an item below the selection threshold so checking for _selectedClass is not reliable.
            return itemBox.querySelectorAll(_selectionPartsSelector).length > 0;
        },

        _addEventListener: function _addEventListener(element, type, listener, useCapture) {
            var eventNameLower = type && type.toLowerCase();
            var entry = customEvents[eventNameLower];
            var equivalentEvent = _BaseUtils._browserEventEquivalents[type];
            if (entry) {
                entry.register(element, type, listener, useCapture);
            } else if (equivalentEvent) {
                element.addEventListener(equivalentEvent, listener, useCapture);
            } else {
                element.addEventListener(type, listener, useCapture);
            }
        },

        _removeEventListener: function _removeEventListener(element, type, listener, useCapture) {
            var eventNameLower = type && type.toLowerCase();
            var entry = customEvents[eventNameLower];
            var equivalentEvent = _BaseUtils._browserEventEquivalents[type];
            if (entry) {
                entry.unregister(element, type, listener, useCapture);
            } else if (equivalentEvent) {
                element.removeEventListener(equivalentEvent, listener, useCapture);
            } else {
                element.removeEventListener(type, listener, useCapture);
            }
        },

        _initEventImpl: function (initType, event, eventType) {
            eventType = eventType.toLowerCase();
            var mapping = eventTranslations[eventType];
            if (mapping) {
                switch (initType.toLowerCase()) {
                    case "pointer":
                        arguments[2] = mapping.mspointer;
                        break;

                    default:
                        arguments[2] = mapping[initType.toLowerCase()];
                        break;
                }
            }
            event["init" + initType + "Event"].apply(event, Array.prototype.slice.call(arguments, 2));
        },

        _initMouseEvent: function (event) {
            this._initEventImpl.apply(this, ["Mouse", event].concat(Array.prototype.slice.call(arguments, 1)));
        },

        _initPointerEvent: function (event) {
            this._initEventImpl.apply(this, ["Pointer", event].concat(Array.prototype.slice.call(arguments, 1)));
        },

        _PointerEventProxy: PointerEventProxy,

        _bubbleEvent: bubbleEvent,

        _setPointerCapture: function (element, pointerId) {
            if (element.setPointerCapture) {
                element.setPointerCapture(pointerId);
            }
        },

        _releasePointerCapture: function (element, pointerId) {
            if (element.releasePointerCapture) {
                element.releasePointerCapture(pointerId);
            }
        },

        _MSPointerEvent: _MSPointerEvent,

        _zoomToDuration: _zoomToDuration,

        _zoomTo: function _zoomTo(element, args) {
            if (this._supportsSnapPoints && element.msZoomTo) {
                element.msZoomTo(args);
            } else {
                // Schedule to ensure that we're not running from within an event handler. For example, if running
                // within a focus handler triggered by WinJS.Utilities._setActive, scroll position will not yet be
                // restored.
                Scheduler.schedule(function () {
                    var initialPos = getAdjustedScrollPosition(element);
                    var effectiveScrollLeft = (typeof element._zoomToDestX === "number" ? element._zoomToDestX : initialPos.scrollLeft);
                    var effectiveScrollTop = (typeof element._zoomToDestY === "number" ? element._zoomToDestY : initialPos.scrollTop);
                    var cs = _Global.getComputedStyle(element);
                    var scrollLimitX = element.scrollWidth - parseInt(cs.width, 10) - parseInt(cs.paddingLeft, 10) - parseInt(cs.paddingRight, 10);
                    var scrollLimitY = element.scrollHeight - parseInt(cs.height, 10) - parseInt(cs.paddingTop, 10) - parseInt(cs.paddingBottom, 10);

                    if (typeof args.contentX !== "number") {
                        args.contentX = effectiveScrollLeft;
                    }
                    if (typeof args.contentY !== "number") {
                        args.contentY = effectiveScrollTop;
                    }

                    var zoomToDestX = _clamp(args.contentX, 0, scrollLimitX);
                    var zoomToDestY = _clamp(args.contentY, 0, scrollLimitY);
                    if (zoomToDestX === effectiveScrollLeft && zoomToDestY === effectiveScrollTop) {
                        // Scroll position is already in the proper state. This zoomTo is a no-op.
                        return;
                    }

                    element._zoomToId = element._zoomToId || 0;
                    element._zoomToId++;
                    element._zoomToDestX = zoomToDestX;
                    element._zoomToDestY = zoomToDestY;

                    var thisZoomToId = element._zoomToId;
                    var start = _BaseUtils._now();
                    var xFactor = (element._zoomToDestX - initialPos.scrollLeft) / _zoomToDuration;
                    var yFactor = (element._zoomToDestY - initialPos.scrollTop) / _zoomToDuration;

                    var update = function () {
                        var t = _BaseUtils._now() - start;
                        if (element._zoomToId !== thisZoomToId) {
                            return;
                        } else if (t > _zoomToDuration) {
                            setAdjustedScrollPosition(element, element._zoomToDestX, element._zoomToDestY);
                            element._zoomToDestX = null;
                            element._zoomToDestY = null;
                        } else {
                            setAdjustedScrollPosition(element, initialPos.scrollLeft + t * xFactor, initialPos.scrollTop + t * yFactor);
                            _BaseUtils._requestAnimationFrame(update);
                        }
                    };

                    _BaseUtils._requestAnimationFrame(update);
                }, Scheduler.Priority.high, null, "WinJS.Utilities._zoomTo");
            }
        },

        _setActive: function _setActive(element, scroller) {
            var success = true;
            try {
                if (_Global.HTMLElement && _Global.HTMLElement.prototype.setActive) {
                    element.setActive();
                } else {
                    // We are aware the unlike setActive(), focus() will scroll to the element that gets focus. However, this is
                    // our current cross-browser solution until there is an equivalent for setActive() in other browsers.
                    //
                    // This _setActive polyfill does have limited support for preventing scrolling: via the scroller parameter, it
                    // can prevent one scroller from scrolling. This functionality is necessary in some scenarios. For example, when using
                    // _zoomTo and _setActive together.

                    var scrollLeft,
                        scrollTop;

                    if (scroller) {
                        scrollLeft = scroller.scrollLeft;
                        scrollTop = scroller.scrollTop;
                    }
                    element.focus();
                    if (scroller) {
                        scroller.scrollLeft = scrollLeft;
                        scroller.scrollTop = scrollTop;
                    }
                }
            } catch (e) {
                // setActive() raises an exception when trying to focus an invisible item. Checking visibility is non-trivial, so it's best
                // just to catch the exception and ignore it. focus() on the other hand, does not raise exceptions.
                success = false;
            }
            return success;
        },

        _MutationObserver: _MutationObserver,

        _resizeNotifier: {
            get: function () {
                if (!_resizeNotifier) {
                    _resizeNotifier = new ResizeNotifier();
                }
                return _resizeNotifier;
            }
        },

        _GenericListener: GenericListener,
        _globalListener: new GenericListener("Global", _Global, { registerThruWinJSCustomEvents: true }),
        _documentElementListener: new GenericListener("DocumentElement", _Global.document.documentElement, { registerThruWinJSCustomEvents: true }),
        _inputPaneListener: _WinRT.Windows.UI.ViewManagement.InputPane ?
            new GenericListener("InputPane", _WinRT.Windows.UI.ViewManagement.InputPane.getForCurrentView()) :
            { addEventListener: function () { }, removeEventListener: function () { } },

        // Appends a hidden child to the given element that will listen for being added
        // to the DOM. When the hidden element is added to the DOM, it will dispatch a
        // "WinJSNodeInserted" event on the provided element.
        _addInsertedNotifier: function (element) {
            var hiddenElement = _Global.document.createElement("div");
            hiddenElement.style[_BaseUtils._browserStyleEquivalents["animation-name"].scriptName] = "WinJS-node-inserted";
            hiddenElement.style[_BaseUtils._browserStyleEquivalents["animation-duration"].scriptName] = "0.01s";
            hiddenElement.style["position"] = "absolute";
            element.appendChild(hiddenElement);

            exports._addEventListener(hiddenElement, "animationStart", function (e) {
                if (e.animationName === "WinJS-node-inserted") {
                    var e = _Global.document.createEvent("Event");
                    e.initEvent("WinJSNodeInserted", false, true);
                    element.dispatchEvent(e);
                }
            }, false);

            return hiddenElement;
        },

        // Returns a promise which completes when *element* is in the DOM.
        _inDom: function Utilities_inDom(element) {
            return new Promise(function (c) {
                if (_Global.document.body.contains(element)) {
                    c();
                } else {
                    var nodeInsertedHandler = function () {
                        element.removeEventListener("WinJSNodeInserted", nodeInsertedHandler, false);
                        c();
                    };
                    exports._addInsertedNotifier(element);
                    element.addEventListener("WinJSNodeInserted", nodeInsertedHandler, false);
                }
            });
        },

        // Browser agnostic method to set element flex style
        // Param is an object in the form {grow: flex-grow, shrink: flex-shrink, basis: flex-basis}
        // All fields optional
        _setFlexStyle: function (element, flexParams) {
            var styleObject = element.style;
            if (typeof flexParams.grow !== "undefined") {
                styleObject.msFlexPositive = flexParams.grow;
                styleObject.webkitFlexGrow = flexParams.grow;
                styleObject.flexGrow = flexParams.grow;
            }
            if (typeof flexParams.shrink !== "undefined") {
                styleObject.msFlexNegative = flexParams.shrink;
                styleObject.webkitFlexShrink = flexParams.shrink;
                styleObject.flexShrink = flexParams.shrink;
            }
            if (typeof flexParams.basis !== "undefined") {
                styleObject.msFlexPreferredSize = flexParams.basis;
                styleObject.webkitFlexBasis = flexParams.basis;
                styleObject.flexBasis = flexParams.basis;
            }
        },

        /// <field locid="WinJS.Utilities.Key" helpKeyword="WinJS.Utilities.Key">
        /// Defines a set of keyboard values.
        /// </field>
        Key: {
            /// <field locid="WinJS.Utilities.Key.backspace" helpKeyword="WinJS.Utilities.Key.backspace">
            /// BACKSPACE key.
            /// </field>
            backspace: 8,

            /// <field locid="WinJS.Utilities.Key.tab" helpKeyword="WinJS.Utilities.Key.tab">
            /// TAB key.
            /// </field>
            tab: 9,

            /// <field locid="WinJS.Utilities.Key.enter" helpKeyword="WinJS.Utilities.Key.enter">
            /// ENTER key.
            /// </field>
            enter: 13,

            /// <field locid="WinJS.Utilities.Key.shift" helpKeyword="WinJS.Utilities.Key.shift">
            /// Shift key.
            /// </field>
            shift: 16,

            /// <field locid="WinJS.Utilities.Key.ctrl" helpKeyword="WinJS.Utilities.Key.ctrl">
            /// CTRL key.
            /// </field>
            ctrl: 17,

            /// <field locid="WinJS.Utilities.Key.alt" helpKeyword="WinJS.Utilities.Key.alt">
            /// ALT key
            /// </field>
            alt: 18,

            /// <field locid="WinJS.Utilities.Key.pause" helpKeyword="WinJS.Utilities.Key.pause">
            /// Pause key.
            /// </field>
            pause: 19,

            /// <field locid="WinJS.Utilities.Key.capsLock" helpKeyword="WinJS.Utilities.Key.capsLock">
            /// CAPS LOCK key.
            /// </field>
            capsLock: 20,

            /// <field locid="WinJS.Utilities.Key.escape" helpKeyword="WinJS.Utilities.Key.escape">
            /// ESCAPE key.
            /// </field>
            escape: 27,

            /// <field locid="WinJS.Utilities.Key.space" helpKeyword="WinJS.Utilities.Key.space">
            /// SPACE key.
            /// </field>
            space: 32,

            /// <field locid="WinJS.Utilities.Key.pageUp" helpKeyword="WinJS.Utilities.Key.pageUp">
            /// PAGE UP key.
            /// </field>
            pageUp: 33,

            /// <field locid="WinJS.Utilities.Key.pageDown" helpKeyword="WinJS.Utilities.Key.pageDown">
            /// PAGE DOWN key.
            /// </field>
            pageDown: 34,

            /// <field locid="WinJS.Utilities.Key.end" helpKeyword="WinJS.Utilities.Key.end">
            /// END key.
            /// </field>
            end: 35,

            /// <field locid="WinJS.Utilities.Key.home" helpKeyword="WinJS.Utilities.Key.home">
            /// HOME key.
            /// </field>
            home: 36,

            /// <field locid="WinJS.Utilities.Key.leftArrow" helpKeyword="WinJS.Utilities.Key.leftArrow">
            /// Left arrow key.
            /// </field>
            leftArrow: 37,

            /// <field locid="WinJS.Utilities.Key.upArrow" helpKeyword="WinJS.Utilities.Key.upArrow">
            /// Up arrow key.
            /// </field>
            upArrow: 38,

            /// <field locid="WinJS.Utilities.Key.rightArrow" helpKeyword="WinJS.Utilities.Key.rightArrow">
            /// Right arrow key.
            /// </field>
            rightArrow: 39,

            /// <field locid="WinJS.Utilities.Key.downArrow" helpKeyword="WinJS.Utilities.Key.downArrow">
            /// Down arrow key.
            /// </field>
            downArrow: 40,

            /// <field locid="WinJS.Utilities.Key.insert" helpKeyword="WinJS.Utilities.Key.insert">
            /// INSERT key.
            /// </field>
            insert: 45,

            /// <field locid="WinJS.Utilities.Key.deleteKey" helpKeyword="WinJS.Utilities.Key.deleteKey">
            /// DELETE key.
            /// </field>
            deleteKey: 46,

            /// <field locid="WinJS.Utilities.Key.num0" helpKeyword="WinJS.Utilities.Key.num0">
            /// Number 0 key.
            /// </field>
            num0: 48,

            /// <field locid="WinJS.Utilities.Key.num1" helpKeyword="WinJS.Utilities.Key.num1">
            /// Number 1 key.
            /// </field>
            num1: 49,

            /// <field locid="WinJS.Utilities.Key.num2" helpKeyword="WinJS.Utilities.Key.num2">
            /// Number 2 key.
            /// </field>
            num2: 50,

            /// <field locid="WinJS.Utilities.Key.num3" helpKeyword="WinJS.Utilities.Key.num3">
            /// Number 3 key.
            /// </field>
            num3: 51,

            /// <field locid="WinJS.Utilities.Key.num4" helpKeyword="WinJS.Utilities.Key.num4">
            /// Number 4 key.
            /// </field>
            num4: 52,

            /// <field locid="WinJS.Utilities.Key.num5" helpKeyword="WinJS.Utilities.Key.num5">
            /// Number 5 key.
            /// </field>
            num5: 53,

            /// <field locid="WinJS.Utilities.Key.num6" helpKeyword="WinJS.Utilities.Key.num6">
            /// Number 6 key.
            /// </field>
            num6: 54,

            /// <field locid="WinJS.Utilities.Key.num7" helpKeyword="WinJS.Utilities.Key.num7">
            /// Number 7 key.
            /// </field>
            num7: 55,

            /// <field locid="WinJS.Utilities.Key.num8" helpKeyword="WinJS.Utilities.Key.num8">
            /// Number 8 key.
            /// </field>
            num8: 56,

            /// <field locid="WinJS.Utilities.Key.num9" helpKeyword="WinJS.Utilities.Key.num9">
            /// Number 9 key.
            /// </field>
            num9: 57,

            /// <field locid="WinJS.Utilities.Key.a" helpKeyword="WinJS.Utilities.Key.a">
            /// A key.
            /// </field>
            a: 65,

            /// <field locid="WinJS.Utilities.Key.b" helpKeyword="WinJS.Utilities.Key.b">
            /// B key.
            /// </field>
            b: 66,

            /// <field locid="WinJS.Utilities.Key.c" helpKeyword="WinJS.Utilities.Key.c">
            /// C key.
            /// </field>
            c: 67,

            /// <field locid="WinJS.Utilities.Key.d" helpKeyword="WinJS.Utilities.Key.d">
            /// D key.
            /// </field>
            d: 68,

            /// <field locid="WinJS.Utilities.Key.e" helpKeyword="WinJS.Utilities.Key.e">
            /// E key.
            /// </field>
            e: 69,

            /// <field locid="WinJS.Utilities.Key.f" helpKeyword="WinJS.Utilities.Key.f">
            /// F key.
            /// </field>
            f: 70,

            /// <field locid="WinJS.Utilities.Key.g" helpKeyword="WinJS.Utilities.Key.g">
            /// G key.
            /// </field>
            g: 71,

            /// <field locid="WinJS.Utilities.Key.h" helpKeyword="WinJS.Utilities.Key.h">
            /// H key.
            /// </field>
            h: 72,

            /// <field locid="WinJS.Utilities.Key.i" helpKeyword="WinJS.Utilities.Key.i">
            /// I key.
            /// </field>
            i: 73,

            /// <field locid="WinJS.Utilities.Key.j" helpKeyword="WinJS.Utilities.Key.j">
            /// J key.
            /// </field>
            j: 74,

            /// <field locid="WinJS.Utilities.Key.k" helpKeyword="WinJS.Utilities.Key.k">
            /// K key.
            /// </field>
            k: 75,

            /// <field locid="WinJS.Utilities.Key.l" helpKeyword="WinJS.Utilities.Key.l">
            /// L key.
            /// </field>
            l: 76,

            /// <field locid="WinJS.Utilities.Key.m" helpKeyword="WinJS.Utilities.Key.m">
            /// M key.
            /// </field>
            m: 77,

            /// <field locid="WinJS.Utilities.Key.n" helpKeyword="WinJS.Utilities.Key.n">
            /// N key.
            /// </field>
            n: 78,

            /// <field locid="WinJS.Utilities.Key.o" helpKeyword="WinJS.Utilities.Key.o">
            /// O key.
            /// </field>
            o: 79,

            /// <field locid="WinJS.Utilities.Key.p" helpKeyword="WinJS.Utilities.Key.p">
            /// P key.
            /// </field>
            p: 80,

            /// <field locid="WinJS.Utilities.Key.q" helpKeyword="WinJS.Utilities.Key.q">
            /// Q key.
            /// </field>
            q: 81,

            /// <field locid="WinJS.Utilities.Key.r" helpKeyword="WinJS.Utilities.Key.r">
            /// R key.
            /// </field>
            r: 82,

            /// <field locid="WinJS.Utilities.Key.s" helpKeyword="WinJS.Utilities.Key.s">
            /// S key.
            /// </field>
            s: 83,

            /// <field locid="WinJS.Utilities.Key.t" helpKeyword="WinJS.Utilities.Key.t">
            /// T key.
            /// </field>
            t: 84,

            /// <field locid="WinJS.Utilities.Key.u" helpKeyword="WinJS.Utilities.Key.u">
            /// U key.
            /// </field>
            u: 85,

            /// <field locid="WinJS.Utilities.Key.v" helpKeyword="WinJS.Utilities.Key.v">
            /// V key.
            /// </field>
            v: 86,

            /// <field locid="WinJS.Utilities.Key.w" helpKeyword="WinJS.Utilities.Key.w">
            /// W key.
            /// </field>
            w: 87,

            /// <field locid="WinJS.Utilities.Key.x" helpKeyword="WinJS.Utilities.Key.x">
            /// X key.
            /// </field>
            x: 88,

            /// <field locid="WinJS.Utilities.Key.y" helpKeyword="WinJS.Utilities.Key.y">
            /// Y key.
            /// </field>
            y: 89,

            /// <field locid="WinJS.Utilities.Key.z" helpKeyword="WinJS.Utilities.Key.z">
            /// Z key.
            /// </field>
            z: 90,

            /// <field locid="WinJS.Utilities.Key.leftWindows" helpKeyword="WinJS.Utilities.Key.leftWindows">
            /// Left Windows key.
            /// </field>
            leftWindows: 91,

            /// <field locid="WinJS.Utilities.Key.rightWindows" helpKeyword="WinJS.Utilities.Key.rightWindows">
            /// Right Windows key.
            /// </field>
            rightWindows: 92,

            /// <field locid="WinJS.Utilities.Key.menu" helpKeyword="WinJS.Utilities.Key.menu">
            /// Menu key.
            /// </field>
            menu: 93,

            /// <field locid="WinJS.Utilities.Key.numPad0" helpKeyword="WinJS.Utilities.Key.numPad0">
            /// Number pad 0 key.
            /// </field>
            numPad0: 96,

            /// <field locid="WinJS.Utilities.Key.numPad1" helpKeyword="WinJS.Utilities.Key.numPad1">
            /// Number pad 1 key.
            /// </field>
            numPad1: 97,

            /// <field locid="WinJS.Utilities.Key.numPad2" helpKeyword="WinJS.Utilities.Key.numPad2">
            /// Number pad 2 key.
            /// </field>
            numPad2: 98,

            /// <field locid="WinJS.Utilities.Key.numPad3" helpKeyword="WinJS.Utilities.Key.numPad3">
            /// Number pad 3 key.
            /// </field>
            numPad3: 99,

            /// <field locid="WinJS.Utilities.Key.numPad4" helpKeyword="WinJS.Utilities.Key.numPad4">
            /// Number pad 4 key.
            /// </field>
            numPad4: 100,

            /// <field locid="WinJS.Utilities.Key.numPad5" helpKeyword="WinJS.Utilities.Key.numPad5">
            /// Number pad 5 key.
            /// </field>
            numPad5: 101,

            /// <field locid="WinJS.Utilities.Key.numPad6" helpKeyword="WinJS.Utilities.Key.numPad6">
            /// Number pad 6 key.
            /// </field>
            numPad6: 102,

            /// <field locid="WinJS.Utilities.Key.numPad7" helpKeyword="WinJS.Utilities.Key.numPad7">
            /// Number pad 7 key.
            /// </field>
            numPad7: 103,

            /// <field locid="WinJS.Utilities.Key.numPad8" helpKeyword="WinJS.Utilities.Key.numPad8">
            /// Number pad 8 key.
            /// </field>
            numPad8: 104,

            /// <field locid="WinJS.Utilities.Key.numPad9" helpKeyword="WinJS.Utilities.Key.numPad9">
            /// Number pad 9 key.
            /// </field>
            numPad9: 105,

            /// <field locid="WinJS.Utilities.Key.multiply" helpKeyword="WinJS.Utilities.Key.multiply">
            /// Multiplication key.
            /// </field>
            multiply: 106,

            /// <field locid="WinJS.Utilities.Key.add" helpKeyword="WinJS.Utilities.Key.add">
            /// Addition key.
            /// </field>
            add: 107,

            /// <field locid="WinJS.Utilities.Key.subtract" helpKeyword="WinJS.Utilities.Key.subtract">
            /// Subtraction key.
            /// </field>
            subtract: 109,

            /// <field locid="WinJS.Utilities.Key.decimalPoint" helpKeyword="WinJS.Utilities.Key.decimalPoint">
            /// Decimal point key.
            /// </field>
            decimalPoint: 110,

            /// <field locid="WinJS.Utilities.Key.divide" helpKeyword="WinJS.Utilities.Key.divide">
            /// Division key.
            /// </field>
            divide: 111,

            /// <field locid="WinJS.Utilities.Key.F1" helpKeyword="WinJS.Utilities.Key.F1">
            /// F1 key.
            /// </field>
            F1: 112,

            /// <field locid="WinJS.Utilities.Key.F2" helpKeyword="WinJS.Utilities.Key.F2">
            /// F2 key.
            /// </field>
            F2: 113,

            /// <field locid="WinJS.Utilities.Key.F3" helpKeyword="WinJS.Utilities.Key.F3">
            /// F3 key.
            /// </field>
            F3: 114,

            /// <field locid="WinJS.Utilities.Key.F4" helpKeyword="WinJS.Utilities.Key.F4">
            /// F4 key.
            /// </field>
            F4: 115,

            /// <field locid="WinJS.Utilities.Key.F5" helpKeyword="WinJS.Utilities.Key.F5">
            /// F5 key.
            /// </field>
            F5: 116,

            /// <field locid="WinJS.Utilities.Key.F6" helpKeyword="WinJS.Utilities.Key.F6">
            /// F6 key.
            /// </field>
            F6: 117,

            /// <field locid="WinJS.Utilities.Key.F7" helpKeyword="WinJS.Utilities.Key.F7">
            /// F7 key.
            /// </field>
            F7: 118,

            /// <field locid="WinJS.Utilities.Key.F8" helpKeyword="WinJS.Utilities.Key.F8">
            /// F8 key.
            /// </field>
            F8: 119,

            /// <field locid="WinJS.Utilities.Key.F9" helpKeyword="WinJS.Utilities.Key.F9">
            /// F9 key.
            /// </field>
            F9: 120,

            /// <field locid="WinJS.Utilities.Key.F10" helpKeyword="WinJS.Utilities.Key.F10">
            /// F10 key.
            /// </field>
            F10: 121,

            /// <field locid="WinJS.Utilities.Key.F11" helpKeyword="WinJS.Utilities.Key.F11">
            /// F11 key.
            /// </field>
            F11: 122,

            /// <field locid="WinJS.Utilities.Key.F12" helpKeyword="WinJS.Utilities.Key.F12">
            /// F12 key.
            /// </field>
            F12: 123,

            /// <field locid="WinJS.Utilities.Key.numLock" helpKeyword="WinJS.Utilities.Key.numLock">
            /// NUMBER LOCK key.
            /// </field>
            numLock: 144,

            /// <field locid="WinJS.Utilities.Key.scrollLock" helpKeyword="WinJS.Utilities.Key.scrollLock">
            /// SCROLL LOCK key.
            /// </field>
            scrollLock: 145,

            /// <field locid="WinJS.Utilities.Key.browserBack" helpKeyword="WinJS.Utilities.Key.browserBack">
            /// Browser back key.
            /// </field>
            browserBack: 166,

            /// <field locid="WinJS.Utilities.Key.browserForward" helpKeyword="WinJS.Utilities.Key.browserForward">
            /// Browser forward key.
            /// </field>
            browserForward: 167,

            /// <field locid="WinJS.Utilities.Key.semicolon" helpKeyword="WinJS.Utilities.Key.semicolon">
            /// SEMICOLON key.
            /// </field>
            semicolon: 186,

            /// <field locid="WinJS.Utilities.Key.equal" helpKeyword="WinJS.Utilities.Key.equal">
            /// EQUAL key.
            /// </field>
            equal: 187,

            /// <field locid="WinJS.Utilities.Key.comma" helpKeyword="WinJS.Utilities.Key.comma">
            /// COMMA key.
            /// </field>
            comma: 188,

            /// <field locid="WinJS.Utilities.Key.dash" helpKeyword="WinJS.Utilities.Key.dash">
            /// DASH key.
            /// </field>
            dash: 189,

            /// <field locid="WinJS.Utilities.Key.period" helpKeyword="WinJS.Utilities.Key.period">
            /// PERIOD key.
            /// </field>
            period: 190,

            /// <field locid="WinJS.Utilities.Key.forwardSlash" helpKeyword="WinJS.Utilities.Key.forwardSlash">
            /// FORWARD SLASH key.
            /// </field>
            forwardSlash: 191,

            /// <field locid="WinJS.Utilities.Key.graveAccent" helpKeyword="WinJS.Utilities.Key.graveAccent">
            /// Accent grave key.
            /// </field>
            graveAccent: 192,

            /// <field locid="WinJS.Utilities.Key.openBracket" helpKeyword="WinJS.Utilities.Key.openBracket">
            /// OPEN BRACKET key.
            /// </field>
            openBracket: 219,

            /// <field locid="WinJS.Utilities.Key.backSlash" helpKeyword="WinJS.Utilities.Key.backSlash">
            /// BACKSLASH key.
            /// </field>
            backSlash: 220,

            /// <field locid="WinJS.Utilities.Key.closeBracket" helpKeyword="WinJS.Utilities.Key.closeBracket">
            /// CLOSE BRACKET key.
            /// </field>
            closeBracket: 221,

            /// <field locid="WinJS.Utilities.Key.singleQuote" helpKeyword="WinJS.Utilities.Key.singleQuote">
            /// SINGLE QUOTE key.
            /// </field>
            singleQuote: 222,

            /// <field locid="WinJS.Utilities.Key.IME" helpKeyword="WinJS.Utilities.Key.IME">
            /// Any IME input.
            /// </field>
            IME: 229
        },

        data: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.data">
            /// <summary locid="WinJS.Utilities.data">
            /// Gets the data value associated with the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.data_p:element">
            /// The element.
            /// </param>
            /// <returns type="Object" locid="WinJS.Utilities.data_returnValue">
            /// The value associated with the element.
            /// </returns>
            /// </signature>
            if (!element[_dataKey]) {
                element[_dataKey] = {};
            }
            return element[_dataKey];
        },

        hasClass: function (e, name) {
            /// <signature helpKeyword="WinJS.Utilities.hasClass">
            /// <summary locid="WinJS.Utilities.hasClass">
            /// Determines whether the specified element has the specified class.
            /// </summary>
            /// <param name="e" type="HTMLElement" locid="WinJS.Utilities.hasClass_p:e">
            /// The element.
            /// </param>
            /// <param name="name" type="String" locid="WinJS.Utilities.hasClass_p:name">
            /// The name of the class.
            /// </param>
            /// <returns type="Boolean" locid="WinJS.Utilities.hasClass_returnValue">
            /// true if the specified element contains the specified class; otherwise, false.
            /// </returns>
            /// </signature>

            if (e.classList) {
                return e.classList.contains(name);
            } else {
                var className = getClassName(e);
                var names = className.trim().split(" ");
                var l = names.length;
                for (var i = 0; i < l; i++) {
                    if (names[i] === name) {
                        return true;
                    }
                }
                return false;
            }
        },

        addClass: addClass,

        removeClass: removeClass,

        toggleClass: toggleClass,

        _setAttribute: setAttribute,

        getRelativeLeft: function (element, parent) {
            /// <signature helpKeyword="WinJS.Utilities.getRelativeLeft">
            /// <summary locid="WinJS.Utilities.getRelativeLeft">
            /// Gets the left coordinate of the specified element relative to the specified parent.
            /// </summary>
            /// <param name="element" domElement="true" locid="WinJS.Utilities.getRelativeLeft_p:element">
            /// The element.
            /// </param>
            /// <param name="parent" domElement="true" locid="WinJS.Utilities.getRelativeLeft_p:parent">
            /// The parent element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getRelativeLeft_returnValue">
            /// The relative left coordinate.
            /// </returns>
            /// </signature>
            if (!element) {
                return 0;
            }

            var left = element.offsetLeft;
            var e = element.parentNode;
            while (e) {
                left -= e.offsetLeft;

                if (e === parent) {
                    break;
                }
                e = e.parentNode;
            }

            return left;
        },

        getRelativeTop: function (element, parent) {
            /// <signature helpKeyword="WinJS.Utilities.getRelativeTop">
            /// <summary locid="WinJS.Utilities.getRelativeTop">
            /// Gets the top coordinate of the element relative to the specified parent.
            /// </summary>
            /// <param name="element" domElement="true" locid="WinJS.Utilities.getRelativeTop_p:element">
            /// The element.
            /// </param>
            /// <param name="parent" domElement="true" locid="WinJS.Utilities.getRelativeTop_p:parent">
            /// The parent element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getRelativeTop_returnValue">
            /// The relative top coordinate.
            /// </returns>
            /// </signature>
            if (!element) {
                return 0;
            }

            var top = element.offsetTop;
            var e = element.parentNode;
            while (e) {
                top -= e.offsetTop;

                if (e === parent) {
                    break;
                }
                e = e.parentNode;
            }

            return top;
        },

        getScrollPosition: getScrollPosition,

        setScrollPosition: setScrollPosition,

        empty: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.empty">
            /// <summary locid="WinJS.Utilities.empty">
            /// Removes all the child nodes from the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" domElement="true" locid="WinJS.Utilities.empty_p:element">
            /// The element.
            /// </param>
            /// <returns type="HTMLElement" locid="WinJS.Utilities.empty_returnValue">
            /// The element.
            /// </returns>
            /// </signature>
            if (element.childNodes && element.childNodes.length > 0) {
                for (var i = element.childNodes.length - 1; i >= 0; i--) {
                    element.removeChild(element.childNodes.item(i));
                }
            }
            return element;
        },

        _isDOMElement: function (element) {
            return element &&
                typeof element === "object" &&
                typeof element.tagName === "string";
        },

        getContentWidth: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getContentWidth">
            /// <summary locid="WinJS.Utilities.getContentWidth">
            /// Gets the width of the content of the specified element. The content width does not include borders or padding.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getContentWidth_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getContentWidth_returnValue">
            /// The content width of the element.
            /// </returns>
            /// </signature>
            var border = getDimension(element, "borderLeftWidth") + getDimension(element, "borderRightWidth"),
                padding = getDimension(element, "paddingLeft") + getDimension(element, "paddingRight");
            return element.offsetWidth - border - padding;
        },

        getTotalWidth: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getTotalWidth">
            /// <summary locid="WinJS.Utilities.getTotalWidth">
            /// Gets the width of the element, including margins.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getTotalWidth_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getTotalWidth_returnValue">
            /// The width of the element including margins.
            /// </returns>
            /// </signature>
            var margin = getDimension(element, "marginLeft") + getDimension(element, "marginRight");
            return element.offsetWidth + margin;
        },

        getContentHeight: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getContentHeight">
            /// <summary locid="WinJS.Utilities.getContentHeight">
            /// Gets the height of the content of the specified element. The content height does not include borders or padding.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getContentHeight_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" integer="true" locid="WinJS.Utilities.getContentHeight_returnValue">
            /// The content height of the element.
            /// </returns>
            /// </signature>
            var border = getDimension(element, "borderTopWidth") + getDimension(element, "borderBottomWidth"),
                padding = getDimension(element, "paddingTop") + getDimension(element, "paddingBottom");
            return element.offsetHeight - border - padding;
        },

        getTotalHeight: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getTotalHeight">
            /// <summary locid="WinJS.Utilities.getTotalHeight">
            /// Gets the height of the element, including its margins.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getTotalHeight_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getTotalHeight_returnValue">
            /// The height of the element including margins.
            /// </returns>
            /// </signature>
            var margin = getDimension(element, "marginTop") + getDimension(element, "marginBottom");
            return element.offsetHeight + margin;
        },

        getPosition: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getPosition">
            /// <summary locid="WinJS.Utilities.getPosition">
            /// Gets the position of the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getPosition_p:element">
            /// The element.
            /// </param>
            /// <returns type="Object" locid="WinJS.Utilities.getPosition_returnValue">
            /// An object that contains the left, top, width and height properties of the element.
            /// </returns>
            /// </signature>
            return exports._getPositionRelativeTo(element, null);
        },

        getTabIndex: function (element) {
            /// <signature helpKeyword="WinJS.Utilities.getTabIndex">
            /// <summary locid="WinJS.Utilities.getTabIndex">
            /// Gets the tabIndex of the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.getTabIndex_p:element">
            /// The element.
            /// </param>
            /// <returns type="Number" locid="WinJS.Utilities.getTabIndex_returnValue">
            /// The tabIndex of the element. Returns -1 if the element cannot be tabbed to
            /// </returns>
            /// </signature>
            // For reference: http://www.w3.org/html/wg/drafts/html/master/single-page.html#specially-focusable
            var tabbableElementsRE = /BUTTON|COMMAND|MENUITEM|OBJECT|SELECT|TEXTAREA/;
            if (element.disabled) {
                return -1;
            }
            var tabIndex = element.getAttribute("tabindex");
            if (tabIndex === null || tabIndex === undefined) {
                var name = element.tagName;
                if (tabbableElementsRE.test(name) ||
                    (element.href && (name === "A" || name === "AREA" || name === "LINK")) ||
                    (name === "INPUT" && element.type !== "hidden") ||
                    (name === "TH" && element.sorted)) {
                    return 0;
                }
                return -1;
            }
            return parseInt(tabIndex, 10);
        },

        convertToPixels: convertToPixels,

        eventWithinElement: function (element, event) {
            /// <signature helpKeyword="WinJS.Utilities.eventWithinElement">
            /// <summary locid="WinJS.Utilities.eventWithinElement">
            /// Determines whether the specified event occurred within the specified element.
            /// </summary>
            /// <param name="element" type="HTMLElement" locid="WinJS.Utilities.eventWithinElement_p:element">
            /// The element.
            /// </param>
            /// <param name="event" type="Event" locid="WinJS.Utilities.eventWithinElement_p:event">
            /// The event.
            /// </param>
            /// <returns type="Boolean" locid="WinJS.Utilities.eventWithinElement_returnValue">
            /// true if the event occurred within the element; otherwise, false.
            /// </returns>
            /// </signature>
            var related = event.relatedTarget;
            if (related && related !== element) {
                return element.contains(related);
            }

            return false;
        },

        //UI Utilities
        _deprecated: function (message) {
            _Global.console && _Global.console.warn(message);
        },

        // Take a renderer which may be a function (signature: (data) => element) or a WinJS.Binding.Template
        //  and return a function with a unified synchronous contract which is:
        //
        //  (data, container) => element
        //
        // Where:
        //
        //  1) if you pass container the content will be rendered into the container and the
        //     container will be returned.
        //
        //  2) if you don't pass a container the content will be rendered and returned.
        //
        _syncRenderer: function (renderer, tagName) {
            tagName = tagName || "div";
            if (typeof renderer === "function") {
                return function (data, container) {
                    if (container) {
                        container.appendChild(renderer(data));
                        return container;
                    } else {
                        return renderer(data);
                    }
                };
            }

            var template;
            if (typeof renderer.render === "function") {
                template = renderer;
            } else if (renderer.winControl && typeof renderer.winControl.render === "function") {
                template = renderer.winControl;
            }

            return function (data, container) {
                var host = container || _Global.document.createElement(tagName);
                template.render(data, host);
                if (container) {
                    return container;
                } else {
                    // The expectation is that the creation of the DOM elements happens synchronously
                    //  and as such we steal the first child and make it the root element.
                    //
                    var element = host.firstElementChild;

                    // Because we have changed the "root" we may need to move the dispose method
                    //  created by the template to the child and do a little switcheroo on dispose.
                    //
                    if (element && host.dispose) {
                        var prev = element.dispose;
                        element.dispose = function () {
                            element.dispose = prev;
                            host.appendChild(element);
                            host.dispose();
                        };
                    }
                    return element;
                }
            };
        },

        _getPositionRelativeTo: function Utilities_getPositionRelativeTo(element, ancestor) {
            var fromElement = element,
                offsetParent = element.offsetParent,
                top = element.offsetTop,
                left = element.offsetLeft;

            while ((element = element.parentNode) &&
                    element !== ancestor &&
                    element !== _Global.document.body &&
                    element !== _Global.document.documentElement) {
                top -= element.scrollTop;
                var dir = _Global.document.defaultView.getComputedStyle(element, null).direction;
                left -= dir !== "rtl" ? element.scrollLeft : -getAdjustedScrollPosition(element).scrollLeft;

                if (element === offsetParent) {
                    top += element.offsetTop;
                    left += element.offsetLeft;
                    offsetParent = element.offsetParent;
                }
            }

            return {
                left: left,
                top: top,
                width: fromElement.offsetWidth,
                height: fromElement.offsetHeight
            };
        },

        // *element* is not included in the tabIndex search
        _getHighAndLowTabIndices: function Utilities_getHighAndLowTabIndices(element) {
            var descendants = element.getElementsByTagName("*");
            var lowestTabIndex = 0;
            var highestTabIndex = 0;
            // tabIndex=0 is the highest (considered higher than positive tab indices) so
            // we can stop searching for a higher tab index once we find tabIndex=0.
            var foundTabIndex0 = false;
            for (var i = 0, len = descendants.length; i < len; i++) {
                var tabIndexStr = descendants[i].getAttribute("tabIndex");
                if (tabIndexStr !== null && tabIndexStr !== undefined) {
                    var tabIndex = parseInt(tabIndexStr, 10);
                    // Update lowest
                    if (tabIndex > 0 && (tabIndex < lowestTabIndex || lowestTabIndex === 0)) {
                        lowestTabIndex = tabIndex;
                    }
                    // Update highest
                    if (!foundTabIndex0) {
                        if (tabIndex === 0) {
                            foundTabIndex0 = true;
                            highestTabIndex = 0;
                        } else if (tabIndex > highestTabIndex) {
                            highestTabIndex = tabIndex;
                        }
                    }
                }
            }

            return {
                highest: highestTabIndex,
                lowest: lowestTabIndex
            };
        },

        _getLowestTabIndexInList: function Utilities_getLowestTabIndexInList(elements) {
            // Returns the lowest positive tabIndex in a list of elements.
            // Returns 0 if there are no positive tabIndices.
            var lowestTabIndex = 0;
            var elmTabIndex;
            for (var i = 0; i < elements.length; i++) {
                elmTabIndex = parseInt(elements[i].getAttribute("tabIndex"), 10);
                if ((0 < elmTabIndex)
                 && ((elmTabIndex < lowestTabIndex) || !lowestTabIndex)) {
                    lowestTabIndex = elmTabIndex;
                }
            }

            return lowestTabIndex;
        },

        _getHighestTabIndexInList: function Utilities_getHighestTabIndexInList(elements) {
            // Returns 0 if any element is explicitly set to 0. (0 is the highest tabIndex)
            // Returns the highest tabIndex in the list of elements.
            // Returns 0 if there are no positive tabIndices.
            var highestTabIndex = 0;
            var elmTabIndex;
            for (var i = 0; i < elements.length; i++) {
                elmTabIndex = parseInt(elements[i].getAttribute("tabIndex"), 10);
                if (elmTabIndex === 0) {
                    return elmTabIndex;
                } else if (highestTabIndex < elmTabIndex) {
                    highestTabIndex = elmTabIndex;
                }
            }

            return highestTabIndex;
        },

        _hasCursorKeysBehaviors: function Utilities_hasCursorKeysBehaviors(element) {
            if (element.tagName === "SELECT" ||
                element.tagName === "TEXTAREA") {
                return true;
            }
            if (element.tagName === "INPUT") {
                return element.type === "" ||
                    element.type === "date" ||
                    element.type === "datetime" ||
                    element.type === "datetime-local" ||
                    element.type === "email" ||
                    element.type === "month" ||
                    element.type === "number" ||
                    element.type === "password" ||
                    element.type === "range" ||
                    element.type === "search" ||
                    element.type === "tel" ||
                    element.type === "text" ||
                    element.type === "time" ||
                    element.type === "url" ||
                    element.type === "week";
            }
            return false;
        },

        _reparentChildren: function (originalParent, destinationParent) {
            var child = originalParent.firstChild;
            while (child) {
                var sibling = child.nextSibling;
                destinationParent.appendChild(child);
                child = sibling;
            }
        },

        _trySetActive: function Utilities_trySetActive(elem, scroller) {
            return this._tryFocus(elem, true, scroller);
        },

        _tryFocus: function Utilities_tryFocus(elem, useSetActive, scroller) {
            var previousActiveElement = _Global.document.activeElement;

            if (elem === previousActiveElement) {
                return true;
            }

            var simpleLogicForValidTabStop = (exports.getTabIndex(elem) >= 0);
            if (!simpleLogicForValidTabStop) {
                return false;
            }

            if (useSetActive) {
                exports._setActive(elem, scroller);
            } else {
                elem.focus();
            }

            if (previousActiveElement !== _Global.document.activeElement) {
                return true;
            }
            return false;
        },

        _setActiveFirstFocusableElement: function Utilities_setActiveFirstFocusableElement(rootEl, scroller) {
            return this._focusFirstFocusableElement(rootEl, true, scroller);
        },

        _focusFirstFocusableElement: function Utilities_focusFirstFocusableElement(rootEl, useSetActive, scroller) {
            var _elms = rootEl.getElementsByTagName("*");

            // Get the tabIndex set to the firstDiv (which is the lowest)
            var _lowestTabIndex = this._getLowestTabIndexInList(_elms);
            var _nextLowestTabIndex = 0;

            // If there are positive tabIndices, set focus to the element with the lowest tabIndex.
            // Keep trying with the next lowest tabIndex until all tabIndices have been exhausted.
            // Otherwise set focus to the first focusable element in DOM order.
            var i;
            while (_lowestTabIndex) {
                for (i = 0; i < _elms.length; i++) {
                    if (_elms[i].tabIndex === _lowestTabIndex) {
                        if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                            return true;
                        }
                    } else if ((_lowestTabIndex < _elms[i].tabIndex)
                            && ((_elms[i].tabIndex < _nextLowestTabIndex) || (_nextLowestTabIndex === 0))) {
                        // Here if _lowestTabIndex < _elms[i].tabIndex < _nextLowestTabIndex
                        _nextLowestTabIndex = _elms[i].tabIndex;
                    }
                }

                // We weren't able to set focus to anything at that tabIndex
                // If we found a higher valid tabIndex, try that now
                _lowestTabIndex = _nextLowestTabIndex;
                _nextLowestTabIndex = 0;
            }

            // Wasn't able to set focus to anything with a positive tabIndex, try everything now.
            // This is where things with tabIndex of 0 will be tried.
            for (i = 0; i < _elms.length; i++) {
                if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                    return true;
                }
            }

            return false;
        },

        _setActiveLastFocusableElement: function Utilities_setActiveLastFocusableElement(rootEl, scroller) {
            return this._focusLastFocusableElement(rootEl, true, scroller);
        },

        _focusLastFocusableElement: function Utilities_focusLastFocusableElement(rootEl, useSetActive, scroller) {
            var _elms = rootEl.getElementsByTagName("*");
            // Get the tabIndex set to the finalDiv (which is the highest)
            var _highestTabIndex = this._getHighestTabIndexInList(_elms);
            var _nextHighestTabIndex = 0;

            // Try all tabIndex 0 first. After this conditional the _highestTabIndex
            // should be equal to the highest positive tabIndex.
            var i;
            if (_highestTabIndex === 0) {
                for (i = _elms.length - 1; i >= 0; i--) {
                    if (_elms[i].tabIndex === _highestTabIndex) {
                        if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                            return true;
                        }
                    } else if (_nextHighestTabIndex < _elms[i].tabIndex) {
                        _nextHighestTabIndex = _elms[i].tabIndex;
                    }
                }

                _highestTabIndex = _nextHighestTabIndex;
                _nextHighestTabIndex = 0;
            }

            // If there are positive tabIndices, set focus to the element with the highest tabIndex.
            // Keep trying with the next highest tabIndex until all tabIndices have been exhausted.
            // Otherwise set focus to the last focusable element in DOM order.
            while (_highestTabIndex) {
                for (i = _elms.length - 1; i >= 0; i--) {
                    if (_elms[i].tabIndex === _highestTabIndex) {
                        if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                            return true;
                        }
                    } else if ((_nextHighestTabIndex < _elms[i].tabIndex) && (_elms[i].tabIndex < _highestTabIndex)) {
                        // Here if _nextHighestTabIndex < _elms[i].tabIndex < _highestTabIndex
                        _nextHighestTabIndex = _elms[i].tabIndex;
                    }
                }

                // We weren't able to set focus to anything at that tabIndex
                // If we found a lower valid tabIndex, try that now
                _highestTabIndex = _nextHighestTabIndex;
                _nextHighestTabIndex = 0;
            }

            // Wasn't able to set focus to anything with a tabIndex, try everything now
            for (i = _elms.length - 2; i > 0; i--) {
                if (this._tryFocus(_elms[i], useSetActive, scroller)) {
                    return true;
                }
            }

            return false;
        }
    });
});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/ControlProcessor/_OptionsLexer',[
    'exports',
    '../Core/_Base'
    ], function optionsLexerInit(exports, _Base) {
    "use strict";

    /*

Lexical grammar is defined in ECMA-262-5, section 7.

Lexical productions used in this grammar defined in ECMA-262-5:

Production          Section
--------------------------------
Identifier          7.6
NullLiteral         7.8.1
BooleanLiteral      7.8.2
NumberLiteral       7.8.3
StringLiteral       7.8.4

*/

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {
        _optionsLexer: _Base.Namespace._lazy(function () {

            var tokenType = {
                leftBrace: 1,           // {
                rightBrace: 2,          // }
                leftBracket: 3,         // [
                rightBracket: 4,        // ]
                separator: 5,           // ECMA-262-5, 7.2
                colon: 6,               // :
                semicolon: 7,           // ;
                comma: 8,               // ,
                dot: 9,                 // .
                nullLiteral: 10,        // ECMA-262-5, 7.8.1 (null)
                trueLiteral: 11,        // ECMA-262-5, 7.8.2 (true)
                falseLiteral: 12,       // ECMA-262-5, 7.8.2 (false)
                numberLiteral: 13,      // ECMA-262-5, 7.8.3
                stringLiteral: 14,      // ECMA-262-5, 7.8.4
                identifier: 15,         // ECMA-262-5, 7.6
                reservedWord: 16,
                thisKeyword: 17,
                leftParentheses: 18,    // (
                rightParentheses: 19,   // )
                eof: 20,
                error: 21
            };
            // debugging - this costs something like 20%
            //
            //Object.keys(tokenType).forEach(function (key) {
            //    tokenType[key] = key.toString();
            //});
            var tokens = {
                leftBrace: { type: tokenType.leftBrace, length: 1 },
                rightBrace: { type: tokenType.rightBrace, length: 1 },
                leftBracket: { type: tokenType.leftBracket, length: 1 },
                rightBracket: { type: tokenType.rightBracket, length: 1 },
                colon: { type: tokenType.colon, length: 1 },
                semicolon: { type: tokenType.semicolon, length: 1 },
                comma: { type: tokenType.comma, length: 1 },
                dot: { type: tokenType.dot, length: 1 },
                nullLiteral: { type: tokenType.nullLiteral, length: 4, value: null, keyword: true },
                trueLiteral: { type: tokenType.trueLiteral, length: 4, value: true, keyword: true },
                falseLiteral: { type: tokenType.falseLiteral, length: 5, value: false, keyword: true },
                thisKeyword: { type: tokenType.thisKeyword, length: 4, value: "this", keyword: true },
                leftParentheses: { type: tokenType.leftParentheses, length: 1 },
                rightParentheses: { type: tokenType.rightParentheses, length: 1 },
                eof: { type: tokenType.eof, length: 0 }
            };

            function reservedWord(word) {
                return { type: tokenType.reservedWord, value: word, length: word.length, keyword: true };
            }
            function reservedWordLookup(identifier) {
                // Moving from a simple object literal lookup for reserved words to this
                // switch was worth a non-trivial performance increase (5-7%) as this path
                // gets taken for any identifier.
                //
                switch (identifier.charCodeAt(0)) {
                    case /*b*/98:
                        switch (identifier) {
                            case 'break':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*c*/99:
                        switch (identifier) {
                            case 'case':
                            case 'catch':
                            case 'class':
                            case 'const':
                            case 'continue':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*d*/100:
                        switch (identifier) {
                            case 'debugger':
                            case 'default':
                            case 'delete':
                            case 'do':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*e*/101:
                        switch (identifier) {
                            case 'else':
                            case 'enum':
                            case 'export':
                            case 'extends':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*f*/102:
                        switch (identifier) {
                            case 'false':
                                return tokens.falseLiteral;

                            case 'finally':
                            case 'for':
                            case 'function':
                                return reservedWord(identifier);
                        }

                        break;
                    case /*i*/105:
                        switch (identifier) {
                            case 'if':
                            case 'import':
                            case 'in':
                            case 'instanceof':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*n*/110:
                        switch (identifier) {
                            case 'null':
                                return tokens.nullLiteral;

                            case 'new':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*r*/114:
                        switch (identifier) {
                            case 'return':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*s*/115:
                        switch (identifier) {
                            case 'super':
                            case 'switch':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*t*/116:
                        switch (identifier) {
                            case 'true':
                                return tokens.trueLiteral;

                            case 'this':
                                return tokens.thisKeyword;

                            case 'throw':
                            case 'try':
                            case 'typeof':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*v*/118:
                        switch (identifier) {
                            case 'var':
                            case 'void':
                                return reservedWord(identifier);
                        }
                        break;

                    case /*w*/119:
                        switch (identifier) {
                            case 'while':
                            case 'with':
                                return reservedWord(identifier);
                        }
                        break;
                }
                return;
            }

            var lexer = (function () {
                function isIdentifierStartCharacter(code, text, offset, limit) {
                    // The ES5 spec decalares that identifiers consist of a bunch of unicode classes, without
                    // WinRT support for determining unicode class membership we are looking at 2500+ lines of
                    // javascript code to encode the relevant class tables. Instead we look for everything
                    // which is legal and < 0x7f, we exclude whitespace and line terminators, and then accept
                    // everything > 0x7f.
                    //
                    // Here's the ES5 production:
                    //
                    //  Lu | Ll | Lt | Lm | Lo | Nl
                    //  $
                    //  _
                    //  \ UnicodeEscapeSequence
                    //
                    switch (code) {
                        case (code >= /*a*/97 && code <= /*z*/122) && code:
                        case (code >= /*A*/65 && code <= /*Z*/90) && code:
                        case /*$*/36:
                        case /*_*/95:
                            return true;

                        case isWhitespace(code) && code:
                        case isLineTerminator(code) && code:
                            return false;

                        case (code > 0x7f) && code:
                            return true;

                        case /*\*/92:
                            if (offset + 4 < limit) {
                                if (text.charCodeAt(offset) === /*u*/117 &&
                                    isHexDigit(text.charCodeAt(offset + 1)) &&
                                    isHexDigit(text.charCodeAt(offset + 2)) &&
                                    isHexDigit(text.charCodeAt(offset + 3)) &&
                                    isHexDigit(text.charCodeAt(offset + 4))) {
                                    return true;
                                }
                            }
                            return false;

                        default:
                            return false;
                    }
                }
                /*
        // Hand-inlined into readIdentifierPart
        function isIdentifierPartCharacter(code) {
        // See comment in isIdentifierStartCharacter.
        //
        // Mn | Mc | Nd | Pc
        // <ZWNJ> | <ZWJ>
        //
        switch (code) {
        case isIdentifierStartCharacter(code) && code:
        case isDecimalDigit(code) && code:
        return true;

        default:
        return false;
        }
        }
        */
                function readIdentifierPart(text, offset, limit) {
                    var hasEscape = false;
                    while (offset < limit) {
                        var code = text.charCodeAt(offset);
                        switch (code) {
                            //case isIdentifierStartCharacter(code) && code:
                            case (code >= /*a*/97 && code <= /*z*/122) && code:
                            case (code >= /*A*/65 && code <= /*Z*/90) && code:
                            case /*$*/36:
                            case /*_*/95:
                                break;

                            case isWhitespace(code) && code:
                            case isLineTerminator(code) && code:
                                return hasEscape ? -offset : offset;

                            case (code > 0x7f) && code:
                                break;

                                //case isDecimalDigit(code) && code:
                            case (code >= /*0*/48 && code <= /*9*/57) && code:
                                break;

                            case /*\*/92:
                                if (offset + 5 < limit) {
                                    if (text.charCodeAt(offset + 1) === /*u*/117 &&
                                        isHexDigit(text.charCodeAt(offset + 2)) &&
                                        isHexDigit(text.charCodeAt(offset + 3)) &&
                                        isHexDigit(text.charCodeAt(offset + 4)) &&
                                        isHexDigit(text.charCodeAt(offset + 5))) {
                                        offset += 5;
                                        hasEscape = true;
                                        break;
                                    }
                                }
                                return hasEscape ? -offset : offset;

                            default:
                                return hasEscape ? -offset : offset;
                        }
                        offset++;
                    }
                    return hasEscape ? -offset : offset;
                }
                function readIdentifierToken(text, offset, limit) {
                    var startOffset = offset;
                    offset = readIdentifierPart(text, offset, limit);
                    var hasEscape = false;
                    if (offset < 0) {
                        offset = -offset;
                        hasEscape = true;
                    }
                    var identifier = text.substr(startOffset, offset - startOffset);
                    if (hasEscape) {
                        identifier = "" + JSON.parse('"' + identifier + '"');
                    }
                    var wordToken = reservedWordLookup(identifier);
                    if (wordToken) {
                        return wordToken;
                    }
                    return {
                        type: tokenType.identifier,
                        length: offset - startOffset,
                        value: identifier
                    };
                }
                function isHexDigit(code) {
                    switch (code) {
                        case (code >= /*0*/48 && code <= /*9*/57) && code:
                        case (code >= /*a*/97 && code <= /*f*/102) && code:
                        case (code >= /*A*/65 && code <= /*F*/70) && code:
                            return true;

                        default:
                            return false;
                    }
                }
                function readHexIntegerLiteral(text, offset, limit) {
                    while (offset < limit && isHexDigit(text.charCodeAt(offset))) {
                        offset++;
                    }
                    return offset;
                }
                function isDecimalDigit(code) {
                    switch (code) {
                        case (code >= /*0*/48 && code <= /*9*/57) && code:
                            return true;

                        default:
                            return false;
                    }
                }
                function readDecimalDigits(text, offset, limit) {
                    while (offset < limit && isDecimalDigit(text.charCodeAt(offset))) {
                        offset++;
                    }
                    return offset;
                }
                function readDecimalLiteral(text, offset, limit) {
                    offset = readDecimalDigits(text, offset, limit);
                    if (offset < limit && text.charCodeAt(offset) === /*.*/46 && offset + 1 < limit && isDecimalDigit(text.charCodeAt(offset + 1))) {
                        offset = readDecimalDigits(text, offset + 2, limit);
                    }
                    if (offset < limit) {
                        var code = text.charCodeAt(offset);
                        if (code === /*e*/101 || code === /*E*/69) {
                            var tempOffset = offset + 1;
                            if (tempOffset < limit) {
                                code = text.charCodeAt(tempOffset);
                                if (code === /*+*/43 || code === /*-*/45) {
                                    tempOffset++;
                                }
                                offset = readDecimalDigits(text, tempOffset, limit);
                            }
                        }
                    }
                    return offset;
                }
                function readDecimalLiteralToken(text, start, offset, limit) {
                    var offset = readDecimalLiteral(text, offset, limit);
                    var length = offset - start;
                    return {
                        type: tokenType.numberLiteral,
                        length: length,
                        value: +text.substr(start, length)
                    };
                }
                function isLineTerminator(code) {
                    switch (code) {
                        case 0x000A:    // line feed
                        case 0x000D:    // carriage return
                        case 0x2028:    // line separator
                        case 0x2029:    // paragraph separator
                            return true;

                        default:
                            return false;
                    }
                }
                function readStringLiteralToken(text, offset, limit) {
                    var startOffset = offset;
                    var quoteCharCode = text.charCodeAt(offset);
                    var hasEscape = false;
                    offset++;
                    while (offset < limit && !isLineTerminator(text.charCodeAt(offset))) {
                        if (offset + 1 < limit && text.charCodeAt(offset) === /*\*/92) {
                            hasEscape = true;

                            switch (text.charCodeAt(offset + 1)) {
                                case quoteCharCode:
                                case 0x005C:    // \
                                case 0x000A:    // line feed
                                case 0x2028:    // line separator
                                case 0x2029:    // paragraph separator
                                    offset += 2;
                                    continue;

                                case 0x000D:    // carriage return
                                    if (offset + 2 < limit && text.charCodeAt(offset + 2) === 0x000A) {
                                        // Skip \r\n
                                        offset += 3;
                                    } else {
                                        offset += 2;
                                    }
                                    continue;
                            }
                        }
                        offset++;
                        if (text.charCodeAt(offset - 1) === quoteCharCode) {
                            break;
                        }
                    }
                    var length = offset - startOffset;
                    // If we don't have a terminating quote go through the escape path.
                    hasEscape = hasEscape || length === 1 || text.charCodeAt(offset - 1) !== quoteCharCode;
                    var stringValue;
                    if (hasEscape) {
                        stringValue = eval(text.substr(startOffset, length)); // jshint ignore:line
                    } else {
                        stringValue = text.substr(startOffset + 1, length - 2);
                    }
                    return {
                        type: tokenType.stringLiteral,
                        length: length,
                        value: stringValue
                    };
                }
                function isWhitespace(code) {
                    switch (code) {
                        case 0x0009:    // tab
                        case 0x000B:    // vertical tab
                        case 0x000C:    // form feed
                        case 0x0020:    // space
                        case 0x00A0:    // no-breaking space
                        case 0xFEFF:    // BOM
                            return true;

                            // There are no category Zs between 0x00A0 and 0x1680.
                            //
                        case (code < 0x1680) && code:
                            return false;

                            // Unicode category Zs
                            //
                        case 0x1680:
                        case 0x180e:
                        case (code >= 0x2000 && code <= 0x200a) && code:
                        case 0x202f:
                        case 0x205f:
                        case 0x3000:
                            return true;

                        default:
                            return false;
                    }
                }
                // Hand-inlined isWhitespace.
                function readWhitespace(text, offset, limit) {
                    while (offset < limit) {
                        var code = text.charCodeAt(offset);
                        switch (code) {
                            case 0x0009:    // tab
                            case 0x000B:    // vertical tab
                            case 0x000C:    // form feed
                            case 0x0020:    // space
                            case 0x00A0:    // no-breaking space
                            case 0xFEFF:    // BOM
                                break;

                                // There are no category Zs between 0x00A0 and 0x1680.
                                //
                            case (code < 0x1680) && code:
                                return offset;

                                // Unicode category Zs
                                //
                            case 0x1680:
                            case 0x180e:
                            case (code >= 0x2000 && code <= 0x200a) && code:
                            case 0x202f:
                            case 0x205f:
                            case 0x3000:
                                break;

                            default:
                                return offset;
                        }
                        offset++;
                    }
                    return offset;
                }
                function lex(result, text, offset, limit) {
                    while (offset < limit) {
                        var startOffset = offset;
                        var code = text.charCodeAt(offset++);
                        var token;
                        switch (code) {
                            case isWhitespace(code) && code:
                            case isLineTerminator(code) && code:
                                offset = readWhitespace(text, offset, limit);
                                token = { type: tokenType.separator, length: offset - startOffset };
                                // don't include whitespace in the token stream.
                                continue;

                            case /*"*/34:
                            case /*'*/39:
                                token = readStringLiteralToken(text, offset - 1, limit);
                                break;

                            case /*(*/40:
                                token = tokens.leftParentheses;
                                break;

                            case /*)*/41:
                                token = tokens.rightParentheses;
                                break;

                            case /*+*/43:
                            case /*-*/45:
                                if (offset < limit) {
                                    var afterSign = text.charCodeAt(offset);
                                    if (afterSign === /*.*/46) {
                                        var signOffset = offset + 1;
                                        if (signOffset < limit && isDecimalDigit(text.charCodeAt(signOffset))) {
                                            token = readDecimalLiteralToken(text, startOffset, signOffset, limit);
                                            break;
                                        }
                                    } else if (isDecimalDigit(afterSign)) {
                                        token = readDecimalLiteralToken(text, startOffset, offset, limit);
                                        break;
                                    }
                                }
                                token = { type: tokenType.error, length: offset - startOffset, value: text.substring(startOffset, offset) };
                                break;

                            case /*,*/44:
                                token = tokens.comma;
                                break;

                            case /*.*/46:
                                token = tokens.dot;
                                if (offset < limit && isDecimalDigit(text.charCodeAt(offset))) {
                                    token = readDecimalLiteralToken(text, startOffset, offset, limit);
                                }
                                break;

                            case /*0*/48:
                                var ch2 = (offset < limit ? text.charCodeAt(offset) : 0);
                                if (ch2 === /*x*/120 || ch2 === /*X*/88) {
                                    var hexOffset = readHexIntegerLiteral(text, offset + 1, limit);
                                    token = {
                                        type: tokenType.numberLiteral,
                                        length: hexOffset - startOffset,
                                        value: +text.substr(startOffset, hexOffset - startOffset)
                                    };
                                } else {
                                    token = readDecimalLiteralToken(text, startOffset, offset, limit);
                                }
                                break;

                            case (code >= /*1*/49 && code <= /*9*/57) && code:
                                token = readDecimalLiteralToken(text, startOffset, offset, limit);
                                break;

                            case /*:*/58:
                                token = tokens.colon;
                                break;

                            case /*;*/59:
                                token = tokens.semicolon;
                                break;

                            case /*[*/91:
                                token = tokens.leftBracket;
                                break;

                            case /*]*/93:
                                token = tokens.rightBracket;
                                break;

                            case /*{*/123:
                                token = tokens.leftBrace;
                                break;

                            case /*}*/125:
                                token = tokens.rightBrace;
                                break;

                            default:
                                if (isIdentifierStartCharacter(code, text, offset, limit)) {
                                    token = readIdentifierToken(text, offset - 1, limit);
                                    break;
                                }
                                token = { type: tokenType.error, length: offset - startOffset, value: text.substring(startOffset, offset) };
                                break;
                        }

                        offset += (token.length - 1);
                        result.push(token);
                    }
                }
                return function (text) {
                    var result = [];
                    lex(result, text, 0, text.length);
                    result.push(tokens.eof);
                    return result;
                };
            })();
            lexer.tokenType = tokenType;
            return lexer;
        })
    });
});
// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS/ControlProcessor/_OptionsParser',[
    'exports',
    '../Core/_Base',
    '../Core/_BaseUtils',
    '../Core/_ErrorFromName',
    '../Core/_Resources',
    './_OptionsLexer'
    ], function optionsParserInit(exports, _Base, _BaseUtils, _ErrorFromName, _Resources, _OptionsLexer) {
    "use strict";

    var strings = {
        get invalidOptionsRecord() { return "Invalid options record: '{0}', expected to be in the format of an object literal. {1}"; },
        get unexpectedTokenExpectedToken() { return "Unexpected token: {0}, expected token: {1}, at offset {2}"; },
        get unexpectedTokenExpectedTokens() { return "Unexpected token: {0}, expected one of: {1}, at offset {2}"; },
        get unexpectedTokenGeneric() { return "Unexpected token: {0}, at offset {1}"; },
    };

    /*
    Notation is described in ECMA-262-5 (ECMAScript Language Specification, 5th edition) section 5.

    Lexical grammar is defined in ECMA-262-5, section 7.

    Lexical productions used in this grammar defined in ECMA-262-5:

        Production          Section
        --------------------------------
        Identifier          7.6
        NullLiteral         7.8.1
        BooleanLiteral      7.8.2
        NumberLiteral       7.8.3
        StringLiteral       7.8.4

    Syntactic grammar for the value of the data-win-options attribute.

        OptionsLiteral:
            ObjectLiteral

        ObjectLiteral:
            { }
            { ObjectProperties }
            { ObjectProperties , }

        ObjectProperties:
            ObjectProperty
            ObjectProperties, ObjectProperty

        ObjectProperty:
            PropertyName : Value

        PropertyName:                       (from ECMA-262-6, 11.1.5)
            StringLiteral
            NumberLiteral
            Identifier

        ArrayLiteral:
            [ ]
            [ Elision ]
            [ ArrayElements ]
            [ ArrayElements , ]
            [ ArrayElements , Elision ]

        ArrayElements:
            Value
            Elision Value
            ArrayElements , Value
            ArrayElements , Elision Value

        Elision:
            ,
            Elision ,

        Value:
            NullLiteral
            NumberLiteral
            BooleanLiteral
            StringLiteral
            ArrayLiteral
            ObjectLiteral
            IdentifierExpression
            ObjectQueryExpression

        AccessExpression:
            [ Value ]
            . Identifier

        AccessExpressions:
            AccessExpression
            AccessExpressions AccessExpression

        IdentifierExpression:
            Identifier
            Identifier AccessExpressions

        ObjectQueryExpression:
            Identifier ( StringLiteral )
            Identifier ( StringLiteral ) AccessExpressions


    NOTE: We have factored the above grammar to allow the infrastructure to be used
          by the BindingInterpreter as well. The BaseInterpreter does NOT provide an
          implementation of _evaluateValue(), this is expected to be provided by the
          derived class since right now the two have different grammars for Value

        AccessExpression:
            [ Value ]
            . Identifier

        AccessExpressions:
            AccessExpression
            AccessExpressions AccessExpression

        Identifier:
            Identifier                      (from ECMA-262-6, 7.6)

        IdentifierExpression:
            Identifier
            Identifier AccessExpressions

        Value:
            *** Provided by concrete interpreter ***

*/

    function illegal() {
        throw "Illegal";
    }

    var imports = _Base.Namespace.defineWithParent(null, null, {
        lexer: _Base.Namespace._lazy(function () {
            return _OptionsLexer._optionsLexer;
        }),
        tokenType: _Base.Namespace._lazy(function () {
            return _OptionsLexer._optionsLexer.tokenType;
        }),
    });

    var requireSupportedForProcessing = _BaseUtils.requireSupportedForProcessing;

    function tokenTypeName(type) {
        var keys = Object.keys(imports.tokenType);
        for (var i = 0, len = keys.length; i < len; i++) {
            if (type === imports.tokenType[keys[i]]) {
                return keys[i];
            }
        }
        return "<unknown>";
    }

    var local = _Base.Namespace.defineWithParent(null, null, {

        BaseInterpreter: _Base.Namespace._lazy(function () {
            return _Base.Class.define(null, {
                _error: function (message) {
                    throw new _ErrorFromName("WinJS.UI.ParseError", message);
                },
                _currentOffset: function () {
                    var p = this._pos;
                    var offset = 0;
                    for (var i = 0; i < p; i++) {
                        offset += this._tokens[i].length;
                    }
                    return offset;
                },
                _evaluateAccessExpression: function (value) {
                    switch (this._current.type) {
                        case imports.tokenType.dot:
                            this._read();
                            switch (this._current.type) {
                                case imports.tokenType.identifier:
                                case this._current.keyword && this._current.type:
                                    var id = this._current.value;
                                    this._read();
                                    return value[id];

                                default:
                                    this._unexpectedToken(imports.tokenType.identifier, imports.tokenType.reservedWord);
                                    break;
                            }
                            return;

                        case imports.tokenType.leftBracket:
                            this._read();
                            var index = this._evaluateValue();
                            this._read(imports.tokenType.rightBracket);
                            return value[index];

                            // default: is unreachable because all the callers are conditional on
                            // the next token being either a . or {
                            //
                    }
                },
                _evaluateAccessExpressions: function (value) {
                    while (true) {
                        switch (this._current.type) {
                            case imports.tokenType.dot:
                            case imports.tokenType.leftBracket:
                                value = this._evaluateAccessExpression(value);
                                break;

                            default:
                                return value;
                        }
                    }
                },
                _evaluateIdentifier: function (nested, value) {
                    var id = this._readIdentifier();
                    value = nested ? value[id] : this._context[id];
                    return value;
                },
                _evaluateIdentifierExpression: function () {
                    var value = this._evaluateIdentifier(false);

                    switch (this._current.type) {
                        case imports.tokenType.dot:
                        case imports.tokenType.leftBracket:
                            return this._evaluateAccessExpressions(value);
                        default:
                            return value;
                    }
                },
                _initialize: function (tokens, originalSource, context, functionContext) {
                    this._originalSource = originalSource;
                    this._tokens = tokens;
                    this._context = context;
                    this._functionContext = functionContext;
                    this._pos = 0;
                    this._current = this._tokens[0];
                },
                _read: function (expected) {
                    if (expected && this._current.type !== expected) {
                        this._unexpectedToken(expected);
                    }
                    if (this._current !== imports.tokenType.eof) {
                        this._current = this._tokens[++this._pos];
                    }
                },
                _peek: function (expected) {
                    if (expected && this._current.type !== expected) {
                        return;
                    }
                    if (this._current !== imports.tokenType.eof) {
                        return this._tokens[this._pos + 1];
                    }
                },
                _readAccessExpression: function (parts) {
                    switch (this._current.type) {
                        case imports.tokenType.dot:
                            this._read();
                            switch (this._current.type) {
                                case imports.tokenType.identifier:
                                case this._current.keyword && this._current.type:
                                    parts.push(this._current.value);
                                    this._read();
                                    break;

                                default:
                                    this._unexpectedToken(imports.tokenType.identifier, imports.tokenType.reservedWord);
                                    break;
                            }
                            return;

                        case imports.tokenType.leftBracket:
                            this._read();
                            parts.push(this._evaluateValue());
                            this._read(imports.tokenType.rightBracket);
                            return;

                            // default: is unreachable because all the callers are conditional on
                            // the next token being either a . or {
                            //
                    }
                },
                _readAccessExpressions: function (parts) {
                    while (true) {
                        switch (this._current.type) {
                            case imports.tokenType.dot:
                            case imports.tokenType.leftBracket:
                                this._readAccessExpression(parts);
                                break;

                            default:
                                return;
                        }
                    }
                },
                _readIdentifier: function () {
                    var id = this._current.value;
                    this._read(imports.tokenType.identifier);
                    return id;
                },
                _readIdentifierExpression: function () {
                    var parts = [];
                    if (this._peek(imports.tokenType.thisKeyword) && parts.length === 0) {
                        this._read();
                    } else {
                        parts.push(this._readIdentifier());
                    }

                    switch (this._current.type) {
                        case imports.tokenType.dot:
                        case imports.tokenType.leftBracket:
                            this._readAccessExpressions(parts);
                            break;
                    }

                    return parts;
                },
                _unexpectedToken: function (expected) {
                    var unexpected = (this._current.type === imports.tokenType.error ? "'" + this._current.value + "'" : tokenTypeName(this._current.type));
                    if (expected) {
                        if (arguments.length === 1) {
                            expected = tokenTypeName(expected);
                            this._error(_Resources._formatString(strings.unexpectedTokenExpectedToken, unexpected, expected, this._currentOffset()));
                        } else {
                            var names = [];
                            for (var i = 0, len = arguments.length; i < len; i++) {
                                names.push(tokenTypeName(arguments[i]));
                            }
                            expected = names.join(", ");
                            this._error(_Resources._formatString(strings.unexpectedTokenExpectedTokens, unexpected, expected, this._currentOffset()));
                        }
                    } else {
                        this._error(_Resources._formatString(strings.unexpectedTokenGeneric, unexpected, this._currentOffset()));
                    }
                }
            }, {
                supportedForProcessing: false,
            });
        }),

        OptionsInterpreter: _Base.Namespace._lazy(function () {
            return _Base.Class.derive(local.BaseInterpreter, function (tokens, originalSource, context, functionContext) {
                this._initialize(tokens, originalSource, context, functionContext);
            }, {
                _error: function (message) {
                    throw new _ErrorFromName("WinJS.UI.ParseError", _Resources._formatString(strings.invalidOptionsRecord, this._originalSource, message));
                },
                _evaluateArrayLiteral: function () {
                    var a = [];
                    this._read(imports.tokenType.leftBracket);
                    this._readArrayElements(a);
                    this._read(imports.tokenType.rightBracket);
                    return a;
                },
                _evaluateObjectLiteral: function () {
                    var o = {};
                    this._read(imports.tokenType.leftBrace);
                    this._readObjectProperties(o);
                    this._tryReadComma();
                    this._read(imports.tokenType.rightBrace);
                    return o;
                },
                _evaluateOptionsLiteral: function () {
                    var value = this._evaluateValue();
                    if (this._current.type !== imports.tokenType.eof) {
                        this._unexpectedToken(imports.tokenType.eof);
                    }
                    return value;
                },
                _peekValue: function () {
                    switch (this._current.type) {
                        case imports.tokenType.falseLiteral:
                        case imports.tokenType.nullLiteral:
                        case imports.tokenType.stringLiteral:
                        case imports.tokenType.trueLiteral:
                        case imports.tokenType.numberLiteral:
                        case imports.tokenType.leftBrace:
                        case imports.tokenType.leftBracket:
                        case imports.tokenType.identifier:
                            return true;
                        default:
                            return false;
                    }
                },
                _evaluateValue: function () {
                    switch (this._current.type) {
                        case imports.tokenType.falseLiteral:
                        case imports.tokenType.nullLiteral:
                        case imports.tokenType.stringLiteral:
                        case imports.tokenType.trueLiteral:
                        case imports.tokenType.numberLiteral:
                            var value = this._current.value;
                            this._read();
                            return value;

                        case imports.tokenType.leftBrace:
                            return this._evaluateObjectLiteral();

                        case imports.tokenType.leftBracket:
                            return this._evaluateArrayLiteral();

                        case imports.tokenType.identifier:
                            if (this._peek(imports.tokenType.identifier).type === imports.tokenType.leftParentheses) {
                                return requireSupportedForProcessing(this._evaluateObjectQueryExpression());
                            }
                            return requireSupportedForProcessing(this._evaluateIdentifierExpression());

                        default:
                            this._unexpectedToken(imports.tokenType.falseLiteral, imports.tokenType.nullLiteral, imports.tokenType.stringLiteral,
                                imports.tokenType.trueLiteral, imports.tokenType.numberLiteral, imports.tokenType.leftBrace, imports.tokenType.leftBracket,
                                imports.tokenType.identifier);
                            break;
                    }
                },
                _tryReadElement: function (a) {
                    if (this._peekValue()) {
                        a.push(this._evaluateValue());
                        return true;
                    } else {
                        return false;
                    }
                },
                _tryReadComma: function () {
                    if (this._peek(imports.tokenType.comma)) {
                        this._read();
                        return true;
                    }
                    return false;
                },
                _tryReadElision: function (a) {
                    var found = false;
                    while (this._tryReadComma()) {
                        a.push(undefined);
                        found = true;
                    }
                    return found;
                },
                _readArrayElements: function (a) {
                    while (!this._peek(imports.tokenType.rightBracket)) {
                        var elision = this._tryReadElision(a);
                        var element = this._tryReadElement(a);
                        var comma = this._peek(imports.tokenType.comma);
                        if (element && comma) {
                            // if we had a element followed by a comma, eat the comma and try to read the next element
                            this._read();
                        } else if (element || elision) {
                            // if we had a element without a trailing comma or if all we had were commas we're done
                            break;
                        } else {
                            // if we didn't have a element or elision then we are done and in error
                            this._unexpectedToken(imports.tokenType.falseLiteral, imports.tokenType.nullLiteral, imports.tokenType.stringLiteral,
                                imports.tokenType.trueLiteral, imports.tokenType.numberLiteral, imports.tokenType.leftBrace, imports.tokenType.leftBracket,
                                imports.tokenType.identifier);
                            break;
                        }
                    }
                },
                _readObjectProperties: function (o) {
                    while (!this._peek(imports.tokenType.rightBrace)) {
                        var property = this._tryReadObjectProperty(o);
                        var comma = this._peek(imports.tokenType.comma);
                        if (property && comma) {
                            // if we had a property followed by a comma, eat the comma and try to read the next property
                            this._read();
                        } else if (property) {
                            // if we had a property without a trailing comma we're done
                            break;
                        } else {
                            // if we didn't have a property then we are done and in error
                            this._unexpectedToken(imports.tokenType.numberLiteral, imports.tokenType.stringLiteral, imports.tokenType.identifier);
                            break;
                        }
                    }
                },
                _tryReadObjectProperty: function (o) {
                    switch (this._current.type) {
                        case imports.tokenType.numberLiteral:
                        case imports.tokenType.stringLiteral:
                        case imports.tokenType.identifier:
                        case this._current.keyword && this._current.type:
                            var propertyName = this._current.value;
                            this._read();
                            this._read(imports.tokenType.colon);
                            o[propertyName] = this._evaluateValue();
                            return true;

                        default:
                            return false;
                    }
                },
                _failReadObjectProperty: function () {
                    this._unexpectedToken(imports.tokenType.numberLiteral, imports.tokenType.stringLiteral, imports.tokenType.identifier, imports.tokenType.reservedWord);
                },
                _evaluateObjectQueryExpression: function () {
                    var functionName = this._current.value;
                    this._read(imports.tokenType.identifier);
                    this._read(imports.tokenType.leftParentheses);
                    var queryExpression = this._current.value;
                    this._read(imports.tokenType.stringLiteral);
                    this._read(imports.tokenType.rightParentheses);

                    var value = requireSupportedForProcessing(this._functionContext[functionName])(queryExpression);
                    switch (this._current.type) {
                        case imports.tokenType.dot:
                        case imports.tokenType.leftBracket:
                            return this._evaluateAccessExpressions(value);

                        default:
                            return value;
                    }
                },
                run: function () {
                    return this._evaluateOptionsLiteral();
                }
            }, {
                supportedForProcessing: false,
            });
        }),

        OptionsParser: _Base.Namespace._lazy(function () {
            return _Base.Class.derive(local.OptionsInterpreter, function (tokens, originalSource) {
                this._initialize(tokens, originalSource);
            }, {
                // When parsing it is illegal to get to any of these "evaluate" RHS productions because
                //  we will always instead go to the "read" version
                //
                _evaluateAccessExpression: illegal,
                _evaluateAccessExpressions: illegal,
                _evaluateIdentifier: illegal,
                _evaluateIdentifierExpression: illegal,
                _evaluateObjectQueryExpression: illegal,

                _evaluateValue: function () {
                    switch (this._current.type) {
                        case imports.tokenType.falseLiteral:
                        case imports.tokenType.nullLiteral:
                        case imports.tokenType.stringLiteral:
                        case imports.tokenType.trueLiteral:
                        case imports.tokenType.numberLiteral:
                            var value = this._current.value;
                            this._read();
                            return value;

                        case imports.tokenType.leftBrace:
                            return this._evaluateObjectLiteral();

                        case imports.tokenType.leftBracket:
                            return this._evaluateArrayLiteral();

                        case imports.tokenType.identifier:
                            if (this._peek(imports.tokenType.identifier).type === imports.tokenType.leftParentheses) {
                                return this._readObjectQueryExpression();
                            }
                            return this._readIdentifierExpression();

                        default:
                            this._unexpectedToken(imports.tokenType.falseLiteral, imports.tokenType.nullLiteral, imports.tokenType.stringLiteral,
                                imports.tokenType.trueLiteral, imports.tokenType.numberLiteral, imports.tokenType.leftBrace, imports.tokenType.leftBracket,
                                imports.tokenType.identifier);
                            break;
                    }
                },

                _readIdentifierExpression: function () {
                    var parts = local.BaseInterpreter.prototype._readIdentifierExpression.call(this);
                    return new IdentifierExpression(parts);
                },
                _readObjectQueryExpression: function () {
                    var functionName = this._current.value;
                    this._read(imports.tokenType.identifier);
                    this._read(imports.tokenType.leftParentheses);
                    var queryExpressionLiteral = this._current.value;
                    this._read(imports.tokenType.stringLiteral);
                    this._read(imports.tokenType.rightParentheses);

                    var call = new CallExpression(functionName, queryExpressionLiteral);
                    switch (this._current.type) {
                        case imports.tokenType.dot:
                        case imports.tokenType.leftBracket:
                            var parts = [call];
                            this._readAccessExpressions(parts);
                            return new IdentifierExpression(parts);

                        default:
                            return call;
                    }
                },
            }, {
                supportedForProcessing: false,
            });
        })

    });

    var parser = function (text, context, functionContext) {
        var tokens = imports.lexer(text);
        var interpreter = new local.OptionsInterpreter(tokens, text, context || {}, functionContext || {});
        return interpreter.run();
    };
    Object.defineProperty(parser, "_BaseInterpreter", { get: function () { return local.BaseInterpreter; } });

    var parser2 = function (text) {
        var tokens = imports.lexer(text);
        var parser = new local.OptionsParser(tokens, text);
        return parser.run();
    };

    // Consumers of parser2 need to be able to see the AST for RHS expression in order to emit
    //  code representing these portions of the options record
    //
    var CallExpression = _Base.Class.define(function (target, arg0Value) {
        this.target = target;
        this.arg0Value = arg0Value;
    });
    CallExpression.supportedForProcessing = false;

    var IdentifierExpression = _Base.Class.define(function (parts) {
        this.parts = parts;
    });
    IdentifierExpression.supportedForProcessing = false;

    _Base.Namespace._moduleDefine(exports, "WinJS.UI", {

        // This is the mis-named interpreter version of the options record processor.
        //
        optionsParser: parser,

        // This is the actual parser version of the options record processor.
        //
        _optionsParser: parser2,
        _CallExpression: CallExpression,
        _IdentifierExpression: IdentifierExpression,

    });

});


define('WinJS/XYFocus',["require", "exports", "./Core/_Global", "./Core/_Base", "./Core/_BaseUtils", "./Utilities/_ElementUtilities", "./Core/_Events", "./ControlProcessor/_OptionsParser"], function(require, exports, _Global, _Base, _BaseUtils, _ElementUtilities, _Events, _OptionsParser) {
    "use strict";

    var AttributeNames = {
        focusOverride: "data-win-xyfocus",
        focusOverrideLegacy: "data-win-focus"
    };

    var ClassNames = {
        focusable: "win-focusable"
    };

    var CrossDomainMessageConstants = {
        messageDataProperty: "msWinJSXYFocusControlMessage",
        register: "register",
        unregister: "unregister",
        dFocusEnter: "dFocusEnter",
        dFocusExit: "dFocusExit"
    };

    var DirectionNames = {
        left: "left",
        right: "right",
        up: "up",
        down: "down"
    };

    var EventNames = {
        focusChanging: "focuschanging",
        focusChanged: "focuschanged"
    };

    var FocusableTagNames = [
        "A",
        "BUTTON",
        "IFRAME",
        "INPUT",
        "SELECT",
        "TEXTAREA"
    ];

    // These factors can be tweaked to adjust which elements are favored by the focus algorithm
    var ScoringConstants = {
        primaryAxisDistanceWeight: 30,
        secondaryAxisDistanceWeight: 20,
        percentInHistoryShadowWeight: 100000
    };

    /**
    * Gets the mapping object that maps keycodes to XYFocus actions.
    **/
    exports.keyCodeMap = {
        left: [_ElementUtilities.Key.leftArrow,140,205,214],
        right: [_ElementUtilities.Key.rightArrow,141,206,213],
        up: [_ElementUtilities.Key.upArrow,138,203,211],
        down: [_ElementUtilities.Key.downArrow,139,204,212]
    };

    /**
    * Gets or sets the focus root when invoking XYFocus APIs.
    **/
    exports.focusRoot;

    

    function findNextFocusElement(direction, options) {
        var result = _findNextFocusElementInternal(direction, options);
        return result ? result.target : null;
    }
    exports.findNextFocusElement = findNextFocusElement;

    

    function moveFocus(direction, options) {
        var result = exports.findNextFocusElement(direction, options);
        if (result) {
            var previousFocusElement = _Global.document.activeElement;
            if (_trySetFocus(result, -1)) {
                eventSrc.dispatchEvent(EventNames.focusChanged, { previousFocusElement: previousFocusElement, keyCode: -1 });

                return result;
            }
        }
    }
    exports.moveFocus = moveFocus;

    function enableXYFocus() {
        if (!_xyFocusEnabled) {
            _Global.document.addEventListener("keydown", _handleKeyEvent);
            _xyFocusEnabled = true;
        }
    }
    exports.enableXYFocus = enableXYFocus;

    function disableXYFocus() {
        if (_xyFocusEnabled) {
            _Global.document.removeEventListener("keydown", _handleKeyEvent);
            _xyFocusEnabled = false;
        }
    }
    exports.disableXYFocus = disableXYFocus;

    // Privates
    var _xyFocusEnabled = false;
    var _lastTarget;
    var _cachedLastTargetRect;
    var _historyRect;
    var _afEnabledFrames = [];
    function _xyFocus(direction, keyCode, referenceRect) {
        // If focus has moved since the last XYFocus movement, scrolling occured, or an explicit
        // reference rectangle was given to us, then we invalidate the history rectangle.
        if (referenceRect || _Global.document.activeElement !== _lastTarget) {
            _historyRect = null;
            _lastTarget = null;
            _cachedLastTargetRect = null;
        } else if (_lastTarget && _cachedLastTargetRect) {
            var lastTargetRect = _toIRect(_lastTarget.getBoundingClientRect());
            if (lastTargetRect.left !== _cachedLastTargetRect.left || lastTargetRect.top !== _cachedLastTargetRect.top) {
                _historyRect = null;
                _lastTarget = null;
                _cachedLastTargetRect = null;
            }
        }

        var activeElement = _Global.document.activeElement;
        var lastTarget = _lastTarget;

        var result = _findNextFocusElementInternal(direction, {
            focusRoot: exports.focusRoot,
            historyRect: _historyRect,
            referenceElement: _lastTarget,
            referenceRect: referenceRect
        });

        if (result && _trySetFocus(result.target, keyCode)) {
            // A focus target was found
            updateHistoryRect(direction, result);
            _lastTarget = result.target;
            _cachedLastTargetRect = result.targetRect;

            if (result.target.tagName === "IFRAME") {
                var index = _afEnabledFrames.lastIndexOf(result.target.contentWindow);
                if (index >= 0) {
                    // If we successfully moved focus and the new focused item is an IFRAME, then we need to notify it
                    // Note on coordinates: When signaling enter, DO transform the coordinates into the child frame's coordinate system.
                    var refRect = _toIRect({
                        left: result.referenceRect.left - result.targetRect.left,
                        top: result.referenceRect.top - result.targetRect.top,
                        width: result.referenceRect.width,
                        height: result.referenceRect.height
                    });

                    var message = {};
                    message[CrossDomainMessageConstants.messageDataProperty] = {
                        type: CrossDomainMessageConstants.dFocusEnter,
                        direction: direction,
                        referenceRect: refRect
                    };
                    result.target.contentWindow.postMessage(message, "*");
                }
            }
            eventSrc.dispatchEvent(EventNames.focusChanged, { previousFocusElement: activeElement, keyCode: keyCode });
            return true;
        } else {
            // No focus target was found; if we are inside an IFRAME, notify the parent that focus is exiting this IFRAME
            // Note on coordinates: When signaling exit, do NOT transform the coordinates into the parent's coordinate system.
            if (top !== window) {
                var refRect = referenceRect;
                if (!refRect) {
                    refRect = _Global.document.activeElement ? _toIRect(_Global.document.activeElement.getBoundingClientRect()) : _defaultRect();
                }

                var message = {};
                message[CrossDomainMessageConstants.messageDataProperty] = {
                    type: CrossDomainMessageConstants.dFocusExit,
                    direction: direction,
                    referenceRect: refRect
                };
                _Global.parent.postMessage(message, "*");
                return true;
            }
        }
        return false;

        // Nested Helpers
        function updateHistoryRect(direction, result) {
            var newHistoryRect = _defaultRect();

            // It's possible to get into a situation where the target element has no overlap with the reference edge.
            //
            //..╔══════════════╗..........................
            //..║   reference  ║..........................
            //..╚══════════════╝..........................
            //.....................╔═══════════════════╗..
            //.....................║                   ║..
            //.....................║       target      ║..
            //.....................║                   ║..
            //.....................╚═══════════════════╝..
            //
            // If that is the case, we need to reset the coordinates to the edge of the target element.
            if (direction === DirectionNames.left || direction === DirectionNames.right) {
                newHistoryRect.top = _Global.Math.max(result.targetRect.top, result.referenceRect.top, _historyRect ? _historyRect.top : Number.MIN_VALUE);
                newHistoryRect.bottom = _Global.Math.min(result.targetRect.bottom, result.referenceRect.bottom, _historyRect ? _historyRect.bottom : Number.MAX_VALUE);
                if (newHistoryRect.bottom <= newHistoryRect.top) {
                    newHistoryRect.top = result.targetRect.top;
                    newHistoryRect.bottom = result.targetRect.bottom;
                }
                newHistoryRect.height = newHistoryRect.bottom - newHistoryRect.top;

                newHistoryRect.width = Number.MAX_VALUE;
                newHistoryRect.left = Number.MIN_VALUE;
                newHistoryRect.right = Number.MAX_VALUE;
            } else {
                newHistoryRect.left = _Global.Math.max(result.targetRect.left, result.referenceRect.left, _historyRect ? _historyRect.left : Number.MIN_VALUE);
                newHistoryRect.right = _Global.Math.min(result.targetRect.right, result.referenceRect.right, _historyRect ? _historyRect.right : Number.MAX_VALUE);
                if (newHistoryRect.right <= newHistoryRect.left) {
                    newHistoryRect.left = result.targetRect.left;
                    newHistoryRect.right = result.targetRect.right;
                }
                newHistoryRect.width = newHistoryRect.right - newHistoryRect.left;

                newHistoryRect.height = Number.MAX_VALUE;
                newHistoryRect.top = Number.MIN_VALUE;
                newHistoryRect.bottom = Number.MAX_VALUE;
            }
            _historyRect = newHistoryRect;
        }
    }

    function _findNextFocusElementInternal(direction, options) {
        options = options || {};
        options.focusRoot = options.focusRoot || exports.focusRoot || _Global.document.body;
        options.historyRect = options.historyRect || _defaultRect();

        var maxDistance = _Global.Math.max(_Global.screen.availHeight, _Global.screen.availWidth);
        var refObj = getReferenceObject(options.referenceElement, options.referenceRect);

        // Handle override
        if (refObj.element) {
            var manualOverrideOptions = refObj.element.getAttribute(AttributeNames.focusOverride) || refObj.element.getAttribute(AttributeNames.focusOverrideLegacy);
            if (manualOverrideOptions) {
                var parsedOptions = _OptionsParser.optionsParser(manualOverrideOptions);

                // The left-hand side can be cased as either "left" or "Left".
                var selector = parsedOptions[direction] || parsedOptions[direction[0].toUpperCase() + direction.substr(1)];

                if (selector) {
                    var target;
                    var element = refObj.element;
                    while (!target && element) {
                        target = element.querySelector(selector);
                        element = element.parentElement;
                    }
                    if (target) {
                        if (target === _Global.document.activeElement) {
                            return null;
                        }
                        return { target: target, targetRect: _toIRect(target.getBoundingClientRect()), referenceRect: refObj.rect, usedOverride: true };
                    }
                }
            }
        }

        // Calculate scores for each element in the root
        var bestPotential = {
            element: null,
            rect: null,
            score: 0
        };
        var allElements = options.focusRoot.querySelectorAll("*");
        for (var i = 0, length = allElements.length; i < length; i++) {
            var potentialElement = allElements[i];

            if (refObj.element === potentialElement || !isFocusable(potentialElement)) {
                continue;
            }

            var potentialRect = _toIRect(potentialElement.getBoundingClientRect());

            // Skip elements that have either a width of zero or a height of zero
            if (potentialRect.width === 0 || potentialRect.height === 0) {
                continue;
            }

            var score = calculateScore(direction, maxDistance, options.historyRect, refObj.rect, potentialRect);

            if (score > bestPotential.score) {
                bestPotential.element = potentialElement;
                bestPotential.rect = potentialRect;
                bestPotential.score = score;
            }
        }

        return bestPotential.element ? { target: bestPotential.element, targetRect: bestPotential.rect, referenceRect: refObj.rect, usedOverride: false } : null;

        // Nested Helpers
        function calculatePercentInShadow(minReferenceCoord, maxReferenceCoord, minPotentialCoord, maxPotentialCoord) {
            /// Calculates the percentage of the potential element that is in the shadow of the reference element.
            if ((minReferenceCoord >= maxPotentialCoord) || (maxReferenceCoord <= minPotentialCoord)) {
                return 0;
            }

            var pixelOverlapWithTheReferenceShadow = _Global.Math.min(maxReferenceCoord, maxPotentialCoord) - _Global.Math.max(minReferenceCoord, minPotentialCoord);
            var referenceEdgeLength = maxReferenceCoord - minReferenceCoord;
            return pixelOverlapWithTheReferenceShadow / referenceEdgeLength;
        }

        function calculateScore(direction, maxDistance, historyRect, referenceRect, potentialRect) {
            var score = 0;

            var percentInShadow;
            var primaryAxisDistance;
            var secondaryAxisDistance = 0;
            var percentInHistoryShadow = 0;
            switch (direction) {
                case DirectionNames.left:
                    // Make sure we don't evaluate any potential elements to the right of the reference element
                    if (potentialRect.left >= referenceRect.left) {
                        break;
                    }

                    percentInShadow = calculatePercentInShadow(referenceRect.top, referenceRect.bottom, potentialRect.top, potentialRect.bottom);
                    primaryAxisDistance = referenceRect.left - potentialRect.right;

                    if (percentInShadow > 0) {
                        percentInHistoryShadow = calculatePercentInShadow(historyRect.top, historyRect.bottom, potentialRect.top, potentialRect.bottom);
                    } else {
                        // If the potential element is not in the shadow, then we calculate secondary axis distance
                        secondaryAxisDistance = (referenceRect.bottom <= potentialRect.top) ? (potentialRect.top - referenceRect.bottom) : referenceRect.top - potentialRect.bottom;
                    }
                    break;

                case DirectionNames.right:
                    // Make sure we don't evaluate any potential elements to the left of the reference element
                    if (potentialRect.right <= referenceRect.right) {
                        break;
                    }

                    percentInShadow = calculatePercentInShadow(referenceRect.top, referenceRect.bottom, potentialRect.top, potentialRect.bottom);
                    primaryAxisDistance = potentialRect.left - referenceRect.right;

                    if (percentInShadow > 0) {
                        percentInHistoryShadow = calculatePercentInShadow(historyRect.top, historyRect.bottom, potentialRect.top, potentialRect.bottom);
                    } else {
                        // If the potential element is not in the shadow, then we calculate secondary axis distance
                        secondaryAxisDistance = (referenceRect.bottom <= potentialRect.top) ? (potentialRect.top - referenceRect.bottom) : referenceRect.top - potentialRect.bottom;
                    }
                    break;

                case DirectionNames.up:
                    // Make sure we don't evaluate any potential elements below the reference element
                    if (potentialRect.top >= referenceRect.top) {
                        break;
                    }

                    percentInShadow = calculatePercentInShadow(referenceRect.left, referenceRect.right, potentialRect.left, potentialRect.right);
                    primaryAxisDistance = referenceRect.top - potentialRect.bottom;

                    if (percentInShadow > 0) {
                        percentInHistoryShadow = calculatePercentInShadow(historyRect.left, historyRect.right, potentialRect.left, potentialRect.right);
                    } else {
                        // If the potential element is not in the shadow, then we calculate secondary axis distance
                        secondaryAxisDistance = (referenceRect.right <= potentialRect.left) ? (potentialRect.left - referenceRect.right) : referenceRect.left - potentialRect.right;
                    }
                    break;

                case DirectionNames.down:
                    // Make sure we don't evaluate any potential elements above the reference element
                    if (potentialRect.bottom <= referenceRect.bottom) {
                        break;
                    }

                    percentInShadow = calculatePercentInShadow(referenceRect.left, referenceRect.right, potentialRect.left, potentialRect.right);
                    primaryAxisDistance = potentialRect.top - referenceRect.bottom;

                    if (percentInShadow > 0) {
                        percentInHistoryShadow = calculatePercentInShadow(historyRect.left, historyRect.right, potentialRect.left, potentialRect.right);
                    } else {
                        // If the potential element is not in the shadow, then we calculate secondary axis distance
                        secondaryAxisDistance = (referenceRect.right <= potentialRect.left) ? (potentialRect.left - referenceRect.right) : referenceRect.left - potentialRect.right;
                    }
                    break;
            }

            if (primaryAxisDistance >= 0) {
                // The score needs to be a positive number so we make these distances positive numbers
                primaryAxisDistance = maxDistance - primaryAxisDistance;
                secondaryAxisDistance = maxDistance - secondaryAxisDistance;

                if (primaryAxisDistance >= 0 && secondaryAxisDistance >= 0) {
                    // Potential elements in the shadow get a multiplier to their final score
                    primaryAxisDistance += primaryAxisDistance * percentInShadow;

                    score = primaryAxisDistance * ScoringConstants.primaryAxisDistanceWeight + secondaryAxisDistance * ScoringConstants.secondaryAxisDistanceWeight + percentInHistoryShadow * ScoringConstants.percentInHistoryShadowWeight;
                }
            }
            return score;
        }

        function getReferenceObject(referenceElement, referenceRect) {
            var refElement;
            var refRect;

            if ((!referenceElement && !referenceRect) || (referenceElement && !referenceElement.parentNode)) {
                // Note: We need to check to make sure 'parentNode' is not null otherwise there is a case
                // where _lastTarget is defined, but calling getBoundingClientRect will throw a native exception.
                // This case happens if the innerHTML of the parent of the _lastTarget is set to "".
                // If no valid reference is supplied, we'll use _Global.document.activeElement unless it's the body
                if (_Global.document.activeElement !== _Global.document.body) {
                    referenceElement = _Global.document.activeElement;
                }
            }

            if (referenceElement) {
                refElement = referenceElement;
                refRect = _toIRect(refElement.getBoundingClientRect());
            } else if (referenceRect) {
                refRect = _toIRect(referenceRect);
            } else {
                refRect = _defaultRect();
            }
            return {
                element: refElement,
                rect: refRect
            };
        }

        function isFocusable(element) {
            var elementTagName = element.tagName;
            if (!element.hasAttribute("tabindex") && FocusableTagNames.indexOf(elementTagName) === -1 && !_ElementUtilities.hasClass(element, ClassNames.focusable)) {
                // If the current potential element is not one of the tags we consider to be focusable, then exit
                return false;
            }

            if (elementTagName === "IFRAME" && _afEnabledFrames.indexOf(element.contentWindow) === -1) {
                // Skip IFRAMEs without compatible XYFocus implementation
                return false;
            }

            if (elementTagName === "DIV" && element["winControl"] && element["winControl"].disabled) {
                // Skip disabled WinJS controls
                return false;
            }

            var style = getComputedStyle(element);
            if (element.getAttribute("tabIndex") === "-1" || style.display === "none" || style.visibility === "hidden" || element.disabled) {
                // Skip elements that are hidden
                // Note: We don't check for opacity === 0, because the browser cannot tell us this value accurately.
                return false;
            }
            return true;
        }
    }

    function _defaultRect() {
        // We set the top, left, bottom and right properties of the referenceBoundingRectangle to '-1'
        // (as opposed to '0') because we want to make sure that even elements that are up to the edge
        // of the screen can receive focus.
        return {
            top: -1,
            bottom: -1,
            right: -1,
            left: -1,
            height: 0,
            width: 0
        };
    }

    function _toIRect(rect) {
        return {
            top: _Global.Math.floor(rect.top),
            bottom: _Global.Math.floor(rect.top + rect.height),
            right: _Global.Math.floor(rect.left + rect.width),
            left: _Global.Math.floor(rect.left),
            height: _Global.Math.floor(rect.height),
            width: _Global.Math.floor(rect.width)
        };
    }

    function _trySetFocus(element, keyCode) {
        // We raise an event on the focusRoot before focus changes to give listeners
        // a chance to prevent the next focus target from receiving focus if they want.
        var canceled = eventSrc.dispatchEvent(EventNames.focusChanging, { nextFocusElement: element, keyCode: keyCode });
        if (!canceled) {
            element.focus();
        }
        return _Global.document.activeElement === element;
    }

    function _getIFrameFromWindow(win) {
        var iframes = _Global.document.querySelectorAll("IFRAME");
        var found = Array.prototype.filter.call(iframes, function (x) {
            return x.contentWindow === win;
        });
        return found.length ? found[0] : null;
    }

    function _handleKeyEvent(e) {
        if (e.defaultPrevented) {
            return;
        }

        var keys = Object.keys(exports.keyCodeMap);
        for (var i = 0; i < keys.length; i++) {
            // Note: key is 'left', 'right', 'up', or 'down'
            var key = keys[i];
            var keyMappings = exports.keyCodeMap[key];
            if (keyMappings.indexOf(e.keyCode) >= 0) {
                if (_xyFocus(key, e.keyCode)) {
                    e.preventDefault();
                }
                return;
            }
        }
    }

    _Global.addEventListener("message", function (e) {
        if (!e.data || !e.data[CrossDomainMessageConstants.messageDataProperty]) {
            return;
        }

        var data = e.data[CrossDomainMessageConstants.messageDataProperty];
        switch (data.type) {
            case CrossDomainMessageConstants.register:
                _afEnabledFrames.push(e.source);
                break;

            case CrossDomainMessageConstants.unregister:
                var index = _afEnabledFrames.indexOf(e.source);
                if (index >= 0) {
                    _afEnabledFrames.splice(index, 1);
                }
                break;

            case CrossDomainMessageConstants.dFocusEnter:
                // The coordinates stored in data.refRect are already in this frame's coordinate system.
                // When we get this message we will force-enable XYFocus to support scenarios where
                // websites running WinJS are put into an IFRAME and the parent frame has XYFocus enabled.
                exports.enableXYFocus();
                _xyFocus(data.direction, -1, data.referenceRect);
                break;

            case CrossDomainMessageConstants.dFocusExit:
                var iframe = _getIFrameFromWindow(e.source);
                if (_Global.document.activeElement !== iframe) {
                    break;
                }

                // The coordinates stored in data.refRect are in the IFRAME's coordinate system,
                // so we must first transform them into this frame's coordinate system.
                var refRect = data.referenceRect;
                refRect.left += iframe.offsetLeft;
                refRect.top += iframe.offsetTop;
                _xyFocus(data.direction, -1, refRect);
                break;
        }
    });

    _Global.document.addEventListener("DOMContentLoaded", function () {
        if (_ElementUtilities.hasWinRT && _Global["Windows"] && _Global["Windows"]["Xbox"]) {
            exports.enableXYFocus();
        }

        // If we are running within an iframe, we send a registration message to the parent window
        if (_Global.top !== _Global.window) {
            var message = {};
            message[CrossDomainMessageConstants.messageDataProperty] = {
                type: CrossDomainMessageConstants.register,
                version: 1.0
            };
            _Global.parent.postMessage(message, "*");
        }
    });

    // Publish to WinJS namespace
    var toPublish = {
        keyCodeMap: exports.keyCodeMap,
        focusRoot: {
            get: function () {
                return exports.focusRoot;
            },
            set: function (value) {
                exports.focusRoot = value;
            }
        },
        enableXYFocus: exports.enableXYFocus,
        disableXYFocus: exports.disableXYFocus,
        findNextFocusElement: exports.findNextFocusElement,
        moveFocus: exports.moveFocus,
        _xyFocus: _xyFocus
    };
    toPublish = _BaseUtils._merge(toPublish, _Events.eventMixin);
    toPublish["_listeners"] = {};
    var eventSrc = toPublish;
    _Base.Namespace.define("WinJS.UI.XYFocus", toPublish);
});

// Copyright (c) Microsoft Corporation.  All Rights Reserved. Licensed under the MIT License. See License.txt in the project root for license information.
define('WinJS-custom',[
    'WinJS/Core/_WinJS',
    'WinJS/Core',
    //'WinJS/Promise',
    //'WinJS/_Signal',
    //'WinJS/Scheduler',
    //'WinJS/Utilities',
    'WinJS/XYFocus'
    //'WinJS/Fragments',
    //'WinJS/Application',
    //'WinJS/Navigation',
    //'WinJS/Animations',
    //'WinJS/Binding',
    //'WinJS/BindingTemplate',
    //'WinJS/BindingList',
    //'WinJS/Res',
    //'WinJS/Pages',
    //'WinJS/ControlProcessor',
    //'WinJS/Controls/HtmlControl',
    //'WinJS/VirtualizedDataSource',
    //'WinJS/Controls/IntrinsicControls',
    //'WinJS/Controls/ListView',
    //'WinJS/Controls/FlipView',
    //'WinJS/Controls/ItemContainer',
    //'WinJS/Controls/Repeater',
    //'WinJS/Controls/DatePicker',
    //'WinJS/Controls/TimePicker',
    //'WinJS/Controls/BackButton',
    //'WinJS/Controls/Rating',
    //'WinJS/Controls/ToggleSwitch',
    //'WinJS/Controls/SemanticZoom',
    //'WinJS/Controls/Pivot',
    //'WinJS/Controls/Hub',
    //'WinJS/Controls/Flyout',
    //'WinJS/Controls/AppBar',
    //'WinJS/Controls/Menu',
    //'WinJS/Controls/SearchBox',
    //'WinJS/Controls/SettingsFlyout',
    //'WinJS/Controls/NavBar',
    //'WinJS/Controls/Tooltip',
    //'WinJS/Controls/ViewBox',
    //'WinJS/Controls/ContentDialog',
    //'WinJS/Controls/ToolBar',
    //'WinJS/Controls/SplitView'
    ], function (_WinJS) {
    "use strict";

    _WinJS.Namespace.define("WinJS.Utilities", {
        _require: require,
        _define: define
    });

    return _WinJS;
});

        require(['WinJS/Core/_WinJS', 'WinJS-custom'], function (_WinJS) {
            global.WinJS = _WinJS;
        });
        return global.WinJS;
    }));
}(this));

