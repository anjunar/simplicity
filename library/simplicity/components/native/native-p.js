import {customComponents} from "../../simplicity.js";

class NativeP extends HTMLParagraphElement {}

export default customComponents.define("native-p", NativeP, {extends : "p"})