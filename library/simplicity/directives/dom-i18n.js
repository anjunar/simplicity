import {customComponents} from "../simplicity.js";
import {appManager} from "../manager/app-manager.js";

class DomI18n extends HTMLSpanElement {

    en;

    initialize() {
        this.en = this.textContent;
    }

    update() {

        let language = appManager.language;

        if (language === "en") {
            this.textContent = this.en;
        } else {
            let i18nMessages = this.template.i18nMessages;

            let marker = this.getAttribute("ref")

            this.textContent = i18nMessages[marker][language];
        }

    }

}

export default customComponents.define("dom-i18n", DomI18n, {extends : "span"})