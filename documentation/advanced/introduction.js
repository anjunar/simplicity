import {customViews} from "../../library/simplicity/simplicity.js";
import {loader} from "../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../library/simplicity/directives/dom-code.js";

class AppIntroduction extends HTMLElement {

    html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello World</title>
    <style>
        advanced-hello-world {
            display: block;
        }

        advanced-hello-world div.center {
            margin: 0;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    </style>
</head>
<body>
    <template>
        <div class="center">
            <div>\${text}</div>
        </div>
    </template>
</body>
</html>`

    script = `import {customComponents, customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class HelloWorld extends HTMLElement {

    text = ""

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case "text" : {
                this.text = newValue;
            }
        }
    }

    static get observedAttributes() {
        return [{
            name : "text",
            type : "input"
        }];
    }

    static get template() {
        return loader("documentation/advanced/examples/hello-world.html");
    }

}

export default customComponents.define("advanced-hello-world", HelloWorld)`

    initialize() {
        let html = hljs.highlight(this.html, {language: 'xml'}).value;
        let script = hljs.highlight(this.script, {language: 'javascript'}).value;

        let codeHTML = this.querySelector("#html");
        let codeScript = this.querySelector("#script");

        let htmlContainer = document.createElement("div");
        let scriptContainer = document.createElement("div");

        htmlContainer.innerHTML = html;
        scriptContainer.innerHTML = script;

        let iterator = document.createNodeIterator(htmlContainer, NodeFilter.SHOW_ELEMENT);
        let node = iterator.nextNode();

        while (node !== null) {
            node.preventHydration = true;
            node = iterator.nextNode();
        }

        iterator = document.createNodeIterator(scriptContainer, NodeFilter.SHOW_ELEMENT);
        node = iterator.nextNode();

        while (node !== null) {
            node.preventHydration = true;
            node = iterator.nextNode();
        }

        codeHTML.appendChild(htmlContainer);
        codeScript.appendChild(scriptContainer)

    }

    static get components() {
        return [DomCode];
    }

    static get template() {
        return loader("documentation/advanced/introduction.html")
    }

}

export default customViews.define({
    name: "advanced-welcome",
    class: AppIntroduction
});