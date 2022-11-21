import {boundAttributes, buildStrategie, getAttributes, rawAttributes} from "./helper.js";
import {customPlugins} from "../processors/html-compiler-processor.js";

function caseStatement(rawAttributes, context, callback, imported = false) {
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
                    let items = buildStrategie(child, parent, imported);
                    if (items instanceof Array) {
                        elements.push(...items);
                    } else {
                        elements.push(items);
                    }
                }
            }
            return elements;
        },
        import(parent) {
            return caseStatement(rawAttributes, context, callback, true)
                .build(parent);
        }
    }
}

export default customPlugins.define({
    name: ["case"],
    destination: "Element",
    code: function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}caseStatement([${rawAttributes(node)}], context, function() { return [${intern(node.childNodes, ++level, isSvg)}\n${tabs}]})`;
    },
    executor : caseStatement
})
