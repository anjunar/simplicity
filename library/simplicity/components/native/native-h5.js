import {customComponents} from "../../simplicity.js";

class NativeH5 extends HTMLHeadingElement {}

export default customComponents.define("native-h5", NativeH5, {extends : "h5"})