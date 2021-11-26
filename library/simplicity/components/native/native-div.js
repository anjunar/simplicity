import {customComponents} from "../../simplicity.js";

class NativeDiv extends HTMLDivElement {}

export default customComponents.define("native-div", NativeDiv, {extends : "div"})