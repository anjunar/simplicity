import {register} from "./manager/view-manager.js";
import {codeGenerator, compiler} from "./processors/html-compiler-processor.js";
import {appManager} from "./manager/app-manager.js";
import {contentManager} from "./manager/content-manager.js";
import {generateDomProxy, isEqual, Membrane} from "./services/tools.js";

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
        let html;

        if (Reflect.has(clazz, "template")) {
            html = domParser.parseFromString(clazz.template, "text/html");

            let templateHMTL = html.querySelector("template");
            template = codeGenerator(templateHMTL.content.children);

            if (appManager.mode === "development") {
                if (Reflect.has(clazz, "components")) {
                    checker(clazz.components, templateHMTL.content, name)
                }
            }

            if (! appManager.shadowDom) {
                let css = html.querySelector("style");
                if (css) {
                    document.head.appendChild(css);
                }
            }

            let i18nElement = html.querySelector("i18n");
            if (i18nElement) {
                for (const translationElement of i18nElement.children) {
                    let en = translationElement.querySelector("en");
                    let string = en.innerHTML
                        .trim()
                        .replace(/ +/g, " ")
                        .replace(/\n+/g, "")
                    let message = i18nMessages[string] = {}
                    for (const languageElement of translationElement.children) {
                        message[languageElement.localName] = languageElement.innerHTML.trim();
                    }
                }
            }
        }

        class SimplicityComponent extends clazz {

            initialized = false;
            handlers = [];

            get isComponent() {
                return true;
            }

            i18n(text) {
                let method = () => {
                    let language = this.app.language;
                    if (language === "en") {
                        return text;
                    } else {
                        let i18nMessage = i18nMessages[text];
                        if (i18nMessage) {
                            return i18nMessage[language]
                        } else {
                            console.warn("no translation found: " + text)
                        }
                        return text;
                    }
                }
                let resonator = (callback, element) => {
                    Membrane.track(this.app, {
                        property : "language",
                        element : element,
                        handler : callback
                    })
                }
                return {method, resonator}
            }

            connectedCallback() {
                if (! this.initialized) {
                    generateDomProxy(this);
                    this.initialized = true;
                    if (template) {
                        let activeContentTemplate = (implicit) => contentManager.instance(this, implicit)

                        if (Reflect.has(this, "preInitialize")) {
                            this.preInitialize();
                        }

                        let fragment = compiler(template, this, activeContentTemplate, null, this.app || this);

                        fragments.set(this, fragment);

                        if (appManager.shadowDom) {
                            let shadowRoot = this.attachShadow({mode : "open"});
                            shadowRoot.appendChild(fragment);

                            if (Reflect.has(clazz, "template")) {
                                let css = html.querySelector("style");
                                if (css) {
                                    css.innerHTML = css.innerHTML.replaceAll(name, ":host")
                                    shadowRoot.appendChild(css);
                                }
                            }
                        } else {
                            this.appendChild(fragment);
                        }
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

            console.warn(`path: ${path} toMuch : ${toMuch.join(", ")} missing:  ${missing.join(", ")}`)
        }

    }
}