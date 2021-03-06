const path = require("path");
const glob = require('glob');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const htmlwebpack = new HtmlWebpackPlugin({
	title: "M",
	template: 'src/index.ejs',
	hash: true
});

module.exports = {
	entry: "./src/app.js",
	output: {
		path: path.join(__dirname, 'dist'),
		filename: "bundle.js"
	},
	module: {
		rules: [
			{ test: /\.svg$/, loader: 'svg-inline-loader' },
			{ test: /\.vue$/, loader: 'vue-loader', options: { loaders: {scss: [ 'style-loader', 'css-loader', { loader: 'sass-loader', options: { includePaths: [path.resolve(__dirname, 'node_modules')] } } ]} } },
			{ test: /\.s[a|c]ss$/, use: [ 'style-loader', 'css-loader', { loader: 'sass-loader', options: { includePaths: [path.resolve(__dirname, 'node_modules')] } } ], },
			{ test: /\.(png|jpg|gif)$/, use: [ { loader: 'file-loader', options: {} } ] }
		],
		loaders: [ { test: /\.js$/, loader: 'babel', exclude: [/node_modules/, /build/, /__test__/], query: { presets: ['es2015'] } } ]
	},
	plugins: [
		htmlwebpack,
		new webpack.ContextReplacementPlugin(
			/moment[\/\\]locale$/,
			/en-gb|de/
		)
	],
	stats: {
		colors: true
	},
	resolve: {
		alias: {
		  'vue$': 'vue/dist/vue.esm.js'
		}
	},
	performance: {
		hints: false
	}
};

if (process.env.NODE_ENV === 'production') {
	module.exports.devtool = '#source-map'
	module.exports.plugins = (module.exports.plugins || []).concat([
		new webpack.DefinePlugin({
			'process.env': {
				NODE_ENV: '"production"'
			}
		}),
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			compress: {
				warnings: false
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: true
		})
	])
}