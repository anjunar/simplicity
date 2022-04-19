import {cachingProxy, evaluator} from "../services/tools.js";

function tokenizer(expression) {

    let tags = [
        {
            type: "reserved",
            regex: /undefined|true|false/y
        },
        {
            type: "placeholder",
            regex: /\$event|\$value|\$children|\$callback/y
        },
        {
            type: "variableDeclaration",
            regex: /let|const|var/y
        },
        {
            type: "operation",
            regex: /[+\-*/<>%=!&|]+|of/y
        },
        {
            type: "property",
            regex: /[a-zA-Z$_][a-zA-Z\d_$]*/y
        },
        {
            type: "point",
            regex: /\./y
        },
        {
            type: "number",
            regex: /[\d.]+/y
        },
        {
            type: "string",
            regex: /'[^']*'/y
        },
        {
            type: "conditional",
            regex: /\?/y
        },
        {
            type: "leftRoundBracket",
            regex: /\(/y
        },
        {
            type: "rightRoundBracket",
            regex: /\)/y
        },
        {
            type: "leftCurlyBracket",
            regex: /{/y
        },
        {
            type: "rightCurlyBracket",
            regex: /}/y
        },
        {
            type: "leftSquareBracket",
            regex: /\[/y
        },
        {
            type: "rightSquareBracket",
            regex: /\]/y
        },
        {
            type: "whitespace",
            regex: /\s+/y
        },
        {
            type: "colon",
            regex: /:/y
        },
        {
            type: "comma",
            regex: /,/y
        },
        {
            type: "semicolon",
            regex: /;/y
        }
    ]

    let index = 0;
    let oldIndex = -1;
    let tokens = [];

    while (index < expression.length) {

        let char = expression.charAt(index);

        if (index === oldIndex) {
            throw new Error(expression + " is an invalid input at position: " + index + " char: " + char)
        }

        oldIndex = index;

        for (const tag of tags) {

            tag.regex.lastIndex = index;
            let result = tag.regex.exec(expression);
            if (result) {
                if (tag.type !== "whitespace" && tag.type !== "comma") {
                    tokens.push({
                        type: tag.type,
                        value: result[0],
                        index: result.index,
                        lastIndex: tag.regex.lastIndex
                    })
                }
                index = tag.regex.lastIndex;
                break;
            }
        }

    }

    return tokens;

}

