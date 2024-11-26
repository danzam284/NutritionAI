import { Calendar } from '@mantine/dates';
import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Indicator } from '@mantine/core';
import { Modal } from 'antd';

function Tracking() {
    const [userData, setUserData] = useState(null);
    const [meals, setMeals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const { user, isSignedIn } = useUser();
    const [ open, setOpen ] = useState(false);
    const checkingDay = useRef(null);
    const cal = useRef(null);
    const pro = useRef(null);
    const fat = useRef(null);
    const car = useRef(null);
    const passed = useRef(false);
    const navigate = useNavigate();

    
    //Imports calendar styling and removes to keep it contained within this component.
    useEffect(() => {
        const coreStyles = document.createElement('link');
        coreStyles.rel = 'stylesheet';
        coreStyles.href = 'https://cdn.jsdelivr.net/npm/@mantine/core/styles.css';
        const datesStyles = document.createElement('link');
        datesStyles.rel = 'stylesheet';
        datesStyles.href = 'https://cdn.jsdelivr.net/npm/@mantine/dates/styles.css';
        document.head.appendChild(coreStyles);
        document.head.appendChild(datesStyles);

        return () => {
          document.head.removeChild(coreStyles);
          document.head.removeChild(datesStyles);
        };
      }, []);

    useEffect(() => {
        // Function to fetch images from the backend
        if (isSignedIn) {
            const fetchImages = async () => {
                try {
                    const userData = (await axios.get(`http://localhost:3000/user/${user.id}`)).data;
                    userData.calories = parseFloat(userData.calories);
                    userData.protein = parseFloat(userData.protein);
                    userData.fat = parseFloat(userData.fat);
                    userData.carbohydrates = parseFloat(userData.carbohydrates);
                    userData.caloriesThreshold = parseFloat(userData.carbohydrateThreshold);
                    userData.proteinThreshold = parseFloat(userData.proteinThreshold);
                    userData.fatThreshold = parseFloat(userData.fatThreshold);
                    userData.carbohydrateThreshold = parseFloat(userData.carbohydrateThreshold);
                    setUserData(userData);

                    const { data } = await axios.get(`http://localhost:3000/savedmeal/${user.id}`);
                    setMeals(data);
                } catch (err) {
                    console.error('Error fetching images:', err);
                    setError(err);
                } finally {
                    setLoading(false);
                }
            };

            fetchImages();
        }
    }, [isSignedIn]);

    if (loading) { 
        return <>
            <Link className="responsive-link" to="/">Home</Link>
            Loading...
        </>
    }

    if (!userData.calories) {
        return <div style={{display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column"}}>
            <Link className="responsive-link" to="/">Home</Link>
            <h3 className="responsive-heading">Goal Tracking</h3>
            <p>You have not set any goals yet.</p>
            <button className="responsive-button" onClick={() => navigate("/profile")} style={{color: "white"}}>Set Goals</button>
        </div>
    }

    return <div>

        <Modal 
            title={`${currentMonth}/${checkingDay.current}/${currentYear}`} 
            open={open} 
            cancelButtonProps={{ style: {display: "none"}}}
            onOk={() => setOpen(false)}
            onCancel={() => setOpen(false)}
        >
            {passed.current ? 
                <h4 style={{color: "green"}}>You hit your goals!</h4> :
                <h4 style={{color: "red"}}>You missed your goals.</h4>
            }

            <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "5px"}}>Calories: 
                <h4>{cal.current}</h4>
                {cal.current >= userData.calories - userData.caloriesThreshold && cal.current <= userData.calories + userData.caloriesThreshold ? '✔' : 
                    cal.current < userData.calories - userData.caloriesThreshold ? "Too Little" : "Too Much"}
            </div>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "5px"}}>Protein: 
                <h4>{pro.current}</h4>
                {pro.current >= userData.protein - userData.proteinThreshold && pro.current <= userData.protein + userData.proteinThreshold ? '✔' : 
                    pro.current < userData.protein - userData.proteinThreshold ? "Too Little" : "Too Much"}
            </div>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "5px"}}>Fat: 
                <h4>{fat.current}</h4>
                {fat.current >= userData.fat - userData.fatThreshold && fat.current <= userData.fat + userData.fatThreshold ? '✔' : 
                    fat.current < userData.fat - userData.fatThreshold ? "Too Little" : "Too Much"}
            </div>
            <div style={{display: "flex", justifyContent: "center", alignItems: "center", gap: "5px"}}>Carbohydrates: 
                <h4>{car.current}</h4>
                {car.current >= userData.carbohydrates - userData.carbohydrateThreshold && car.current <= userData.carbohydrates + userData.carbohydrateThreshold ? '✔' : 
                    car.current < userData.carbohydrates - userData.carbohydrateThreshold ? "Too Little" : "Too Much"}
            </div>
      </Modal>

        <Link className="responsive-link" to="/">Home</Link>
        <h3 className="responsive-heading">Goal Tracking</h3>
        <Calendar
            onClick={(e) => {
                cal.current = 0;
                pro.current = 0;
                fat.current = 0;
                car.current = 0;

                let baseNode = e.target;
                if (baseNode.classList.contains("mantine-Calendar-day")) {
                    baseNode = baseNode.parentNode;
                }
                while (baseNode.lastChild.lastChild) {
                    baseNode = baseNode.lastChild
                }
                baseNode = baseNode.innerHTML

                if (!isNaN(baseNode) && parseInt(baseNode) >= 1 && parseInt(baseNode) <= 31) {
                    baseNode = parseInt(baseNode);
                    checkingDay.current = baseNode;
                    setOpen(true);


                    for (let i = 0; i < meals.length; i++) {
                        if (!meals[i].timestamp) {
                            continue;
                        }

                        const mealDate = new Date(meals[i].timestamp);
                        const mealDay = mealDate.getDate();
                        const mealMonth = mealDate.getMonth();
                        const mealYear = mealDate.getFullYear();
                        if (mealDay === checkingDay.current && mealMonth === currentMonth && mealYear === currentYear) {
                            cal.current = (cal.current ?? 0) + (meals[i].calories ?? 0);
                            car.current = (car.current ?? 0) + (meals[i].carbohydrates ?? 0);
                            fat.current = (fat.current ?? 0) + (meals[i].fat ?? 0);
                            pro.current = (pro.current ?? 0) + (meals[i].protein ?? 0);
                        }
                    }
                }
                passed.current = (
                    cal.current >= userData.calories - userData.caloriesThreshold && cal.current <= userData.calories + userData.caloriesThreshold &&
                    car.current >= userData.carbohydrates - userData.carbohydrateThreshold && car.current <= userData.carbohydrates + userData.carbohydrateThreshold &&
                    fat.current >= userData.fat - userData.fatThreshold && fat.current <= userData.fat + userData.fatThreshold &&
                    pro.current >= userData.protein - userData.proteinThreshold && pro.current <= userData.protein + userData.proteinThreshold
                );
            }}
            onDateChange={(newDate) => {
                setCurrentMonth(newDate.getMonth());
                setCurrentYear(newDate.getFullYear());
            }}
            maxDate={new Date()}
            renderDay={(date) => {
                const day = date.getDate();
                const month = date.getMonth();
                const year = date.getFullYear();

                if (month !== currentMonth || date > new Date()) {
                    return
                }

                const dayStats = {
                    calories: 0,
                    carbohydrates: 0,
                    fat: 0,
                    protein: 0
                }

                for (let i = 0; i < meals.length; i++) {
                    if (!meals[i].timestamp) {
                        continue;
                    }

                    const mealDate = new Date(meals[i].timestamp)
                    const mealDay = mealDate.getDate();
                    const mealMonth = mealDate.getMonth();
                    const mealYear = mealDate.getFullYear();
                    if (mealDay === day && mealMonth === month && mealYear === year) {
                        dayStats.calories += meals[i].calories ?? 0
                        dayStats.carbohydrates += meals[i].carbohydrates ?? 0
                        dayStats.fat += meals[i].fat ?? 0
                        dayStats.protein += meals[i].protein ?? 0
                    }
                }

                if (
                    dayStats.calories >= userData.calories - userData.caloriesThreshold && dayStats.calories <= userData.calories + userData.caloriesThreshold &&
                    dayStats.carbohydrates >= userData.carbohydrates - userData.carbohydrateThreshold && dayStats.carbohydrates <= userData.carbohydrates + userData.carbohydrateThreshold &&
                    dayStats.fat >= userData.fat - userData.fatThreshold && dayStats.fat <= userData.fat + userData.fatThreshold &&
                    dayStats.protein >= userData.protein - userData.proteinThreshold && dayStats.protein <= userData.protein + userData.proteinThreshold
                ) {
                    return (
                        <Indicator size={10} color="green" offset={-2} style={{pointerEvents: "none"}}>
                            <div style={{color: "black"}}>{day}</div>
                        </Indicator>
                    )
                } else {
                    return (
                        <Indicator size={10} color="red" offset={-2} style={{pointerEvents: "none"}}>
                            <div style={{color: "black"}}>{day}</div>
                        </Indicator>
                    )
                }
            }}
        />
    </div>
}

export default Tracking;
