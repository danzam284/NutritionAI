import React, { useState, useEffect } from "react";

const mockUsers = [
  { id: 1, name: "Alice", isFriend: false },
  { id: 2, name: "Bob", isFriend: true },
  { id: 3, name: "Charlie", isFriend: false },
  { id: 4, name: "David", isFriend: true },
];

function SearchFriends() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Simulate searching users from a backend
  useEffect(() => {
    if (searchTerm) {
      const results = mockUsers.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(results);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm]);

  // Function to handle adding a friend
  const handleAddFriend = (userId) => {
    alert(`Friend request sent to user with ID: ${userId}`);
    // Here you would typically send a request to the backend to add the friend
  };

  return (
    <div className="search-friends">
      <h2>Search for Friends</h2>
      <input
        type="text"
        placeholder="Search by name..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <div className="results">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="user">
              <span>{user.name}</span>
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
