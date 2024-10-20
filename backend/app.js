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
const usersDB = new Datastore({ filename: "data/user.db", autoload: true });
const mealsDB = new Datastore({ filename: "data/meal.db", autoload: true });


/**
 * Checks whether a user is already registered in the database based on their ID
 * @param {id} The ID of the user to be checked.
 * @returns A boolean whether the user already exists
 */
async function userExists(id) {
  return new Promise((resolve, reject) => {
      usersDB.findOne({ id }, (err, exists) => {
          if (err) {
              reject(err);
          } else {
              resolve(!!exists);
          }
      });
  });
}

/**
 * Adds a new user to the DB
 */
async function createUser(id, email, username, pic) {
  const newUser = {
      id,
      email,
      username,
      notifications: [{seen: false, message: "Welcome to NutritionAI!"}],
      friends: [],
      profilePicture: pic,
      score: 0
  }
  usersDB.insert(newUser, (error, newDoc) => {
      if (error) {
          console.error(err)
      }
  })
}


/**
 * Sends an API call to gemini was 2 components: the image and prompt
 * @param {filename} The name of the image file to be uploaded as part of the Gemini prompt
 * @param {mimeType} The type of the image file that is being uploaded
 * @returns The text response of Gemini
 */
async function sendAPIDescription(filename, mimeType) {
  const uploadResult = await fileManager.uploadFile(filename, {
    mimeType: mimeType,
    displayName: filename,
  });

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResult.file.mimeType,
        fileUri: uploadResult.file.uri,
      },
    },
    {
      text: "There is an uploaded food image. Your goal is to get each different part of the image and return it in a standard format of {food1}|{food2}|{foodn}. For example, if the picture was a cheeseburger with fries and a beer, you would return cheeseburger|fries|beer",
    },
  ]);
  const text = result.response.text();
  return text;
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

app.post("/newUser", async (req, _) => {
  const exists = await userExists(req.body.id);
  if (!exists) {
      createUser(req.body.id, req.body.email, req.body.username, req.body.profilePicture);
  }
});

app.post("/upload", async (req, res) => {
  let cumulativeFoodData;
  const error = [];
  // Gemini Action
  try {
    const image = req.body.image;
    const posterId = req.body.id;

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
    const geminiResponse = await sendAPIDescription(filename, mimeType);
    const geminiIngredients = geminiResponse.split("|");

    // Get the macronutrients of the food from food data central api
    let fooddata;
    if (geminiResponse) {
      for (let i = 0; i < geminiIngredients.length; i++) {
        fooddata = await nutritionFacts(geminiIngredients[i]);
        if (i === 0) {
          cumulativeFoodData = {
            base64Image: base64Image,
            poster: posterId,
            food: fooddata.description,
            likes: [],
            calories: fooddata.foodNutrients[3]?.value,
            fat: fooddata.foodNutrients[1]?.value,
            carbohydrates: fooddata.foodNutrients[2]?.value,
            protein: fooddata.foodNutrients[0]?.value,
            sodium: fooddata.foodNutrients[8]?.value,
            sugar: fooddata.foodNutrients[4]?.value
          }
        } else {
          cumulativeFoodData["food"] += ", " + fooddata.description
          cumulativeFoodData["calories"] += fooddata.foodNutrients[3]?.value ?? 0;
          cumulativeFoodData["fat"] += fooddata.foodNutrients[1]?.value ?? 0;
          cumulativeFoodData["carbohydrates"] += fooddata.foodNutrients[2]?.value ?? 0;
          cumulativeFoodData["protein"] += fooddata.foodNutrients[0]?.value ?? 0;
          cumulativeFoodData["sodium"] += fooddata.foodNutrients[8]?.value ?? 0;
          cumulativeFoodData["sugar"] += fooddata.foodNutrients[4]?.value ?? 0;
        }
      }
    }


    // Clean up file after processing
    if (fs.existsSync(filepath)) {
      console.log("here");
      fs.unlinkSync(filepath); // Only delete if the file exists
    } else {
      console.log("Error: File not saved.");
    }

  } catch (e) {
    console.log(e);
    error.push(e);
  }

  // DB Action
  try {
    try {
      await mealsDB.insertAsync(cumulativeFoodData);
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
    return res.status(200).json(cumulativeFoodData);
  }
});

app.get("/savedmeal/:id", async (req, res) => {
  const userId = req.params.id;
  let doc = await mealsDB.findAsync({ poster: userId });
  res.json(doc);
});

app.listen(3000, () => {
  console.log(`NutritionAI listening at http://localhost:3000`);
});
