import {customComponents} from "../../../simplicity-core/simplicity.js";
import {loader} from "../../../simplicity-core/processors/loader-processor.js";
import DomSelect from "../../../simplicity-core/directives/dom-select.js";
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
        return loader("library/simplicity-material/components/system/mat-language.html")
    }

}

export default customComponents.define("mat-language", MatLanguage)