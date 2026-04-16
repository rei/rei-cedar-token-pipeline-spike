import type { Meta, StoryObj } from "@storybook/html";
import { TokenTable } from "../../src/stories/components/TokenTable";
import { surfaceTokens } from "../../src/tokens/color/semantic/surface";

const meta: Meta = {
  title: "Components/TokenTable",
  argTypes: {
    category: {
      control: { type: "inline-radio" },
      options: ["color", "space", "typography", "elevation", "motion"],
    },
    showAlias: { control: "boolean" },
    showDescription: { control: "boolean" },
    showUsedBy: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    tokens: surfaceTokens,
    category: "color",
    showAlias: true,
    showDescription: true,
    showUsedBy: true,
  },
  render: (args) => TokenTable(args),
};
