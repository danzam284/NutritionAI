import express from "express";

const app = express();


app.listen(3000, () => {
    console.log(`NutritionAI listening at http://localhost:${3000}`);
  });