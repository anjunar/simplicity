import {customViews} from "../../library/simplicity/simplicity.js";
import {loader} from "../../library/simplicity/processors/loader-processor.js";
import {rawClient} from "../../library/simplicity/services/client.js";

class AppIntroduction extends HTMLElement {

    html;
    script;

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



    static get template() {
        return loader("documentation/basic/introduction.html")
    }

}

export default customViews.define({
    name : "basic-welcome",
    class : AppIntroduction,
    guard(activeRoute) {
        return {
            html : rawClient.get("documentation/basic/examples/hello-world.html"),
            script : rawClient.get("documentation/basic/examples/hello-world.js")
        }
    }
});