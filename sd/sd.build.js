import StyleDictionary from "style-dictionary";
import config from "./src/config/sd.config.ts";

const sd = new StyleDictionary(config);

await sd.buildAllPlatforms();
