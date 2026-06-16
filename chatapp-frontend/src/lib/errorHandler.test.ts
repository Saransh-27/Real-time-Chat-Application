import { getErrorMessage } from './errorHandler';

// Test various error formats
const testCases = [
  {
    name: 'String error response',
    error: { response: { data: 'Invalid credentials' } },
    expected: 'Invalid credentials',
  },
  {
    name: 'Object with message property',
    error: { response: { data: { message: 'User not found' } } },
    expected: 'User not found',
  },
  {
    name: 'Error with message property',
    error: { message: 'Network error' },
    expected: 'Network error',
  },
  {
    name: 'No data property',
    error: {},
    expected: 'An error occurred',
  },
  {
    name: 'Null error',
    error: null,
    expected: 'An error occurred',
  },
  {
    name: 'Custom default message',
    error: {},
    expected: 'Custom error',
    defaultMsg: 'Custom error',
  },
];

// Run tests
console.log('Testing getErrorMessage function:\n');
let passed = 0;
let failed = 0;

testCases.forEach((testCase) => {
  const result = getErrorMessage(testCase.error, testCase.defaultMsg);
  const isMatching = result === testCase.expected;

  if (isMatching) {
    console.log(`✅ ${testCase.name}`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got:      "${result}"\n`);
    passed++;
  } else {
    console.log(`❌ ${testCase.name}`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got:      "${result}"\n`);
    failed++;
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('All tests passed! ✅');
}

