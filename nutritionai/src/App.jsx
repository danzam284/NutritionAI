import { useState } from 'react'
import axios from 'axios';
import './App.css'

function App() {
  const [response, setResponse] = useState("");

  /**
   * Uploaded file is converted to base 64
   * POST request is then triggered, sending image to the backend
   * Response is then displayed
   */
  async function sendFile(e) {
    const uploadedFile = e.target.files[0];
    const reader = new FileReader();
    reader.addEventListener("load", async (e) => {
      console.log(e.target.result);
      const { data } = await axios.post("http://localhost:3000/upload", {
        image: e.target.result
      });
      setResponse(data);
    });
    reader.readAsDataURL(uploadedFile);
  }

  return (
    <>
      <div>
        <input type='file' accept="image/*" onInput={(e) => sendFile(e)}></input>
        <p>{response}</p>
      </div>
    </>
  )
}

export default App
