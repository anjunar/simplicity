import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";
import MatScrollbarHorizontal from "../navigation/scrollbar/mat-scrollbar-horizontal.js";
import MatScrollbarVertical from "../navigation/scrollbar/mat-scrollbar-vertical.js";

class MatScrollArea extends HTMLElement {

    content;
    scrollX;
    scrollY;

    checkScrollBars() {
        let contentDiv = this.querySelector("div.content");
        let clientOffsetHeight = this.content.offsetHeight - contentDiv.offsetHeight;
        let clientOffsetWidth = this.content.offsetWidth - contentDiv.offsetWidth;
        let matScrollBarHorizontal = this.querySelector("mat-scrollbar-horizontal");
        let matScrollBarVertical = this.querySelector("mat-scrollbar-vertical");

        if (clientOffsetHeight <= 0) {
            matScrollBarVertical.hide();
        } else {
            matScrollBarVertical.show();
        }

        if (clientOffsetWidth <= 0) {
            matScrollBarHorizontal.hide();
        } else {
            matScrollBarHorizontal.show();
        }
    }

    onScrollY(event) {
        this.scrollY = event.target.position;
        this.dispatchEvent(new CustomEvent("scroll"))
    }

    onScrollX(event) {
        this.scrollX = event.target.position;
        this.dispatchEvent(new CustomEvent("scroll"))
    }

    initialize() {
        this.content = this.querySelector("div.content *");

        let windowProcess = (element) => {
            this.addEventListener("scroll", (event) => {
                let clientOffsetHeight = this.content.offsetHeight - element.offsetHeight + 16;
                let clientOffsetWidth = this.content.offsetWidth - element.offsetWidth + 16;
                let top = clientOffsetHeight * (event.target.scrollY || 0);
                let left = clientOffsetWidth * (event.target.scrollX || 0);

                this.content.style.transition = "all 0s cubic-bezier(0.2, .84, .5, 1)"
                this.content.style.transform = `translate3d(${- left}px, ${- top}px, 0px)`
            });

            function getMatrix(element) {
                if (element.style.transform === "") {
                    return {
                        x : 0,
                        y : 0,
                        z : 0
                    }
                }

                let regex = /translate3d\((-?[\d.]+)px,\s*(-?[\d.]+)px,\s*(-?[\d.]+)px\)/;
                let transform = regex.exec(element.style.transform);
                return {
                    x: Number.parseInt(transform[1]),
                    y: Number.parseInt(transform[2]),
                    z: Number.parseInt(transform[3])
                };
            }

            this.addEventListener("wheel", (event) => {
                event.preventDefault();
                let matrix = getMatrix(this.content);
                let top = - matrix.y + event.deltaY;
                let clientOffsetHeight = this.content.offsetHeight - element.offsetHeight + 16;
                if (clientOffsetHeight > 0) {
                    if (top < 0) {
                        top = 0;
                    }
                    if (top > clientOffsetHeight) {
                        top = clientOffsetHeight;
                    }
                    let position = top / clientOffsetHeight;
                    let matScrollbarVertical = this.querySelector("mat-scrollbar-vertical");
                    matScrollbarVertical.position = position;

                    this.content.style.transition = "all .5s cubic-bezier(0.2, .84, .5, 1)"
                    this.content.style.transform = `translate3d(0px, ${- top}px, 0px)`
                }
                return false;
            })
        }

        windowProcess(this.querySelector("div.content"))
    }

    static get components() {
        return [MatScrollbarHorizontal, MatScrollbarVertical]
    }

    static get template() {
        return libraryLoader("simplicity-material/components/modal/mat-scroll-area.html")
    }

}

export default customComponents.define("mat-scroll-area", MatScrollArea)