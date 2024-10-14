import '../App.css'
import { Link } from "react-router-dom";
function Home() {
    return <div>
        <h1>NutritionAI Homepage</h1>
        <div id='nav'>
            <Link to="/upload">Upload</Link>
            <Link to="/savedmeal">Saved Meals</Link>
        </div>
    </div>
}

export default Home;