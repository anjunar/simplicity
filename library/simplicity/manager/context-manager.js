import {viewManager} from "./view-manager.js";
import MatContextMenu from "../components/modal/mat-context-menu.js";

export const contextManager = new class ContextManager {
    openContext(url, options) {
        let executor = (resolve, reject) => {
            viewManager.load(url).then((view) => {
                if (options?.data) {
                    Object.assign(view, options.data);
                }

                view.render();

                let viewPort = document.querySelector("viewport");
                let viewPortRect = viewPort.getBoundingClientRect();

                function content() {
                    return [{
                        type : "dom",
                        dom : view
                    }]
                }

                let matContextMenu = new MatContextMenu({content});
                matContextMenu.render();

                matContextMenu.style.top = options.pageY - viewPortRect.top - 2 + "px";
                matContextMenu.style.left = options.pageX - viewPortRect.left - 2 + "px";

                viewPort.appendChild(matContextMenu);

                resolve(matContextMenu);
            });
        }

        return new Promise(executor);
    }
}