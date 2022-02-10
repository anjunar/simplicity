function tokenizer(expression) {

    let tags = [
        {
            type : "reserved",
            regex: /undefined|true|false/y
        },
        {
            type : "placeholder",
            regex: /\$event|\$value|\$children/y
        },
        {
            type : "property",
            regex : /[a-zA-Z$_][a-zA-Z\d_$]*/y
        },
        {
            type : "point",
            regex : /\./y
        },
        {
            type : "number",
            regex : /[\d.]+/y
        },
        {
            type : "string",
            regex : /'[^']*'/y
        },
        {
            type : "operation",
            regex : /[+\-*/<>%=!&|]+/y
        },
        {
            type : "conditional",
            regex : /\?/y
        },
        {
            type : "leftRoundBracket",
            regex : /\(/y
        },
        {
            type : "rightRoundBracket",
            regex : /\)/y
        },
        {
            type : "leftCurlyBracket",
            regex: /{/y
        },
        {
            type : "rightCurlyBracket",
            regex: /}/y
        },
        {
            type : "whitespace",
            regex : /\s+/y
        },
        {
            type : "colon",
            regex: /:/y
        },
        {
            type : "comma",
            regex: /,/y
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
                        type : tag.type,
                        value : result[0],
                        index : result.index,
                        lastIndex : tag.regex.lastIndex
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
            case "reserved" : {
                current++

                let node = {
                    type : "ReservedLiteral",
                    value : token.value,
                    before : before
                }

                return node;
            }
            case "placeholder" : {
                current++

                let node = {
                    type : "PlaceholderLiteral",
                    value : token.value,
                    before : before
                }

                return node;
            }
            case "string" : {
                current++

                let node = {
                    type : "StringLiteral",
                    value : token.value,
                    before : before
                };

                token = tokens[current];
                if (token && token.type === "operation") {
                    stack.push(node);
                    node = walk(node);
                }

                return node
            }
            case "number" : {
                current++
                let isFloat = token.value.indexOf(".") > - 1;

                let node = {
                    type : "NumberLiteral",
                    value: isFloat ? Number.parseFloat(token.value) : Number.parseInt(token.value),
                    before : before
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
                    type : "Identifier",
                    value : token.value,
                    before : before
                };

                if (current < tokens.length) {
                    token = tokens[current];
                    if (token.type === "point") {
                        current++
                        node.property = walk(node);
                    }
                }

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

                    if (token && token.type === "operation") {
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
                        type : "UnaryExpression",
                        operator: token.value,
                        before : before
                    }

                    node.argument = walk(node)
                } else {
                    node = {
                        type: "BinaryExpression",
                        operator: token.value,
                        before : before
                    };

                    node.left = stack.pop();
                    node.right = walk(node);
                }

                token = tokens[current];
                if (token && token.type === "operation") {
                    stack.push(node);
                    node = walk(node);
                }

                return node
            }
            case "leftCurlyBracket" : {
                current++

                let node = {
                    type : "ObjectExpression",
                    parameters : [],
                    before : before
                }

                while (token.type !== "rightCurlyBracket") {
                    let key = walk(node);
                    current++
                    let value = walk(node);
                    node.parameters.push({
                        key : key,
                        value : value
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
                        type : "CallExpression",
                        callee : top,
                        arguments : [],
                        before : before
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

                    if (token && token.type === "operation") {
                        stack.push(node);
                        node = walk(node);
                    }

                    return node;
                }
            }
            case "conditional" : {
                current++
                let top = stack.pop();

                let node = {
                    type : "ConditionalExpression",
                    test : top,
                    before : before
                }

                node.consequent = walk(node);

                token = tokens[current];

                if (token && token.type === "colon") {
                    current++
                    node.alternate = walk(node)
                }

                return node;
            }
        }
    }

    while (current < tokens.length) {
        stack.push(walk(null));
    }

    return stack.pop();

}

function transformator(node, parent, callback) {
    switch (node.type) {
        case "ReservedLiteral" :
            return node;
        case "PlaceholderLiteral" :
            return {
                type : node.type,
                value : `args.${node.value}`
            }
        case "StringLiteral" :
            return node
        case "NumberLiteral" :
            return node
        case "Identifier" : {
            if (parent === null || parent.type !== "ObjectExpression") {
                if (node.value !== "this") {
                    node.value = callback(node.value)
                }
            }
            return node
        }
        case "UnaryExpression" : {
            return {
                type : node.type,
                operator: node.operator,
                argument: transformator(node.argument, node, callback)
            }
        }
        case "BinaryExpression" : {
            return {
                type: node.type,
                left : transformator(node.left, node, callback),
                operator : node.operator,
                right : transformator(node.right, node, callback)
            }
        }
        case "ConditionalExpression" :
            let result = {
                type : node.type,
                test: transformator(node.test, node, callback),
                consequent: transformator(node.consequent, node, callback)
            };

            if (node.alternate) {
                result.alternate = transformator(node.alternate, node, callback)
            }

            return node
        case "CallExpression" :
            return {
                type : node.type,
                callee: transformator(node.callee, node, callback),
                arguments: node.arguments.map((arg) => transformator(arg, node, callback))
            }
        case "ObjectExpression" :
            return {
                type : node.type,
                parameters : node.parameters.map((entry) => {
                    return {
                        key : transformator(entry.key, node, callback),
                        value : transformator(entry.value, node, callback)
                    }
                })
            }
    }
}

function codeGenerator(node) {

    switch (node.type) {
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

export function compiler(expression, callback) {
    let tokens = tokenizer(expression);
    let ast = parser(tokens);
    let transformed = transformator(ast, null, callback)
    return codeGenerator(transformed);
}

const proxyCache = new WeakMap();

export function evaluation(expression, context, args) {

    let proxy = proxyCache.get(context);

    if (! proxy) {
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

    let output = compiler(expression, (property) => {
        return `context.${property}`
    });

    let func = Function(`return function(context, args) {return ${output}}`);
    return func()(proxy, args)
}
