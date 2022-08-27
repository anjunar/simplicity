import {evaluation} from "../processors/js-compiler-processor.js";
import {customPlugins} from "../processors/html-compiler-processor.js";

export function buildStrategie(ast, element, imported = false) {
    if (imported) {
        return ast.import(element)
    } else {
        return ast.build(element)
    }
}

export function rawAttributes(node) {
    return Array.from(node.attributes).map((attribute) => `"${attribute.name}=${attribute.value}"`);
}

export function attributes(node) {
    let names = customPlugins.names();
    return Array.from(node.attributes)
        .filter((attribute) => ! names.includes(attribute.name))
        .map((attribute => {
            if (attribute.name.startsWith("read")) {
                return `bindOnceStatement("${attribute.name}", "${attribute.value}", context)`
            }
            if (attribute.name.startsWith("bind") || attribute.name === "i18n") {
                return `bindStatement("${attribute.name}", "${attribute.value}", context)`
            }
            return `"${attribute.name}=${attribute.value}"`
        })).join(",")
}

export function getAttributes(attributes, observed) {
    let attributeValues = {};
    for (const attribute of attributes) {
        let indexOf = attribute.indexOf("=");
        let attributePair = [attribute.substr(0, indexOf), attribute.substr(indexOf + 1)]
        if (attribute.startsWith("bind") || attribute.startsWith("read")) {
            let string = attributePair[0].split(":")[1];
            if (observed.indexOf(string) > -1) {
                attributeValues[string] = {
                    name: string,
                    type: attribute.startsWith("bind") ? "bind" : "read",
                    value: attributePair[1]
                }
            }
        } else {
            attributeValues[attributePair[0]] = {
                name: attributePair[0],
                type: "raw",
                value: attributePair[1]
            }
        }
    }
    return attributeValues;
}

export function boundAttributes(attributes, context) {
    function values() {
        let attributeValues = {};
        for (let attribute of Object.values(attributes)) {
            if (attribute.type === "bind") {
                attributeValues[attribute.name] = evaluation(attribute.value, context)
            } else if (attribute.type === "read"){
                attributeValues[attribute.name] = evaluation(attribute.value, context, null, true)
            } else {
                attributeValues[attribute.name] = attribute.value
            }
        }
        return attributeValues;
    }

    return values;
}

export function isCompositeComponent(node) {
    if (node.localName.indexOf("-") > -1) {
        let component = customElements.get(node.localName);
        if (Reflect.has(component, "template")) {
            return true;
        }
    }
    if (node.hasAttribute("is")) {
        let component = customElements.get(node.getAttribute("is"));
        if (Reflect.has(component, "template")) {
            return true;
        }
    }
    return false;
}

export function notifyElementRemove(element) {
    let iterator = document.createNodeIterator(element, NodeFilter.SHOW_ALL)
    let node = iterator.nextNode();
    while (node !== null) {
        node.dispatchEvent(new CustomEvent("removed"))
        node = iterator.nextNode();
    }
}


