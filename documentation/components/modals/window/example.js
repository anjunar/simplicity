import {customViews} from "../../../../library/simplicity/simplicity.js";
import {loader} from "../../../../library/simplicity/util/loader.js";

class Example extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("documentation/components/modals/dialog/example.html")
    }

}

export default customViews.define({
    name: "window-example",
    class: Example,
    header: "Example",
    width : "320px",
    height : "200px"
});