import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Meal from "./Meal";

const FriendsMeals = () => {
  const { user, isSignedIn } = useUser();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendId, setFriendId] = useState(""); // Add state for friend's ID
  const [friendUsername, setFriendUsername] = useState('');
  const [likedMeals, setLikedMeals] = useState([]); // Track liked meals


  useEffect(() => {
    const fetchFriendsMeals = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/getAllFriend/${user.id}`);
        const cleanedResponse = response.data.filter((f) => f);

        // Check if we have any friends
        if (cleanedResponse.length > 0) {
          // Get the first friend's ID for example
          setFriendId(cleanedResponse[0]);

          const friendMealsPromises = cleanedResponse.map(async (friendId) => {
            if (!friendId) return;
            const friendMeals = await axios.get(`http://localhost:3000/savedmeal/${friendId}`);
            // Fetch friend's username
            const friendData = await axios.get(`http://localhost:3000/user/${friendId}`);

            setFriendUsername(friendData.data.username); // Store friend's username
            return friendMeals.data.map(meal => ({ ...meal, friendId }));
          });

          const friendsMeals = await Promise.all(friendMealsPromises);
          console.log(friendsMeals);
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

    if (!isSignedIn) {
      return;
    }

    fetchFriendsMeals();
  }, [user, isSignedIn]);
  
  const handleLikeDislike = async (mealId, action) => {
    try {
      const response = await axios.post('http://localhost:3000/reaction', {
        mealId: mealId,
        userId: user.id,
        action: action,
      });


      if (response.status === 200) {
        if (action === 'like') {
          setLikedMeals((prevLikes) => [...prevLikes, mealId]);
        } else if (action === 'dislike') {
          setLikedMeals((prevLikes) => prevLikes.filter((id) => id !== mealId));
        }
      }
    } catch (error) {
      console.error('Error handling like/dislike:', error);
    }
  };
  

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="responsive-container">
      <h1 className="responsive-heading">This is {friendUsername}'s meals:</h1> {/* Display friend's username */}
      <Link className="responsive-link" to="/">Home</Link>
      <div >
        {meals.length > 0 ? (
          meals.map((meal, index) => (
            <div key={index}>
              <Meal
                score={meal["NutritionScore"]}
                feedback={meal["NutritionFeedback"]}
                calories={meal["calories"]}
                fat={meal["fat"]}
                protein={meal["protein"]}
                carbs={meal["carbohydrates"]}
                sodium={meal["sodium"]}
                sugar={meal["sugar"]}
                image={meal["base64Image"]}
                food={meal["food"]}
                index={index}
              />
              {/* Like and Dislike Buttons */}
               <button
                onClick={() => handleLikeDislike(meal._id, 'like')}
                disabled={likedMeals.includes(meal._id)} // Disable if already liked
              >
                Like
              </button>
              <button
                onClick={() => handleLikeDislike(meal._id, 'dislike')}
                disabled={!likedMeals.includes(meal._id)} // Disable if not liked
                >
                  Dislike
                </button>
              
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
