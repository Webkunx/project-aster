/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  collectCoverage: true,
  coverageDirectory: "./cov",
  collectCoverageFrom: ["./src/**/*.ts"],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  transform: {
    "^.+\\\\.(ts|tsx)$": "ts-jest",
  },
};
