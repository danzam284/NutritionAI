# NutritionAI
## Our Application Summary
We plan to take on the diet analyzer project with the main theme of helping people to reach their health goals. Some features we plan to deploy are allowing users to upload images of their meals and receive a nutritional score, as well as some feedback or suggestions to improve the meal. We also plan to make our application more user oriented such that their uploads will be saved and accessible at any time for tracking. We also plan to allow users to follow each other so that they can see what other people are eating, which would have the positive effects of giving inspiration as well as holding people accountable. Finally, we plan to allow people to enter goals (such as daily macronutrient counts) so that they can track their daily progress towards meeting those goals.
## Our Technical Plan
As far as our technical plan for this project, we want to build an express application using node.js web framework. While mobile is also suitable, we feel that web is more suitable towards our team's skill set and we plan to make the site mobile friendly so it can still be utilized. We also plan to leverage Gemini’s API for image analysis as it is free and effective and can be a good tool to figure out the ingredients and proportions. For database storage, we plan to either use MongoDB or a more lightweight option, NEDB. Finally, we plan to use Clerk for our user creation, authentication, and management as it is extremely simple and allows sign in integration with organizations like Google and auto filled user data.
## Our Team
- Armaan Khatri
- Branden Bulatao
- Daniel Zamloot
- Mohammed Aziz
- Johnson Lee
- Andre Neyra
## Running the Application
- cd into backend and run 'npm i'
- cd into NutritionAI and run 'npm i'
- to run the backend, run 'npm start' in the backend directory
- to run the frontent (nutritionAI) run 'npm run dev' in the nutritionai directory
- You also need to add a .env file in the backend directory with an API Key required for gemini use. Feel free to generate your own or contact the team for a key.







