import {customViews} from "../../library/simplicity-core/simplicity.js";
import {loader} from "../../library/simplicity-core/processors/loader-processor.js";

class Home extends HTMLElement {

    static get template() {
        return loader("documentation/home/index.html")
    }

}

export default customViews.define({
    name : "home-index",
    class : Home
})