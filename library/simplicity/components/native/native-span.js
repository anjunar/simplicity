import {customComponents} from "../../simplicity.js";

class NativeSpan extends HTMLSpanElement {}

export default customComponents.define("native-span", NativeSpan, {extends : "span"})