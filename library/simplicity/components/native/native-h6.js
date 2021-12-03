import {customComponents} from "../../simplicity.js";

class NativeH6 extends HTMLHeadingElement {}

export default customComponents.define("native-h6", NativeH6, {extends : "h6"})