function parser(tokens) {

    let current = 0;
    let stack = [];

    function walk(before) {

        let token = tokens[current];

        switch (token.type) {
            case "semicolon" : {
                current++

                return walk(before)
            }
            case "reserved" : {
                current++

                let node = {
                    type: "ReservedLiteral",
                    value: token.value,
                    before: before
                }

                return node;
            }
            case "placeholder" : {
                current++

                let node = {
                    type: "PlaceholderLiteral",
                    value: token.value,
                    before: before
                }

                return node;
            }
            case "variableDeclaration" : {
                current++

                let node = {
                    type: "VariableDeclaration",
                    kind: token.value,
                    before: before,
                    init: null,
                    id: null
                }

                token = tokens[current];

                if (token && token.type === "leftSquareBracket") {
                    stack.push(node);
                    node.id = walk(node);
                }

                if (token && token.type === "property") {
                    stack.push(node);
                    node.id = walk(node);
                }

                token = tokens[current];

                if (token && token.type === "operation") {
                    node.value = token.value
                    current++
                    node.init = walk(node);
                }

                stack.pop();

                return node;
            }
            case "string" : {
                current++

                let node = {
                    type: "StringLiteral",
                    value: token.value,
                    before: before
                };

                token = tokens[current];
                if (token && token.type === "operation") {
                    stack.push(node);
                    node = walk(node);
                }

                if (token && token.type === "conditional") {
                    stack.push(node);
                    node = walk(node);
                }

                return node
            }
            case "number" : {
                current++
                let isFloat = token.value.indexOf(".") > -1;

                let node = {
                    type: "NumberLiteral",
                    value: isFloat ? Number.parseFloat(token.value) : Number.parseInt(token.value),
                    before: before
                };

                token = tokens[current];
                if (token && token.type === "operation") {
                    stack.push(node);
                    node = walk(node);
                }

                return node
            }
            case "property" : {
                current++;
                let node = {
                    type: "Identifier",
                    value: token.value,
                    before: before
                };

                if (current < tokens.length) {
                    token = tokens[current];
                    if (token.type === "point") {
                        current++
                        node.property = walk(node);
                    }
                }

                let top = stack[stack.length - 1];
                if (before === null || before.type !== "Identifier") {
                    token = tokens[current];

                    if (token && token.type === "leftRoundBracket") {
                        stack.push(node);
                        node = walk(node);
                    }

                    if (token && token.type === "conditional") {
                        stack.push(node);
                        node = walk(node);
                    }

                    if (token && token.type === "operation" && top?.type !== "VariableDeclaration") {
                        stack.push(node);
                        node = walk(node);
                    }
                }

                return node
            }
            case "operation" : {
                current++

                let node;
                if (token.value === "!") {
                    node = {
                        type: "UnaryExpression",
                        operator: token.value,
                        before: before
                    }

                    node.argument = walk(node)
                } else {
                    if (token.value === "=") {
                        node = {
                            type: "AssignmentExpression",
                            operator: token.value,
                            left: stack.pop(),
                        }

                        node.right = walk(node)
                    } else {
                        node = {
                            type: "BinaryExpression",
                            operator: token.value,
                            before: before,
                            left: stack.pop()
                        };

                        node.right = walk(node);
                    }
                }

                token = tokens[current];
                if (token && token.type === "operation") {
                    stack.push(node);
                    node = walk(node);
                }

                if (token && token.type === "conditional") {
                    stack.push(node);
                    node = walk(node);
                }

                return node
            }
            case "leftCurlyBracket" : {
                current++

                let node = {
                    type: "ObjectExpression",
                    parameters: [],
                    before: before
                }

                while (token.type !== "rightCurlyBracket") {
                    let key = walk(node);
                    current++
                    let value = walk(node);
                    node.parameters.push({
                        key: key,
                        value: value
                    });
                    token = tokens[current];
                }

                current++;

                return node;

            }
            case "leftRoundBracket" : {
                current++;
                let top = stack.pop();
                token = tokens[current];

                if (top && top.type === "Identifier") {
                    let node = {
                        type: "CallExpression",
                        callee: top,
                        arguments: [],
                        before: before
                    };

                    while (token.type !== "rightRoundBracket") {
                        node.arguments.push(walk(node))
                        token = tokens[current];
                    }

                    current++

                    token = tokens[current]
                    if (token && token.type === "conditional") {
                        stack.push(node);
                        node = walk(node);
                    }

                    if (token && token.type === "operation") {
                        stack.push(node);
                        node = walk(node);
                    }

                    return node
                } else {

                    let node;
                    while (token.type !== "rightRoundBracket") {
                        node = walk(before);
                        token = tokens[current];
                        if (token && token.type !== "rightRoundBracket") {
                            stack.push(node)
                        }
                    }

                    current++
                    token = tokens[current];

                    if (token && token.type === "conditional") {
                        stack.push(node);
                        node = walk(node);
                    }

                    if (token && token.type === "operation") {
                        stack.push(node);
                        node = walk(node);
                    }

                    return node;
                }
            }
            case "leftSquareBracket" : {
                current++
                let top = stack[stack.length - 1];
                if (top && top.type === "VariableDeclaration") {
                    let node = {
                        type: "ArrayPattern",
                        elements: [],
                        before: before
                    }

                    while (token.type !== "rightSquareBracket") {
                        node.elements.push(walk(node))
                        token = tokens[current];
                    }

                    current++
                    token = tokens[current]

                    return node;
                } else {
                    return before;
                }
            }
            case "conditional" : {
                current++
                let top = stack.pop();

                let node = {
                    type: "ConditionalExpression",
                    test: top,
                    before: before
                }

                node.consequent = walk(node);

                token = tokens[current];

                if (token && token.type === "colon") {
                    current++
                    node.alternate = walk(node)
                }

                return node;
            }
            default : {
                throw new Error("Nothing found for " + JSON.stringify(token))
            }
        }
    }

    let ast = {
        type: "Program",
        body: []
    }

    while (current < tokens.length) {
        let items = walk(null);
        ast.body.push(items)
    }

    return ast;

}

