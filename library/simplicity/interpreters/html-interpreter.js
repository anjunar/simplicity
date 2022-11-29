import {addContext} from "./js-interpreter.js";
import {bind, interpolation, variable} from "./json-interpreter.js";
import {generate} from "../../astring/astring.js";
import {parse} from "../../acorn/index.js";
import {toCamelCase} from "../util/tools.js";

function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE;
}

function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
}

function isPassiveInterpolation(node) {
    let regExp = /{{{([^}]+)}}}/g;
    return regExp.test(node.textContent);
}

function isActiveInterpolation(node) {
    let regExp = /{{([^}]+)}}/g;
    return regExp.test(node.textContent);
}

function isSpecialElement(node) {
    return node.parentElement instanceof HTMLIFrameElement || node.parentElement instanceof HTMLScriptElement
}

function findAttributePlugin(attribute) {
    for (const plugin of plugins) {
        if (plugin.destination === "Attribute" && plugin.name.includes(attribute.name)) {
            if (!attribute.processed) {
                attribute.processed = true;
                return plugin;
            }
        }
    }
    return null;
}

function findElementPlugin(element) {
    for (const plugin of plugins) {
        if (plugin.destination === "Element" && plugin.name.includes(element.localName)) {
            if (!element.processed) {
                element.processed = true
                return plugin;
            }
        }
    }
    return null;
}

const slotStatement = {
    name: ["slot"],
    destination: "Element",
    code(node, iterateChildren, processNode, isSvg) {
        let objects = [`type : "slot"`, `context : context`];

        let whiteList = ["implicit", "source", "selector", "tag", "name", "index"];

        for (const property of whiteList) {

            let constant = node.getAttribute(property);
            if (constant) {
                objects.push(`${property} : "${constant}"`);
            }

            let read = node.getAttribute("read:" + property);
            if (read) {
                objects.push(`${property} : ${addContext(read)}`);
            }

            let bind = node.getAttribute("bind:" + property);
            if (bind) {
                objects.push(`${property} : bind(context, "${bind}")`);
            }

        }

        return `{ ${objects.join(", ")} }`;
    }
}

const letStatement = {
    name: ["let"],
    destination: "Attribute",
    code(node, iterateChildren, processNode, isSvg) {
        let value = node.getAttribute("let");
        return `letStatement(implicit, context, "${value}", (context) => { return ${processNode(node, isSvg)} } )`
    }
}

const variableStatement = {
    name: ["read:variable"],
    destination: "Attribute",
    code(node, iterateChildren, processNode, isSvg) {
        let value = node.getAttribute("read:variable");
        return `{ type : "variable", value : "${value}", context : context, node : ${processNode(node, isSvg)} }`
    }
}

const ifStatement = {
    name: ["bind:if", "read:if"],
    destination: "Attribute",
    code(node, iterateChildren, processNode, isSvg) {
        let expression = node.getAttribute("read:if") || node.getAttribute("bind:if");

        if (node.hasAttribute("read:if")) {
            return `{ type : "if", predicate : ${addContext(expression)}, callback() { return ${processNode(node, isSvg)} } }`
        } else {
            return `{ type : "if", predicate : bind(context, "${expression}"), callback() { return ${processNode(node, isSvg)} } }`
        }
    }
}

