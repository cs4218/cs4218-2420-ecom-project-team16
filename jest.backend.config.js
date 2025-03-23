export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: [
    "<rootDir>/controllers/*Integration*.test.js",
    "<rootDir>/helpers/*Integration*.test.js",
    "<rootDir>/middlewares/*Integration*.test.js",
    "<rootDir>/models/*Integration*.test.js",
    "<rootDir>/config/*Integration*.test.js",
  ],

  testSequencer: "<rootDir>/customSequencer.js",

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/**", "models/**"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
