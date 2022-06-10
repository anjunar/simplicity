import {lifeCycle} from "../processors/life-cycle-processor.js";
import {membraneFactory} from "../processors/html-compiler-processor.js";

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

            Promise.all(results)
                .then(() => {
                    lifeCycle();
                })
                .catch(() => {
                    lifeCycle();
                })
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
            return isEqual(this.value, this.defaultValue)
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
        this.dispatchEvent(new Event("input"));
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

            if (!isEqual(lhs[lhsProperty], rhs[lhsProperty])) {
                return false
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

export function getPropertyDescriptor(name, object) {
    let result = Object.getOwnPropertyDescriptor(object, name);
    if (result) {
        return result;
    }
    return getPropertyDescriptor(name, Object.getPrototypeOf(object))
}

const data = new WeakMap();

export function generateDomProxy(element) {
    let dataObject = data.get(element);
    if (! dataObject) {
        dataObject = {
            handlers : []
        }
        data.set(element, dataObject);
    }

    function generateWrapper(construct, property, descriptor, data) {
        delete construct[property];

        Object.defineProperty(data, property, descriptor);

        Object.defineProperty(construct, property, {
            configurable: true,
            enumerable: true,
            get() {
                let instance = Reflect.get(data, property);
                if (instance && instance.isProxy) {
                    return instance;
                }
                return membraneFactory(instance, [{
                    proxy: construct, property: property
                }])
            },
            set(value) {
                Reflect.set(data, property, value)
                for (const eventHandler of dataObject.handlers) {
                    if (eventHandler.name === property) {
                        eventHandler.handler(value);
                    }
                }
            }
        })
    }

    function $fire(value) {
        for (const eventHandler of dataObject.handlers) {
            if (eventHandler.name === value.property) {
                eventHandler.handler(value.proxy);
            }
        }
    }

    function addEventHandler (name, element, handler) {
        dataObject.handlers.push({
            name: name,
            handler: handler,
            element: element
        });

        if (dataObject.handlers.filter(item => item.name === name).length > 50) {
            console.warn(`possibly handlers memory leak ${dataObject.handlers.length} ${name}`)
        }

        element.addEventListener("removed", () => {
            let entry = dataObject.handlers.find((entry) => entry.name === name && entry.handler === handler);
            if (entry) {
                let indexOf = dataObject.handlers.indexOf(entry);
                dataObject.handlers.splice(indexOf, 1)
            }
        })
    }

    function setupProxy() {
        let descriptors = Object.getOwnPropertyDescriptors(element);
        for (const [property, descriptor] of Object.entries(descriptors)) {
            let privateGetter = Object.getOwnPropertyDescriptor(dataObject, property)
            if (! privateGetter) {
                let blackList = ["$fire", "addEventHandler", "initialized"];
                if (! blackList.includes(property)) {
                    generateWrapper(element, property, descriptor, dataObject);
                }
            }
        }
    }

    if (! Reflect.has(element, "$fire") && ! Reflect.has(element, "addEventHandler")) {
        Object.defineProperties(element, {
            $fire : {
                set(value) {
                    $fire(value)
                }
            },
            addEventHandler : {
                value : addEventHandler
            }
        })
    }

    setupProxy();
}