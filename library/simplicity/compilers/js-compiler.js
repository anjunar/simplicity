import {cachingProxy, evaluator, getPropertyDescriptor} from "../util/tools.js";
import {generate} from "../../astring/astring.js";
import {parse} from "../../acorn/index.js";

export function jsWalker(program, state, parent = []) {

    Object.assign(state, {
        findMemberAncestors(node) {
            let ancestors = [];
            let cursor = node;
            while (cursor.type === "MemberExpression" || cursor.type === "CallExpression") {
                if (cursor.type === "MemberExpression" && (cursor.object.type === "MemberExpression" || cursor.object.type === "CallExpression")) {
                    cursor = cursor.object;
                } else if (cursor.type === "CallExpression" && (cursor.callee.type === "MemberExpression" || cursor.callee.type === "CallExpression")) {
                    cursor = cursor.callee
                } else {
                    break;
                }
                ancestors.push(cursor)
            }
            return ancestors;
        }
    })

    function walk(node, parent, position) {
        let type = node.type;
        let goDeeper = true;
        if (state[type]) {
            goDeeper = state[type](node, parent, position);
        } else {
            let defaultElement = state["default"];
            if (defaultElement) {
                goDeeper = defaultElement(node, parent, position);
            }
        }

        if (goDeeper) {
            for (const [key, value] of Object.entries(node)) {
                if (value instanceof Array) {
                    for (const element of value) {
                        walk(element, [...parent, {node: node, property: key}]);
                    }
                } else if (value instanceof Object) {
                    walk(value, [...parent, {node: node, property: key}]);
                } else {
                    // Do Nothing
                }
            }
        }
    }

    if (program instanceof Array) {
        for (const element of program) {
            walk(element, Array.from(parent));
        }
    } else {
        walk(program, Array.from(parent));
    }


}

function collect(ast) {
    let identifiers = [];
    jsWalker(ast, new class {
        CallExpression(node, parent) {
            identifiers.push(node);
            // jsWalker(node.arguments, this, [...parent, {node : node, property : "arguments"}])
            return false;
        }
        MemberExpression(node, parent) {
            identifiers.push(node);
            return false;
        }
        Identifier(node, parent) {
            identifiers.push(node);
            return false;
        }
    });
    return identifiers;
}

export const collectIdentifiers = cachingProxy(function (expression) {
        let ast = parse(expression, {ecmaVersion : 2022});
        return collect(ast);
    }
)

function addContextPrefix(ast, argsPrefix = true) {
    jsWalker(ast, new class {
        MemberExpression(node, parent) {
            let ancestors = this.findMemberAncestors(node);

            let cursor = ancestors[ancestors.length - 1] || node
            let memberParent = cursor.object;
            cursor.object = {
                type : "MemberExpression",
                object : {
                    type : "Identifier",
                    name : "context"
                },
                property : memberParent
            }

            ancestors.filter((node) => node.type === "CallExpression")
                .forEach((node) => jsWalker(node.arguments, this, [{node : node, property : "arguments"}]))

            return false;
        }

        Identifier(node, parent) {
            let top = parent[parent.length - 1]
            let container = top.node[top.property];
            let memberExpression;
            if (node.name.startsWith("$")) {
                if (argsPrefix) {
                    memberExpression = {
                        type: "MemberExpression",
                        property: node,
                        object: {
                            type : "Identifier",
                            name : "args"
                        }
                    };
                }
            } else  {
                memberExpression = {
                    type: "MemberExpression",
                    property: node,
                    object: {
                        type : "Identifier",
                        name : "context"
                    }
                };
            }
            if (memberExpression) {
                if (container instanceof Array) {
                    let indexOf = container.indexOf(node);
                    container[indexOf] = memberExpression;
                } else {
                    top.node[top.property] = memberExpression;
                }
            }
            return false;
        }
    });
}

export function addContext(expression, argsPrefix = true) {
    let ast = parse(expression, {ecmaVersion : 2022});
    addContextPrefix(ast, argsPrefix);
    return generate(ast, {lineEnd : ""});
}

export function evaluation(expression, context, args, full = false) {

    let ast = parse(expression, {ecmaVersion : 2022});

    addContextPrefix(ast);

    if (! full) {
        jsWalker(ast, new class {
            CallExpression(node, parent) {
                this.addCallExpression(parent, node);
                return false;
            }
            MemberExpression(node, parent) {
                let source = generate(node.object);
                if (source !== "args") {
                    let destination = generate(node.property);
                    let output = `let result = ${source}; return getPropertyDescriptor(result, '${destination}')`

                    let arg = `return function(context, getPropertyDescriptor) {${output}}`;
                    let func = evaluator(arg)
                    let descriptor = func()(context, getPropertyDescriptor)
                    if (descriptor.get && descriptor.set === undefined) {
                        this.addCallExpression(parent, node);
                    }
                }
                return false;
            }
            addCallExpression(parent, node) {
                let top = parent[parent.length - 1]
                let container = top.node[top.property];
                let callExpression = {
                    type: "CallExpression",
                    arguments: [],
                    callee: {
                        type: "MemberExpression",
                        object: node,
                        property: {
                            type: "Identifier",
                            name: "method"
                        }
                    }
                };
                if (container instanceof Array) {
                    let indexOf = container.indexOf(node);
                    container[indexOf] = callExpression;
                } else {
                    top.node[top.property] = callExpression;
                }
            }
        })
    }

    let output = generate(ast);

    let arg = `return function(context, args) {return ${output}}`;
    let func = evaluator(arg)
    return func()(context, args)

}
