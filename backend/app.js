import cors from 'cors';
import dotenv from 'dotenv';
import express from "express";
import fs from 'fs';
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";

// DB
import Datastore from '@seald-io/nedb';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

//Gemini Configs
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Init DB
const db = new Datastore({ filename: 'data/users.db', autoload: true })

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
    { text: "What is the item in the uploaded image?,can you describe the image in detail?,what nutritional information can you tell me about this image?, can you tell me an added estimate of calories from this image?, can you tell me how healthy this image is?" },
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

  let geminiResponse = "";
  const error = []
  // Gemini Action
  try {
    const image = req.body.image;

    const mimeType = image.match(/^data:(image\/[a-zA-Z]+);base64,/)[1];
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Image, 'base64');

    fs.writeFileSync("image", buffer);
    geminiResponse = await sendAPICall("image", mimeType);
  } catch (e) {
    console.log(e);
    error.push(e)
  }

  // DB Action
  try {
    const image = req.body.image;
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const insert_image = {
      base64Image,
      geminiResponse
    }
    try {
      const newDoc = await db.insertAsync(insert_image)
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
    } catch (e) {
      // if an error happens
      console.log(e)
    }
  } catch (e) {
    console.log(e);
    error.push(e)
  }
  if (error.length != 0) {
    return res.status(400).send(error)
  } else {
    return res.status(200).send(geminiResponse);
  }
});

app.get("/savedmeal", async (req, res) => {
  let doc = await db.findAsync({ "base64Image": { $exists: true } })
  console.log(doc)
  res.json(doc)
});

app.listen(3000, () => {
  console.log(`NutritionAI listening at http://localhost:3000`);
});
