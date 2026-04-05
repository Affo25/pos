const CracoLessPlugin = require('craco-less');
const { theme } = require('./src/config/theme/themeVariables');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env }) => {
      webpackConfig.resolve = webpackConfig.resolve || {};
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: false,
      };
      webpackConfig.ignoreWarnings = [/Failed to parse source map/];

      // Vercel/CI: do not fail production build on ESLint (fix rules incrementally)
      if (env === 'production') {
        webpackConfig.plugins = (webpackConfig.plugins || []).filter(
          (p) => p.constructor.name !== 'ESLintWebpackPlugin',
        );
      }

      return webpackConfig;
    },
    test: /\.m?jsx?$/,
    exclude: /node_modules\/@firebase\/auth/,
    ignoreWarnings: [/Failed to parse source map/],
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: {
              ...theme,
            },
            javascriptEnabled: true,
          },
        },
      },
    },
  ],
};
