import {boundAttributes, buildStrategie, getAttributes, notifyElementRemove, rawAttributes} from "./helper.js";
import {activeObjectExpression, customPlugins} from "../processors/html-compiler-processor.js";

function switchStatement(rawAttributes, context, cases, imported = false) {
    let attributes = getAttributes(rawAttributes, ["switch"])
    let boundAttributesFunction = boundAttributes(attributes, context);

    let container = document.createDocumentFragment();
    let comment = document.createComment("switch")

    function generate() {
        return buildStrategie(caseSegment, container, imported)
    }

    function findCase(value) {
        for (const caseSegment of cases) {
            if (caseSegment.value === value) {
                return caseSegment;
            }
        }
        for (const caseSegment of cases) {
            if (caseSegment.value === "default") {
                return caseSegment;
            }
        }
    }

    activeObjectExpression(attributes.switch.value, context, comment, (result) => {
        for (const element of elements) {
            element.remove();
            notifyElementRemove(element)
        }
        caseSegment = findCase(value);
        elements = generate();
        comment.after(container);
    });

    let caseSegment;
    let value;
    let elements;

    return {
        type: "switch",
        build(parent) {
            let values = boundAttributesFunction();
            value = values.switch;
            caseSegment = findCase(value);
            elements = generate();
            parent.appendChild(comment);
            parent.appendChild(container);
        },
        import(parent) {
            return switchStatement(rawAttributes, context, cases, true)
                .build(parent)
        }
    }
}

export default customPlugins.define({
    name: ["bind:switch", "read:switch"],
    destination: "Attribute",
    code: function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}switchStatement([${rawAttributes(node)}], context, [${intern(node.childNodes, ++level, isSvg)}\n${tabs}])`;
    },
    executor: switchStatement
})
