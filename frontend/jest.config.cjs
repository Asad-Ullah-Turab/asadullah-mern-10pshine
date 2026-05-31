module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.spec.json",
        useESM: true,
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.test.tsx"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/tests/styleMock.ts",
  },
};
