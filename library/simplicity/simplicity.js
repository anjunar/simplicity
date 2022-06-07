import {register} from "./manager/view-manager.js";
import {codeGenerator, compiler, membraneFactory} from "./processors/html-compiler-processor.js";
import {appManager} from "./manager/app-manager.js";
import {contentManager} from "./manager/content-manager.js";
import {evaluator, isEqual} from "./services/tools.js";

/*
Element.prototype.remove = (function (_super) {
    return function () {
        _super.apply(this, [])
    }
})(Element.prototype.remove)
*/

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
const domParser = new DOMParser();

export const customComponents = new class CustomComponents {

    define(name, clazz, options) {

        let fragments = new WeakMap();
        let template;
        let i18nMessages = {};

        if (Reflect.has(clazz, "template")) {
            let html = domParser.parseFromString(clazz.template, "text/html");

            let templateHMTL = html.querySelector("template");
            template = codeGenerator(templateHMTL.content.children);

            if (clazz.components) {
                checker(clazz.components, template.content, name)
            }

            let css = html.querySelector("style");
            if (css) {
                document.head.appendChild(css);
            }

            let scriptElement = html.querySelector("script");
            if (scriptElement) {
                let textContent = scriptElement.textContent.replaceAll(/\s+/g, " ");
                let arg = `return function(context, args) {return ${textContent}}`;
                let rawMessagesFunction = evaluator(arg)()()
                let rawMessages = rawMessagesFunction();
                for (const rawMessage of rawMessages) {
                    let withoutSpaces = rawMessage["en"].replaceAll(" ", "");
                    let message = i18nMessages[withoutSpaces] = {}
                    message["de"] = rawMessage["de"];
                }
            }
        }

        function generateWrapper(construct, property, descriptor) {
            delete construct[property];

            Object.defineProperty(construct, "_" + property, descriptor);

            Object.defineProperty(construct, property, {
                configurable: true,
                enumerable: true,
                get() {
                    let instance = Reflect.get(construct, "_" + property);
                    if (instance && instance.isProxy) {
                        return instance;
                    }
                    return membraneFactory(instance, [{
                        proxy: construct, property: property
                    }])
                },
                set(value) {
                    Reflect.set(construct, "_" + property, value)
                    for (const eventHandler of construct.handlers) {
                        if (eventHandler.name === property) {
                            eventHandler.handler(value);
                        }
                    }
                }
            })
        }

        class SimplicityComponent extends clazz {

            initialized = false;
            handlers = [];

            get isComponent() {
                return true;
            }

            constructor() {
                super();
                this.setupProxy();
            }

            set $fire(value) {
                for (const eventHandler of this.handlers) {
                    if (eventHandler.name === value.property) {
                        eventHandler.handler(value.proxy);
                    }
                }
            }

            addEventHandler (name, element, handler) {
                this.handlers.push({
                    name: name,
                    handler: handler,
                    element: element
                });

                element.addEventListener("removed", () => {
                    let entry = this.handlers.find((entry) => entry.name === name && entry.handler === handler);
                    if (entry) {
                        let indexOf = this.handlers.indexOf(entry);
                        this.handlers.splice(indexOf, 1)
                    }
                })
            }

            setupProxy() {
                let descriptors = Object.getOwnPropertyDescriptors(this);
                for (const [property, descriptor] of Object.entries(descriptors)) {
                    let privateGetter = Object.getOwnPropertyDescriptor(this, "_" + property)
                    if (! privateGetter) {
                        if (property !== "handlers") {
                            generateWrapper(this, property, descriptor);
                        }
                    }
                }
            }

            i18n(text) {
                let method = () => {
                    let language = appManager.language;
                    if (language === "en") {
                        return text;
                    } else {
                        let withoutSpaces = text.replaceAll(" ", "");
                        let i18nMessage = i18nMessages[withoutSpaces];
                        if (i18nMessage) {
                            return i18nMessage[language]
                        } else {
                            console.warn("no translation found: " + text)
                        }
                        return text;
                    }
                }
                let resonator = (callback, element) => {

                }
                return {method, resonator}
            }

            connectedCallback() {
                if (! this.initialized && this.isConnected) {
                    this.initialized = true;
                    if (template) {
                        let activeContentTemplate = (implicit) => contentManager.instance(this, implicit)

                        if (Reflect.has(this, "preInitialize")) {
                            this.preInitialize();
                        }

                        let fragment = compiler(template, this, activeContentTemplate);

                        fragments.set(this, fragment);

                        this.appendChild(fragment);

                        fragment.update();
                    }

                    if (Reflect.has(this, "initialize")) {
                        this.initialize();
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

        return SimplicityComponent
    }

}

export const customViews = new class CustomViews {
    define(configuration) {

        register(configuration.name, configuration)

        return customComponents.define(configuration.name, configuration.class)
    }
}

function checker(jsImports, html, path) {
    if (html) {
        let components = [];

        function traverse(elements) {
            for (const element of elements) {
                if (element.localName.indexOf("-") > -1) {
                    let name = element.localName;
                    if (components.indexOf(name) === -1) {
                        components.push(name);
                    }
                }
                if (element.hasAttribute("is")) {
                    let name = element.getAttribute("is");
                    if (components.indexOf(name) === -1) {
                        components.push(name);
                    }
                }

                if (element instanceof HTMLTemplateElement) {
                    traverse(element.content.children)
                }

                traverse(element.children);
            }
        }

        traverse(html.children);

        let sortedComponents = components.sort();
        let sortedJsImports = jsImports.map(item => names.get(item)).sort();

        if (!isEqual(sortedComponents, sortedJsImports)) {
            let toMuch = sortedJsImports.filter((importz) => sortedComponents.indexOf(importz) === -1);
            let missing = sortedComponents.filter((component) => sortedJsImports.indexOf(component) === -1)

            console.log(`path: ${path} toMuch : ${toMuch.join(", ")} missing:  ${missing.join(", ")}`)
        }

    }
}