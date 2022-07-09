import {customViews} from "../../../library/simplicity-core/simplicity.js";
import {loader} from "../../../library/simplicity-core/processors/loader-processor.js";

class Architecture extends HTMLElement {

    static get components() {
        return []
    }

    static get template() {
        return loader("documentation/basic/architecture/overview.html");
    }

}

export default customViews.define({
    name: "basic-architecture-index",
    class: Architecture
})

