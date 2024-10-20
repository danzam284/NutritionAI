import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import "../App.css";

function Upload() {
  const [response, setResponse] = useState();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [image, setImage] = useState();
  const { isSignedIn, user } = useUser();

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
        id: user.id
      });
      const parsedData = typeof data === "string" ? JSON.parse(data) : data;
      setResponse(parsedData);
    });
    reader.readAsDataURL(uploadedFile);
    setIsSubmitted(true);
  }

  return (
    <>
      <div>
        <Link to="/">Home</Link>
        <h1>Upload Image Page</h1>
        <input type="file" accept="image/*" onInput={(e) => sendFile(e)}></input>
        {isSubmitted && (
          <div>
            <img src={image} alt="Image" width="500" />
          </div>
        )}
        {response && (
          <div>
            <p>{response["food"] || ""}</p>
          </div>
        )}
        {response && (
          <div>
            <p>Calories: {response["calories"] + " kCal" || "N/A"}</p>
            <p>Fat: {response["fat"] + " g" || "N/A"}</p>
            <p>Protein: {response["protein"] + " g" || "N/A"}</p>
            <p>Carbohydrates: {response["carbohydrates"] + " g" || "N/A"}</p>
            <p>Sodium: {response["sodium"] + " mg" || "N/A"}</p>
            <p>Sugar: {response["sugar"] + " g" || "N/A"}</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Upload;
