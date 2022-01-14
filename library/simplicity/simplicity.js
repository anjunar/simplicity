import {register} from "./manager/view-manager.js";
import {codeGenerator, compiler, membraneFactory} from "./processors/html-compiler-processor.js";
import {appManager} from "./manager/app-manager.js";
import {contentManager} from "./manager/content-manager.js";

Object.prototype.equals = function (lhs, rhs) {
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
                if (! Object.equals(lh,rh)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    } else if (lhs instanceof Object && rhs instanceof Object) {
        let lhsProperties = Object.keys(lhs);
        let rhsProperties = Object.keys(rhs);
        if (lhsProperties.length === 0 && rhsProperties.length === 0) {
            return true;
        }
        for (let i = 0; i < lhsProperties.length; i++) {
            const lhsProperty = lhsProperties[i];
            const rhsProperty = rhsProperties[i];

            if (! isEqual(lhs[lhsProperty], rhs[rhsProperty])) {
                return false
            }
        }

        return true;
    } else {
        return Object.equals(lhs, rhs);
    }
}

Node.prototype.queryUpwards = function (callback) {
    if (callback(this)) {
        return this;
    } else {
        if (this.parentElement === null) {
            return null;
        }
        return this.parentElement.queryUpwards(callback);
    }
}

const names = new Map();

export const customComponents = new class CustomComponents {

    define(name, clazz, options) {

        let asts = new WeakMap();
        let contents = [];
        let html = clazz.template;
        let template;
        let i18nMessages = {};

        if (html) {
            let templateHMTL = html.querySelector("template");
            template = codeGenerator(templateHMTL.content.children);

            let css = html.querySelector("style");
            if (css) {
                document.head.appendChild(css);
            }

            let scriptElement = html.querySelector("script");
            if (scriptElement) {
                let textContent = scriptElement.textContent.replaceAll(/\s+/g, " ");
                let rawMessagesFunction = eval("(" + textContent + ")")
                let rawMessages = rawMessagesFunction();
                for (const rawMessage of rawMessages) {
                    let message = i18nMessages[rawMessage["en"]] = {}
                    message["de"] = rawMessage["de"];
                }
            }
        }

        class SimplicityComponent extends clazz {

            initialized = false;

            constructor() {
                super();
            }

            i18n(text) {
                let language = appManager.language;
                if (language === "en") {
                    return text;
                } else {
                    let i18nMessage = i18nMessages[text];
                    if (i18nMessage) {
                        return i18nMessage[language]
                    }
                    return text;
                }
            }

            cycle() {
                for (const content of contents) {
                    for (const astElement of content.ast) {
                        astElement.update();
                    }
                }
                let ast = asts.get(this);
                if (ast) {
                    for (const segment of ast) {
                        segment.update();
                    }
                }
            }

            attributeChangedCallback(name, oldValue, newValue) {
                if (!isEqual(oldValue, newValue)) {
                    this.attributesChanged = true;
                    super.attributeChangedCallback(name, oldValue, newValue)
                }
            }

            connectedCallback() {
                if (! this.initialized && this.isConnected) {
                    this.initialized = true;
                    if (template) {
                        let activeContentTemplate = (implicit) => {
                            let instance = contentManager.instance(this, implicit);
                            contents.push(instance);
                            return instance;
                        }

                        if (Reflect.has(this, "preInitialize")) {
                            membraneFactory(this).preInitialize();
                        }

                        let container = compiler(template, this, activeContentTemplate);

                        asts.set(this, container.ast);

                        this.appendChild(container);
                    }

                    if (Reflect.has(this, "initialize")) {
                        membraneFactory(this).initialize();
                    }
                }
            }

            disconnectedCallback() {
                if (this.initialized) {
                    if (super.destroy) {
                        super.destroy();
                    }
                }
            }

            static get observedAttributes() {
                if (super.observedAttributes) {
                    let observedAttributes = super.observedAttributes;
                    return observedAttributes.map((attribute => attribute.name))
                } else {
                    return [];
                }
            }

            static get observedBindAttributes() {
                if (super.observedAttributes) {
                    return super.observedAttributes;
                } else {
                    return [];
                }
            }


        }

        customElements.define(name, SimplicityComponent, options)
        names.set(SimplicityComponent, name);

        return SimplicityComponent;
    }

}

export const customViews = new class CustomViews {
    define(configuration) {

        register(configuration.name, configuration)

        return customComponents.define(configuration.name, configuration.class)
    }
}
