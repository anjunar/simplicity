import {customComponents} from "../../simplicity.js";

class NativeThead extends HTMLTableSectionElement {}

export default customComponents.define("native-thead", NativeThead, {extends : "thead"})