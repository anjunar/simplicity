import {activeObjectExpression, content, customPlugins} from "../processors/html-compiler-processor.js";
import {getAttributes, boundAttributes, notifyElementRemove, rawAttributes} from "./helper.js";

function slotStatement(rawAttributes, context, contents) {
    let attributes = getAttributes(rawAttributes, ["name", "index", "source", "selector", "implicit", "tag"])
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

        function findAst(ast, element) {
            let result = null;
            for (const astElement of ast) {
                if (result) {
                    break;
                }
                if (astElement instanceof Object) {
                    if (astElement.element === element) {
                        result = astElement;
                        break;
                    }
                    if (astElement.children) {
                        result = findAst(astElement.children, element);
                    }
                }
            }
            return result;
        }

        if (values.name) {
            let querySelector = activeContent.querySelectorAll(`[slot=${values.name}]`)[index];
            if (querySelector) {
                let ast = findAst(activeContent.component.ast, querySelector);
                let items = ast.import(container);
                children.push(items)
            }
        } else if (values.selector) {
            let querySelector = activeContent.querySelectorAll(values.selector)[index];
            if (querySelector) {
                let ast = findAst(activeContent.component.ast, querySelector);
                let items = ast.import(container);
                children.push(items)
            }
        } else if (values.tag) {
            let iterator = document.createNodeIterator(activeContent, NodeFilter.SHOW_ELEMENT)
            let cursor = iterator.nextNode();
            while (cursor != null) {
                if (cursor[values.tag]) {
                    let ast = findAst(activeContent.component.ast, cursor);
                    let items = ast.import(container);
                    children.push(items)
                    break;
                }
                cursor = iterator.nextNode();
            }
        } else {
            for (const astElement of activeContent.component.ast) {
                if (astElement instanceof Object) {
                    let items = astElement.import(container);
                    if (items instanceof Array) {
                        children.push(...items)
                    } else {
                        children.push(items)
                    }

                }
            }

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
    }

    return {
        type: "slot",
        ...values,
        children: children,
        build(parent) {
            fragment = generate();
            parent.appendChild(comment);
            parent.appendChild(container);
            return children;
        },
        import(parent) {
            return slotStatement(rawAttributes, context, contents)
                .build(parent);
        }
    };
}

export default customPlugins.define({
    name : ["slot"],
    destination : "Element",
    code : function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}slotStatement([${rawAttributes(node)}], context, content)`;
    },
    executor : slotStatement
})