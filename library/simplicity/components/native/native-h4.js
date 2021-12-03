import {customComponents} from "../../simplicity.js";

class NativeH4 extends HTMLHeadingElement {}

export default customComponents.define("native-h4", NativeH4, {extends : "h4"})