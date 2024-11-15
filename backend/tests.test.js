import {
  nutritionFacts,
  createUser,
  usersDB,
  userExists,
  sendAPIDescription,
  getAllUsers,
  getMealsByUser,
  addMealForUser,
  mealsDB,
  searchUsers,
  updateGoals,
  suggestGoal,
} from "./app.js";

describe("Test Nutrition API Call", () => {
  test("Should throw if in github but pass locally", async () => {
    if (process.env.USDA_KEY) {
      const chickenInfo = await nutritionFacts("chicken");
      await expect(chickenInfo).toBeDefined();
    } else {
      await expect(nutritionFacts("chicken")).rejects.toThrow();
    }
  });
});

describe("Test Database User Functions", () => {
  test("Test adding a user", async () => {
    const addedUser = await createUser(1, "fake@gmail.com", "fakeUser", "pic");

    await usersDB.removeAsync({ id: 1 }, { multi: true });

    expect(addedUser.id).toBe(1);
  });

  test("Test userExists with an existing user", async () => {
    await createUser(1, "fake@gmail.com", "fakeUser", "pic");
    const exists = await userExists(1);
    expect(exists).toBe(true);
    await usersDB.removeAsync({ id: 1 }, { multi: true });
  });

  test("Test userExists with non-existing user function", async () => {
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

  test("Test updateGoals function no parameters included except ID", async () => {
    //Creates a fake user
    await createUser(1, "fake@gmail.com", "fakeUser", "pic");
    //Updates the user with empty goals so that it uses the default goal values
    await updateGoals(1, {});

    //Finds the correct user and ensures the protein is 50 (default value)
    const users = await getAllUsers();
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === 1) {
        expect(users[i].protein).toBe(50);
      }
    }

    //cleans up
    await usersDB.removeAsync({ id: 1 }, { multi: true });
  });

  test("Test updateGoals function with all parameters included", async () => {
    //Creates a fake user
    await createUser(1, "fake@gmail.com", "fakeUser", "pic");

    const nutritionGoals = {
      cal: 1,
      calt: 1,
      pro: 1,
      prot: 1,
      car: 1,
      cart: 1,
      fat: 1,
      fatt: 1,
    };

    //Updates the user with all goals set to 1
    await updateGoals(1, nutritionGoals);

    //Finds the correct user and ensures the fat threshold is 50 (default value)
    const users = await getAllUsers();
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === 1) {
        expect(users[i].fatt).toBe(1);
      }
    }

    //cleans up
    await usersDB.removeAsync({ id: 1 }, { multi: true });
  });
});

describe("Test Gemini API Call", () => {
  test("Should throw if in github but pass locally", async () => {
    if (process.env.API_KEY) {
      const geminiResponse = await sendAPIDescription("dontRemove.png", "image/png");
      await expect(geminiResponse).toBeDefined();
    } else {
      await expect(sendAPIDescription("dontRemove.png", "image/png")).rejects.toThrow();
    }
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

describe("Test suggestGoal function", () => {
  it("should return a valid goal suggestion for a valid prompt", async () => {
    if (process.env.API_KEY) {
      const prompt = "Increase energy levels";
      const goal = await suggestGoal(prompt);
      expect(goal).toBeDefined();
    } else {
      await expect(sendAPIDescription("dontRemove.png", "image/png")).rejects.toThrow();
    }
    
  });

  it("should throw an error for an empty prompt", async () => {
    const prompt = "";
    await expect(suggestGoal(prompt)).rejects.toThrow("Prompt must not be empty");
  });

  it("should throw an error for a non-string prompt", async () => {
    const prompt = 12345;
    await expect(suggestGoal(prompt)).rejects.toThrow("Prompt must be of type string");
  });
});
