import express from "express";
import cors from "cors";
import fs from "node:fs";
import dotenv from "dotenv";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// DB
import Datastore from "@seald-io/nedb";
import e from "express";

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
 * @param {id}
 * @param {email}
 * @param {username}
 * @param {pic}
 */
async function createUser(id, email, username, pic) {
  const newUser = {
    id,
    email,
    username,
    notifications: [{ seen: false, message: "Welcome to NutritionAI!" }],
    friends: [],
    profilePicture: pic,
    score: 0,
    protein: null,
    carbohydrates: null,
    calories: null,
    fat: null,
    proteinThreshold: null,
    carbohydrateThreshold: null,
    fatThreshold: null,
    caloriesThreshold: null,
    goals: [], // list of goals
  };
  return new Promise((resolve, reject) => {
    usersDB.insert(newUser, (error, newDoc) => {
      if (error) {
        console.error(error);
        reject(error);
      } else {
        resolve(newDoc);
      }
    });
  });
}

async function uploadFileToGemini(filename, mimeType) {
  const uploadResult = await fileManager.uploadFile(filename, {
    mimeType: mimeType,
    displayName: filename,
  });

  return uploadResult;
}

/**
 * Sends an API call to gemini was 2 components: the image and prompt
 * @param {filename} The name of the image file to be uploaded as part of the Gemini prompt
 * @param {mimeType} The type of the image file that is being uploaded
 * @returns The text response of Gemini
 */
