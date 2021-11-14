import {customViews} from "../../../library/simplicity/simplicity.js";
import {loader} from "../../../library/simplicity/processors/loader-processor.js";

class HelloWorld extends HTMLElement {

    text = "Hello World!"

    static get template() {
        return loader("documentation/basic/examples/hello-world.html");
    }

}

export default customViews.define({
    name : "basic-hello-world",
    class : HelloWorld
})