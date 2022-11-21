import {customViews} from "../../../library/simplicity/simplicity.js";
import DomCode from "../../../library/simplicity/directives/dom-code.js";
import {loader} from "../../../library/simplicity/util/loader.js";

class Plugins extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/expert/compiler/plugins.html")
    }

}

export default customViews.define({
    name : "expert-compiler-plugins",
    class : Plugins
})