/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    modulePathIgnorePatterns: ["<rootDir>/dist/"],
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.test.json",
        },
        NODE_ENV: "test",
    },
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^@common/(.*)$": "<rootDir>/src/common/$1",
        "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    },
    modulePaths: ["<rootDir>/src"],
    moduleDirectories: ["node_modules", "src"],
    setupFiles: ["<rootDir>/jest.setup.ts"],
};
