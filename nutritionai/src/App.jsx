import "./App.css";
import React from "react";
import { SignedOut, SignedIn, SignIn, SignUp, UserButton } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import Upload from "./components/Upload.jsx";
import Home from "./components/Home.jsx";
import Profile from "./components/Profile.jsx";
import SignedOutPage from "./components/SignedOutPage.jsx";
import SearchFriends from "./components/SearchFriends.jsx";
import FriendsMeals from "./components/FriendsMeals.jsx"; // Import the new FriendsMeals component

function App() {
  return (
    <div>
      <SignedOut>
        <SignedOutPage />
      </SignedOut>

      <SignedIn>
        {/* <UserButton /> */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up/*" element={<SignUp />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/add-friends" element={<SearchFriends />} />
          <Route path="/friends-meals" element={<FriendsMeals />} />
        </Routes>
      </SignedIn>
    </div>
  );
}

export default App;
