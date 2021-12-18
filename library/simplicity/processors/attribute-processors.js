import {evaluation} from "./js-compiler-processor.js";
import {isEqual} from "../simplicity.js";
import {appManager} from "../manager/app-manager.js";

class BindInterpolationProcessor {
    attribute;
    element;
    matched = false;

    constructor(attribute, element) {
        this.attribute = attribute;
        this.element = element;

        let interpolationRegExp = /\${([^}]+)}/g;

        let result = interpolationRegExp.exec(this.attribute.value);
        if (result) {
            this.matched = true;
            let variable = result[1];

            let value = evaluation(variable, this.element);
            let replace = attribute.value.replace(interpolationRegExp, value);
            attribute.value = replace;
        }
    }

    process() {}
}

class StyleAttributeProcessor {
    attribute;
    element;
    matched = false;
    runOnce = false;

    constructor(attribute, element) {
        this.attribute = attribute;
        this.element = element;

        let result = attribute.name === "bind:style"
        if (result) {
            this.matched = true;
            this.process();
        }
    }

    process() {
        let cssExpressions = this.attribute.value.split(";");
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

            try {
                this.element.style[keyString] = evaluation(value, this.element);
            } catch (e) {
                this.runOnce = true;
            }
        }
    }
}

class ClassAttributeProcessor {

    attribute;
    element;
    matched = false;
    runOnce = false;

    constructor(attribute, element) {
        this.attribute = attribute;
        this.element = element;

        let result = attribute.name === "bind:class"
        if (result) {
            this.matched = true;
            this.process();
        }
    }

    process() {
        try {
            let classList = this.attribute.value.split(";");
            let result = [];
            for (const classListElement of classList) {
                result.push(evaluation(classListElement.trim(), this.element));
            }
            this.element.className = result.join(" ");
        } catch (e) {
            this.runOnce = true
        }
    }
}

class EventAttributeProcessor {
    attribute;
    element;
    matched = false;
    name;
    runOnce = true;

    constructor(attribute, element) {
        this.attribute = attribute;
        this.element = element;

        let regex = /bind:on(\w+)/g;
        let result = regex.exec(attribute.name);
        if (result) {
            this.matched = true;
            this.name = result[1];
            this.process();
        }
    }

    process() {
        this.element.addEventListener(this.name, ($event) => {
            evaluation(this.attribute.value, this.element, {$event: $event})
        })
    }
}

class DynamicBindingAttributeProcessor {
    attribute;
    element;
    matched = false;
    name;
    type;
    runOnce = false;
    oldValue = null;

    constructor(attribute, element) {
        this.attribute = attribute;
        this.element = element;
        this.name = attribute.name.split(":")[1]

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
                        let expression = attribute.value + " = " + "$value"
                        evaluation(expression, element, {$value: $value})
                    })
                }
            }
        }
    }

    process() {
        try {
            let result = evaluation(this.attribute.value, this.element);
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
        } catch (e) {
            this.runOnce = true
        }
    }
}

class DomAttributesProcessor {
    attribute;
    element;
    matched = false;
    name;
    type;
    runOnce = false;
    oldValue = null;


    constructor(attribute, element) {
        this.attribute = attribute;
        this.element = element;
        this.name = attribute.name.split(":")[1]

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
        try {
            let element = this.element;
            let result = evaluation(this.attribute.value, element);
            if (this.element[this.name] !== result) {
                this.element[this.name] = result;
            }
        } catch (e) {
            this.runOnce = true;
        }
    }
}

class i18nAttributeProcessor {
    attribute;
    element;
    matched = false;
    text;
    lastLanguage;

    constructor(attribute, element) {
        this.attribute = attribute;
        this.element = element;
        if (this.attribute.name === "i18n") {
            this.matched = true;
            this.text = element.textContent.trim().replaceAll(/\s+/g, " ");
            this.process();
        }
    }

    process() {
        let language = appManager.language;

        if (language !== this.lastLanguage) {
            if (language === "en") {
                this.element.textContent = this.text;
            } else {
                let text = this.element.template.i18n(this.text, this.attribute.value);
                this.element.textContent = text;
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

