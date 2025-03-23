const Sequencer = require('@jest/test-sequencer').default;
const path = require('path');

class CustomSequencer extends Sequencer {
  sort(tests) {
    return tests.sort((testA, testB) => {
      const fileNameA = path.basename(testA.path);
      const fileNameB = path.basename(testB.path);
      
      if (fileNameA.includes('productListControllerIntegration')) {
        return -1;
      }
      if (fileNameB.includes('productListControllerIntegration')) {
        return 1;
      }
      
      return fileNameA.localeCompare(fileNameB);
    });
  }
}

module.exports = CustomSequencer;