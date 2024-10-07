import express from "express";

import dotenv from 'dotenv';
dotenv.config();

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});


/**
 * Sends an API call to gemini was 2 components: the image and prompt
 * @param filename: The name of the image file to be uploaded as part of the Gemini prompt
 * @returns The text response of Gemini
 */
async function sendAPICall(filename) {
  const uploadResult = await fileManager.uploadFile(filename, {
      mimeType: "image/png",
      displayName: "Image",
  });

  const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri
        }
      },
      { text: "What is the item in the uploaded image?"},
  ]);
  const text = result.response.text();
  return text;
}

app.listen(3000, () => {
    console.log(`NutritionAI listening at http://localhost:3000`);
});

//Sample call with a burger image, output describes the image correctly.
//console.log(await sendAPICall("burger.png"));