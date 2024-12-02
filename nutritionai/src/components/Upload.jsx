import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";
import { useUser } from "@clerk/clerk-react";
import Meal from "./Meal";
import Navbar from "./Navbar";

function Upload() {
  const [response, setResponse] = useState();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [image, setImage] = useState();
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [stream, setStream] = useState(null);
  const { user } = useUser();

  /**
   * Uploaded file is converted to base 64task mamnager
   * POST request is then triggered, sending image to the backend
   * Response is then displayed
   */
  async function processImage(e) {
    const uploadedFile = e.target.files[0];
    sendFile(uploadedFile);
  }

  // Process and send image to backend
  async function sendFile(imageFile) {
    setResponse(null); // Reset response state
    setImage(URL.createObjectURL(imageFile));
    setIsSubmitted(true);

    const reader = new FileReader();
    reader.addEventListener("load", async (e) => {
      console.log("Sending image to server...");
      const { data } = await axios.post("http://localhost:3000/upload", {
        image: e.target.result,
        id: user.id,
      });

      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("Raw response from server:", parsedData);

      setResponse(parsedData);
    });

    reader.readAsDataURL(imageFile);
  }

  // Start camera stream
  async function startCamera() {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    setStream(mediaStream);
  }

  // Stop camera stream
  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }

  // Toggle between camera and upload modes
  function toggleMode() {
    if (isCameraMode) {
      stopCamera();
    } else {
      startCamera();
    }
    setIsCameraMode(!isCameraMode);
  }

  // Take photo from camera
  async function takePhoto() {
    const video = document.querySelector("video");
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        const imageFile = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
        sendFile(imageFile);
        stopCamera();
        setIsCameraMode(false);
      },
      "image/jpeg",
      0.9
    );
  }

  return (
    <div className="responsive-container bg-gray-100 saved-meal-page flex justify-center items-center flex-col p-4">
      <div>
        <h1 className="responsive-heading text-black font-bold text-5xl">NutritionAI</h1>
        <Navbar />
      </div>

      <div className="responsive-container">
        <h1 className="responsive-heading text-center text-black text-3xl font-semibold mb-6">
          Upload Image Page
        </h1>

        <div>
          <button
            className="responsive-button bg-blue-500 hover:bg-blue-700 text-white py-2 px-6 rounded-lg shadow-md transition-all"
            onClick={toggleMode}
          >
            {isCameraMode ? "Switch to Upload" : "Switch to Camera"}
          </button>
        </div>

        {!isCameraMode && (
          <input
            type="file"
            accept="image/*"
            onInput={(e) => processImage(e)}
            className="file-input text-black p-2 my-4 bg-gray-100 border border-gray-300 rounded-lg shadow-sm"
          ></input>
        )}

        {isCameraMode && stream && (
          <div className="camera-mode-container flex flex-col items-center mt-8">
            <video
              autoPlay
              playsInline
              ref={(video) => video && (video.srcObject = stream)}
              className="w-full max-w-lg rounded-lg border-4 border-gray-200 mb-4"
            />
            <button
              className="responsive-button bg-green-500 hover:bg-green-700 text-white py-2 px-6 rounded-lg shadow-md transition-all"
              onClick={takePhoto}
            >
              Take Photo
            </button>
          </div>
        )}

        {isSubmitted && !response && image && (
          <div>
            <img
              className="responsive-image mx-auto rounded-lg shadow-lg mb-4"
              src={image}
              alt="Preview"
            />
            <p>One Moment...</p>
          </div>
        )}

        {response && (
          <div className="nutrition-info-container mt-8 flex flex-col sm:flex-row sm:space-x-8 space-y-6 sm:space-y-0">
            <Meal
              score={response["NutritionScore"]}
              calories={response["calories"]}
              fat={response["fat"]}
              protein={response["protein"]}
              carbs={response["carbohydrates"]}
              sodium={response["sodium"]}
              sugar={response["sugar"]}
              image={response["base64Image"]}
              food={response["food"]}
              feedback={response["NutritionFeedback"]}
              index={0}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Upload;
