import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const FriendsMeals = () => {
  const { user } = useUser();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendId, setFriendId] = useState(""); // Add state for friend's ID
  const [friendUsername, setFriendUsername] = useState('');

  useEffect(() => {
    const fetchFriendsMeals = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getAllFriend/${user.id}`);
        
        // Check if we have any friends
        if (response.data.length > 0) {
          // Get the first friend's ID for example
          setFriendId(response.data[0]); 

          const friendMealsPromises = response.data.map(async (friendId) => {
            const friendMeals = await axios.get(`http://localhost:3000/savedmeal/${friendId}`);
            // Fetch friend's username
            const friendData = await axios.get(`http://localhost:3000/user/${friendId}`);
            setFriendUsername(friendData.data.username); // Store friend's username
            return friendMeals.data.map(meal => ({ ...meal, friendId }));
          });

          const friendsMeals = await Promise.all(friendMealsPromises);
          setMeals(friendsMeals.flat());
        } else {
          setError("No friends found.");
        }
      } catch (error) {
        setError("Error fetching friends' meals.");
      } finally {
        setLoading(false);
      }
    };

    fetchFriendsMeals();
  }, [user.id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>This is {friendUsername}'s meals:</h1> {/* Display friend's username */}
      <Link to="/">Home</Link>
      <div>
        {meals.length > 0 ? (
          meals.map((meal, index) => (
            <div key={index} style={{ margin: '10px', textAlign: 'center' }}>
              <img
                src={`data:image/png;base64,${meal.base64Image}`}
                alt={`Meal ${index}`}
                style={{ width: '100px', height: 'auto' }} // Smaller image size
              />
              <p style={{ fontSize: '0.8em' }}>{meal.food}</p>
              <p style={{ fontSize: '0.8em' }}>Calories: {meal.calories}</p>
              <p style={{ fontSize: '0.8em' }}>Fat: {meal.fat}g</p>
              <p style={{ fontSize: '0.8em' }}>Protein: {meal.protein}g</p>
              <p style={{ fontSize: '0.8em' }}>Carbohydrates: {meal.carbohydrates}g</p>
              <p style={{ fontSize: '0.8em' }}>Sodium: {meal.sodium}mg</p>
              <p style={{ fontSize: '0.8em' }}>Sugar: {meal.sugar}g</p>
            </div>
          ))
        ) : (
          <p>No meals found.</p>
        )}
      </div>
    </div>
  );
};

export default FriendsMeals;
