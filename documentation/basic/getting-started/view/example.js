import {customViews} from "../../../../library/simplicity/simplicity.js";
import {loader} from "../../../../library/simplicity/util/loader.js";

class Example extends HTMLElement {

    material;

    static get template() {
        return loader("documentation/basic/getting-started/view/example.html");
    }

}

export default customViews.define({
    name : "architecture-custom-page",
    class : Example,
    guard(activeRoute) {
        return {
            material : fetch("materials.json")
                .then(response => response.json())
                .then((materials) => {
                    return materials.rows.find((material) => material.position === Number.parseInt(activeRoute.queryParams.id))
                })
        }
    }
})