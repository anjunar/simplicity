import {customViews} from "../../library/simplicity/simplicity.js";
import DomCode from "../../library/simplicity/directives/dom-code.js";
import {loader} from "../../library/simplicity/util/loader.js";

class Home extends HTMLElement {

    static get components() {
        return [DomCode]
    }

    static get template() {
        return loader("documentation/home/index.html")
    }

}

export default customViews.define({
    name : "home-index",
    class : Home
})