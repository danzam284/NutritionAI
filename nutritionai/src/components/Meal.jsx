function Meal(props) {
  const { calories, fat, protein, carbs, sodium, sugar, image, food, index, score, feedback } =
    props;

  return (
    <div className="responsive-container bg-gradient-to-r from-purple-500 to-cyan-400 p-4 mb-4 rounded-lg text-black">
      <h3 className="responsive-heading text-xl font-semibold mb-4">{food || ""}</h3>

      <div className="flex flex-col sm:flex-row sm:space-x-6 sm:items-start">
        <div className="flex-1 space-y-2 mb-4 sm:mb-0">
          <p>Calories: {calories?.toFixed(1) + " kCal" || "N/A"}</p>
          <p>Fat: {fat?.toFixed(1) + " g" || "N/A"}</p>
          <p>Protein: {protein?.toFixed(1) + " g" || "N/A"}</p>
        </div>

        <div className="flex justify-center mb-4 sm:mb-0">
          <img
            className="responsive-image rounded-lg w-48 h-auto"
            src={`data:image/png;base64,${image}`}
            style={{ width: "200px", margin: "10px", borderRadius: "10px" }}
            alt={`Meal ${index + 1}`}
          />
        </div>

        <div className="flex-1 space-y-2 mb-4 sm:mb-0">
          <p>Carbohydrates: {carbs?.toFixed(1) + " g" || "N/A"}</p>
          <p>Sodium: {sodium?.toFixed(1) + " mg" || "N/A"}</p>
          <p>Sugar: {sugar?.toFixed(1) + " g" || "N/A"}</p>
        </div>

        <div className="mb-4 sm:mb-0">
          <p>Score: {score}</p>
        </div>

        {feedback && (
          <div className="mt-4 sm:mb-0">
            <h4 className="font-semibold">Feedback</h4>
            <p>1. {feedback[0]}</p>
            <p>2. {feedback[1]}</p>
            <p>3. {feedback[2]}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Meal;
