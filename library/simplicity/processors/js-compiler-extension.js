import {parser, Parser, TopLevelParser} from "../../flash/parser.js";
import {generator, Generator} from "../../flash/generator.js";
import {tags} from "../../flash/tokenizer.js";

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