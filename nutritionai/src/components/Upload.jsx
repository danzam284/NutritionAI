import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../App.css";

function Upload() {
  const [response, setResponse] = useState();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [image, setImage] = useState();

  /**
   * Uploaded file is converted to base 64task mamnager
   * POST request is then triggered, sending image to the backend
   * Response is then displayed
   */
  async function sendFile(e) {
    const uploadedFile = e.target.files[0];
    setImage(URL.createObjectURL(uploadedFile)); // update setImage with image
    const reader = new FileReader();
    reader.addEventListener("load", async (e) => {
      console.log(e.target.result);
      const { data } = await axios.post("http://localhost:3000/upload", {
        image: e.target.result,
      });
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      console.log(parsedData);
      setResponse(parsedData);
    });
    reader.readAsDataURL(uploadedFile);
    setIsSubmitted(true);
  }

  return (
    <>
      <div>
        <h1>Upload Image Page`</h1>
        <Link to="/">Home</Link>
        <input type="file" accept="image/*" onInput={(e) => sendFile(e)}></input>
        {isSubmitted && (
          <div>
            <img src={image} alt="Image" width="500" />
          </div>
        )}
        {response && (
          <div>
            <p>Item: {response["food"] || "N/A"}</p>
            <p>Calories: {response["calories"] || "N/A"}</p>
            <p>Fat: {response["fat"] || "N/A"}</p>
            <p>Protein: {response["protein"] || "N/A"}</p>
            <p>Carbohydrates: {response["carbohydrates"] || "N/A"}</p>
            <p>Sodium: {response["sodium"] || "N/A"}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Upload;
