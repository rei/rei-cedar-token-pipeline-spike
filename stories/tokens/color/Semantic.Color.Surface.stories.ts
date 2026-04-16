import type { Meta, StoryObj } from "@storybook/html";
import { TokenTable } from "../../../src/stories/components/TokenTable";
import { TokenMeta } from "../../../src/stories/components/TokenMeta";
import { surfaceTokens } from "../../../src/tokens/color/semantic/surface";

const meta: Meta = {
  title: "Tokens/Color/Semantic/Surface API",
};

export default meta;
type Story = StoryObj;

export const Surface: Story = {
  render: () => {
    const root = document.createElement("div");
    root.style.display = "grid";
    root.style.gap = "1rem";

    root.appendChild(TokenTable({
      tokens: surfaceTokens,
      category: "color",
      showAlias: true,
      showDescription: true,
      showUsedBy: true,
    }));

    root.appendChild(TokenMeta({ token: surfaceTokens[0] }));
    return root;
  },
};
