import express from "express";
import { sendAPICall, nutritionAPICall } from "../services/apiServices.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

/**
 * The POST request where an image is uploaded.
 * The mimeType of the image is extracted and the image is stripped of its encoding
 * Then the image is uploaded to the local file system and the prompt is called
 */
router.route("/upload").post(async (req, res) => {
  try {
    const image = req.body.image;

    const mimeType = image.match(/^data:(image\/[a-zA-Z]+);base64,/)[1];
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, "");
    const buffer = Buffer.from(base64Image, "base64");

    const filename = `image-${Date.now()}.${mimeType.split("/")[1]}`;
    const parentDir = path.join(__dirname, ".."); // __dirname gets this directory, so get parent
    const filepath = path.join(parentDir, filename);

    // Write image into local file system
    // fs.writeFileSync("image", buffer);
    fs.writeFileSync(filepath, buffer);

    // Prompt GenAI the image
    // const geminiResponse = await sendAPICall("image", mimeType);
    const geminiResponse = await sendAPICall(filename, mimeType);
    let macros;
    if (geminiResponse) {
      macros = await nutritionAPICall(geminiResponse);
    }
    // Clean up file after processing
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath); // Only delete if the file exists
    } else {
      console.log("Error: File not saved.");
    }

    console.log(geminiResponse);
    console.log(macros);
    return res.status(200).send(geminiResponse);
  } catch (e) {
    console.log(e);
    return res.status(400).send(e);
  }
});

export default router;
