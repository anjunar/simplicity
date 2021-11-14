import {customComponents} from "../simplicity.js";

class DomCode extends HTMLElement {

    convert(html) {
        let spaceRegex = /[^\s]/;

        let split = html.split("\n");
        let indexOfFirstChar = 100;
        for (const segment of split) {
            let exec = spaceRegex.exec(segment);
            if (exec !== null && indexOfFirstChar > exec.index) {
                indexOfFirstChar = exec.index;
            }
        }

        let index = 1;
        let result = "";
        for (const segment of split) {
            let exec = spaceRegex.exec(segment);
            if (exec !== null) {
                result = result + segment.substr(indexOfFirstChar, segment.length) + "\n";
            } else {
                result = result + "\n"
            }
        }

        return result;
    }

    initialize() {
        this.style.whiteSpace = "pre"
        this.style.color = "var(--main-blue-color)"

        function htmlSpecialChars(str) {
            const specialChars = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&apos;'
            }
            return str.replace(/[&<>"#]/g, find => specialChars [find]);
        }

        let result;

        let orLanguageName = this.convert(this.innerHTML);

        if (this.getAttribute("lang") === "html5") {
            result = hljs.highlight(orLanguageName, {language: 'xml'}).value
        }
        if (this.getAttribute("lang") === "javascript") {
            result = hljs.highlight(orLanguageName, {language: 'javascript'}).value
        }

        for (const child of Array.from(this.childNodes)) {
            child.remove();
        }

        let container = document.createElement("div");
        container.innerHTML = result.replaceAll("&amp;gt;", "&gt;")

        let iterator = document.createNodeIterator(container, NodeFilter.SHOW_ELEMENT);
        let node = iterator.nextNode();

        while (node !== null) {
            node.preventHydration = true;
            node = iterator.nextNode();
        }

        this.appendChild(container)
    }

}

export default customComponents.define("dom-code", DomCode, {extends : "code"})
