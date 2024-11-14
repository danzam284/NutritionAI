import axios from 'axios';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Modal, InputNumber } from 'antd';
import Meal from './Meal';

const Profile = () => {
  const [images, setImages] = useState([]);     // State to store images
  const [loading, setLoading] = useState(true); // State for loading
  const [error, setError] = useState(null);     // State for errors
  const [userData, setUserData] = useState(null);
  const [open, setOpen] = useState(false);
  const { isSignedIn, user } = useUser();

  async function updateGoals(cal, calt, pro, prot, car, cart, fat, fatt) {
    await axios.post("http://localhost:3000/updateGoals", {
      id: user.id,
      cal, calt, pro, prot, car, cart, fat, fatt
    });
    window.location.reload();
  }

  useEffect(() => {
    // Function to fetch images from the backend
    if (isSignedIn) {
      console.log(user);
      const fetchImages = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/savedmeal/${user.id}`);
          const data = response.data;

          const userData = (await axios.get(`http://localhost:3000/user/${user.id}`)).data;
          setUserData(userData);
          setImages(data);
        } catch (err) {
          console.error('Error fetching images:', err);
          setError(err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchImages();
    }
  }, [isSignedIn]);

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
    <div className="saved-meal-page" style={{display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>

      <Modal 
        title="Enter Nutrition Goals" 
        open={open} 
        okText="Update" 
        onCancel={() => setOpen(false)} 
        onOk={async () => {
          console.log(document.getElementById("cal").value)
          await updateGoals(
            document.getElementById("cal").value, 
            document.getElementById("calt").value, 
            document.getElementById("pro").value, 
            document.getElementById("prot").value, 
            document.getElementById("car").value, 
            document.getElementById("cart").value, 
            document.getElementById("fat").value, 
            document.getElementById("fatt").value
          );
        }
      }
      >
        <p>For each row, the first input is desired goal and the second input is the threshold of having met that goal.</p>
        <p>The default numbers are either based on your previous goals or the reccomended values.</p>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}}>
          <p style={{textDecoration: "underline"}}>Calories: </p><InputNumber id='cal' defaultValue={userData.calories ?? 2000} suffix="cal" /><p>±</p><InputNumber id='calt' defaultValue={userData.caloriesThreshold ?? 400} suffix="cal" />
        </div>

        <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}}>
          <p style={{textDecoration: "underline"}}>Protein: </p><InputNumber id='pro' defaultValue={userData.protein ?? 50} suffix="g"/><p>±</p><InputNumber id='prot' defaultValue={userData.proteinThreshold ?? 10} suffix="g" />
        </div>

        <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}}>
          <p style={{textDecoration: "underline"}}>Carbohydrates: </p><InputNumber id='car' defaultValue={userData.carbohydrates ?? 250} suffix="g" /><p>±</p><InputNumber id='cart' defaultValue={userData.carbohydrateThreshold ?? 50} suffix="g" />
        </div>

        <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}}>
          <p style={{textDecoration: "underline"}}>Fats: </p><InputNumber id='fat' defaultValue={userData.fat ?? 60} suffix="g" /><p>±</p><InputNumber id='fatt' defaultValue={userData.fatThreshold ?? 20} suffix="g" />
        </div>
      </Modal>
      
      <Link to="/" style={{position: "absolute", left: 20, top: 20}}>Home</Link>
      <div style={{backgroundColor: "aliceblue", color: "black", width: "50vw", padding: "10px", borderRadius: "10px"}}>
        <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}}>
          <h3>{user.username}</h3>
          <img width={30} src={user.imageUrl} ></img>
        </div>
        <p>Email: {user.primaryEmailAddress.emailAddress}</p>
        <p>Joined {user.createdAt.toLocaleDateString('en-US')}</p>
        <p>Meals Logged: {images.length}</p>
        <p>Friends: {userData.friends.length}</p>
        <br></br>

        <h3>Tracking</h3>
        <button onClick={() => setOpen(true)}>Update Nutrition Goals</button>
        {!userData.protein ? 
          <p>Your nutrition goals have not been set.</p> :

          <div>
            <div>
              <p>Calories Goal: {userData.calories} cal ± {userData.caloriesThreshold} cal</p>
              <p>Protein Goal: {userData.protein}g ± {userData.proteinThreshold}g</p>
              <p>Carbohydrates Goal: {userData.carbohydrates}g ± {userData.carbohydrateThreshold}g</p>
              <p>Fat Goal: {userData.fat}g ± {userData.fatThreshold}g</p>
            </div>
          </div>
        }
      </div>
      <h4>Saved Meals</h4>
      <div className="image-gallery">
        {images.length > 0 ? (
          images.map((item, index) => (
            <div key={index}>
            <Meal
              score={item["NutritionScore"]}
              feedback={item["NutritionFeedback"]}
              calories={item["calories"]}
              fat={item["fat"]}
              protein={item["protein"]}
              carbs={item["carbohydrates"]}
              sodium={item["sodium"]}
              sugar={item["sugar"]}
              image={item["base64Image"]}
              food={item["food"]}
              index={index}
            />
            </div>
          ))
        ) : (
          <p>No images found.</p>
        )}
      </div>
    </div>
  );
};

export default Profile;
