import express from "express";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";
import { getAccessToken } from "./services/apiServices.js";

import imageHandling from "./routes/imageHandling.js";

dotenv.config();

// import { GoogleAIFileManager } from "@google/generative-ai/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// Routes (moved previous functions on app.js onto here)
app.use("/", imageHandling);

app.listen(3000, () => {
  console.log(`NutritionAI listening at http://localhost:3000`);
});
