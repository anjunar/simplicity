import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {loader} from "../../../library/simplicity/util/loader.js";

class AppIntroduction extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/basic/getting-started/installation.html")
    }

}

export default customViews.define({
    name: "advanced-getting-started",
    class: AppIntroduction
});