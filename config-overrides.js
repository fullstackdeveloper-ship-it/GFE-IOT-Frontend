/**
 * Webpack Configuration Overrides
 * Optimized for production deployment with limited resources
 */

const path = require('path');
const { override, addWebpackPlugin, addWebpackResolve, addWebpackOptimization } = require('customize-cra');
const CompressionPlugin = require('compression-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Check if bundle analysis is enabled
const analyzeBundle = process.env.ANALYZE_BUNDLE === 'true';

// Production optimizations
const productionOptimizations = {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
        priority: 10,
      },
      common: {
        name: 'common',
        minChunks: 2,
        chunks: 'all',
        priority: 5,
        reuseExistingChunk: true,
      },
    },
  },
  usedExports: true,
  sideEffects: false,
};

// Add compression plugin for production
const addCompression = () => (config) => {
  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
        threshold: 8192,
        minRatio: 0.8,
      })
    );
  }
  return config;
};

// Add bundle analyzer for development
const addBundleAnalyzer = () => (config) => {
  if (analyzeBundle) {
    config.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
        reportFilename: 'bundle-report.html',
      })
    );
  }
  return config;
};

// Optimize imports
const optimizeImports = () => (config) => {
  // Tree shaking optimization
  config.optimization.usedExports = true;
  config.optimization.sideEffects = false;
  
  // Module concatenation
  config.optimization.concatenateModules = true;
  
  return config;
};

// Add resolve aliases for better imports
const addResolveAliases = () => (config) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname, 'src'),
    '@components': path.resolve(__dirname, 'src/components'),
    '@pages': path.resolve(__dirname, 'src/pages'),
    '@services': path.resolve(__dirname, 'src/services'),
    '@utils': path.resolve(__dirname, 'src/utils'),
    '@hooks': path.resolve(__dirname, 'src/hooks'),
    '@config': path.resolve(__dirname, 'src/config'),
    '@store': path.resolve(__dirname, 'src/store'),
    '@features': path.resolve(__dirname, 'src/features'),
  };
  
  return config;
};

// Performance optimizations
const addPerformanceOptimizations = () => (config) => {
  // Disable source maps in production
  if (process.env.NODE_ENV === 'production') {
    config.devtool = false;
  }
  
  // Optimize chunks
  if (process.env.NODE_ENV === 'production') {
    config.optimization = {
      ...config.optimization,
      ...productionOptimizations,
    };
  }
  
  // Remove console logs in production
  if (process.env.NODE_ENV === 'production') {
    config.optimization.minimizer = config.optimization.minimizer.map(plugin => {
      if (plugin.constructor.name === 'TerserPlugin') {
        plugin.options.terserOptions.compress.drop_console = true;
        plugin.options.terserOptions.compress.drop_debugger = true;
      }
      return plugin;
    });
  }
  
  return config;
};

module.exports = override(
  addResolveAliases(),
  addPerformanceOptimizations(),
  addCompression(),
  addBundleAnalyzer(),
  optimizeImports()
);
