import {membraneFactory} from "../processors/html-compiler-processor.js";
import {appManager} from "../manager/app-manager.js";

export function css(stylesheet) {
    let styleElement = document.createElement("style");
    document.head.appendChild(styleElement)
    let sheet = styleElement.sheet;

    for (const [selector, object] of Object.entries(stylesheet)) {
        let cssString = selector + " {\n"
        for (const [rule, value] of Object.entries(object)) {
            let unescaped = rule.replace(/([A-Z])/g, (group) => "-" + group.toLowerCase())
            cssString += "\t" + unescaped + " : " + value + ";\n"
        }
        cssString += "}\n"
        if (cssString) {
            sheet.insertRule(cssString);
        }
    }
}

export function idExtractorHelper(object) {
    if (object instanceof Array) {
        return object.map((item) => objectIdExtractor(item))
    }
    if (object instanceof Object && Reflect.has(object, "$schema")) {
        return objectIdExtractor(object);
    }

    return object;
}

function objectIdExtractor(object) {
    let [key, value] = Object.entries(object.$schema.properties)
        .filter(([key, value]) => value.id)[0]
    return object[key];
}

export function idExtractor(object) {
    return  Object.entries(object)
        .reduce((previous, [currentKey, currentValue]) => {
            previous[currentKey] = idExtractorHelper(currentValue);
            return previous;
        }, {})
}

export function uriTemplate(template) {
    let indexOf = template.indexOf("?");
    let queryParams;
    if (indexOf > -1) {
        queryParams = template.substring(indexOf + 1)
    } else {
        queryParams = "";
    }

    let url = new URLSearchParams(queryParams);

    url.build = function () {
        if (indexOf > - 1) {
            return decodeURIComponent(template.substr(0, indexOf) + "?" + url.toString());
        } else {
            return decodeURIComponent(template + "?" + url.toString());
        }
    }

    return url;
}

export function cachingProxy(func) {
    const cache = new Map();
    return new Proxy(func, {
        apply(target, thisArg, argArray) {
            let cached = cache.get(argArray[0]);
            if (cached) {
                return cached;
            }

            let result = Reflect.apply(target, thisArg, argArray);
            cache.set(argArray[0], result);

            return result;
        }
    });
}

