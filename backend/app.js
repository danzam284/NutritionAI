import express from "express";
import cors from 'cors';
import fs from 'fs';

import dotenv from 'dotenv';
dotenv.config();

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb'}));
app.use(express.urlencoded({extended: true, limit: '100mb'}));

//Gemini Configs
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});


/**
 * Sends an API call to gemini was 2 components: the image and prompt
 * @param {filename} The name of the image file to be uploaded as part of the Gemini prompt
 * @param {mimeType} The type of the image file that is being uploaded
 * @returns The text response of Gemini
 */
async function sendAPICall(filename, mimeType) {
  const uploadResult = await fileManager.uploadFile(filename, {
      mimeType: mimeType,
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

/**
 * The POST request where an image is uploaded.
 * The mimeType of the image is extracted and the image is stripped of its encoding
 * Then the image is uploaded to the local file system and the prompt is called
 */
app.post("/upload", async (req, res) => {
  try {
    const image = req.body.image;

    const mimeType = image.match(/^data:(image\/[a-zA-Z]+);base64,/)[1];
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Image, 'base64');

    fs.writeFileSync("image", buffer);
    const geminiResponse = await sendAPICall("image", mimeType);
    return res.status(200).send(geminiResponse);
  } catch(e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

app.listen(3000, () => {
    console.log(`NutritionAI listening at http://localhost:3000`);
});