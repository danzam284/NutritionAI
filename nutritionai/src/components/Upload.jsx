import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";
import { useUser } from '@clerk/clerk-react';
import Meal from "./Meal";

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
        id: user.id
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
      video: { facingMode: 'environment' } 
    });
    setStream(mediaStream);
  }

  // Stop camera stream
  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
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
    const video = document.querySelector('video');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0);
    
    canvas.toBlob((blob) => {
      const imageFile = new File([blob], "camera-photo.jpg", { type: "image/jpeg" });
      sendFile(imageFile);
      stopCamera();
      setIsCameraMode(false);
    }, 'image/jpeg', 0.9);
  }

  return (
    <div>
      <h1>Upload Image Page</h1>
      <Link to="/">Home</Link>
      
      <div>
        <button
          onClick={toggleMode}
        >
          {isCameraMode ? 'Switch to Upload' : 'Switch to Camera'}
        </button>
      </div>

      {!isCameraMode && (
        <input type="file" accept="image/*" onInput={(e) => processImage(e)}></input>
      )}

      {isCameraMode && stream && (
        <div>
          <video
            autoPlay
            playsInline
            ref={video => video && (video.srcObject = stream)}
          />
          <button
            onClick={takePhoto}
          >
            Take Photo
          </button>
        </div>
      )}

      {isSubmitted && !response && image && (
        <div>
          <img src={image} alt="Preview"/>
          <p>One Moment...</p>
        </div>
      )}

      {response && (
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
      )}
    </div>
  );
}

export default Upload;