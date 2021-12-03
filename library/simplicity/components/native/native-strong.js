import {customComponents} from "../../simplicity.js";

class NativeStrong extends HTMLElement {}

export default customComponents.define("native-strong", NativeStrong, {extends : "strong"})