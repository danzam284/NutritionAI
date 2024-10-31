import { nutritionFacts, createUser, usersDB, userExists, sendAPIDescription, getAllUsers, getMealsByUser, addMealForUser, mealsDB, searchUsers } from './app.js';

describe("Test Nutrition API Call", () => {
  // Return a valid token
  test("should return valid data for chicken", async () => {
    const result = await nutritionFacts("chicken");
    expect(result).toBeDefined();
  });
});

describe("Test Database User Functions", () => {

  test("Test adding a user", async () => {
    const addedUser = await createUser(1, "fake@gmail.com", "fakeUser", "pic");

    await usersDB.removeAsync({ id: 1 }, { multi: true });

    expect(addedUser.id).toBe(1);
  });

  test("Test userExists function", async () => {

    //Removes all previously added users with an ID of 1
    await usersDB.removeAsync({ id: 1 }, { multi: true });

    const exists = await userExists(1);
    expect(exists).toBe(false);
  });

  test("Test getAllUsers function", async () => {

    //Removes all previously added users with an ID of 1
    const allUsers = await getAllUsers();
    expect(Array.isArray(allUsers)).toBe(true);
  });

  test("Test searchUsers function", async () => {
    await createUser(1, "fake@gmail.com", "fakeUser", "pic");
    await createUser(2, "fake2@gmail.com", "fakeUser2", "pic");
    const results = await searchUsers("fakeUser", 2);
    expect(results).toBeDefined();

    await usersDB.removeAsync({ id: 1 }, { multi: true });
    await usersDB.removeAsync({ id: 2 }, { multi: true });
  });

  test("Test searchUsers should fail", async () => {
    await createUser(1, "fake@gmail.com", "fakeUser", "pic");
    await createUser(2, "fake2@gmail.com", "fakeUser2", "pic");
    await expect(searchUsers("fakeUser", 1029)).rejects.toThrow();

    await usersDB.removeAsync({ id: 1 }, { multi: true });
    await usersDB.removeAsync({ id: 2 }, { multi: true });
  });

  
});

describe("Test Gemini API Call", () => {
  // Return a valid token
  test("Should return API data", async () => {
    const APITest = await sendAPIDescription("dontRemove.png", "image/png");
    expect(APITest).toBeDefined();
  });

});

describe("Test Database Meal Functions", () => {

  test("Test getting meals by a user", async () => {
    const meals = await getMealsByUser(1);
    expect(meals.length).toBe(0);
  });

  test("Test adding meals for a user", async () => {
    await createUser(1, "fake@gmail.com", "fakeUser", "pic");
    const fakeMeal = { poster: 1 };
    await addMealForUser(fakeMeal);

    const meals = await getMealsByUser(1);
    expect(meals.length).toBe(1);

    await mealsDB.removeAsync({ poster: 1 }, { multi: true });
    await usersDB.removeAsync({ id: 1 }, { multi: true });
  });
  
});