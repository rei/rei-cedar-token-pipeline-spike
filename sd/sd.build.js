import StyleDictionary from "style-dictionary";
import config from "./dist/config/sd.config.js";

const sd = new StyleDictionary(config);

await sd.buildAllPlatforms();
