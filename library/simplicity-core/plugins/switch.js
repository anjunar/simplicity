import {isEqual} from "../services/tools.js";
import {boundAttributes, getAttributes, rawAttributes} from "./helper.js";
import {customPlugins} from "../processors/html-compiler-processor.js";

function switchStatement(rawAttributes, context, cases) {
    let attributes = getAttributes(rawAttributes, ["switch"])
    let boundAttributesFunction = boundAttributes(attributes, context);

    let container = document.createDocumentFragment();
    let comment = document.createComment("switch")

    function generate() {
        return caseSegment.build(container);
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

    let caseSegment;
    let value;
    let elements;

    return {
        type : "switch",
        build(parent) {
            let values = boundAttributesFunction();
            value = values.switch;
            caseSegment = findCase(value);
            elements = generate();
            parent.appendChild(comment);
            parent.appendChild(container);
        }
    }
}

export default customPlugins.define({
    name: "bind:switch",
    destination: "Attribute",
    code: function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}switchStatement([${rawAttributes(node)}], context, [${intern(node.childNodes, ++level, isSvg)}\n${tabs}])`;
    },
    executor: switchStatement
})
