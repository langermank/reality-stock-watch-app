module.exports = {
  stories: ['../app/**/*.stories.mdx', '../app/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    // 'storybook-dark-mode',
    'storybook-addon-dark-mode-toggle',
  ],
  staticDirs: ['../public'],
  framework: '@storybook/react',
};
