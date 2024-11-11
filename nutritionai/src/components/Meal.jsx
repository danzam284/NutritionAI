function Meal(props) {

    const { calories, fat, protein, carbs, sodium, sugar, image, food, index} = props;

    return <div style={{ background: "linear-gradient(90deg, rgba(137,0,171,1) 24%, rgba(93,213,255,1) 81%)", borderRadius: "10px", padding: "10px", marginBottom: "10px", color: "black"}}>
        <h3>{food || ""}</h3>

        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <div>
                <p>Calories: {calories.toFixed(1) + " kCal" || "N/A"}</p>
                <p>Fat: {fat.toFixed(1) + " g" || "N/A"}</p>
                <p>Protein: {protein.toFixed(1) + " g" || "N/A"}</p>
            </div>
            <img
                src={`data:image/png;base64,${image}`}
                style={{ width: '200px', margin: '10px', borderRadius: "10px"}}
                alt={`Meal ${index + 1}`}
            />
            <div>
                <p>Carbohydrates: {carbs.toFixed(1) + " g" || "N/A"}</p>
                <p>Sodium: {sodium.toFixed(1) + " mg" || "N/A"}</p>
                <p>Sugar: {sugar.toFixed(1) + " g" || "N/A"}</p>
            </div>
        </div>

    </div>
}

export default Meal;