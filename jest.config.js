module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRegex: 'test/.*\\.test\\.ts$',
	collectCoverage: true,
	collectCoverageFrom: ['src/**/*.ts']
}
