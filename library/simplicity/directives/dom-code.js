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

        let templateElement = this.querySelector("template");

        if (this.getAttribute("lang") === "html5") {
            let htmliFrameElement = templateElement.content.querySelector("iframe");
            let orLanguageName = this.convert(htmliFrameElement.innerHTML);
            result = hljs.highlight(orLanguageName, {language: 'xml'}).value
        }
        if (this.getAttribute("lang") === "javascript") {
            let htmlScriptElement = templateElement.content.querySelector("script");
            let orLanguageName = this.convert(htmlScriptElement.innerHTML);
            result = hljs.highlight(orLanguageName, {language: 'javascript'}).value
        }

        for (const child of Array.from(this.childNodes)) {
            child.remove();
        }

        let container = document.createElement("div");
        container.innerHTML = result.replaceAll("&amp;gt;", "&gt;")

        this.appendChild(container)
    }

}

export default customComponents.define("dom-code", DomCode, {extends : "code"})
