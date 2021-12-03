import {customComponents} from "../../simplicity.js";
import {loader} from "../../processors/loader-processor.js";
import DomSelect from "../../directives/dom-select.js";
import {appManager} from "../../manager/app-manager.js";

class MatLanguage extends HTMLElement {

    get language() {
        return appManager.language;
    }

    set language(value) {
        return appManager.language = value;
    }

    static get components() {
        return [DomSelect]
    }

    static get template() {
        return loader("library/simplicity/components/system/mat-language.html")
    }

}

export default customComponents.define("mat-language", MatLanguage)