import {customComponents} from "../../simplicity.js";

class NativeH3 extends HTMLHeadingElement {}

export default customComponents.define("native-h3", NativeH3, {extends : "h3"})