async function sendAPIDescription(filename, mimeType) {
  const uploadResult = await uploadFileToGemini(filename, mimeType);

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: uploadResult.file.mimeType,
        fileUri: uploadResult.file.uri,
      },
    },
    {
      text: "There is an uploaded food image. Your goal is to get each different part of the image and return it in a standard format of {food1}|{food2}|{foodn}. For example, if the picture was a cheeseburger with fries and a beer, you would return cheeseburger|fries|beer.",
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
async function nutritionFacts(text) {
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

app.post("/newUser", async (req, res) => {
  const exists = await userExists(req.body.id);
  if (!exists) {
    await createUser(req.body.id, req.body.email, req.body.username, req.body.profilePicture);
  }
  res.status(200).send();
});

async function toggleFriend(userId, targetUser, adding) {
  try {
    // Validate if users are present
    const currentUser = await usersDB.findAsync({ id: userId });
    const otherUser = await usersDB.findAsync({ username: targetUser });

    // Check if you can find currentUser in DB
    if (currentUser.length === 0) {
      return {
        error: "Cannot find user in database.",
      };
    }
    // If targetUser cannot be found
    if (otherUser.length === 0) {
      return {
        error: "Could not find a user with name testUser.",
      };
    }

    // If currentUser is trying to friend themselves
    if (userId === otherUser[0].id) {
      return {
        error: "You cannot add or remove yourself as a friend.",
      };
    }

    const currentUserFriends = currentUser[0].friends;
    const isFriend = currentUserFriends.includes(targetUser[0].id);

    if (adding && isFriend) {
      return {
        error: "Already Friends",
      };
    } else if (!adding && !isFriend) {
      return {
        error: "Not Friends",
      };
    }

    const updateAction = adding
      ? { $push: { friends: targetUser[0].id } }
      : { $pull: { friends: targetUser[0].id } };
    await usersDB.updateAsync({ id: userId }, updateAction);

    return { message: "Friend Status updated successfully" };
  } catch (e) {
    return { error: e.message };
  }
}

//Request takes 3 inputs: current user's id, other user's username, boolean whether adding or removing
app.post("/toggleFriend", async (req, res) => {
  const userId = req.body.id;
  const targetUser = req.body.targetUserName;
  const adding = req.body.adding;

  try {
    const result = await toggleFriend(userId, targetUser, adding);

    if (result.error) {
      res.status(400).json({ error: result.error });
    }

    res.status(200).send("Changes Made.");
  } catch (e) {
    console.error("Error: ", e);
    res.status(500).json({ error: "Database error" });
  }
});

async function getAllUsers() {
  return new Promise((resolve, reject) => {
    usersDB.find({}, (err, docs) => {
      if (err) {
        reject("Database error");
      } else {
        const emails = docs.map((doc) => doc.email);
        resolve(emails);
      }
    });
  });
}

app.get("/getAllUser", async (_, res) => {
  try {
    const emails = await getAllUsers();
    res.json(emails);
  } catch (error) {
    res.status(500).send({ error });
  }
});

app.get("/friends-meals/:friendId", async (req, res) => {
  const friendId = req.params.friendId;

  try {
    const meals = await getMealsByUser(friendId); // Use the existing function to fetch meals
    res.json(meals);
  } catch (error) {
    console.error("Error fetching friend's meals:", error);
    res.status(500).send("Error fetching friend's meals");
  }
});

app.get("/user/:id", async (req, res) => {
  const userId = req.params.id;
  usersDB.findOne({ id: userId }, (err, doc) => {
    if (err) {
      return res.status(500).send({ error: "Database error" });
    } else if (!doc) {
      return res.status(404).send({ error: "User not found" });
    } else {
      res.json(doc); // Return the user document which contains username and other details
    }
  });
});

// Get Current User's ALL Friends
app.get("/getAllFriend/:id", async (req, res) => {
  // Extract user ID from the request parameters
  const userId = req.params.id;

  // Query the database to find the user by ID
  usersDB.findOne({ id: userId }, (err, doc) => {
    if (err) {
      // Handle database errors
      res.status(500).send({ error: "Database error" });
    } else if (!doc) {
      // Handle case where user is not found
      res.status(404).send({ error: "User not found" });
    } else {
      // Send the list of friends as JSON response
      res.json(doc.friends);
    }
  });
});

async function searchUsers(searchTerm, ID) {
  const users = await usersDB.findAsync({
    username: { $regex: new RegExp(searchTerm, "i") },
  });

  const currentUser = await usersDB.findAsync({ id: ID });

  const userResults = users
    .filter((user) => user.id !== ID)
    .map((user) => ({
      id: user.id,
      username: user.username,
      isFriend: currentUser[0].friends.includes(user.id),
    }));

  return userResults;
}

app.post("/searchUsers", async (req, res) => {
  const searchTerm = req.query.q;
  const currentUserId = req.body.id;

  if (!searchTerm) {
    return res.status(400).send("No search term provided.");
  }

  try {
    const userResults = await searchUsers(searchTerm, currentUserId);
    res.json(userResults);
  } catch {
    res.status(500).send({ error: "Error finding users." });
  }
});

async function addMealForUser(cumulativeFoodData) {
  await mealsDB.insertAsync(cumulativeFoodData);
}

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
            timestamp: new Date().getTime(),
            likes: [],
            calories: fooddata.foodNutrients[3]?.value,
            fat: fooddata.foodNutrients[1]?.value,
            carbohydrates: fooddata.foodNutrients[2]?.value,
            protein: fooddata.foodNutrients[0]?.value,
            sodium: fooddata.foodNutrients[8]?.value,
            sugar: fooddata.foodNutrients[4]?.value,
          };
        } else {
          cumulativeFoodData["food"] += ", " + fooddata.description;
          cumulativeFoodData["calories"] += fooddata.foodNutrients[3]?.value ?? 0;
          cumulativeFoodData["fat"] += fooddata.foodNutrients[1]?.value ?? 0;
          cumulativeFoodData["carbohydrates"] += fooddata.foodNutrients[2]?.value ?? 0;
          cumulativeFoodData["protein"] += fooddata.foodNutrients[0]?.value ?? 0;
          cumulativeFoodData["sodium"] += fooddata.foodNutrients[8]?.value ?? 0;
          cumulativeFoodData["sugar"] += fooddata.foodNutrients[4]?.value ?? 0;
        }
      }
    }
    const user = usersDB.findOne({ id: posterId });
    if (!user) {
      return res.status(400).send("User not found");
    }
    const userCalorieGoal = user.calories ?? 2000; // Default to 2000 if not set

    // Compare meal calories with goal
    if (cumulativeFoodData.calories > userCalorieGoal) {
      cumulativeFoodData.goalFeedback = `Your calorie goal of ${userCalorieGoal} kcal is not met. The pizza you're eating exceeds your goal by ${
        cumulativeFoodData.calories - userCalorieGoal
      } kcal.`;
    } else {
      cumulativeFoodData.goalFeedback = `You are within your calorie goal of ${userCalorieGoal} kcal.`;
    }

    // Nutrition Score
    const NutritionScorePrompt = `Here is my food, which includes the following items: ${geminiIngredients}.
    Here are the nutritional details for these food items:
    - Calories: ${cumulativeFoodData["calories"]} kcal
    - Fat: ${cumulativeFoodData["fat"]} g
    - Carbohydrates: ${cumulativeFoodData["carbohydrates"]} g
    - Protein: ${cumulativeFoodData["protein"]} g
    - Sodium: ${cumulativeFoodData["sodium"]} mg
    - Sugar: ${cumulativeFoodData["sugar"]} g

    Please evaluate this food based on standard human health guidelines and provide:

    1. **A health score between 0.0 and 100.0** (with 100.0 being the healthiest).
    2. **Feedback** about the food's nutritional content.

    **Feedback Requirements:**
    - Provide up to **3 bullet-point suggestions**.
    - Each suggestion should be **no more than 30 words**.
    - Format the feedback as individual suggestions separated by a pipe '|'.

    Format your response as: **{score}|{Suggestion_1}|{Suggestion_2}|{Suggestion_3}**

    For example: **60|Reduce calorie intake.|Lower sodium levels.|Increase vegetable consumption.**`;
    let ScoreResult = await model.generateContent(NutritionScorePrompt);
    ScoreResult = ScoreResult.response.text().split("|");
    const NutritionScore = ScoreResult[0].replace("##", "").trim();
    const NutritionFeedback = ScoreResult.splice(1, 3);

    // Put info in to
    cumulativeFoodData["NutritionScore"] = Number(NutritionScore);
    cumulativeFoodData["NutritionFeedback"] = NutritionFeedback;

    // Clean up file after processing
    if (fs.existsSync(filepath)) {
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
      await addMealForUser(cumulativeFoodData);
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

async function getMealsByUser(id) {
  return await mealsDB.findAsync({ poster: id });
}

/**
 * Edits the user DB to set the goals of that user
 * Uses default values if a specific value is not supplied by the user
 * @param {userId} The ID of the user whose goals are to be updated
 * @param {macronutrients} The body of the calling POST request which contains the values for each macronutrient goal
 */
async function updateGoals(userId, macronutrients) {
  await usersDB.updateAsync(
    { id: userId },
    {
      $set: {
        calories: macronutrients.cal ?? 2000,
        caloriesThreshold: macronutrients.calt ?? 400,
        protein: macronutrients.pro ?? 50,
        proteinThreshold: macronutrients.prot ?? 10,
        carbohydrates: macronutrients.car ?? 250,
        carbohydrateThreshold: macronutrients.cart ?? 50,
        fat: macronutrients.fat ?? 60,
        fatThreshold: macronutrients.fatt ?? 20,
      },
    }
  );
}

/**
 * Generates a personalized nutrition goal suggestion based on the provided input by user.
 *
 * This function uses the Gemini AI model to generate a brief, personalized suggestion
 * for a nutrition goal, based on the user's description. The function validates the
 * prompt, ensuring it is a non-empty string and does not exceed 50 characters.
 *
 * @param {string} prompt A small description
 * @returns {string} A suggestion for a nutrition goal created by a Gemini AI response
 * @throws Will throw an error if the prompt is not a string, is empty, or exceeds 50 characters.
 */
async function suggestGoal(prompt) {
  if (typeof prompt !== "string") {
    throw Error("Prompt must be of type string");
  }

  console.log(prompt);

  prompt = prompt.trim();

  if (prompt.length <= 0 || prompt.length > 50) {
    if (prompt.length <= 0) {
      throw Error("Prompt must not be empty");
    }
    if (prompt.length > 100) {
      throw Error("Prompt must not exceed 100 characters");
    }
  }

  // Build the prompt to encourage the model to generate a concise, goal-oriented response
  const fullprompt = `
    Provide a clear, actionable nutrition goal suggestion for a user with the following focus: "${prompt}".
    Limit the suggestion to a single sentence of 30 words or less.
    Example suggestions: "Focus on protein-rich foods for increased muscle strength." 
    or "Increase whole grains for sustained energy throughout the day."
  `;

  const result = await model.generateContent([{ text: fullprompt }]);
  const text = result.response.text();
  return text;
}

/**
 * Edits the user DB to set a goal description of what the user wants.
 * @param {id} userId
 * @param {string} goalDescription
 */
async function addGoalsDescription(userId, goalDescription) {
  await usersDB.updateAsync(
    { id: userId },
    {
      $push: {
        goals: { id: uuidv4(), description: goalDescription },
      },
    }
  );
}

// Define route for goal suggestions
app.post("/suggest-goal", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const goalSuggestion = await suggestGoal(prompt);

    res.json({ suggestion: goalSuggestion });
  } catch (error) {
    console.error("Error generating goal description:", error);
    res.status(500).json({ error: "Failed to generate goal" });
  }
});

