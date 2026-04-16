import type { Meta, StoryObj } from "@storybook/html";
import { TokenMeta } from "../../src/stories/components/TokenMeta";
import { surfaceTokens } from "../../src/tokens/color/semantic/surface";

const meta: Meta = {
  title: "Components/TokenMeta",
  argTypes: {
    showSource: { control: "boolean" },
    showUsedBy: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: { token: surfaceTokens[0], showSource: true, showUsedBy: true },
  render: (args) => TokenMeta(args),
};
