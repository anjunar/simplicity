import {customViews} from "../../library/simplicity/simplicity.js";
import {loader} from "../../library/simplicity/processors/loader-processor.js";

class AppIntroduction extends HTMLElement {

    index = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Simplicity</title>
    <link rel="stylesheet" href="styles.css">
    <script type="module" src="documentation/app.js"></script>
</head>
<body>
    <app-documentation></app-documentation>
</body>
</html>`

    html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>App</title>
</head>
<body>
    <template>
        \${text}
    </template>
</body>
</html>`

    script = `
import {customComponents} from "../library/simplicity/simplicity.js";
import {loader} from "../library/simplicity/processors/loader-processor.js";

export default class DocumentationApp extends HTMLElement {

    text = "Hello World!"

    static get template() {
        return loader("documentation/app.html");
    }
}

customComponents.define("app-documentation", DocumentationApp);`

    initialize() {
        let index = hljs.highlight(this.index, {language: 'xml'}).value;
        let html = hljs.highlight(this.html, {language: 'xml'}).value;
        let script = hljs.highlight(this.script, {language: 'javascript'}).value;

        let codeIndex = this.querySelector("#index");
        let codeHTML = this.querySelector("#html");
        let codeScript = this.querySelector("#script");

        let indexContainer = document.createElement("div")
        let htmlContainer = document.createElement("div");
        let scriptContainer = document.createElement("div");

        indexContainer.innerHTML = index;
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

        iterator = document.createNodeIterator(indexContainer, NodeFilter.SHOW_ELEMENT);
        while (node !== null) {
            node.preventHydration = true;
            node = iterator.nextNode();
        }

        codeIndex.appendChild(indexContainer)
        codeHTML.appendChild(htmlContainer);
        codeScript.appendChild(scriptContainer)

    }

    static get template() {
        return loader("documentation/basic/started.html")
    }

}

export default customViews.define({
    name: "basic-getting-started",
    class: AppIntroduction
});