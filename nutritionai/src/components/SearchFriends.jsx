import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

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
      console.log(currentUserId);
      await axios.post("http://localhost:3000/toggleFriend", {
        id: currentUserId,
        targetUserName: username,
        adding: true,
      });
      alert(`Friend request sent to user: ${username}`);

      // Changing button to remove friend
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) => (user.username === username ? { ...user, isFriend: false } : user))
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
      alert(`Friend removed: ${username}`);

      // Changing button to add friend
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) => (user.username === username ? { ...user, isFriend: false } : user))
      );
    } catch (e) {
      console.error("Error removing friend:", e);
    }
  };

  return (
    <div className="search-friends">
      <h2>Search for Friends</h2>
      <div id="nav">
        <Link to="/">Home</Link>
        <Link to="/upload">Upload</Link>
        <Link to="/savedmeal">Saved Meals</Link>
      </div>
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <button onClick={handleSearch}>Search</button>
      <div className="results">
        {filteredUsers && Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="user">
              <span>{user.username}</span>
              {user.isFriend ? (
                <button
                  onClick={() => {
                    handleRemoveFriend(user.username);
                  }}
                >
                  Remove Friend
                </button>
              ) : (
                <button onClick={() => handleAddFriend(user.username)}>Add Friend</button>
              )}
            </div>
          ))
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
}

export default SearchFriends;
