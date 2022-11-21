import {cachingProxy, evaluator, getPropertyDescriptor} from "../services/tools.js";
import {walker} from "../../simplicity-parser/walker.js";
import {generate, parse} from "./js-compiler-extension.js";

function collect(ast) {
    let identifiers = [];
    walker(ast, new class {
        CallExpression(node, parent) {
            identifiers.push(node);
            // walker(node.arguments, this, [...parent, {node : node, property : "arguments"}])
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
        let ast = parse(expression);
        return collect(ast);
    }
)

export function codeGenerator(node) {
    return generate(node);
}

function addContextPrefix(ast) {
    walker(ast, new class {
        PlaceholderLiteral(node, parent) {
            let top = parent[parent.length - 1]
            let container = top.node[top.property];
            let memberExpression = {
                type: "MemberExpression",
                property: node,
                object: {
                    type : "Identifier",
                    name : "args"
                }
            };
            if (container instanceof Array) {
                let indexOf = container.indexOf(node);
                container[indexOf] = memberExpression;
            } else {
                top.node[top.property] = memberExpression;
            }
            return false;
        }
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
                .forEach((node) => walker(node.arguments, this, [{node : node, property : "arguments"}]))

            return false;
        }

        Identifier(node, parent) {
            let top = parent[parent.length - 1]
            let container = top.node[top.property];
            let memberExpression = {
                type: "MemberExpression",
                property: node,
                object: {
                    type : "Identifier",
                    name : "context"
                }
            };
            if (container instanceof Array) {
                let indexOf = container.indexOf(node);
                container[indexOf] = memberExpression;
            } else {
                top.node[top.property] = memberExpression;
            }
            return false;
        }
    });
}

function proxyFactory(context) {
    let proxy = proxyCache.get(context);

    if (!proxy) {
        proxy = new Proxy(context, {
            getOwnPropertyDescriptor(target, p) {
                let cursor = target;

                function scope(target) {
                    if (Reflect.has(target.instance, p)) {
                        return getPropertyDescriptor(target.instance, p)
                    }
                    cursor = cursor.parent;
                    return scope(cursor);
                }

                return scope(cursor);
            },
            get(target, p, receiver) {
                let cursor = target;

                function scope(target) {
                    if (! target)  {
                        return undefined;
                    }
                    if (Reflect.has(target.instance, p)) {
                        let result = Reflect.get(target.instance, p, target.instance);
                        if (result instanceof Function) {
                            return (...args) => result.apply(target.instance, args);
                        }
                        return result;
                    } else {
                        cursor = cursor.parent;
                        return scope(cursor);
                    }
                }

                return scope(cursor);
            },
            set(target, p, value, receiver) {
                let cursor = target;

                function scope(target) {
                    if (Reflect.has(target.instance, p)) {
                        return Reflect.set(target.instance, p, value, target.instance);
                    }
                    cursor = cursor.parent;
                    return scope(cursor);
                }

                return scope(cursor);
            }
        });

        proxyCache.set(context, proxy);
    }

    return proxy;
}

const proxyCache = new WeakMap();

export function evaluation(expression, context, args, full = false) {

    let ast = parse(expression);

    addContextPrefix(ast);

    let proxy = proxyFactory(context);

    if (! full) {
        walker(ast, new class {
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
                    let descriptor = func()(proxy, getPropertyDescriptor)
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
    return func()(proxy, args)

}