function transformator(node, parent, property, callback) {
    switch (node.type) {
        case "Program" :
            return {
                type: node.type,
                body: node.body.map(element => transformator(element, node, "body", callback))
            }
        case "ReservedLiteral" :
            return node;
        case "PlaceholderLiteral" :
            return {
                type: node.type,
                value: `args.${node.value}`
            }
        case "StringLiteral" :
            return node
        case "NumberLiteral" :
            return node
        case "Identifier" : {
            if (parent === null || (parent.type !== "ObjectExpression" && (parent.type !== "VariableDeclaration" || property === "init"))) {
                if (node.value !== "this") {
                    node.value = callback(node.value)
                }
            }
            return node
        }
        case "AssignmentExpression" : {
            return {
                type: node.type,
                operator: node.operator,
                left: transformator(node.left, node, "left", callback),
                right: transformator(node.right, node, "right", callback)
            }
        }
        case "ArrayPattern" : {
            return {
                type: node.type,
                elements: node.elements.map((arg) => transformator(arg, node, "elements", callback))
            }
        }
        case "VariableDeclaration" : {
            return {
                type: node.type,
                kind: node.kind,
                value: node.value,
                id: transformator(node.id, node, "id", callback),
                init: transformator(node.init, node, "init", callback)
            }
        }
        case "UnaryExpression" : {
            return {
                type: node.type,
                operator: node.operator,
                argument: transformator(node.argument, node, "argument", callback)
            }
        }
        case "BinaryExpression" : {
            return {
                type: node.type,
                left: transformator(node.left, node, "left", callback),
                operator: node.operator,
                right: transformator(node.right, node, "right", callback)
            }
        }
        case "ConditionalExpression" :
            let result = {
                type: node.type,
                test: transformator(node.test, node, "test", callback),
                consequent: transformator(node.consequent, node, "consequent", callback)
            };

            if (node.alternate) {
                result.alternate = transformator(node.alternate, node, "alternate", callback)
            }

            return node
        case "CallExpression" :
            return {
                type: node.type,
                callee: transformator(node.callee, node, "callee", callback),
                arguments: node.arguments.map((arg) => transformator(arg, node, "arguments", callback))
            }
        case "ObjectExpression" :
            return {
                type: node.type,
                parameters: node.parameters.map((entry) => {
                    return {
                        key: transformator(entry.key, node, "key", callback),
                        value: transformator(entry.value, node, "value", callback)
                    }
                })
            }
    }
}

function collector(node, parent, property, identifiers) {
    switch (node.type) {
        case "Program" :
            return {
                type: node.type,
                body: node.body.map(element => collector(element, node, "body", identifiers))
            }
        case "ReservedLiteral" :
            return node;
        case "PlaceholderLiteral" :
            return {
                type: node.type,
                value: `args.${node.value}`
            }
        case "StringLiteral" :
            return node
        case "NumberLiteral" :
            return node
        case "Identifier" : {
            if (parent === null || (parent.type !== "ObjectExpression" && (parent.type !== "VariableDeclaration" || property === "init"))) {
                if (node.value !== "this" && property !== "callee" && property !== "arguments") {
                    identifiers.push(node);
                }
            }
            return node
        }
        case "AssignmentExpression" : {
            return {
                type: node.type,
                operator: node.operator,
                left: collector(node.left, node, "left", identifiers),
                right: collector(node.right, node, "right", identifiers)
            }
        }
        case "ArrayPattern" : {
            return {
                type: node.type,
                elements: node.elements.map((arg) => collector(arg, node, "elements", identifiers))
            }
        }
        case "VariableDeclaration" : {
            return {
                type: node.type,
                kind: node.kind,
                value: node.value,
                id: collector(node.id, node, "id", identifiers),
                init: collector(node.init, node, "init", identifiers)
            }
        }
        case "UnaryExpression" : {
            return {
                type: node.type,
                operator: node.operator,
                argument: collector(node.argument, node, "argument", identifiers)
            }
        }
        case "BinaryExpression" : {
            return {
                type: node.type,
                left: collector(node.left, node, "left", identifiers),
                operator: node.operator,
                right: collector(node.right, node, "right", identifiers)
            }
        }
        case "ConditionalExpression" :
            let result = {
                type: node.type,
                test: collector(node.test, node, "test", identifiers),
                consequent: collector(node.consequent, node, "consequent", identifiers)
            };

            if (node.alternate) {
                result.alternate = collector(node.alternate, node, "alternate", identifiers)
            }

            return node
        case "CallExpression" : {
            identifiers.push(node)
            return {
                type: node.type,
                callee: collector(node.callee, node, "callee", identifiers),
                arguments: node.arguments.map((arg) => collector(arg, node, "arguments", identifiers))
            }

        }
        case "ObjectExpression" :
            return {
                type: node.type,
                parameters: node.parameters.map((entry) => {
                    return {
                        key: collector(entry.key, node, "key", identifiers),
                        value: collector(entry.value, node, "value", identifiers)
                    }
                })
            }
    }
}