const forEachStatement = {
    name: ["bind:for", "read:for"],
    destination: "Attribute",
    code(node, iterateChildren, processNode, isSvg) {
        let expressions = node.getAttribute("read:for") || node.getAttribute("bind:for");
        let expressionSegments = expressions.split(";");

        let forOptions = expressionSegments.reduce((previousValue, segment, index) => {
            if (index === 0) {
                let forSegment = "for(" + segment + ") {}";
                let ast = parse(forSegment, {ecmaVersion: 2022});
                let bodyElement = ast.body[0];
                let forItems = generate(bodyElement.right, {lineEnd: ""});
                let id = bodyElement.left.declarations[0].id;
                let forItem;
                if (id.type === "ArrayPattern") {
                    forItem = [id.elements[0].name, id.elements[1].name];
                } else {
                    forItem = id.name
                }
                previousValue["forEach"] = {
                    items: forItems,
                    item: forItem
                }
                return previousValue
            } else {
                let ast = parse(segment, {ecmaVersion: 2022});
                let bodyElement = ast.body[0];
                if (bodyElement.type === "VariableDeclaration") {
                    let declaration = bodyElement.declarations[0];
                    let id = declaration.id.name;
                    let init = declaration.init.name;
                    previousValue[init] = id;
                    return previousValue;
                } else {
                    let left = bodyElement.expression.left.name;
                    previousValue[left] = generate(bodyElement.expression.right, {lineEnd: ""});
                    return previousValue;
                }
            }
        }, {});

        let objects = [`type : "forEach"`, `context : context`];
        if (node.hasAttribute("read:for")) {
            objects.push(`items : ${addContext(forOptions.forEach.items)}`)
        } else {
            objects.push(`items : bind(context, "${forOptions.forEach.items}")`)
        }

        if (forOptions.forEach.item instanceof Array) {
            objects.push(`item : [${forOptions.forEach.item.map(item => `"${item}"`).join(", ")}]`)
        } else {
            objects.push(`item : "${forOptions.forEach.item}"`)
        }

        if (forOptions.index) {
            objects.push(`index : "${forOptions.index}"`)
        }
        if (forOptions.length) {
            objects.push(`length : "${forOptions.length}"`)
        }
        if (forOptions.onRendered) {
            objects.push(`onRendered : "${forOptions.onRendered}"`)
        }

        objects.push(`callback: function (context) { return ${processNode(node, isSvg)} }`)
        return "{ " + objects.join(", ") + "}"
    }
};

const switchStatement = {
    name: ["switch"],
    destination: "Element",
    code(node, iterateChildren, processNode, isSvg) {
        let expression = node.getAttribute("bind:value") || node.getAttribute("read:value");

        let objects = [`type : "switch"`];

        if (node.hasAttribute("read:value")) {
            objects.push(`value : ${addContext(expression)}`)
        } else {
            objects.push(`value : bind(context, "${expression}")`)
        }

        objects.push(`cases : [${iterateChildren(node.children, isSvg)}]`)

        return `{ ${objects.join(", ")} }`
    }
}

const caseStatement = {
    name: ["case"],
    destination: "Element",
    code(node, iterateChildren, processNode, isSvg) {
        let expression = node.getAttribute("value") || node.getAttribute("read:value") || node.getAttribute("bind:value")

        let objects = [`type : "case"`]

        if (node.hasAttribute("value")) {
            objects.push(`value : "${expression}"`)
        }
        if (node.hasAttribute("read:value")) {
            objects.push(`value : ${addContext(expression)}`)
        }
        if (node.hasAttribute("bind:value")) {
            objects.push(`value : bind(context, "${expression}")`)
        }


        objects.push(`callback() { return ${processNode(node, isSvg)} }`)

        return `{ ${objects.join(", ")} }`
    }
}

const plugins = [forEachStatement, ifStatement, slotStatement, letStatement, switchStatement, caseStatement, variableStatement];

const styleAttribute = {
    name() {
        return /^style$/g
    },
    process(attribute, name, previousValue, callback) {
        let value = attribute.value;
        let segments = value.split(";").filter(elem => elem.length > 0);
        previousValue["style"] = segments.reduce((previousValue, currentValue) => {
            let indexOf = currentValue.indexOf(":")
            let cssSegments = [currentValue.substring(0, indexOf), currentValue.substring(indexOf + 1)];
            let key = toCamelCase(cssSegments[0].trim());
            previousValue[key] = callback(cssSegments[1].trim());
            return previousValue;
        }, previousValue["style"] || {});
        return previousValue;
    }
}

const classAttribute = {
    name() {
        return /^class$/g
    },
    process(attribute, name, previousValue, callback) {
        let value = attribute.value;
        let segments;
        if (attribute.name.startsWith("bind") || attribute.name.startsWith("read")) {
            segments = value.split(";");
        } else {
            segments = value.split(" ");
        }
        previousValue["class"] = segments.reduce((previousValue, currentValue) => {
            previousValue.push(callback(currentValue.trim()));
            return previousValue;
        }, previousValue["class"] || []);
        return previousValue;
    }
}

