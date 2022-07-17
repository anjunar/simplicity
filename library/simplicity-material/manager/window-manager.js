import MatWindow from "../components/modal/mat-window.js";
import {get, viewManager} from "../../simplicity-core/manager/view-manager.js";
import MatModal from "../components/modal/mat-modal.js";
import {contentManager} from "../../simplicity-core/manager/content-manager.js";
import {notifyElementRemove} from "../../simplicity-core/plugins/helper.js";

const windowsRegistry = [];

function zIndexSorted() {
    return windowsRegistry.sort((lhs, rhs) => Number.parseInt(lhs.style.zIndex) - Number.parseInt(rhs.style.zIndex));
}

export const windowManager = new class WindowManager {

    openWindow(url, options) {
        let executor = (resolve, reject) => {
            viewManager.load(url).then((view) => {
                view.setAttribute("slot", "content");
                let configuration = get(view.localName);

                let header = document.createElement("div");
                header.setAttribute("slot", "header");
                header.textContent = configuration.header;

                if (options?.data) {
                    Object.assign(view, options.data);
                }

                let matWindow = new MatWindow();

                contentManager.register(matWindow, [header, view]);

                if (options?.width) {
                    matWindow.style.width = options.width;
                }

                if (options?.height) {
                    matWindow.style.height = options.height;
                }

                if (configuration.width) {
                    matWindow.style.width = configuration.width;
                }

                if (configuration.height) {
                    matWindow.style.height = configuration.height
                }

                windowsRegistry.push(matWindow);

                if (configuration.modal) {
                    matWindow.resizable = false;
                    matWindow.draggable = false;
                    let modal = new MatModal();
                    contentManager.register(modal, [matWindow]);
                    matWindow.addEventListener("close", () => {
                        modal.remove();
                    })
                    matWindow.addEventListener("ok", () => {
                        modal.remove();
                    })

                    let viewport = document.querySelector("viewport");
                    viewport.appendChild(modal);
                } else {
                    let viewport = document.querySelector("viewport");
                    viewport.appendChild(matWindow);
                }

                let matScrollArea = matWindow.querySelector("mat-scroll-area");
                matScrollArea.checkScrollBars();

                matWindow.style.top = matWindow.parentElement.offsetHeight / 2 - matWindow.offsetHeight / 2 + "px"
                matWindow.style.left = matWindow.parentElement.offsetWidth / 2 - matWindow.offsetWidth / 2 + "px"

                this.clickWindow(matWindow);
                window.dispatchEvent(new CustomEvent("window"));

                resolve(matWindow);
            })
        }
        return new Promise(executor);
    }

    findByView(view) {
        for (const matWindow of windowsRegistry) {
            if (matWindow[1].content === view) {
                return matWindow[1];
            }
        }
        return null;
    }

    clickWindow(matWindow) {
        let sort = Array.from(zIndexSorted());

        let indexOf = sort.indexOf(matWindow);

        sort.splice(indexOf, 1);

        sort.push(matWindow);

        for (let i = 0; i < sort.length; i++) {
            const sortElement = sort[i];
            sortElement.style.zIndex = (i + 1) * 10;

            for (const value of windowsRegistry) {
                if (value === sortElement) {
                    value.minimized = false;
                }
            }
        }
    }

    get windows() {
        return windowsRegistry;
    }

    get configurations() {
        return this.windows.map((window) => {
            return {
                window : window,
                configuration : get(window.contents.localName)
            }
        })
    }

    show(matWindow) {
        matWindow.style.display = "block";
    }

    close(matWindow) {
        if (matWindow.isProxy) {
            matWindow = matWindow.resolve;
        }
        let indexOf = windowsRegistry.indexOf(matWindow);
        windowsRegistry.splice(indexOf, 1)
        matWindow.remove();
        notifyElementRemove(matWindow);
        window.dispatchEvent(new CustomEvent("window"));
    }

    minimize(matWindow) {
        matWindow.minimized = true;
        matWindow.style.display = "none";
    }

    closeAll() {
        for (const window of windowsRegistry) {
            this.close(window);
        }
    }

    maximize(matWindow) {
        if (matWindow.maximized) {
            matWindow.style.left = matWindow.maximized.left
            matWindow.style.top = matWindow.maximized.top;
            matWindow.style.width = matWindow.maximized.width;
            matWindow.style.height = matWindow.maximized.height;

            matWindow.maximized = false;
        } else {
            matWindow.maximized = {
                left : matWindow.style.left,
                top : matWindow.style.top,
                width : matWindow.style.width,
                height : matWindow.style.height
            }

            matWindow.style.left = "0";
            matWindow.style.top = "0";
            matWindow.style.width = matWindow.parentElement.offsetWidth + "px";
            matWindow.style.height = matWindow.parentElement.offsetHeight + "px"
        }
    }

    isTopWindow(matWindow) {
        let sorted = zIndexSorted();
        return sorted[sorted.length - 1] === matWindow;
    }

}