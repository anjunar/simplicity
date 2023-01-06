import {customComponents} from "../../simplicity.js";
import {libraryLoader} from "../../util/loader.js";

class MatCarouselItem extends HTMLElement {

    static get template() {
        return libraryLoader("simplicity/components/navigation/mat-carousel-item.html")
    }

}

export default customComponents.define("mat-carousel-item", MatCarouselItem)