import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <div id="nav" className="responsive-nav p-4 m-4 text-gray-600 border-4">
      <div className="responsive-nav flex-wrap justify-between items-center space-x-4">
        <Link
          to="/"
          className="responsive-link text-gray-600 hover:text-blue-800 transition px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200"
        >
          Home
        </Link>
        <Link
          to="/upload"
          className="responsive-link text-gray-600 hover:text-blue-800 transition px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200"
        >
          Upload
        </Link>
        <Link
          to="/profile"
          className="responsive-link text-gray-600 hover:text-blue-800 transition px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200"
        >
          Profile
        </Link>
        <Link
          to="/add-friends"
          className="responsive-link text-gray-600 hover:text-blue-800 transition px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200"
        >
          Add Friends
        </Link>
        <Link
          to="/friends-meals"
          className="responsive-link text-gray-600 hover:text-blue-800 transition px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200"
        >
          View Friends Meals
        </Link>
        <Link
          to="/tracking"
          className="responsive-link text-gray-600 hover:text-blue-800 transition px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-200"
        >
          Goal Tracking
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
