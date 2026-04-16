import type { Meta, StoryObj } from "@storybook/html";
import { TokenRow } from "../../src/stories/components/TokenRow";
import { surfaceTokens } from "../../src/tokens/color/semantic/surface";

const meta: Meta = {
  title: "Components/TokenRow",
  argTypes: {
    category: {
      control: { type: "inline-radio" },
      options: ["color", "space", "typography", "elevation", "motion"],
    },
    showAlias: { control: "boolean" },
    showDescription: { control: "boolean" },
    showUsedBy: { control: "boolean" },
    compact: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj;

const baseToken = surfaceTokens[0];

export const Stable: Story = {
  args: { token: baseToken, category: "color", showAlias: true, showDescription: true, showUsedBy: true, compact: false },
  render: (args) => TokenRow(args),
};

export const Experimental: Story = {
  args: { token: surfaceTokens[1], category: "color", showAlias: true, showDescription: true, showUsedBy: true, compact: false },
  render: (args) => TokenRow(args),
};

export const Deprecated: Story = {
  args: { token: surfaceTokens[2], category: "color", showAlias: true, showDescription: true, showUsedBy: true, compact: false },
  render: (args) => TokenRow(args),
};

export const Compact: Story = {
  args: { token: baseToken, category: "color", showAlias: false, showDescription: false, showUsedBy: false, compact: true },
  render: (args) => TokenRow(args),
};
