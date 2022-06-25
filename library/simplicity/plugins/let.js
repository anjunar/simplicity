import {generateDomProxy} from "../services/tools.js";
import {Context, customPlugins, membraneFactory} from "../processors/html-compiler-processor.js";
import {attributes, boundAttributes, getAttributes, rawAttributes} from "./helper.js";

function letStatement(rawAttributes, implicit, context, callback) {
    let ast = {
        update() {
        }
    }
    let newContext;
    let instance;
    let scope;
    if (implicit) {
        let attributes = getAttributes(rawAttributes, ["let"]);
        let boundAttributesFunction = boundAttributes(attributes, context);
        let values = boundAttributesFunction();
        instance = {};
        instance[values.let] = implicit;
        scope = {proxy: {handlers: [], property: ""}};
        newContext = new Context(membraneFactory(instance, [scope]), context);
        ast = callback(newContext);
    }
    return {
        build(parent) {
            if (implicit) {
                let element = ast.build(parent);
                newContext.instance = element;
                Object.assign(element, instance);
                generateDomProxy(element);
                element.handlers = scope.proxy.handlers;
                return element
            }
            return null;
        },
        update() {
            ast.update();
        }
    }
}

export default customPlugins.define({
    name: "let",
    destination: "Attribute",
    code: function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}letStatement([${rawAttributes(node)}], implicit, context, (context) => {return html("${tagName}", [${attributes(node)}], [${children(node, level + 1, isSvg)}\n${tabs}])})`
    },
    executor : letStatement
})