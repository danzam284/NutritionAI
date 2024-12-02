import axios from "axios";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Modal, InputNumber } from "antd";
import Meal from "./Meal";
import Navbar from "./Navbar";

const Profile = () => {
  const [images, setImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);
  const [goalsLoading, setGoalsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [open, setOpen] = useState(false);
  const [toggleGoal, setToggleGoal] = useState(true);
  const { isSignedIn, user } = useUser();
  const [goalPrompt, setGoalPrompt] = useState("");
  const [suggestedGoal, setSuggestedGoal] = useState("");
  const [userGoals, setUserGoals] = useState([]);

  async function updateGoals(cal, calt, pro, prot, car, cart, fat, fatt) {
    await axios.post("http://localhost:3000/updateGoals", {
      id: user.id,
      cal,
      calt,
      pro,
      prot,
      car,
      cart,
      fat,
      fatt,
    });
    window.location.reload();
  }

  async function suggestGoal() {
    try {
      const response = await axios.post("http://localhost:3000/suggest-goal", {
        prompt: goalPrompt,
      });
      setSuggestedGoal(response.data.suggestion);
    } catch (error) {
      console.error("Error suggesting goal:", error);
    }
  }

  async function saveSuggestedGoal() {
    try {
      await axios.post("http://localhost:3000/add-goal-description", {
        id: user.id,
        goalDescription: suggestedGoal,
      });
      window.location.reload(); // Reload to show updated goal
    } catch (error) {
      console.error("Error saving suggested goal:", error);
    }
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
          console.error("Error fetching images:", err);
          setError(err);
        } finally {
          setImageLoading(false);
        }
      };
      const fetchGoals = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/getgoals/${user.id}`);
          console.log(response.data.goals);
          setUserGoals(response.data.goals);
        } catch (e) {
          console.error("Error fetching goals: ", e);
          setError(e);
        } finally {
          setGoalsLoading(false);
        }
      };

      fetchGoals();
      fetchImages();
    }
  }, [isSignedIn]);

  // Loading state
  if (imageLoading) {
    return (
      <div className="responsive-container">
        <Link className="responsive-link" to="/">
          Home
        </Link>
        <p>Loading images...</p>
      </div>
    );
  }

  if (goalsLoading) {
    return (
      <div className="responsive-container">
        <Link className="responsive-link" to="/">
          Home
        </Link>
        <p>Loading goals...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="responsive-container">
        <Link className="responsive-link" to="/">
          Home
        </Link>
        <p>Error loading images: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="responsive-container bg-gray-100 saved-meal-page flex justify-center items-center flex-col p-4">
      <Modal
        title="Enter Nutrition Goals"
        open={open}
        okText="Update"
        onCancel={() => setOpen(false)}
        onOk={async () => {
          console.log(document.getElementById("cal").value);
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
        }}
      >
        <div className="responsive-container">
          <p className="mb-4">
            For each row, the first input is desired goal and the second input is the threshold of
            having met that goal.
          </p>
          <p>
            The default numbers are either based on your previous goals or the reccomended values.
          </p>
          <div className="macro-container py-4">
            <div className="flex justify-center items-center gap-4 mb-4">
              <p className="text-lg font-underline">Calories: </p>
              <InputNumber id="cal" defaultValue={userData.calories ?? 2000} suffix="cal" />
              <p>±</p>
              <InputNumber
                id="calt"
                defaultValue={userData.caloriesThreshold ?? 400}
                suffix="cal"
              />
            </div>

            <div className="flex justify-center items-center gap-4 mb-4">
              <p className="text-lg font-underline">Protein: </p>
              <InputNumber id="pro" defaultValue={userData.protein ?? 50} suffix="g" />
              <p>±</p>
              <InputNumber id="prot" defaultValue={userData.proteinThreshold ?? 10} suffix="g" />
            </div>

            <div className="flex justify-center items-center gap-4 mb-4">
              <p className="text-lg font-underline">Carbohydrates: </p>
              <InputNumber id="car" defaultValue={userData.carbohydrates ?? 250} suffix="g" />
              <p>±</p>
              <InputNumber
                id="cart"
                defaultValue={userData.carbohydrateThreshold ?? 50}
                suffix="g"
              />
            </div>

            <div className="flex justify-center items-center gap-4 mb-4">
              <p className="text-lg font-underline">Fats: </p>
              <InputNumber id="fat" defaultValue={userData.fat ?? 60} suffix="g" />
              <p>±</p>
              <InputNumber id="fatt" defaultValue={userData.fatThreshold ?? 20} suffix="g" />
            </div>
          </div>
        </div>
      </Modal>

      <div>
        <h1 className="text-black font-bold text-5xl">NutritionAI</h1>

        <Navbar />
      </div>

      <div className="responsive-container bg-blue-50 text-black w-full sm:w-1/2 p-6 rounded-lg shadow-lg mt-4">
        <div className="flex justify-center items-center gap-4 mb-4">
          <h3 className="responsive-heading text-xl font-semibold">{user.username}</h3>
          <img className="w-8 h-8 rounded-full" width={30} src={user.imageUrl}></img>
        </div>
        <table className="min-w-full table-auto md:table-fixed border-separate border-spacing-4">
          <thead>
            <tr>
              <th className="text-lg text-gray-700">Info</th>
              <th className="text-lg text-gray-700">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-sm text-gray-600">Email</td>
              <td className="text-sm text-gray-900">{user.primaryEmailAddress.emailAddress}</td>
            </tr>
            <tr>
              <td className="text-sm text-gray-600">Joined</td>
              <td className="text-sm text-gray-900">
                {user.createdAt.toLocaleDateString("en-US")}
              </td>
            </tr>
            <tr>
              <td className="text-sm text-gray-600">Meals Logged</td>
              <td className="text-sm text-gray-900">{images.length}</td>
            </tr>
            <tr>
              <td className="text-sm text-gray-600">Friends</td>
              <td className="text-sm text-gray-900">{userData.friends.length}</td>
            </tr>
          </tbody>
        </table>

        <h3 className="mt-6 text-xl font-semibold">Tracking</h3>
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
        >
          Update Nutrition Goals
        </button>
        {!userData.protein ? (
          <p className="mt-4 text-gray-600">Your nutrition goals have not been set.</p>
        ) : (
          <div className="mt-4 space-y-2">
            <p>
              Calories Goal: {userData.calories} cal ± {userData.caloriesThreshold} cal
            </p>
            <p>
              Protein Goal: {userData.protein}g ± {userData.proteinThreshold}g
            </p>
            <p>
              Carbohydrates Goal: {userData.carbohydrates}g ± {userData.carbohydrateThreshold}g
            </p>
            <p>
              Fat Goal: {userData.fat}g ± {userData.fatThreshold}g
            </p>
          </div>
        )}
      </div>

      <div className="goal-container responsive-container bg-blue-50 text-black w-full sm:w-1/2 p-6 rounded-lg shadow-lg mt-4">
        <h3 className="text-xl font-semibold">Goal Suggestor/Saver</h3>
        <button
          onClick={(e) => setToggleGoal(!toggleGoal)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-6"
        >
          Switch to {toggleGoal ? "Manual" : "AI"} Mode
        </button>
        {toggleGoal ? (
          <div className="goal-generator mt-6 space-y-4">
            <h3 className="text-2xl font-semibold text-black">AI Goal Entry</h3>
            <textarea
              placeholder="Enter your goal focus (e.g., more energy, weight loss)"
              value={goalPrompt}
              onChange={(e) => setGoalPrompt(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg text-white"
            />
            <button onClick={suggestGoal} className="bg-green-500 text-white px-4 py-2 rounded-lg">
              Suggest Goal
            </button>

            {suggestedGoal && (
              <div>
                <p>{suggestedGoal}</p>
                <button
                  onClick={saveSuggestedGoal}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
                >
                  Save Goal
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="goal-manual mt-6 space-y-4">
            <h3 className="text-lg font-semibold">Manual Goal Entry</h3>
            <textarea
              placeholder="Enter your goal focus (e.g., more energy, weight loss)"
              value={goalPrompt}
              onChange={(e) => setGoalPrompt(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg text-white"
            />
            <button
              onClick={saveSuggestedGoal}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2"
            >
              Save Goal
            </button>
          </div>
        )}
      </div>

      <div className="goal-lists">
        <h3 className="text-lg font-semibold text-black">List of Goals</h3>
        <div className="goal-list mt-4">
          {userGoals.length > 0 ? (
            <ul className="space-y-4">
              {userGoals.map((goal, index) => (
                <li key={index} className="bg-blue-100 p-4 rounded-lg shadow-md">
                  <h4 className="text-md font-bold text-blue-700">Goal #{index + 1}</h4>
                  <p className="text-sm text-gray-700 mt-2">{goal.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No goals set yet.</p>
          )}
        </div>
      </div>

      <h3 className="text-2xl font-semibold mt-6 text-black">Saved Meals</h3>
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
