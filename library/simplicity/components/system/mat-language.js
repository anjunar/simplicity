import {customComponents} from "../../../simplicity/simplicity.js";
import DomSelect from "../../../simplicity/directives/dom-select.js";
import {libraryLoader} from "../../util/loader.js";

class MatLanguage extends HTMLElement {

    get language() {
        return this.app.language;
    }

    set language(value) {
        return this.app.language = value;
    }

    static get components() {
        return [DomSelect]
    }

    static get template() {
        return libraryLoader("simplicity/components/system/mat-language.html")
    }

}

export default customComponents.define("mat-language", MatLanguage)