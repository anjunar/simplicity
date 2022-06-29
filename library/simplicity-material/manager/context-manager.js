import {get, viewManager} from "../../simplicity-core/manager/view-manager.js";
import MatContextMenu from "../components/modal/mat-context-menu.js";

export const contextManager = new class ContextManager {
    openContext(url, options) {
        let executor = (resolve, reject) => {
            viewManager.load("#" + url).then((view) => {
                if (options?.data) {
                    Object.assign(view, options.data);
                }

                let configuration = get(view.localName);

                let viewPort = document.querySelector("viewport");
                let viewPortRect = viewPort.getBoundingClientRect();

                let matContextMenu = new MatContextMenu();
                matContextMenu.appendChild(view);
                matContextMenu.style.top = options.pageY - viewPortRect.top - 2 + "px";
                matContextMenu.style.left = options.pageX - viewPortRect.left - 2 + "px";

                viewPort.appendChild(matContextMenu);

                resolve(matContextMenu);
            });
        }

        return new Promise(executor);
    }
}