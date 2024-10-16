import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import { url } from "inspector";

dotenv.config();

//Gemini Configs
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// FAT SECRET ACCESS TOKEN
const clientId = process.env.FATSECRET_ID; // Replace with your actual client ID
const clientSecret = process.env.FATSECRET_SECRET; // Replace with your actual client secret

export const getAccessToken = async () => {
  try {
    const response = await axios.post(
      "https://oauth.fatsecret.com/connect/token",
      new URLSearchParams({
        grant_type: "client_credentials",
        scope: "basic",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: clientId,
          password: clientSecret,
        },
      }
    );

    const accessToken = response.data.access_token;
    console.log("Access Token:", accessToken);
    return accessToken;
  } catch (error) {
    console.error(
      "Error getting access token:",
      error.response ? error.response.data : error.message
    );
  }
};

/**
 * Sends an API call to gemini was 2 components: the image and prompt
 * @param {filename} The name of the image file to be uploaded as part of the Gemini prompt
 * @param {mimeType} The type of the image file that is being uploaded
 * @returns The text response of Gemini
 */
export async function sendAPICall(filename, mimeType) {
  try {
    const uploadResult = await fileManager.uploadFile(filename, {
      mimeType: mimeType,
      displayName: "Image",
    });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri,
        },
      },
      // { text: "What is the item in the uploaded image?" },
      {
        text: "What is the food item in the image? Provide a one-word answer and approximate weight",
      },
    ]);
    const text = result.response.text();
    return text;
  } catch (e) {
    console.error("Error sending API call to Gemini:", e);
    throw new Error("Failed to process the image.");
  }
}

/**
 * Sends an API call to api-ninja's nutrition API with 2 parameters: Gemini's response (text)
 * @param {string} text - The response text from Gemini API which contains food item name and approx. weight
 * @returns {Object} - The JSON response from nutrition API, containing the macros and nutritional details about the food.
 */
export async function nutritionAPICall(text) {
  try {
    const accessToken = await getAccessToken();
    const foodId = 33691;
    let result = axios.get(
      `https://platform.fatsecret.com/rest/food/v4?food_id=${foodId}&format=json`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log(result);
    return result;
  } catch (e) {
    console.error("Error sending API call to api-ninja:", e);
    throw new Error("Failed to process the food macros.");
  }
}
