import {customComponents} from "../../../simplicity-core/simplicity.js";
import {libraryLoader} from "../../../simplicity-core/processors/loader-processor.js";
import DomSelect from "../../../simplicity-core/directives/dom-select.js";

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
        return libraryLoader("simplicity-material/components/system/mat-language.html")
    }

}

export default customComponents.define("mat-language", MatLanguage)