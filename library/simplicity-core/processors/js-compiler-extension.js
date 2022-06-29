import {parser, Parser, TopLevelParser} from "../../simplicity-parser/parser.js";
import {generator, Generator} from "../../simplicity-parser/generator.js";
import {tags} from "../../simplicity-parser/tokenizer.js";

tags.splice(1, 0,{
        type: "placeholder",
        regex: /(\$event|\$value|\$children|\$context)/y,
        keyWord : true
    }
)

class CustomGenerator extends Generator {
    ForVariableDeclaration(node, walk, scope) {
        let result = walk(node.id, [...scope, node]);
        if (node.init) {
            result += " of " + walk(node.init, [...scope, node]);
        }
        return result
    }
    PlaceholderLiteral(node, walk, scope) {
        return node.name;
    }
    MemberExpression(node, walk, scope) {
        if (node.property.type === "Identifier" || node.property.type === "MemberExpression" || node.property.type === "CallExpression" || node.property.type === "PlaceholderLiteral") {
            return walk(node.object, [...scope, node]) + "." + walk(node.property, [...scope, node])
        }
        return walk(node.object, [...scope, node]) + "[" + walk(node.property, [...scope, node]) + "]"
    }
}

class CustomParser extends Parser {
    placeholder(state, stack, walk, init, topLevel) {
        let token = state.current();

        let node = {
            type: "PlaceholderLiteral",
            name: token.value
        };

        state.next();

        return node;
    }

    variableDeclarations(state, stack, walk, init, topLevel) {
        let token = state.current();

        let node = {
            type: "VariableDeclaration",
            kind: token.value,
            declarations: []
        }

        state.next();

        while ((token && token.type === "comma") || (token && token.type === "variableDeclarations")) {
            let subNode = {
                type: "VariableDeclarator"
            };
            node.declarations.push(subNode)
            if (token.type === "comma") {
                state.next();
            }
            subNode.id = walk([...init, {...subNode, position : "id"}]);
            token = state.current();
            if (token.type === "assignment") {
                token = state.next();
                subNode.init = walk([...init, {...subNode, position : "init"}]);
                token = state.current();
            }
            if (token.type === "operation" && this.topType(init) !== "ForStatement") {
                subNode.type = "ForVariableDeclaration";
                token = state.next();
                subNode.init = walk([...init, {...subNode, position : "init"}]);
                token = state.current();
            }
        }

        return node;
    }
}

export function parse(expression) {
    return parser(expression, [new TopLevelParser(), new CustomParser()])
}

export function generate(ast) {
    return generator(ast, [new CustomGenerator()])
}