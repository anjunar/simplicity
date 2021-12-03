import {customComponents} from "../../simplicity.js";

class NativeH2 extends HTMLHeadingElement {}

export default customComponents.define("native-h2", NativeH2, {extends : "h2"})