app.post("/add-goal-description", async (req, res) => {
  try {
    const { id, goalDescription } = req.body;

    await addGoalsDescription(id, goalDescription);
    res.status(200).send();
  } catch (e) {
    console.error("Error updating goal description: ", e);
    res.status(500).json({ error: "Failed to update goal description" });
  }
});

app.get("/getgoals/:id", async (req, res) => {
  try {
    // ! IMPLEMENTS
  } catch (e) {
    console.error("Error fetching user goal descriptions: ", e);
    res.status(500).json({ error: "Failed to fetch user goal descriptions" });
  }
});

app.post("/updateGoals", async (req, res) => {
  try {
    await updateGoals(req.body.id, req.body);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

app.get("/savedmeal/:id", async (req, res) => {
  const userId = req.params.id;
  const doc = await getMealsByUser(userId);
  res.json(doc);
});

async function addNotification(userId, notification) {
  await usersDB.updateAsync(
    { id: userId },
    {
      $push: {
        notifications: { seen: false, message: notification },
      },
    }
  );
}

app.post("/addNotification", async (req, res) => {
  try {
    await addNotification(req.body.userId, req.body.message);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

async function clearNotifications(userId) {
  const user = await usersDB.findOneAsync({ id: userId });
  const updatedNotifications = user.notifications.map((notification) => {
    return {
      seen: true,
      message: notification.message,
    };
  });

  await usersDB.updateAsync({ id: userId }, { $set: { notifications: updatedNotifications } }, {});
}

app.post("/seenNotifications", async (req, res) => {
  try {
    await clearNotifications(req.body.userId);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e);
  }
});

//like
//*********************meal.db using _id as mealId**************
app.post("/reaction", async (req, res) => {

  try {
    // value
    const mealId = req.body.mealId
    const userId = req.body.userId
    const action = req.body.action

    // find meals DB first
    let meal = await mealsDB.findOneAsync({ _id: mealId})
    let poster = await usersDB.findOneAsync({ id: meal.poster })

    // Update the likes or dislikes based on the action
    if (action === "like") {
      if (!meal.likes.includes(userId)) {
        meal.likes.push(userId); // Add the userId to likes
        await addNotification(meal.poster, `${poster.username} has liked your post.`);
      }
    }
    
    if (action === "dislike") {
      meal.likes = meal.likes.filter(id => id !== userId); // Remove the userId from likes
    }

    // Update the meal in the database
    const result = await mealsDB.updateAsync({ _id: mealId}, { $set:{ likes: meal.likes}})
    res.status(200).send();
  } catch(e) {
    res.status(400).send(e);
  }

});
app.listen(3000, () => {
  console.log(`NutritionAI listening at http://localhost:3000`);
});

export {
  nutritionFacts,
  createUser,
  usersDB,
  userExists,
  sendAPIDescription,
  getAllUsers,
  getMealsByUser,
  addMealForUser,
  mealsDB,
  searchUsers,
  updateGoals,
  suggestGoal,
  addNotification,
  clearNotifications,
};
