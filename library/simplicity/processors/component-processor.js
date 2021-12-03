function hasBinding(element) {
    for (const attribute of element.attributes) {
        if (attribute.name.startsWith("bind:")) {
            return true;
        }
    }
    return false;
}

function hasTextInterpolation(element) {
    for (const childNode of element.childNodes) {
        if (childNode.nodeType === 3) {
            let interpolationRegExp = /\${([^}]+)}/g;
            return interpolationRegExp.test(childNode.textContent)
        }
    }
}

function isTemplateRepeat(node, template) {
    return template && node.parentNode === template.content && template.getAttribute("is") === "dom-repeat"
}

function isI18n(element) {
    return element.hasAttribute("i18n");
}

function enrich(templateElement) {
    function iterate(element, template) {
        let iterator = document.createNodeIterator(element, NodeFilter.SHOW_ELEMENT);
        let node = iterator.nextNode();
        while (node != null) {
            if (node.localName.indexOf("-") === -1 && ! node.hasAttribute("is")) {
                if (hasBinding(node) || hasTextInterpolation(node) || isTemplateRepeat(node, template) || isI18n(node)) {
                    node.setAttribute("is", "native-" + node.localName);
                    import("../components/native/native-" + node.localName + ".js")
                        .then(() => {
                            document.dispatchEvent(new CustomEvent("lifecycle", {detail : {target: document.body, event: "import"}}))
                        })
                }
            }

            if (node instanceof HTMLTemplateElement && node.hasAttribute("is")) {
                iterate(node.content, node);
            }
            node = iterator.nextNode();
        }
    }

    iterate(templateElement.content);
}

export class ComponentProcessor {

    parse(html) {
        let domParser = new DOMParser();
        let rawParsed = domParser.parseFromString(html, "text/html");
        enrich(rawParsed.querySelector("template"));
        return domParser.parseFromString(rawParsed.documentElement.innerHTML, "text/html");
    }

}