import {activeObjectExpression, customPlugins} from "../processors/html-compiler-processor.js";
import {attributes, boundAttributes, buildStrategie, getAttributes, rawAttributes} from "./helper.js";

function ifStatement(rawAttributes, context, callback, imported = false) {
    let attributes = getAttributes(rawAttributes, ["if"]);
    let boundAttributesFunction = boundAttributes(attributes, context);
    let values = boundAttributesFunction()
    let value = values.if;
    let comment = document.createComment("if");
    let container = document.createDocumentFragment();
    let html;
    let element;

    if (attributes.if.type === "bind") {
        activeObjectExpression(attributes.if.value, context, comment, (result) => {
            update(result);
        })
    }

    function update(value) {
        if (value) {
            if (element) {
                if (!element.isConnected) {
                    comment.after(element);
                }
            } else {
                generate();
                comment.after(element);
            }
        } else {
            if (element.isConnected) {
                element.remove();
            }
        }
    }

    function generate() {
        html = callback(context);
        element = buildStrategie(html, container, imported)
    }

    return {
        type: "if",
        element: html,
        build(parent) {
            parent.appendChild(comment);
            if (value) {
                generate();
                parent.appendChild(container);
            }
        },
        import(parent) {
            return ifStatement(rawAttributes, context, callback, true)
                .build(parent)
        }
    }
}

export default customPlugins.define({
    name: ["bind:if", "read:if"],
    destination: "Attribute",
    code: function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}ifStatement([${rawAttributes(node)}], context, () => {return html("${tagName}", [${attributes(node)}], [${intern(node.childNodes, ++level, isSvg)}\n${tabs}])})`
    },
    executor: ifStatement
})