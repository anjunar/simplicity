import {activeObjectExpression, customPlugins} from "../processors/html-compiler-processor.js";
import {attributes, boundAttributes, getAttributes, rawAttributes} from "./helper.js";

function ifStatement(rawAttributes, context, callback) {
    let attributes = getAttributes(rawAttributes, ["if"]);
    let boundAttributesFunction = boundAttributes(attributes, context);
    let values = boundAttributesFunction()
    let value = values.if;
    let comment = document.createComment("if");
    let container = document.createDocumentFragment();
    let html;
    let element;

    activeObjectExpression(attributes.if.value, context, comment, (result) => {
        update(result);
    })

    function update(value) {
        if (value) {
            if (element) {
                if (!element.isConnected) {
                    comment.after(element);
                }
            } else {
                generate();
                comment.after(element);
                html.update();
            }
        } else {
            if (element.isConnected) {
                element.remove();
            }
        }
    }

    function generate() {
        html = callback(context);
        element = html.build(container);
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
        update() {
            if (value) {
                html.update();
            }
        }
    }
}

export default customPlugins.define({
    name: "bind:if",
    destination: "Attribute",
    code: function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}ifStatement([${rawAttributes(node)}], context, () => {return html("${tagName}", [${attributes(node)}], [${intern(node.childNodes, ++level, isSvg)}\n${tabs}])})`
    },
    executor: ifStatement
})