import { sendAPICall, getAccessToken, nutritionFacts } from "./services/apiServices.js";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

describe("sendAPICall Tests", () => {
  // Get instance of our AI model
  beforeAll(() => {
    const fileManager = new GoogleAIFileManager(process.env.API_KEY);
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
  });

  // Return a valid test (with 20 second timeout limit)
  test("should return a text", async () => {
    const image = "image-1729002522400.jpeg";
    const mimeType = "image/jpeg";

    const result = await sendAPICall(image, mimeType);
    expect(result).toBeDefined();
  }, 20000);

  // Return an invalid test
  test("should handle errors", async () => {
    const filename = "invalid/path/to/image.jpg";
    const mimeType = "image/jpeg";

    await expect(sendAPICall(filename, mimeType)).rejects.toThrow("Failed to process the image.");
  });
});

// describe("oauth tests for fatsecret", () => {
//   // Return a valid token
//   test("should return a token", async () => {
//     const result = await getAccessToken();
//     expect(result).toBeDefined();
//   });
// });

// describe("nutritionAPICall tests for fatsecret", () => {
//   // Return a valid token
//   test("should return a ", async () => {
//     const result = await nutritionAPICall("text");
//     expect(result).toBeDefined();
//   });
// });

describe("fdc tests for fatsecret", () => {
  // Return a valid token
  test("should return valid data for chicken", async () => {
    const result = await nutritionFacts("chicken");
    expect(result).toBeDefined();
  });
});