export function codeGenerator(node) {

    switch (node.type) {
        case "Program" :
            return node.body.map(element => codeGenerator(element)).join(";\n")
        case "ReservedLiteral" :
            return node.value;
        case "PlaceholderLiteral" :
            return node.value;
        case "StringLiteral" :
            return node.value;
        case "NumberLiteral" :
            return node.value;
        case "Identifier" : {
            let value = node.value;
            if (node.property) {
                value += "." + codeGenerator(node.property)
            }
            return value
        }
        case "AssignmentExpression" :
            return codeGenerator(node.left) + " " + " " + node.operator + " " + codeGenerator(node.right);
        case "ArrayPattern" :
            return "[" + node.elements.map((element) => codeGenerator(element)).join(", ") + "]"
        case "VariableDeclaration" :
            return node.kind + " " + codeGenerator(node.id) + " " + node.value + " " + codeGenerator(node.init)
        case "UnaryExpression" :
            return node.operator + " " + codeGenerator(node.argument)
        case "BinaryExpression" :
            return "( " + codeGenerator(node.left) + " " + node.operator + " " + codeGenerator(node.right) + " )"
        case "ConditionalExpression" :
            let result = codeGenerator(node.test) + " ? " + codeGenerator(node.consequent);
            if (node.alternate) {
                result += " : " + codeGenerator(node.alternate)
            }
            return result
        case "CallExpression" :
            return codeGenerator(node.callee) + "(" + node.arguments.map((arg) => codeGenerator(arg)).join(", ") + ")"
        case "ObjectExpression" :
            return "{ " + node.parameters.map((entry) => codeGenerator(entry.key) + " : " + codeGenerator(entry.value)).join(", ") + " }"
    }
}

export function identifierToArray(node) {
    let value = [node.value];
    if (node.property) {
        value.push(...identifierToArray(node.property))
    }
    return value
}

export function callExpressionToArray(node) {
    return [identifierToArray(node.callee)]
}

export function astGenerator(expression) {
    let tokens = tokenizer(expression);
    return parser(tokens);
}

export const compiler = cachingProxy(function (expression, callback) {
        let ast = astGenerator(expression);
        let transformed = transformator(ast, null, null, callback)
        return codeGenerator(transformed);
    }
)

export const collectIdentifiers = cachingProxy(function (expression) {
        let ast = astGenerator(expression);
        let identifiers = [];
        collector(ast, null, null, identifiers);
        return identifiers.map((identifier) => codeGenerator(identifier));
    }
)

function proxyFactory(context) {
    let proxy = proxyCache.get(context);

    if (!proxy) {
        proxy = new Proxy(context, {
            get(target, p, receiver) {
                let cursor = target;

                function scope(target) {
                    if (Reflect.has(target.instance, p)) {
                        let result = Reflect.get(target.instance, p, target.instance);
                        if (result instanceof Function) {
                            return (...args) => result.apply(target.instance, args);
                        }
                        return result;
                    }
                    cursor = cursor.parent;
                    return scope(cursor);
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

export function evaluation(expression, context, args) {

    let proxy = proxyFactory(context);

    let output = compiler(expression, (property) => {
        return `context.${property}`
    });

    try {
        let arg = `return function(context, args) {return ${output}}`;
        let func = evaluator(arg)
        return func()(proxy, args)
    } catch (e) {
        console.error(e)
    }

}
