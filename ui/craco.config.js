const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const path = require("path");

module.exports = {
  reactScriptsVersion: "react-scripts" /* (default value) */,
  webpack: {
    alias: {},
    // plugins: {
    //   add: [
    //     new NodePolyfillPlugin({
    //       root: "./",
    //     }),
    //   ] /* An array of plugins */,
    // },
    configure: (webpackConfig) => {
      // webpackConfig.resolve.modules.push("node_modules", path.resolve(__dirname, "src"));
      webpackConfig.resolve.fallback = {
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer"),
        console: require.resolve("console-browserify"),
        constants: require.resolve("constants-browserify"),
        crypto: require.resolve("crypto-browserify"),
        domain: require.resolve("domain-browser"),
        events: require.resolve("events"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify"),
        punycode: require.resolve("punycode"),
        process: require.resolve("process/browser"),
        querystring: require.resolve("querystring-es3"),
        stream: require.resolve("stream-browserify"),
        string_decoder: require.resolve("string_decoder"),
        sys: require.resolve("util"),
        timers: require.resolve("timers-browserify"),
        tty: require.resolve("tty-browserify"),
        url: require.resolve("url"),
        util: require.resolve("util"),
        vm: require.resolve("vm-browserify"),
        zlib: require.resolve("browserify-zlib"),
      };
      return webpackConfig;
    },
  },
};
