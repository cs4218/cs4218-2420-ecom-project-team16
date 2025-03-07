export default {
  // display name
  displayName: "backend",

  // when testing backend
  testEnvironment: "node",

  // which test to run
  testMatch: ["<rootDir>/controllers/productController.test.js"],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: ["controllers/productController.test.js"],
  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
};
