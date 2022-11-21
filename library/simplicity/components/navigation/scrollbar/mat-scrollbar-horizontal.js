import {customComponents} from "../../../../simplicity/simplicity.js";
import {libraryLoader} from "../../../util/loader.js";

class MatScrollbarHorizontal extends HTMLElement {

    _position;

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
        let element = this.querySelector("div.cursor");
        let number = (this.offsetWidth - 16) * value;
        element.style.left = number + "px";
    }

    initialize() {

        let sliderHorizontal = (element) => {
            let delta = element.offsetLeft, pointer = element.offsetLeft;

            let elementDrag = (event) => {
                event.preventDefault();
                delta = pointer - event.clientX;
                pointer = event.clientX;
                let computedStyle = Number.parseInt(window.getComputedStyle(element).left.replace("px", ""));
                let number = computedStyle - delta;
                if (number < 0) {
                    number = 0;
                }
                if (number > this.offsetWidth - 32) {
                    number = this.offsetWidth - 32;
                }
                this.position = number / (this.offsetWidth - 16);
                element.style.left = number + "px";
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

        this.sliderHorizontal = sliderHorizontal(this.querySelector("div.cursor"));
    }

    show() {
        this.style.display = "block";
    }

    hide() {
        this.style.display = "none";
    }

    static get template() {
        return libraryLoader("simplicity/components/navigation/scrollbar/mat-scrollbar-horizontal.html")
    }


}

export default customComponents.define("mat-scrollbar-horizontal", MatScrollbarHorizontal)