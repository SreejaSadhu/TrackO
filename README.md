TrackO - MERN Expense Tracker 💸

🚀 TrackO is a MERN-based expense tracker with a modern UI powered by React, Node.js, Express, and MongoDB. It features user authentication, CRUD functionality, and expense visualization with charts.

📌 Features
✅ User Authentication (Login & Register) 🔐
✅ Add, Edit, and Delete Expenses 💰
✅ Categorized Expense List 📑
✅ Dark Mode Toggle 🌙
✅ Interactive Charts (Recharts.js) 📊
✅ LocalStorage & Database Sync 🔄
✅ Responsive UI with Tailwind CSS 📱
✅ Vercel Frontend & Render Backend Deployment 🚀

🛠 Tech Stack
Technology	Purpose
MongoDB	NoSQL Database
Express.js	Backend Framework
React.js	Frontend UI
Node.js	Server-side Runtime
Tailwind CSS	Styling
Recharts	Charts & Data Visualization
JWT (JSON Web Tokens)	Authentication
Bcrypt.js	Password Hashing

1️⃣ Clone the Repository
sh
Copy
Edit
git clone https://github.com/your-username/tracko-mern.git
cd tracko-mern

2️⃣ Set Up Environment Variables
Create a .env file in the root directory and add:
env
Copy
Edit
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

3️⃣ Install Dependencies
Backend (Express + MongoDB)
sh
Copy
Edit
cd backend
npm install
Frontend (React + Tailwind)
sh
Copy
Edit
cd ../frontend
npm install

4️⃣ Run the Application
Start Backend Server
sh
Copy
Edit
cd backend
npm run dev
Start Frontend Development Server
sh
Copy
Edit
cd frontend
npm start
🚀 Your app is now running at http://localhost:3000 (frontend) and http://localhost:5000 (backend).

🛠 API Endpoints
Method	Endpoint	Description
POST	/api/users/register	Register a new user
POST	/api/users/login	User login
GET	/api/expenses	Get all expenses
POST	/api/expenses	Add a new expense
PUT	/api/expenses/:id	Update an expense
DELETE	/api/expenses/:id	Delete an expense

📜 License
This project is licensed under the MIT License.

💬 Contributing
Feel free to open an issue or pull request if you’d like to improve TrackO! 😊













Search

Reason

C
