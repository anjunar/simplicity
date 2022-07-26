import {content, contentRegistry} from "../processors/html-compiler-processor.js";

export const contentManager = new class ContentManager {

    instance(element, implicit) {
        element = element.resolve || element;
        return content(element, implicit);
    }

    register(element, children) {
        function template(implicit) {
            return children.map((outerChild) => {
                return {
                    type : "registeredContentChildren",
                    build(parent) {
                        let child = document.importNode(outerChild);
                        child.table = outerChild.table
                        parent.appendChild(child);
                        if (! this.element) {
                            this.element = child;
                        }
                        return child;
                    },
                }
            })
        }

        contentRegistry.set(element, template)
    }

}