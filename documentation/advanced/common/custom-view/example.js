import {customViews} from "../../../../library/simplicity/simplicity.js";
import {jsonClient} from "../../../../library/simplicity/services/client.js";
import {loader} from "../../../../library/simplicity/processors/loader-processor.js";

class Example extends HTMLElement {

    material;

    static get template() {
        return loader("documentation/advanced/common/custom-view/example.html");
    }

}

export default customViews.define({
    name : "examples-custom-page",
    class : Example,
    guard(activeRoute) {
        return {
            material : jsonClient.get("materials.json")
                .then((materials) => {
                    return materials.find((material) => material.position === Number.parseInt(activeRoute.queryParams.id))
                })
        }
    }
})