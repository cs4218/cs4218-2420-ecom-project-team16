export default {
  // name displayed during tests
  displayName: "frontend",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testTimeout: 10000,

  // simulates browser environment in jest
  // e.g., using document.querySelector in your tests
  testEnvironment: "jest-environment-jsdom",

  // jest does not recognise jsx files by default, so we use babel to transform any jsx files
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },

  // tells jest how to handle css/scss imports in your tests
  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
  },

  // ignore all node_modules except styleMock (needed for css imports)
  transformIgnorePatterns: ["/node_modules/(?!(styleMock\\.js)$)"],

  // only run these tests
  testMatch: [
    "<rootDir>/client/src/pages/Auth/*Integration*.test.js",
    "<rootDir>/client/src/pages/user/*Integration*.test.js",
    "<rootDir>/client/src/pages/admin/*Integration*.test.js",
    "<rootDir>/client/src/pages/*Integration*.test.js",
    "<rootDir>/client/src/context/*Integration*.test.js",
    "<rootDir>/client/src/components/*Integration*.test.js",
    "<rootDir>/client/src/components/Routes/*Integration*.test.js",
    "<rootDir>/client/src/pages/*Integration*.test.js",
  ],

  // jest code coverage
  collectCoverage: true,
  collectCoverageFrom: [
    "client/src/pages/Auth/**",
    "client/src/pages/user/Profile.js",
    "client/src/pages/admin/Users.js",
    "client/src/pages/*.js",
    "client/src/context/*.js",
    "client/src/components/AdminMenu.js",
    "client/src/components/Routes/Private.js",
    "client/src/pages/admin/AdminDashboard.js",
    "client/src/pages/admin/AdminOrders.js",
    "client/src/pages/admin/UpdateProduct.test.js",
    "client/src/pages/admin/Products.test.js",
    "client/src/pages/ProductDetails.test.js",
  ],

  coverageThreshold: {
    global: {
      lines: 100,
      functions: 100,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