export function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function dateTimeFormat(value, language) {
    let date = new Date(value);
    // let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
    let options = {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'};
    return new Intl.DateTimeFormat(language, options).format(date);
}

export function dateFormat(value, language) {
    let date = new Date(value);
    //let options = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    let options = {year: 'numeric', month: 'long', day: 'numeric'};
    return new Intl.DateTimeFormat(language, options).format(date);
}

export function distinct(items, extractor) {
    let distinctArray = [];
    for (let item of items) {
        let extracted = extractor(item);
        let find = distinctArray.find((element) => extractor(element) === extracted);
        if (!find) {
            distinctArray.push(item);
        }
    }
    return distinctArray;
}

export function debounce(func, wait, immediate, disable) {
    if (disable) {
        return func;
    }
    let timeout;
    return function () {
        const context = this, args = arguments;
        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export const mix = (superclass) => new MixinBuilder(superclass);

class MixinBuilder {
    constructor(superclass) {
        this.superclass = superclass;
    }

    with(...mixins) {
        return mixins.reduce((c, mixin) => mixin(c), this.superclass);
    }
}

export const Input = (superclass) => class InputMixin extends superclass {

    model = "";

    asyncValidators = [];
    syncValidators = [];

    errors = [];

    constructor() {
        super();

        this.addEventListener("model", debounce(this.asyncValidationHandler, 300));
        this.addEventListener("model", this.syncValidationHandler);
    }

    asyncValidationHandler() {
        if (this.asyncValidators.length > 0) {
            let results = [];
            for (const validator of this.asyncValidators) {
                let result = validator.validate(this)
                    .then((result) => {
                        let indexOf = this.errors.indexOf(result);
                        if (indexOf > -1) {
                            this.errors.splice(indexOf, 1);
                        }
                    })
                    .catch((reason) => {
                        let indexOf = this.errors.indexOf(reason);
                        if (indexOf === -1) {
                            this.errors.push(reason)
                        }
                    })
                results.push(result);
            }
        }
    }

    syncValidationHandler() {
        for (const validator of this.syncValidators) {
            let result = validator.validate(this);
            let errorName = Object.keys(result)[0];
            if (result[errorName]) {
                let indexOf = this.errors.indexOf(errorName);
                if (indexOf === -1) {
                    this.errors.push(errorName);
                }
            } else {
                let indexOf = this.errors.indexOf(errorName);
                if (indexOf > -1) {
                    this.errors.splice(indexOf, 1);
                }
            }
        }
    }

    get validity() {
        let validity = super.validity;

        return new Proxy(validity, {
            get: (target, p, receiver) => {
                if (this.errors.indexOf(p) > -1) {
                    return true;
                }
                if (validity) {
                    return target[p]
                }
                return undefined;
            },

            getOwnPropertyDescriptor: function (target, key) {
                return {enumerable: true, configurable: true};
            },

            ownKeys: (target) => {
                if (validity) {
                    return Object.keys(target).concat(this.errors);
                }
                return this.errors;
            }
        })
    }

    get isInput() {
        return true;
    }

    get valid() {
        return this.validity.valid && this.errors.length === 0;
    }

    get pristine() {
        let method = () => {
            return isEqual(this.model, this.defaultModel)
        }
        let resonator = (context, element) => {
            this.addEventListener("input", context)
        }
        return {method, resonator}
    }

    get dirty() {
        let method = () => {
            return ! this.pristine.method();
        }
        let resonator = (context, element) => {
            this.addEventListener("input", context)
        }
        return {method, resonator}
    }

    reset() {
        this.value = this.defaultValue;
        this.model = this.defaultModel;
        this.dispatchEvent(new Event("input"));
    }

    validate() {
        if (this.checkValidity) {
            if (! this.checkValidity()) {
                this.dispatchEvent(new Event("input"))
                return false;
            }
        }
        return true;
    }

    addAsyncValidator(value) {
        this.asyncValidators.push(value);
    }

    addSyncValidator(value) {
        this.syncValidators.push(value);
    }

};

function equals(lhs, rhs) {
    if (lhs instanceof Object && rhs instanceof Object) {
        lhs = lhs.resolve || lhs;
        rhs = rhs.resolve || rhs;
        return lhs === rhs;
    }
    return lhs === rhs;
}

export function isEqual(lhs, rhs) {
    return isEqualLeft(lhs, rhs) && isEqualLeft(rhs, lhs);
}

function isEqualLeft(lhs, rhs) {
    if (lhs instanceof Array && rhs instanceof Array) {
        if (lhs && rhs && lhs.length === rhs.length) {
            for (let i = 0; i < lhs.length; i++) {
                const lh = lhs[i];
                const rh = rhs[i];
                if (!isEqual(lh, rh)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    } else if (lhs instanceof Object && rhs instanceof Object) {
        let lhsProperties = Object.keys(lhs);

        for (let i = 0; i < lhsProperties.length; i++) {
            const lhsProperty = lhsProperties[i];

            if (lhsProperty !== "$schema") {
                if (!isEqual(lhs[lhsProperty], rhs[lhsProperty])) {
                    return false
                }
            }
        }

        return true;
    } else {
        return equals(lhs, rhs);
    }
}

export const evaluator = cachingProxy(function (arg) {
    return Function(arg)
})

export function getPropertyDescriptor(object, name) {
    if (object === null) {
        return null;
    }
    let result = Object.getOwnPropertyDescriptor(object, name);
    if (result) {
        return result;
    }
    return getPropertyDescriptor(Object.getPrototypeOf(object), name)
}

const data = new WeakMap();

export function generateDomProxy(node) {
    node.handlers = node.handlers || [];
    let dataObject = data.get(node);
    if (! dataObject) {
        dataObject = {}
        data.set(node, dataObject);
    }

    function generateWrapper(construct, property, descriptor, data) {
        delete construct[property];

        Object.defineProperty(data, property, descriptor);

        Object.defineProperty(construct, property, {
            configurable: true,
            enumerable: true,
            get() {
                let instance = Reflect.get(data, property);
                if ((instance && instance.isProxy) || (instance && instance instanceof WebSocket)) {
                    return instance;
                }
                return membraneFactory(instance, [{
                    proxy: construct, property: property
                }])
            },
            set(value) {
                let start = performance.now();
                if (value && value.isProxy) {
                    value = value.resolve;
                }
                Reflect.set(data, property, value)
                for (const eventHandler of node.handlers) {
                    if (eventHandler.scoped) {
                        if (eventHandler.path === property) {
                            eventHandler.handler(value);
                        }
                    } else {
                        if (eventHandler.path.startsWith(property)) {
                            eventHandler.handler(value);
                        }
                    }
                }
                if (appManager.mode === "development") {
                    console.log("latency : " + Math.round(performance.now() - start) + "ms" + " " + property)
                }
            }
        })
    }

    function $fire(value) {
        for (const eventHandler of node.handlers) {
            if (eventHandler.path === value.property) {
                eventHandler.handler(value.proxy);
            }
        }
    }

    function addEventHandler (options) {
        let name = options.property, handler = options.handler, element = options.element,
            scoped = options.scoped;

        if (node[name] instanceof Object && Reflect.has(node[name], "method") && Reflect.has(node[name], "resonator")) {
            let nodeElement = node[name];
            nodeElement.resonator(() => {
                handler(nodeElement.method());
            }, element);
        } else {
            let result = {
                node : node,
                path: name,
                handler: handler,
                element: element,
                scoped : scoped
            };
            node.handlers.push(result);

            element.addEventListener("removed", () => {
                let entry = node.handlers.find((entry) => entry.path === name && entry.handler === handler);
                if (entry) {
                    let indexOf = node.handlers.indexOf(entry);
                    node.handlers.splice(indexOf, 1)
                }
            })

            return result;
        }
    }

    function removeEventHandler(options) {
        let indexOf = node.handlers.indexOf(options);
        node.handlers.splice(indexOf, 1)
    }

    function setupProxy() {
        let descriptors = Object.getOwnPropertyDescriptors(node);
        for (const [property, descriptor] of Object.entries(descriptors)) {
            let privateGetter = Object.getOwnPropertyDescriptor(dataObject, property)
            if (! privateGetter) {
                let blackList = ["$fire", "addEventHandler", "removeEventHandler", "initialized", "handlers"];
                let blackListRegex = /\d+/;
                if (! blackList.includes(property) && ! blackListRegex.test(property)) {
                    generateWrapper(node, property, descriptor, dataObject);
                }
            }
        }
    }

    if (! Reflect.has(node, "$fire") && ! Reflect.has(node, "addEventHandler")) {
        Object.defineProperties(node, {
            $fire : {
                set(value) {
                    $fire(value)
                }
            },
            addEventHandler : {
                value : addEventHandler
            },
            removeEventHandler : {
                value : removeEventHandler
            }
        })
    }

    setupProxy();
}

export function queryComment(node) {
    let iterator = document.createNodeIterator(node, NodeFilter.SHOW_COMMENT);
    return iterator.nextNode();
}

export const Membrane = class Membrane {
    static track(membrane, options) {
        return membrane.addEventHandler(options);
    }
    static remove(options) {
        options.node.removeEventHandler(options);
    }
    static fire(membrane) {
        membrane.fire();
    }
}