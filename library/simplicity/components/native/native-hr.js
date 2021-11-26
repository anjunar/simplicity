import {customComponents} from "../../simplicity.js";

class NativeHr extends HTMLHRElement {}

export default customComponents.define("native-hr", NativeHr, {extends : "hr"})