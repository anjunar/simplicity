import {customViews} from "../../library/simplicity/simplicity.js";
import {loader} from "../../library/simplicity/processors/loader-processor.js";
import DomCode from "../../library/simplicity/directives/dom-code.js";

class AppIntroduction extends HTMLElement {

    static get components() {
        return [DomCode];
    }

    static get template() {
        return loader("documentation/advanced/introduction.html")
    }

}

export default customViews.define({
    name: "advanced-welcome",
    class: AppIntroduction
});