/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  coverageDirectory: "./cov",
  collectCoverageFrom: ["./src/**/*.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
      isolatedModules: true,
    },
  },
  transform: {
    "^.+\\\\.(ts|tsx)$": ["@swc/jest"],
  },
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
};