const eventAttribute = {
    name() {
        return /^on(\w+)$/g
    },
    readOnly: true,
    process(attribute, name, previousValue, callback) {
        let eventName = attribute.name.substring(5);
        let value = attribute.value;
        previousValue[eventName] = `($event) => {${callback(value)};}`
        return previousValue;
    }
}

const dynamicAttribute = {
    name(attribute) {
        return {
            test(value) {
                let constructor;
                if (attribute.ownerElement.hasAttribute("is")) {
                    constructor = customElements.get(attribute.ownerElement.getAttribute("is"));
                } else {
                    constructor = customElements.get(attribute.ownerElement.localName);
                }
                if (constructor) {
                    let observedAttributes = constructor.observedAttributes;
                    if (observedAttributes) {
                        return observedAttributes.find(attribute => attribute === value)
                    }
                    return false;
                }
            }
        }
    },
    process(attribute, name, previousValue, callback) {
        let value = attribute.value;
        previousValue[name] = callback(value);
        return previousValue;
    }
}

const domAttribute = {
    name(attribute) {
        return {
            test(value) {
                let ownerElement = attribute.ownerElement;
                switch (value) {
                    case "contenteditable" :
                        return Reflect.has(ownerElement, "contentEditable");
                    case "innerhtml" :
                        return Reflect.has(ownerElement, "innerHTML");
                    case "colspan" :
                        return Reflect.has(ownerElement, "colSpan");
                    default :
                        return Reflect.has(ownerElement, value);
                }

            }
        }
    },
    process(attribute, name, previousValue, callback) {
        let value = attribute.value;

        switch (name) {
            case "contenteditable" : {
                previousValue.contentEditable = callback(value);
            }
                break
            case "innerhtml" : {
                previousValue.innerHTML = callback(value);
            }
                break;
            case "colspan" : {
                previousValue.colSpan = callback(value);
            }
                break;
            default : {
                previousValue[name] = callback(value);
            }
                break;
        }

        return previousValue;
    }
}

const i18nAttribute = {
    name(attribute) {
        return /^i18n$/;
    },
    process(attribute, name, previousValue, callback) {
        previousValue.i18n = `{ context }`
        return previousValue;
    }
}

const attributeProcessors = [styleAttribute, classAttribute, eventAttribute, dynamicAttribute, domAttribute, i18nAttribute];

function attributes(attributes = []) {
    let blackList = plugins
        .map(plugin => {
            if (plugin.destination === "Attribute") {
                return plugin.name;
            }
            return [];
        })
        .flat();

    blackList.push("is")

    let result = Array.from(attributes)
        .filter((attribute) => !blackList.includes(attribute.name) && attribute.ownerElement.localName !== "case" && attribute.ownerElement.localName !== "switch")
        .reduce((previousValue, attribute) => {
            let namespace = attribute.name.split(":");
            switch (namespace[0]) {
                case "bind" : {
                    let processor = attributeProcessors.find(processor => processor.name(attribute).test(namespace[1]));
                    if (!processor) {
                        throw new Error("Attribute Processor not found for attribute: " + namespace[1] + " on Element: " + attribute.ownerElement.localName)
                    }
                    if (processor.readOnly) {
                        throw new Error("Events are read only")
                    }
                    return processor.process(attribute, namespace[1], previousValue, (value) => {
                        return `bind(context, "${value}")`;
                    });
                }
                case "read" : {
                    let processor = attributeProcessors.find(processor => processor.name(attribute).test(namespace[1]));
                    if (!processor) {
                        throw new Error("Attribute Processor not found for attribute: " + namespace[1] + " on Element: " + attribute.ownerElement.localName)
                    }
                    return processor.process(attribute, namespace[1], previousValue, (value) => {
                        return addContext(value, false);
                    });
                }
                default : {
                    let processor = attributeProcessors.find(processor => processor.name(attribute).test(namespace[0]));
                    if (!processor) {
                        previousValue[attribute.name] = "'" + attribute.value + "'"
                        return previousValue;
                    }
                    if (processor.readOnly) {
                        throw new Error("Events are read only")
                    }
                    return processor.process(attribute, namespace[0], previousValue, (value) => {
                        return "'" + value + "'"
                    });
                }
            }
        }, {});

    function generate(object) {
        if (object instanceof Array) {
            return "[ " + object.map((item) => generate(item)).join(", ") + " ]"
        }
        if (object instanceof Object) {
            return "{ " + Object.entries(object).map(([key, value]) => {
                return `${toCamelCase(key)} : ${generate(value)}`
            }).join(", ") + " }"
        }

        return object;
    }

    return generate(result);
}

