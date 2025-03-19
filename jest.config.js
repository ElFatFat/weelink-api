module.exports = {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // The test environment that will be used for testing
    testEnvironment: 'node',

    // A list of paths to modules that run some code to configure or set up the testing environment
    setupFiles: ['./jest.setup.js'], // Include your jest.setup.js file here

    // The glob patterns Jest uses to detect test files
    testMatch: ['**/__tests__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],

    // Transform files using Babel or other tools if needed
    transform: {},

    // Add any other Jest configuration options as needed
};