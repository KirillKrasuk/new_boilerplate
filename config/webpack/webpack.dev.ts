import webpack                     from 'webpack';
import { BundleAnalyzerPlugin }    from 'webpack-bundle-analyzer';
import path                        from 'path';
import ReactRefreshWebpackPlugin   from '@pmmmwh/react-refresh-webpack-plugin';
import CircularDependencyPlugin    from 'circular-dependency-plugin';

import { paths, configureBundler } from './webpack.common';

const isNeedBundleAnalyze = JSON.parse(process.env.BUILD_ANALYZE || 'false');
const analyzerPort        = parseInt(process.env.BUNDLE_ANALYZER_PORT || '8181', 10);

export default configureBundler({
    mode : 'development',
    entry: {
        bundle: [
            // require.resolve('react-app-polyfill/ie11'),
            `${ paths.entry }`,
            'webpack-hot-middleware/client'
        ]
    },
    cache: {
        type          : 'filesystem',
        name          : 'dev-client-cache',
        cacheDirectory: path.resolve(__dirname, '../../.cache')
    },
    devtool     : 'eval-cheap-module-source-map',
    optimization: {
        usedExports           : true,
        emitOnErrors          : true,
        removeAvailableModules: false,
        removeEmptyChunks     : false,
        splitChunks           : false,
    },
    stats  : 'summary',
    watch  : true,
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new ReactRefreshWebpackPlugin({
            overlay: {
                // integration with webpack-hot-middleware
                sockIntegration: 'whm',
            },
        }),
        isNeedBundleAnalyze && new BundleAnalyzerPlugin({
            openAnalyzer: false,
            logLevel    : 'silent',
            analyzerPort,
            analyzerHost: '127.0.0.1'
        }),
        new CircularDependencyPlugin({
            onDetected({ paths, compilation }) {
                compilation.errors.push(new Error(paths.join(' -> ')));
            },
            failOnError: true
        }) as webpack.WebpackPluginInstance,
    ].filter(Boolean)
});