function processNode(node, isSvg = false) {
    if (isTextNode(node)) {
        let textContent = node.textContent
            .replaceAll("`", "\\`")
            .replaceAll("${", "\\${")

        if (!isSpecialElement(node)) {
            if (isPassiveInterpolation(node)) {
                let regExp = /{{{([^}]+)}}}/g;
                textContent = textContent.replace(regExp, (_, group) => "${" + addContext(group) + "}")
            } else if (isActiveInterpolation(node)) {
                return `{ type : "text", textContent : interpolation(context, \`${textContent}\`) }`
            }
        }

        return `{ type : "text", textContent : \`${textContent}\` }`
    }

    if (isElementNode(node)) {
        for (const attribute of node.attributes) {
            let plugin = findAttributePlugin(attribute);
            if (plugin) {
                return plugin.code(node, iterateChildren, processNode, isSvg);
            }
        }

        let plugin = findElementPlugin(node);
        if (plugin) {
            return plugin.code(node, iterateChildren, processNode, isSvg);
        }

        let elementName = node.localName;
        if (node.hasAttribute("is")) {
            elementName = node.getAttribute("is");
        }

        let objects = [];
        let customElement = customElements.get(elementName);
        if (customElement) {
            if (customElement.template?.html) {
                objects.push(`type : "component"`)
                objects.push(`tag : "${node.localName}"`)
                let is = node.getAttribute("is");
                if (is) {
                    objects.push(`is : "${is}"`)
                }
                objects.push(`content(implicit) { return [${iterateChildren(node.childNodes, isSvg)}] }`)
            } else {
                objects.push(`type : "directive"`)
                objects.push(`tag : "${node.localName}"`)
                let is = node.getAttribute("is");
                if (is) {
                    objects.push(`is : "${is}"`)
                }
                objects.push(`children : [${iterateChildren(node.childNodes, isSvg)}]`)
            }
        } else {
            if (node.localName === "svg" || isSvg) {
                objects.push(`type : "svg"`)
                objects.push(`tag : "${node.localName}"`)
                objects.push(`children : [${iterateChildren(node.childNodes, true)}]`);
            } else {
                if (node.localName === "template") {
                    objects.push(`type : "template"`)
                    objects.push(`content : [${iterateChildren(node.content.childNodes, isSvg)}]`);
                } else {
                    objects.push(`type : "element"`)
                    objects.push(`tag : "${node.localName}"`)
                    objects.push(`children : [${iterateChildren(node.childNodes, isSvg)}]`);
                }
            }
        }

        if (node.attributes.length > 0) {
            objects.push(`attributes : ${attributes(node.attributes, isSvg)}`)
        }

        return `{ ${objects.join(", ")} }`
    }

    return `{ type : "comment", textContent : \`${node.textContent.trim()}\` }`
}

function iterateChildren(children, isSvg = false) {
    return Array.from(children).map(node => {
        return processNode(node, isSvg);
    }).join(", ")
}

export function compile(template) {
    let children = template.content.childNodes;
    let header = `function (context) { return [${iterateChildren(children)}]; }`
    let loader = `function main(letStatement, bind, interpolation) {return ${header} }`
    let ast;
    try {
        ast = parse(loader, {ecmaVersion: 2022});
    } catch (e) {
        if (e instanceof SyntaxError) {
            let lines = loader.substring(e.pos - 100, e.pos) + "%c" + loader.substring(e.pos, e.pos + 1) + "%c" + loader.substring(e.pos + 1, e.pos + 100)
            console.log(lines.replaceAll("\n", " "), "color : red", "color : white")
        }
    }
    let pretty = generate(ast);
    let func = new Function("return " + pretty);

    return func()(variable, bind, interpolation);
}