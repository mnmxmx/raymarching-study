const path = require('path');
const config = require('./config.js');
const HtmlWebpackPlugin = require('html-webpack-plugin')

const entry = {};


config.files.map(function(filename){
    entry[filename + "/main"] = './js/' + filename + '/main.js';
})

module.exports = {
    mode: 'development',
    entry: entry,
    output: {
        filename: '[name].min.js',
        path: __dirname + "/dist"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: [['@babel/preset-env', { modules: false }]]
                        }
                    }
                ]
            },
            {
                test: /\.(vert|frag)$/i,
                use: 'raw-loader',
            }
        ],
        
        
    },
    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: false,
        port: 3000,
        open: true,
    },
    plugins: config.files.map(function(filename){
        return new HtmlWebpackPlugin({
            title: filename,
            // Load a custom template (lodash by default)
            template: './html/index.html',
            filename: filename + '/index.html',
            inject: false
        })
    })
};