import "../App.css";
import { useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Badge, notification } from "antd";
import { NotificationTwoTone } from "@ant-design/icons";
import Navbar from "./Navbar";

function Home() {
  const { isSignedIn, user } = useUser();
  const [newNotifications, setNewNotifications] = useState(false);
  const [newNot, setNewNot] = useState(null);
  const [oldNot, setOldNot] = useState(null);
  const [open, setOpen] = useState(false);
  const [lookingNew, setLookingNew] = useState(true);

  //Sends a request to register the user if they have not been already
  useEffect(() => {
    async function getUserAndNotifications() {
      await axios.post("http://localhost:3000/newUser", {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress,
        username: user.username,
        profilePicture: user.imageUrl,
      });

      const { data } = await axios.get(`http://localhost:3000/user/${user.id}`);
      const newNotifs = data.notifications.filter((notification) => !notification.seen);
      const oldNotifs = data.notifications.filter((notification) => notification.seen);

      setNewNot(newNotifs);
      setOldNot(oldNotifs);
      setNewNotifications(newNotifs.length !== 0);
    }

    if (isSignedIn) {
      getUserAndNotifications();
    }
  }, [isSignedIn]);

  return (
    <div
      className="responsive-container bg-gray-100"
      style={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}
    >
      <Modal
        title={lookingNew ? "New Notifications" : "Old Notifications"}
        open={open}
        cancelButtonProps={{ style: { display: "none" } }}
        onOk={() => {
          setOldNot((prevOldNot) => [...prevOldNot, ...newNot]);
          setNewNot([]);
          setOpen(false);
          setLookingNew(true);
        }}
        onCancel={() => {
          setOldNot((prevOldNot) => [...prevOldNot, ...newNot]);
          setNewNot([]);
          setOpen(false);
          setLookingNew(true);
        }}
      >
        {lookingNew ? (
          <div>
            {newNot && newNot.length ? (
              newNot.map((notification) => (
                <div
                  key={notification.message}
                  style={{ backgroundColor: "gray", padding: "10px" }}
                >
                  {notification.message}
                </div>
              ))
            ) : (
              <p>You have no new Notifications</p>
            )}
            <br></br>
            <button className="responsive-button" onClick={() => setLookingNew(false)}>
              View Old Notifications
            </button>
          </div>
        ) : (
          <div>
            {oldNot.map((notification) => (
              <div key={notification.message} style={{ backgroundColor: "gray", padding: "10px" }}>
                {notification.message}
              </div>
            ))}
            <br></br>
            <button className="responsive-button" onClick={() => setLookingNew(true)}>
              View New Notifications
            </button>
          </div>
        )}
      </Modal>

      <Badge dot style={newNotifications ? { width: "10px", height: "10px" } : { display: "none" }}>
        <NotificationTwoTone
          onClick={async () => {
            setOpen(true);
            setNewNotifications(false);
            await axios.post("http://localhost:3000/seenNotifications", { userId: user.id });
          }}
          style={{ fontSize: "30px", cursor: "pointer" }}
          twoToneColor={"black"}
          className="responsive-icon"
        />
      </Badge>

      <div>
        <h1 className="text-black font-bold text-5xl">NutritionAI</h1>

        <Navbar />
      </div>

      <div className="responsive-container">
        {/* <!-- Hero Section --> */}
        <section class="flex flex-col items-center justify-center text-center text-white py-24">
          <h1 class="text-5xl font-bold mb-4 text-black">
            Welcome to{" "}
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-bold">
              NutritionAI
            </p>
          </h1>
          <p class="text-xl mb-6 max-w-3xl mx-auto text-gray-600">
            Your personalized assistant to track meals and health goals with AI-powered suggestions.
          </p>
          <a
            href="#features"
            class="bg-yellow-500 hover:bg-yellow-400 text-white px-6 py-3 rounded-lg text-xl transition duration-300"
          >
            Learn More
          </a>
        </section>

        {/* <!-- Features Section --> */}
        <section id="features" class="py-20">
          <h2 class="text-4xl font-semibold text-center mb-12 text-black">Features</h2>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* <!-- Feature 1 --> */}
            <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 class="text-2xl font-semibold mb-4 text-black">Track Your Meals</h3>
              <p class="text-gray-700">
                Log your meals and get instant nutritional breakdowns to stay on top of your health
                goals.
              </p>
            </div>
            {/* <!-- Feature 2 --> */}
            <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 class="text-2xl font-semibold mb-4 text-black">Personalized Goals</h3>
              <p class="text-gray-700">
                Set personalized health goals, and track your progress with real-time feedback and
                suggestions.
              </p>
            </div>
            {/* <!-- Feature 3 --> */}
            <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300">
              <h3 class="text-2xl font-semibold mb-4 text-black">Social Sharing</h3>
              <p class="text-gray-700">
                Share your meals, goals, and achievements with friends to stay motivated and
                inspired.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
