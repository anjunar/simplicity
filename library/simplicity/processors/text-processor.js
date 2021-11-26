import {compiler} from "./js-compiler-processor.js";
import {findProperty} from "../simplicity.js";

export class TextProcessor {

    element;
    childNode;
    textContent;

    constructor(element, childNode) {
        this.element = element;
        this.childNode = childNode;
        this.textContent = childNode.textContent;
        this.process();
    }

    process() {
        let interpolationRegExp = /\${([^}]+)}/g;

        let scopes = [];

        let text = this.textContent.replace(interpolationRegExp, (match, expressions) => {

            expressions = compiler(expressions, (property) => {
                scopes.push(findProperty(property, this.element.template, this.element));
                let index = scopes.length - 1;
                return `scopes[${index}].${property}`
            });

            return "${" + expressions + "}"
        });

        this.childNode.textContent = eval("`" + text + "`");
    }
}

