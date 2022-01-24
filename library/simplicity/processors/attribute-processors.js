import {evaluation} from "./js-compiler-processor.js";
import {isEqual} from "../simplicity.js";
import {appManager} from "../manager/app-manager.js";

class BindInterpolationProcessor {
    element;
    matched = false;
    processor;

    constructor(name, value, element, context) {
        this.element = element;

        let interpolationRegExp = /\${([^}]+)}/g;

        let result = interpolationRegExp.exec(value);
        if (result) {
            this.matched = true;
            let variable = result[1];

            let value1 = evaluation(variable, context);
            value = value.replace(interpolationRegExp, value1);

            for (const AttributeProcessor of attributeProcessorRegistry) {
                this.processor = new AttributeProcessor(name, value, element, context);
                if (this.processor.matched) {
                    break;
                } else {
                    this.processor = null
                }
            }

        }
    }

    process() {
        this.processor.process();
    }
}

class StyleAttributeProcessor {
    name;
    value;
    element;
    context;
    matched = false;
    runOnce = false;

    constructor(name, value, element, context) {
        this.context = context;
        this.element = element;
        this.name = name;
        this.value = value;

        let result = name === "bind:style"
        if (result) {
            this.matched = true;
            this.process();
        }
    }

    process() {
        let cssExpressions = this.value.split(";");
        for (const cssExpression of cssExpressions) {
            let indexOf = cssExpression.indexOf(":");
            let key = cssExpression.substring(0, indexOf).trim();
            let value = cssExpression.substring(indexOf + 1, cssExpression.length).trim()

            let keyString = "";
            let last = ""
            for (const char of key) {
                if (last === "-") {
                    keyString += char.toUpperCase()
                } else {
                    if (char !== "-") {
                        keyString += char;
                    }
                }
                last = char;
            }

            let cssValue = evaluation(value, this.context);
            this.element.style[keyString] = cssValue;
        }
    }
}

class ClassAttributeProcessor {

    name;
    value;
    element;
    context;
    matched = false;
    runOnce = false;

    constructor(name, value, element, context) {
        this.context = context;
        this.element = element;
        this.name = name;
        this.value = value;

        let result = name === "bind:class"
        if (result) {
            this.matched = true;
            this.process();
        }
    }

    process() {
        let classList = this.value.split(";");
        let result = [];
        for (const classListElement of classList) {
            result.push(evaluation(classListElement.trim(), this.context));
        }
        this.element.className = result.join(" ");
    }
}

class EventAttributeProcessor {
    name;
    value;
    element;
    context;
    matched = false;
    runOnce = true;

    constructor(name, value, element, context) {
        this.context = context;
        this.element = element;
        this.name = name;
        this.value = value;

        let regex = /bind:on(\w+)/g;
        let result = regex.exec(name);
        if (result) {
            this.matched = true;
            this.name = result[1];
            this.process();
        }
    }

    process() {
        this.element.addEventListener(this.name, ($event) => {
            evaluation(this.value, this.context, {$event: $event})
        })
    }
}

class DynamicBindingAttributeProcessor {
    name;
    value;
    element;
    context;
    matched = false;
    type;
    runOnce = false;
    oldValue = null;

    constructor(name, value, element, context) {
        this.context = context;
        this.element = element;
        this.value = value;
        this.name = name.split(":")[1]

        let observedBindAttributes = element.constructor.observedBindAttributes;
        if (observedBindAttributes) {
            let find = observedBindAttributes.find((type) => type.name === this.name);

            if (find) {
                this.matched = true;
                this.type = find.type;
                this.process();
                if (this.type === "two-way") {
                    this.element.addEventListener(this.name, (event) => {
                        let $value = event.target[this.name]
                        let expression = value + " = " + "$value"
                        evaluation(expression, context, {$value: $value})
                    })
                }
            }
        }
    }

    process() {
        let result = evaluation(this.value, this.context);
        if (this.element.attributeChangedCallback) {
            if (!isEqual(this.oldValue, result)) {
                this.element.attributeChangedCallback(this.name, this.oldValue, result);
                if (result instanceof Array) {
                    this.oldValue = Array.from(result);
                } else {
                    this.oldValue = result;
                }
            }
        }
    }
}

class DomAttributesProcessor {
    name;
    value;
    element;
    context;
    matched = false;
    type;
    runOnce = false;
    oldValue = null;


    constructor(name, value, element, context) {
        this.context = context;
        this.element = element;
        this.value = value;
        this.name = name.split(":")[1]

        switch (this.name) {
            case "colspan" : {
                this.name = "colSpan";
            }
                break;
            case "innerhtml" : {
                this.name = "innerHTML"
            } break
            default : {
            }
                ;
        }

        if (Reflect.has(this.element, this.name)) {
            this.matched = true;
            this.process();
        }
    }

    process() {
        let result = evaluation(this.value, this.context);
        if (this.element[this.name] !== result) {
            this.element[this.name] = result;
        }
    }
}

class i18nAttributeProcessor {
    name;
    value;
    element;
    context;
    matched = false;
    text;
    lastLanguage;
    runOnce = false;

    constructor(name, value, element, context) {
        this.context = context;
        this.element = element;
        this.name = name;
        this.value = value;
        if (name === "i18n") {
            this.matched = true;
            this.text = element.innerHTML.trim()
                .replaceAll(/\s+/g, " ")
                .replace(/&lt;/g,'<')
                .replace(/&gt;/g,'>')
                .replace(/&amp;/g,'&');
            this.process();
        }
    }

    process() {
        let language = appManager.language;

        if (language !== this.lastLanguage) {
            if (language === "en") {
                this.element.innerHTML = this.text;
            } else {
                let context = this.context.variable("i18n");
                let text = context.i18n(this.text, this.value);
                this.element.innerHTML = text;
            }

            this.lastLanguage = language;
        }
    }
}

export const attributeProcessorRegistry = [
    BindInterpolationProcessor,
    StyleAttributeProcessor,
    ClassAttributeProcessor,
    EventAttributeProcessor,
    DynamicBindingAttributeProcessor,
    DomAttributesProcessor,
    i18nAttributeProcessor
];

