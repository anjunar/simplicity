import {content, contentRegistry} from "../processors/html-compiler-processor.js";

export const contentManager = new class ContentManager {

    instance(element, implicit) {
        element = element.resolve || element;
        return content(element, implicit);
    }

    register(element, children) {
        function template(implicit) {
            return children.map((child) => {
                return {
                    build(parent) {
                        parent.appendChild(child);
                    },
                    update() {
                        // Todo : What could be done here?
                    }
                }
            })
        }

        contentRegistry.set(element, template)
    }

}