import {evaluation} from "../processors/js-compiler-processor.js";
import {customPlugins} from "../processors/html-compiler-processor.js";
import {attributes, rawAttributes} from "./helper.js";

function variableStatement(rawAttributes, context, html) {

    let attribute = rawAttributes.find((attribute) => attribute.startsWith("bind:variable"))

    let variable = attribute.split("=")[1];

    return {
        type : "variable",
        build(parent) {
            let element = html.build(parent);
            if (! this.element) {
                this.element = element;
            }
            evaluation(variable + " = $value", context, {$value: element})
        }
    }

}

export default customPlugins.define({
    name: "bind:variable",
    destination: "Attribute",
    code: function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}variableStatement([${rawAttributes(node)}], context, html("${tagName}", [${attributes(node)}], [${intern(node.childNodes, ++level, isSvg)}\n${tabs}]))`;
    },
    executor: variableStatement
})