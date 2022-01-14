import {content, contentRegistry} from "../processors/html-compiler-processor.js";

export const contentManager = new class ContentManager {

    instance(element, implicit) {
        element = element.resolve || element;
        return content(element, implicit);
    }

    register(element, children) {
        function template(implicit) {
            return children.map((child) => {
                let ast = {
                    build(parent) {
                        parent.appendChild(child);
                    },
                    update() {
                        console.log("update")
                    }
                };

                return ast
            })
        }

        contentRegistry.set(element, template)
    }

}