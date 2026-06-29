type SrgbColorValue = {
  "sRGB": {
    red: string;
    green: string;
    blue: string;
    alpha: string;
  };
};

type IosSrgbColorsetToken = {
  name: string;
  value?: {
    light?: SrgbColorValue;
    dark?: SrgbColorValue;
  };
};

export const iosSrgbColorsetFormatter = (token: IosSrgbColorsetToken): string => {
  if (!token.value || !token.value.light || !token.value.dark) {
    throw new Error(
      `Token ${token.name} is missing light/dark sRGB values. ` +
        `Check that ios-srgb-color-action resolved the option token correctly.`
    );
  }

  return JSON.stringify(
    {
      colors: [
        {
          color: token.value.light,
          idiom: "universal",
        },
        {
          appearances: [{ appearance: "luminosity", value: "dark" }],
          color: token.value.dark,
          idiom: "universal",
        },
      ],
      info: {
        author: "xcode",
        version: 1,
      },
    },
    null,
    2
  );
};
