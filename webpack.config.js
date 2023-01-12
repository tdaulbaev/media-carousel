const path = require("path");

const config = {
    target: "web",
    mode: 'production',
    entry: {
        index: "./src/index.js",
    },
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: '[name].js',
        library: "MediaCarousel",
        libraryTarget: "umd",
        globalObject: "this",
        umdNamedDefine: true,
    },
    plugins: [],
    module: {
        rules: [
            {
                test: /\.js?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".jsx", ".ts", ".js"],
    },
};

module.exports = config