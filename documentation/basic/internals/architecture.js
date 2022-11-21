import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/util/loader.js";

class Architecture extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("documentation/basic/internals/architecture.html");
    }

}

export default customViews.define({
    name: "basic-architecture-index",
    class: Architecture
})

