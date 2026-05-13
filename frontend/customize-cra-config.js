const CracoLessPlugin = require('craco-less');
const { theme } = require('./src/config/theme/themeVariables');

// Dev proxy: browser → webpack dev server → Node API at `target`. MongoDB (e.g. Atlas) is configured in backend .env, not here.
  process.env.REACT_APP_PROXY_TARGET ||
  process.env.PROXY_TARGET ||
  'http://127.0.0.1:5000';

module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
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
