import "./App.css";
import React from "react";
import { SignedOut, SignedIn, SignIn, SignUp, UserButton } from "@clerk/clerk-react";
import { Routes, Route } from "react-router-dom";
import Upload from "./components/Upload.jsx";
import Home from "./components/Home.jsx";
import SavedMeal from "./components/SavedMeal.jsx";
import SignedOutPage from "./components/SignedOutPage.jsx";
import SearchFriends from "./components/SearchFriends.jsx";

function App() {
  return (
    <div>
      <SignedOut>
        <SignedOutPage />
      </SignedOut>

      <SignedIn>
        <UserButton />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up/*" element={<SignUp />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/savedmeal" element={<SavedMeal />} />
          <Route path="/add-friends" element={<SearchFriends />} />
        </Routes>
      </SignedIn>
    </div>
  );
}

export default App;
