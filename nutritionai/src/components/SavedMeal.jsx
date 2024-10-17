// SavedMeal.js
import axios from 'axios';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
// import './SavedMeal.css'; // Optional: For styling

const SavedMeal = () => {
  const [images, setImages] = useState([]);     // State to store images
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null);     // State for errors

  useEffect(() => {
    // Function to fetch images from the backend
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://localhost:3000/savedmeal');
        console.log('Response:', response);
        const data = response.data;
        console.log('Data:', data);
        setImages(data);
      } catch (err) {
        console.error('Error fetching images:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Loading state
  if (loading) {
    return <div>
      <Link to="/">Home</Link>
      <p>Loading images...</p>
    </div>;
  }

  // Error state
  if (error) {
    return <div>
      <Link to="/">Home</Link>
      <p>Error loading images: {error.message}</p>
    </div>;
  }

  return (
    <div className="saved-meal-page">
      <Link to="/">Home</Link>
      <h1>Saved Meals</h1>
      <div className="image-gallery">
        {images.length > 0 ? (
          images.map((item, index) => (
            <div className="image-container" key={index}>
              <img
                src={`data:image/png;base64,${item["base64Image"]}`}
                style={{ width: '200px', margin: '10px' }}
                alt={`Meal ${index + 1}`}
              />

              <div>
                <p>{item["food"] || ""}</p>
              </div>

              <div>
            <p>Calories: {item["calories"] + " kCal" || "N/A"}</p>
            <p>Fat: {item["fat"] + " g" || "N/A"}</p>
            <p>Protein: {item["protein"] + " g" || "N/A"}</p>
            <p>Carbohydrates: {item["carbohydrates"] + " g" || "N/A"}</p>
            <p>Sodium: {item["sodium"] + " mg" || "N/A"}</p>
            <p>Sugar: {item["sugar"] + " g" || "N/A"}</p>
          </div>

            </div>
          ))
        ) : (
          <p>No images found.</p>
        )}
      </div>
    </div>
  );
};

export default SavedMeal;
