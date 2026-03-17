export const iosColorsetFormatter = (token: any): string => {
  if (!token.value || !token.value.light || !token.value.dark) {
    throw new Error(
      `Token ${token.name} is missing light/dark P3 values. ` +
      `Check that ios-color-action resolved the option token correctly.`
    );
  }

  return JSON.stringify(
    {
      colors: [
        {
          color: token.value.light,
          idiom: 'universal',
        },
        {
          appearances: [{ appearance: 'luminosity', value: 'dark' }],
          color: token.value.dark,
          idiom: 'universal',
        },
      ],
      info: {
        author: 'xcode',
        version: 1,
      },
    },
    null,
    2
  );
};
