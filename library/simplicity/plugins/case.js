import {boundAttributes, getAttributes, rawAttributes} from "./helper.js";
import {customPlugins} from "../processors/html-compiler-processor.js";

function caseStatement(rawAttributes, context, callback) {
    let attributes = getAttributes(rawAttributes, ["value"]);
    let boundAttributesFunction = boundAttributes(attributes, context);
    let values = boundAttributesFunction();
    let children;
    return {
        type: "case",
        value: values.value,
        build(parent) {
            let elements = [];
            children = callback();
            for (const child of children) {
                if (child instanceof Object) {
                    elements.push(child.build(parent));
                }
            }
            return elements;
        },
        update() {
            for (const child of children) {
                if (child instanceof Object) {
                    child.update();
                }
            }
        }
    }
}

export default customPlugins.define({
    name: "case",
    destination: "Element",
    code: function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}caseStatement([${rawAttributes(node)}], context, function() { return [${intern(node.childNodes, ++level, isSvg)}\n${tabs}]})`;
    },
    executor : caseStatement
})
