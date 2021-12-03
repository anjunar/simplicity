import {customComponents} from "../../simplicity.js";

class NativeH1 extends HTMLHeadingElement {}

export default customComponents.define("native-h1", NativeH1, {extends : "h1"})