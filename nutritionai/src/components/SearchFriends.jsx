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
  const { currentUserId } = useUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Mock users search from a backend
  const handleSearch = async () => {
    if (searchTerm) {
      try {
        const response = await axios.get(`http://localhost:3000/searchUsers?q=${searchTerm}`);
        console.log(response.data);
        setFilteredUsers(response.data);
        // const results = mockUsers.filter((user) =>
        //   user.username.toLowerCase().includes(searchTerm.toLowerCase())
        // );
      } catch (e) {
        console.error("Error fetching search results:", error);
      }
    } else {
      setFilteredUsers([]);
    }
  };

  // Handle adding a friend
  const handleAddFriend = async (userId) => {
    alert(`Friend request sent to user with ID: ${userId}`);
    // backend call later
    try {
      await axios.post("http://localhost:3000/toggleFriend", {
        id: currentUserId,
        otherUserId: userId,
        adding: true,
      });
      alert(`Friend request sent to user with ID: ${userId}`);
    } catch (e) {
      console.error("Error adding friend:", e);
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
                <button disabled>Already Friends</button>
              ) : (
                <button onClick={() => handleAddFriend(user.id)}>Add Friend</button>
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
