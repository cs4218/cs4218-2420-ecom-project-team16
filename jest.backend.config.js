export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/controllers/*.test.js"],
  // testMatch: ["<rootDir>/config/*.test.js"],
  // testMatch: ["<rootDir>/helpers/*.test.js"],
  // testMatch: ["<rootDir>/middlewares/*.test.js"],
  /// testMatch: ["<rootDir>/models/*.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
