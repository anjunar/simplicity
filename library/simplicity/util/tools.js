Node.prototype.queryUpwards = function (callback) {
    if (callback(this)) {
        return this;
    } else {
        if (this.parentElement === null) {
            let rootNode = this.getRootNode();
            if (rootNode) {
                if (rootNode.host) {
                    return rootNode.host.queryUpwards(callback);
                }
                return null;
            }
            return null;
        }
        return this.parentElement.queryUpwards(callback);
    }
}

Node.prototype.querySelector = function(selector) {
    return this.querySelectorAll(selector)[0];
}

Node.prototype.querySelectorAll = function(selector) {
    const node = this, nodes = [...node.querySelectorAll(selector)], nodeIterator = document.createNodeIterator(node, Node.ELEMENT_NODE);
    let currentNode;
    while (currentNode = nodeIterator.nextNode()) {
        if(currentNode.shadowRoot) {
            nodes.push(...currentNode.shadowRoot.querySelectorAll(selector));
        }
    }
    return nodes;
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

export function notifyElementRemove(element) {
    let iterator = document.createNodeIterator(element, NodeFilter.SHOW_ALL)
    let node = iterator.nextNode();
    while (node !== null) {
        node.dispatchEvent(new CustomEvent("removed"))
        node = iterator.nextNode();
    }
}

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

export const evaluator = cachingProxy(function (arg) {
    return Function(arg)
})

export function toCamelCase(text) {
    return text.replace(/-\w/g, function (text) {
        return text.replace(/-/, "").toUpperCase();
    });
}

export function toKebabCase(str) {
    return str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? "-" : "") + $.toLowerCase())
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
        let validity = super.validity || { valid : true };

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
