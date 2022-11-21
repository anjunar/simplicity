import {rawAttributes, attributes, notifyElementRemove, buildStrategie} from "./helper.js";
import {parse} from "../processors/js-compiler-extension.js";
import {codeGenerator as jsCodeGenerator, evaluation} from "../processors/js-compiler-processor.js";
import {generateDomProxy} from "../services/tools.js";
import {customPlugins, activeObjectExpression, Context, membraneFactory} from "../processors/html-compiler-processor.js";

function forExpressions(expressions) {
    let ast = parse(expressions);

    let result = {};

    for (const bodyExpression of ast.body) {
        if (bodyExpression.type === "VariableDeclaration") {
            for (const expression of bodyExpression.declarations) {
                if (expression.type === "ForVariableDeclaration") {
                    result.for = {
                        expression: jsCodeGenerator(expression, true),
                        variable: expression.id.name,
                        source: jsCodeGenerator(expression.init, true)
                    }
                }
                if (expression.type === "VariableDeclarator") {
                    if (expression.init.name === "index") {
                        result.index = {
                            expression: jsCodeGenerator(expression, true),
                            variable: expression.id.name
                        }
                    }
                    if (expression.init.name === "length") {
                        result.length = {
                            expression: jsCodeGenerator(expression, true),
                            variable: expression.id.name
                        }
                    }
                }
                if (expression.id.type === "ArrayPattern") {
                    result.for = {
                        expression: jsCodeGenerator(expression, true),
                        variable: expression.id.elements.map(element => element.name),
                        source: jsCodeGenerator(expression.init, true)
                    }
                }
            }
        }
        if (bodyExpression.type === "ExpressionStatement") {
            let expressionStatement = bodyExpression.expression;
            if (expressionStatement.type === "AssignmentExpression" && expressionStatement.left.name === "onRendered") {
                result.onRendered = {
                    expression: jsCodeGenerator(expressionStatement, true),
                    func: jsCodeGenerator(expressionStatement.right, true)
                }
            }
            if (expressionStatement.type === "AssignmentExpression" && expressionStatement.left.name === "force") {
                result.force = {
                    expression: jsCodeGenerator(expressionStatement, true),
                    enabled: true
                }
            }
        }
    }
    return result;
}

function forStatement(rawAttributes, context, callback, imported = false) {

    let attribute = rawAttributes.find((attribute) => attribute.startsWith("bind:for") || attribute.startsWith("read:for"))
    let bindOnce = attribute.startsWith("read");
    let indexOf = attribute.indexOf("=");
    let expressions = attribute.substr(indexOf + 1)

    let data = forExpressions(expressions);

    let children = [];
    let result = evaluation(data.for.source, context, null, bindOnce);
    let array;
    if (result instanceof Array) {
        array = Array.from(result);
    } else if (result instanceof Object) {
        if (data.for.variable instanceof Array) {
            array = Object.entries(result);
        } else {
            array = Object.values(result);
        }
    } else {
        console.log(`For loops data source is a ${typeof result} from path ${data.for.source}`)
    }

    let ast = [];

    let container = document.createDocumentFragment();
    let comment = document.createComment(data.for.expression);

    if (! bindOnce) {
        activeObjectExpression(data.for.source, context, comment, (result) => {
            let value = result instanceof Array ? result : Object.entries(result);
            update(value)
        });
    }

    function generate() {
        array.forEach((item, index) => {
            let instance = {};
            if (data.for.variable instanceof Array) {
                let [key, value] = item;
                instance[data.for.variable[0]] = key;
                instance[data.for.variable[1]] = value;
            } else {
                instance[data.for.variable] = item;
            }
            if (data.index) {
                instance[data.index.variable] = index;
            }
            if (data.length) {
                instance[data.length.variable] = array.length;
            }
            let scope = {proxy : {handlers : [], property : ""}};
            let newContext = new Context(membraneFactory(instance, [scope]), context);
            let astLeaf = callback(newContext);
            ast.push(astLeaf);
            let build = buildStrategie(astLeaf, container, imported)
            children.push(build);
            Object.assign(build, instance);
            generateDomProxy(build);
            build.handlers = scope.proxy.handlers;
        })

        comment.children = children;

    }

    function update(value) {
        // console.log("for: " + data.for.expression)
        array = value;
        for (const child of children) {
            notifyElementRemove(child);
            child.remove();
        }
        children.length = 0;
        ast.length = 0;
        generate();
        comment.after(container);
        if (data.onRendered) {
            evaluation(data.onRendered.func, context, {$children: children}, true)
        }
    }

    return {
        type: "for",
        expression: expressions,
        children: ast,
        build: function (parent) {
            generate();
            parent.appendChild(comment);
            parent.appendChild(container);
            if (data.onRendered) {
                evaluation(data.onRendered.func, context, {$children: children}, true)
            }
            return children;
        },
        import(parent) {
            return forStatement(rawAttributes, context, callback, true)
                .build(parent)
        }
    }
}

export default customPlugins.define({
    name : ["bind:for", "read:for"],
    destination : "Attribute",
    code : function (tagName, node, children, intern, isSvg, tabs, level) {
        return `\n${tabs}forStatement([${rawAttributes(node)}], context, (context) => {return html("${tagName}", [${attributes(node)}], [${children(node, level + 1, isSvg)}\n${tabs}])})`
    },
    executor : forStatement
});