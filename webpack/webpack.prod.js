const webpack                 = require('webpack');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const { paths, configureBundler } = require('./webpack.common');

module.exports = configureBundler({
    mode : 'production',
    entry: {
        bundle: [
            // require.resolve('react-app-polyfill/ie11'),
            `${ paths.entry }`,
        ]
    },
    minimizer: [
        new OptimizeCssAssetsPlugin()
    ],
    plugins: [
        new webpack.HashedModuleIdsPlugin({
            hashFunction    : 'md4',
            hashDigest      : 'base64',
            hashDigestLength: 4,
        }),

    ]
});
