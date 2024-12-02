import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import Navbar from "./Navbar";

// const mockUsers = [
//   { id: 1, name: "Alice", isFriend: false },
//   { id: 2, name: "Bob", isFriend: true },
//   { id: 3, name: "Charlie", isFriend: false },
//   { id: 4, name: "David", isFriend: true },
// ];

function SearchFriends() {
  const { user } = useUser();
  const currentUserId = user.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Mock users search from a backend
  const handleSearch = async () => {
    if (searchTerm) {
      try {
        const response = await axios.post(`http://localhost:3000/searchUsers?q=${searchTerm}`, {
          id: currentUserId,
        });
        console.log(response.data);
        setFilteredUsers(response.data);
      } catch (e) {
        console.error("Error fetching search results:", error);
      }
    } else {
      setFilteredUsers([]);
    }
  };

  // Handle adding a friend
  const handleAddFriend = async (username) => {
    try {
      await axios.post("http://localhost:3000/toggleFriend", {
        id: currentUserId,
        targetUserName: username,
        adding: true,
      });

      // Changing button to remove friend
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) => (user.username === username ? { ...user, isFriend: true } : user))
      );
    } catch (e) {
      console.error("Error adding friend:", e);
    }
  };

  // Handle remove a friend
  const handleRemoveFriend = async (username) => {
    try {
      console.log(currentUserId);
      await axios.post("http://localhost:3000/toggleFriend", {
        id: currentUserId,
        targetUserName: username,
        adding: false,
      });

      // Changing button to add friend
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) => (user.username === username ? { ...user, isFriend: false } : user))
      );
    } catch (e) {
      console.error("Error removing friend:", e);
    }
  };

  return (
    <div className="responsive-container bg-gray-100">
      <div className="navbar-container">
        <h1 className="text-black font-bold text-5xl">NutritionAI</h1>

        <Navbar />
      </div>

      {/* Search Friends Section */}
      <h2 className="responsive-heading text-black font-bold">Search for Friends</h2>
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="px-4 py-2 border rounded-lg text-white-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        className="responsive-button px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        onClick={handleSearch}
      >
        Search
      </button>

      {/* Results */}
      <div className="results mt-8 w-full max-w-2xl">
        {filteredUsers && Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white p-4 shadow-md rounded-lg flex flex-col items-center justify-between"
              >
                <span className="text-lg font-semibold text-gray-800 mb-2">{user.username}</span>
                {user.isFriend ? (
                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    onClick={() => {
                      handleRemoveFriend(user.username);
                    }}
                  >
                    Remove Friend
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    onClick={() => handleAddFriend(user.username)}
                  >
                    Add Friend
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mt-8">No users found</p>
        )}
      </div>
    </div>
  );
}

export default SearchFriends;
