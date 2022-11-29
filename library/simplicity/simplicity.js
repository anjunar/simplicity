import {compileCss, compileHTML, proxyFactory} from "./interpreters/json-interpreter.js";
import {generateDomProxy, Membrane} from "./service/membrane.js";
import {register} from "./manager/view-manager.js";
import {loadHTML} from "./util/loader.js";

export const customComponents = new class CustomComponents {

    content;

    define(name, clazz, options) {

        let template = clazz.template;

        let i18nMessages;
        if (template?.i18n) {
            i18nMessages = template.i18n;
        }

        if (template) {
            if (typeof template === "string") {
                template = loadHTML(template);
            }
            if (template.css) {
                let styleElement = document.createElement("style");
                styleElement.innerHTML = compileCss(template.css, this);
                document.head.appendChild(styleElement);
            }
        }


        let component = class SimplicityComponent extends clazz {

            constructor(properties) {
                super();

                Object.assign(this, properties);

                generateDomProxy(this);

                if (this.preInitialize) {
                    this.preInitialize();
                }
            }

            render() {
                if (template) {
                    if (template.html) {
                        let context = proxyFactory({$scope : [this]});
                        let ast = template.html(context);
                        let documentFragment = compileHTML(this, ast, context);
                        this.appendChild(documentFragment);
                    }
                }
            }

            i18n(text) {
                let method = () => {
                    let language = this.app.language;
                    if (language === "en") {
                        return text;
                    } else {
                        let i18nMessage = i18nMessages.find(message => message.en === text.trim())
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
                if (super.connectedCallback) {
                    super.connectedCallback();
                }
                if (this.initialize) {
                    this.initialize();
                }
            }

            disconnectedCallback() {
                if (super.disconnectedCallback) {
                    super.disconnectedCallback();
                }
                if (this.destroy) {
                    this.destroy();
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

        };

        customElements.define(name, component, options)

        return component;
    }

}

export const customViews = new class CustomViews {
    define(configuration) {
        let component = customComponents.define(configuration.name, configuration.class);

        register(component, configuration)

        return component
    }
}


