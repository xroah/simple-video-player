import {Server, config} from "karma"

process.env.NODE_ENV = "test"

const conf = {
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: "",
    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["jasmine", "karma-typescript"],
    // list of files / patterns to load in the browser
    files: [
        "src/ts/**/*.ts",
        "tests/spec/*.spec.ts"
    ],
    // list of files / patterns to exclude
    exclude: [],
    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        "**/*.ts": "karma-typescript",
        "src/**/*.ts": "coverage"
    },
    // test results reporter to use
    // possible values: "dots", "progress"
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["progress", "karma-typescript", "coverage"],
    // web server port
    port: 9876,
    // enable / disable colors in the output (reporters and logs)
    colors: true,
    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,
    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ["Chrome"],
    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    browserDisconnectTimeout: 0,
    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,
    karmaTypescriptConfig: {
        exclude: ["build", "node_modules"]
    },
    coverageReporter: {
        type: "html",
        dir: "coverage/"
    }
}

config.parseConfig(
    null,
    conf as any,
    {
        promiseConfig: true,
        throwErrors: true
    }
).then(karmaConf => {
    const server = new Server(
        karmaConf,
        exitCode => {
            console.log('Karma has exited with ' + exitCode)
            process.exit(exitCode)
        }
    )

    server.start()
})
