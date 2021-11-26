import {customComponents} from "../../simplicity.js";

class NativeA extends HTMLAnchorElement {}

export default customComponents.define("native-a", NativeA, {extends : "a"})