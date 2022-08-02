import {content, contentRegistry} from "../processors/html-compiler-processor.js";

export const contentManager = new class ContentManager {

    instance(element, implicit) {
        element = element.resolve || element;
        return content(element, implicit);
    }

    register(element, children, data) {
        function template(implicit) {
            return children.map((outerChild) => {
                return {
                    type : "registeredContentChildren",
                    element : outerChild,
                    build(parent) {
                        parent.appendChild(outerChild);
                    },
                    import(parent) {
                        let child = document.importNode(outerChild);
                        let outerRegistry = contentRegistry.get(outerChild);
                        if (outerRegistry) {
                            contentRegistry.set(child, outerRegistry)
                        }
                        if (data) {
                            Object.assign(child, data)
                        }
                        parent.appendChild(child);
                        return child;
                    }
                }
            })
        }

        contentRegistry.set(element, template)
    }

}