'use strict';

/**
 * @file webpack.config.dev.mjs
 * @description Webpack 5 configuration for module bundling and development server setup
 *
 * @details
 * This configuration file defines the Webpack setup for bundling the project's
 * assets, handling both JavaScript/TypeScript files and other resources like 
 * CSS, images, and fonts. It also configures the Webpack development server 
 * for a smooth development experience with hot module replacement and 
 * efficient resource handling.
 *
 * Key functionalities:
 * 1. Define entry and output points for the project.
 * 2. Load and apply module rules for processing various file types (JavaScript, CSS, images).
 * 3. Asynchronously import plugins and rules from external modules for modular configuration.
 * 4. Configure Webpack development server settings for a seamless local development experience.
 * 5. Optimize the build with split chunking for better performance.
 *
 * @constant {string} __filename - Absolute file path of the current module.
 * @constant {string} __dirname - Directory name of the current module.
 *
 * @returns {Promise<Object>} A promise resolving to the Webpack configuration object.
 *
 * @author Yagnik Vadi<yagnik.infineit2003@gmail.com>
 * @version 1.0.0
 * @created 2024-08-28
 * @updated 2024-09-26
 *
 * @usage
 * - Run the Webpack build process to bundle assets for the application.
 * - Start the development server to test the application with live reloads.
 * - Modify the `entry` point and output paths as per the project's structure.
 *
 * @note
 * Ensure that all plugins and loaders specified in the configuration are installed 
 * and properly configured to avoid build errors.
 *
 * @see https://webpack.js.org/configuration/ for more information on Webpack configuration options.
 */

import path from 'path';
import { fileURLToPath } from 'url';

import webpackAliases from '../common/routes/webpack.aliases.mjs';

// Convert the module URL to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Asynchronously imports a list of Webpack plugins from a specified file path.
 *
 * This function attempts to dynamically load a module containing an array of plugins
 * that will be used in the Webpack configuration. In case of failure, it logs the
 * error to the console and returns an empty array.
 *
 * @async
 * @function loadPlugins
 * @returns {Promise<Object[]>} A promise that resolves to an array of Webpack plugins.
 * @throws {Error} Throws an error if the module cannot be loaded.
 *
 * @example
 * const plugins = await loadPlugins();
 */
const loadPlugins = async () => {
    const pluginsPath = path.resolve(__dirname, "..", "plugins/webpack.plugins.mjs");
    try {
        const module = await import(pluginsPath);
        return module.default || [];
    } catch (err) {
        console.error("Error loading plugins:", err);
        return [];
    }
};

/**
 * Asynchronously imports a list of Webpack rules from a specified file path.
 *
 * This function attempts to dynamically load a module containing an array of rules
 * that define how various types of files should be processed in the Webpack configuration.
 * In case of failure, it logs the error to the console and returns an empty array.
 *
 * @async
 * @function loadRules
 * @returns {Promise<Object[]>} A promise that resolves to an array of Webpack rules.
 * @throws {Error} Throws an error if the module cannot be loaded.
 *
 * @example
 * const rules = await loadRules();
 */
const loadRules = async () => {
    const rulesPath = path.resolve(__dirname, "..", "common/rules/webpack.rules.mjs");
    try {
        const module = await import(rulesPath);
        return module.default || [];
    } catch (err) {
        console.error("Error loading rules:", err);
        return [];
    }
};

export default async () => {
    const plugins = await loadPlugins();
    const rules = await loadRules();

    return {
        mode: "development",
        entry: path.resolve(__dirname, "..", "..", "src/index.tsx"),
        module: {
            rules,
        },
        output: {
            asyncChunks: true,
            filename: "[name].js",
            chunkFilename: "[name].chunk.js",
            path: path.resolve(__dirname, "..", "..", "dist"),
            clean: true,
        },
        plugins,
        resolve: {
            alias: webpackAliases,
            extensions: [".js", ".ts", ".tsx", ".css"],
        },
        devServer: {
            hot: true,
            port: 5114,
            compress: true,
            webSocketServer: 'ws',
            historyApiFallback: true,
            open: {
                target: ['http://localhost:5114'],
                app: {
                    name: 'google-chrome',
                    // arguments: ['--incognito', '--new-window'],
                },
            },
            client: {
                progress: true,
                reconnect: 5,
                logging: 'info',
                webSocketTransport: 'ws',
                webSocketURL: 'ws://127.0.0.1:5114/ws',
                overlay: {
                    errors: true,
                    warnings: true,
                    runtimeErrors: true,
                },
            },
            static: {
                directory: path.join(__dirname, "..", "..", "dist"),
                watch: true,
            },
            devMiddleware: {
                index: true,
                mimeTypes: { phtml: 'text/html' },
                publicPath: path.resolve(__dirname, "..", "..", "src/assets/**/*"),
                serverSideRender: true,
                writeToDisk: true,
            },
        },
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000,
            ignored: /node_modules/,
        },
        optimization: {
            splitChunks: {
                chunks: "all",
            },
        },
    };
};
