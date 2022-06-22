import {activeObjectExpression, content, customPlugins} from "../processors/html-compiler-processor.js";
import {getAttributes, boundAttributes, notifyElementRemove, rawAttributes} from "./helper.js";

function slotStatement(rawAttributes, context, contents) {
    let attributes = getAttributes(rawAttributes, ["name", "index", "source", "selector", "implicit"])
    let boundAttributesFunction = boundAttributes(attributes, context);
    let values = boundAttributesFunction()

    let container = document.createDocumentFragment();
    let data = "slot " + JSON.stringify(attributes)

    let comment = document.createComment(data);
    let children = [];

    for (const attribute of Object.values(attributes)) {
        if (attribute.type === "bind") {
            activeObjectExpression(attribute.value, context, comment, () => {
                values = boundAttributesFunction();
                update();
            })
        }
    }

    function generate() {
        let activeContent;
        let index = values.index || 0;

        let implicitValue = values.implicit;
        if (Reflect.has(values, "source")) {
            activeContent = content(values.source, implicitValue);
        } else {
            activeContent = contents(implicitValue);
        }

        if (values.name) {
            let querySelector = activeContent.querySelectorAll(`[slot=${values.name}]`)[index];
            if (querySelector) {
                container.appendChild(querySelector)
                children.push(querySelector);
            }
        } else if (values.selector) {
            let querySelector = activeContent.querySelectorAll(values.selector)[index];
            if (querySelector) {
                container.appendChild(querySelector)
                children.push(querySelector);
            }
        } else {
            for (const segment of activeContent.children) {
                container.appendChild(segment)
                children.push(segment);
            }
        }

        for (const child of children) {
            child.addEventListener("removed",() => {
                notifyElementRemove(activeContent)
            })
        }

        return activeContent;
    }

    let fragment;

    function update() {
        for (const child of children) {
            notifyElementRemove(child)
            child.remove();
        }
        children.length = 0;
        fragment = generate();
        comment.after(container);
        fragment.update();
    }

    return {
        type: "slot",
        ...values,
        children: children,
        build(parent) {
            fragment = generate();
            parent.appendChild(comment);
            parent.appendChild(container);
        },
        update() {
            fragment.update();
        }
    };
}

export default customPlugins.define({
    name : "slot",
    destination : "Element",
    code : function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}slotStatement([${rawAttributes(node)}], context, content)`;
    },
    executor : slotStatement
})