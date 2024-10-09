import '../App.css'
import { Link } from "react-router-dom";
function Home() {
    return <div>
        <h1>NutritionAI Homepage</h1>
        <Link to="/upload">Upload</Link>
    </div>
}

export default Home;