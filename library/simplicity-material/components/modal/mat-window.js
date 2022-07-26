import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";
import MatScrollArea from "./mat-scroll-area.js";
import {windowManager} from "../../manager/window-manager.js";

class MatWindow extends HTMLElement {

    resizable = true;
    draggable = true;
    maximized = false;
    minimized = false;

    get contents() {
        let element = this.querySelector("div.content div *");
        return element
    }

    minimize() {
        windowManager.minimize(this);
    }

    maximize() {
        windowManager.maximize(this);
    }

    ok() {
        this.dispatchEvent(new CustomEvent("ok"))
        windowManager.close(this);
    }

    close(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("close"))
        windowManager.close(this);
        return false;
    }

    initialize() {
        this.addEventListener("windowEndResize", () => {
            let matScrollArea = this.querySelector("mat-scroll-area");
            matScrollArea.checkScrollBars();
        });

        this.addEventListener("click", (event) => {
            windowManager.clickWindow(this);
        })

        let dragElement = (element) => {
            let deltaX = 0, deltaY = 0, pointerX = 0, pointerY = 0;

            let elementDrag = (e) => {
                e.preventDefault();
                deltaX = pointerX - e.clientX;
                deltaY = pointerY - e.clientY;
                pointerX = e.clientX;
                pointerY = e.clientY;
                let top = element.offsetTop - deltaY;
                if (top < 0) {
                    top = 0;
                }
                let left = element.offsetLeft - deltaX;
                element.style.top = top + "px";
                element.style.left = left + "px";
                this.dispatchEvent(new CustomEvent("windowDrag"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dispatchEvent(new CustomEvent("windowEndDrag"));
            }

            let dragMouseDown = (e) => {
                if (!this.maximized && this.draggable) {
                    e.preventDefault();
                    pointerX = e.clientX;
                    pointerY = e.clientY;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    this.dispatchEvent(new CustomEvent("windowStartDrag"));
                }
            }

            return dragMouseDown
        }

        let nResizeTop = (element) => {
            let delta = element.offsetTop, pointer = element.offsetTop;

            let elementDrag = (event) => {
                event.preventDefault();
                delta = pointer - event.clientY;
                pointer = event.clientY;
                element.style.height = ((element.offsetHeight - 2) + delta) + "px";
                element.style.top = (element.offsetTop - delta) + "px";
                this.dispatchEvent(new CustomEvent("windowResize"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dispatchEvent(new CustomEvent("windowEndResize"));
            }

            let dragMouseDown = (event) => {
                if (this.resizable && !this.maximized) {
                    event.preventDefault();
                    pointer = event.clientY;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    this.dispatchEvent(new CustomEvent("windowStartResize"));
                }
            }

            return dragMouseDown
        }

        let seResize = (element) => {
            let deltaY = element.offsetTop, pointerY = element.offsetTop;
            let deltaX = element.offsetLeft, pointerX = element.offsetLeft;

            let elementDrag = (event) => {
                event.preventDefault();
                deltaY = pointerY - event.clientY;
                pointerY = event.clientY;
                element.style.height = ((element.offsetHeight - 2) + deltaY) + "px";
                element.style.top = (element.offsetTop - deltaY) + "px";

                deltaX = pointerX - event.clientX;
                pointerX = event.clientX;
                element.style.width = ((element.offsetWidth - 2) + deltaX) + "px";
                element.style.left = (element.offsetLeft - deltaX) + "px";
                this.dispatchEvent(new CustomEvent("windowResize"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dispatchEvent(new CustomEvent("windowEndResize"));
            }

            let dragMouseDown = (event) => {
                if (this.resizable && !this.maximized) {
                    event.preventDefault();
                    pointerY = event.clientY;
                    pointerX = event.clientX;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    this.dispatchEvent(new CustomEvent("windowStartResize"));
                }
            }

            return dragMouseDown;
        }

        let eResizeLeft = (element) => {
            let delta = element.offsetLeft, pointer = element.offsetLeft;

            let elementDrag = (event) => {
                event.preventDefault();
                delta = pointer - event.clientX;
                pointer = event.clientX;
                element.style.width = ((element.offsetWidth - 2) + delta) + "px";
                element.style.left = (element.offsetLeft - delta) + "px";
                this.dispatchEvent(new CustomEvent("windowResize"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dispatchEvent(new CustomEvent("windowEndResize"));
            }

            let dragMouseDown = (event) => {
                if (this.resizable && !this.maximized) {
                    event.preventDefault();
                    pointer = event.clientX;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    this.dispatchEvent(new CustomEvent("windowStartResize"));
                }
            }

            return dragMouseDown;
        }

        let neResize = (element) => {
            let deltaY = element.offsetTop, pointerY = element.offsetTop;
            let deltaX = element.offsetLeft, pointerX = element.offsetLeft;

            let elementDrag = (event) => {
                event.preventDefault();
                deltaY = pointerY - event.clientY;
                pointerY = event.clientY;
                element.style.height = ((element.offsetHeight - 2) - deltaY) + "px";
                element.style.bottom = ((element.offsetTop + (element.offsetHeight - 2)) - deltaY) + "px";

                deltaX = pointerX - event.clientX;
                pointerX = event.clientX;
                element.style.width = ((element.offsetWidth - 2) + deltaX) + "px";
                element.style.left = (element.offsetLeft - deltaX) + "px";
                this.dispatchEvent(new CustomEvent("windowResize"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dispatchEvent(new CustomEvent("windowEndResize"));
            }

            let dragMouseDown = (event) => {
                if (this.resizable && !this.maximized) {
                    event.preventDefault();
                    pointerY = event.clientY;
                    pointerX = event.clientX;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    this.dispatchEvent(new CustomEvent("windowStartResize"));
                }
            }

            return dragMouseDown;
        }

        let swResize = (element) => {
            let deltaY = element.offsetTop, pointerY = element.offsetTop;
            let deltaX = element.offsetLeft, pointerX = element.offsetLeft;

            let elementDrag = (event) => {
                event.preventDefault();
                deltaY = pointerY - event.clientY;
                pointerY = event.clientY;
                element.style.height = ((element.offsetHeight - 2) + deltaY) + "px";
                element.style.top = (element.offsetTop - deltaY) + "px";

                deltaX = pointerX - event.clientX;
                pointerX = event.clientX;
                element.style.width = ((element.offsetWidth - 2) - deltaX) + "px";
                element.style.right = ((element.offsetLeft + (element.offsetWidth - 2)) - deltaX) + "px";
                this.dispatchEvent(new CustomEvent("windowResize"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dispatchEvent(new CustomEvent("windowEndResize"));
            }

            let dragMouseDown = (event) => {
                if (this.resizable && !this.maximized) {
                    event.preventDefault();
                    pointerY = event.clientY;
                    pointerX = event.clientX;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    this.dispatchEvent(new CustomEvent("windowStartResize"));
                }
            }

            return dragMouseDown;
        }

        let eResizeRight = (element) => {
            let delta = element.offsetLeft, pointer = element.offsetLeft;

            let elementDrag = (event) => {
                event.preventDefault();
                delta = pointer - event.clientX;
                pointer = event.clientX;
                element.style.width = ((element.offsetWidth - 2) - delta) + "px";
                element.style.right = ((element.offsetLeft + (element.offsetWidth - 2)) - delta) + "px";
                this.dispatchEvent(new CustomEvent("windowResize"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dispatchEvent(new CustomEvent("windowEndResize"));
            }

            let dragMouseDown = (event) => {
                if (this.resizable && !this.maximized) {
                    event.preventDefault();
                    pointer = event.clientX;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    this.dispatchEvent(new CustomEvent("windowStartResize"));
                }
            }

            return dragMouseDown;
        }

        let nwResize = (element) => {
            let deltaY = element.offsetTop, pointerY = element.offsetTop;
            let deltaX = element.offsetLeft, pointerX = element.offsetLeft;

            let elementDrag = (event) => {
                event.preventDefault();
                deltaY = pointerY - event.clientY;
                pointerY = event.clientY;
                element.style.height = ((element.offsetHeight - 2) - deltaY) + "px";
                element.style.bottom = ((element.offsetTop + (element.offsetHeight - 2)) - deltaY) + "px";

                deltaX = pointerX - event.clientX;
                pointerX = event.clientX;
                element.style.width = ((element.offsetWidth - 2) - deltaX) + "px";
                element.style.right = ((element.offsetLeft + (element.offsetWidth - 2)) - deltaX) + "px";
                this.dispatchEvent(new CustomEvent("windowResize"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dispatchEvent(new CustomEvent("windowEndResize"));
            }

            let dragMouseDown = (event) => {
                if (this.resizable && !this.maximized) {
                    event.preventDefault();
                    pointerY = event.clientY;
                    pointerX = event.clientX;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    this.dispatchEvent(new CustomEvent("windowStartResize"));
                }
            }

            return dragMouseDown;
        }

        let nResizeBottom = (element) => {
            let delta = element.offsetTop, pointer = element.offsetTop;

            let elementDrag = (event) => {
                event.preventDefault();
                delta = pointer - event.clientY;
                pointer = event.clientY;
                element.style.height = ((element.offsetHeight - 2) - delta) + "px";
                element.style.bottom = ((element.offsetTop + (element.offsetHeight - 2)) - delta) + "px";
                this.dispatchEvent(new CustomEvent("windowResize"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dispatchEvent(new CustomEvent("windowEndResize"));
            }

            return (event) => {
                if (this.resizable && !this.maximized) {
                    event.preventDefault();
                    pointer = event.clientY;
                    document.onmouseup = closeDragElement;
                    document.onmousemove = elementDrag;
                    this.dispatchEvent(new CustomEvent("windowStartResize"));
                }
            };
        }

        this.dragMouseDown = dragElement(this);

        this.nResizeTopMouseDown = nResizeTop(this);
        this.seResizeMouseDown = seResize(this);
        this.eResizeLeftMouseDown = eResizeLeft(this);
        this.neResizeMouseDown = neResize(this);
        this.swResizeMouseDown = swResize(this);
        this.eResizeRightMouseDown = eResizeRight(this);
        this.nwResizeMouseDown = nwResize(this);
        this.nResizeBottomMouseDown = nResizeBottom(this);
    }

    static get components() {
        return [MatScrollArea]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/modal/mat-window.html")
    }

}

export default customComponents.define("mat-window", MatWindow)