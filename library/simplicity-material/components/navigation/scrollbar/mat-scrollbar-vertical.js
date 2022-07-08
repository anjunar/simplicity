import {customComponents} from "../../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../../simplicity-core/processors/loader-processor.js";

class MatScrollbarVertical extends HTMLElement {

    _position;

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
        let element = this.querySelector("div.cursor");
        let number = (this.offsetHeight - 16) * value;
        element.style.top = number + "px";
    }

    initialize() {

        let sliderVertical = (element) => {
            let delta = element.offsetTop, pointer = element.offsetTop;

            let elementDrag = (event) => {
                event.preventDefault();
                delta = pointer - event.clientY;
                pointer = event.clientY;
                let computedStyle = Number.parseInt(window.getComputedStyle(element).top.replace("px", ""));
                let number = computedStyle - delta;
                if (number < 0) {
                    number = 0;
                }
                if (number > this.offsetHeight - 16) {
                    number = this.offsetHeight - 16;
                }
                this.position = number / (this.offsetHeight - 16);
                element.style.top = number + "px";
                this.dispatchEvent(new CustomEvent("scroll"));
            }

            let closeDragElement = () => {
                document.onmouseup = null;
                document.onmousemove = null;
            }

            return (event) => {
                event.preventDefault();
                pointer = event.clientY;
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            };
        }

        this.sliderVertical = sliderVertical(this.querySelector("div.cursor"));
    }


    show() {
        this.style.display = "block";
    }

    hide() {
        this.style.display = "none";
    }

    static get template() {
        return libraryLoader("simplicity-material/components/navigation/scrollbar/mat-scrollbar-vertical.html")
    }

}

export default customComponents.define("mat-scrollbar-vertical", MatScrollbarVertical)