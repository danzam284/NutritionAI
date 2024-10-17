import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// DB
import Datastore from "@seald-io/nedb";

const app = express();
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

//Gemini Configs
const fileManager = new GoogleAIFileManager(process.env.API_KEY);
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Init DB
const db = new Datastore({ filename: "data/users.db", autoload: true });

/**
 * Sends an API call to gemini was 2 components: the image and prompt
 * @param {filename} The name of the image file to be uploaded as part of the Gemini prompt
 * @param {mimeType} The type of the image file that is being uploaded
 * @returns The text response of Gemini
 */
async function sendAPIDescription(filename, mimeType) {
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
    {
      text: "What is the item in the uploaded image?,can you describe the image in detail?,what nutritional information can you tell me about this image?, can you tell me an added estimate of calories from this image?, can you tell me how healthy this image is?",
    },
  ]);
  const text = result.response.text();
  return text;
}

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

app.post("/upload", async (req, res) => {
  let geminiResponse = "";
  const error = [];
  // Gemini Action
  try {
    const image = req.body.image;

    const mimeType = image.match(/^data:(image\/[a-zA-Z]+);base64,/)[1];
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");

    const filename = `image-${Date.now()}.${mimeType.split("/")[1]}`;
    const parentDir = path.join(__dirname); // __dirname gets this directory, so get parent
    const filepath = path.join(parentDir, filename);

    // Write image into local file system
    // fs.writeFileSync("image", buffer);
    fs.writeFileSync(filepath, buffer);

    // Prompt GenAI the image
    const geminiResponse = await sendAPICall(filename, mimeType);
    const geminiFoodDescription = await sendAPIDescription(filename, mimeType);

    // Get the macronutrients of the food from food data central api
    let fooddata;
    if (geminiResponse) {
      fooddata = await nutritionFacts(geminiResponse);
    }

    let result = {
      geminiFoodDescription: geminiFoodDescription,
      food: fooddata.description,
      calories: `${fooddata.foodNutrients[3].value} ${fooddata.foodNutrients[3].unitName}`,
      fat: `${fooddata.foodNutrients[1].value} ${fooddata.foodNutrients[1].unitName}`,
      carbohydrates: `${fooddata.foodNutrients[2].value} ${fooddata.foodNutrients[2].unitName}`,
      protein: `${fooddata.foodNutrients[0].value} ${fooddata.foodNutrients[0].unitName}`,
      sodium: `${fooddata.foodNutrients[8].value} ${fooddata.foodNutrients[8].unitName}`,
    };

    // Clean up file after processing
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath); // Only delete if the file exists
    } else {
      console.log("Error: File not saved.");
    }

    return res.status(200).send(result);
  } catch (e) {
    console.log(e);
    error.push(e);
  }

  // DB Action
  try {
    const image = req.body.image;
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const insert_image = {
      base64Image,
      geminiResponse,
    };
    try {
      const newDoc = await db.insertAsync(insert_image);
      // newDoc is the newly inserted document, including its _id
      // newDoc has no key called notToBeSaved since its value was undefined
    } catch (e) {
      // if an error happens
      console.log(e);
    }
  } catch (e) {
    console.log(e);
    error.push(e);
  }
  if (error.length != 0) {
    return res.status(400).send(error);
  } else {
    return res.status(200).send(geminiResponse);
  }
});

app.get("/savedmeal", async (req, res) => {
  let doc = await db.findAsync({ base64Image: { $exists: true } });
  console.log(doc);
  res.json(doc);
});

app.listen(3000, () => {
  console.log(`NutritionAI listening at http://localhost:3000`);
});
