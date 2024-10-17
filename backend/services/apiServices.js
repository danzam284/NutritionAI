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
        json: true,
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
      { text: "what is the item in the uploaded image? Respond with just the food name." },
    ]);
    const rawtext = result.response.text();
    const cleantext = rawtext.trim(); // Remove leading and trailing whitespace
    return cleantext;
  } catch (e) {
    console.error("Error sending API call to Gemini:", e);
    throw new Error("Failed to process the image.");
  }
}

/**
 *
 * @param {string} text The food item that Gemini AI determined
 * @returns object from FDC API of food nutrients
 */
export async function nutritionFacts(text) {
  try {
    const base_url = "https://api.nal.usda.gov/fdc/v1/foods/search";
    const api_key = `?api_key=${process.env.USDA_KEY}`;
    const query = `&query=${text}`;

    // const response = await axios.get(base_url + path_url + api_key + query);
    const response = await axios.get(base_url + api_key + query, {
      params: {
        pageNumber: 1,
        pageSize: 25,
      },
    });

    if (response) {
      return response.data.foods[0];
    } else {
      throw Error(`No responses`);
    }
  } catch (e) {
    console.error(e);
    throw new Error(`FDC API failed to process`);
  }
}
