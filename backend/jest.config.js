// jest.config.js
export default {
  testEnvironment: "node", // Set the test environment to Node.js
  transform: {
    "^.+\\.jsx?$": ["babel-jest", { presets: ["@babel/preset-env"] }],
  },
};
