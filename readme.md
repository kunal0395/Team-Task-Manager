# Team Task Manager
[Live Demo](https://team-task-manager-production-c2d6.up.railway.app/)
A full-stack team task management web app built with:

* **Frontend:** React + Vite + Tailwind CSS
* **Backend:** FastAPI
* **Database:** MongoDB Atlas
* **Authentication:** JWT
* **Roles:** Admin and Member

The app supports:

* Signup and login
* Admin seed account
* Project creation and member management
* Task creation, assignment, update, and delete
* Task status updates: **To Do**, **In Progress**, **Done**
* Dashboard with project/task stats
* Right-side greeting like **Good morning, Kunal**

---

## Folder Structure

```bash
team-task-manager/
├─ backend/
│  ├─ app/
│  │  ├─ core/
│  │  ├─ routers/
│  │  ├─ schemas/
│  │  ├─ utils/
│  │  └─ main.py
│  ├─ .env
│  └─ requirements.txt
│
├─ frontend/
│  ├─ src/
│  │  ├─ api/
│  │  ├─ components/
│  │  ├─ context/
│  │  ├─ pages/
│  │  ├─ App.jsx
│  │  ├─ main.jsx
│  │  └─ index.css
│  ├─ .env
│  ├─ index.html
│  ├─ package.json
│  ├─ tailwind.config.js
│  └─ postcss.config.js
│
└─ README.md
```

---

## Features

### Authentication

* New users can sign up with name, email, and password
* Existing users can log in with email and password
* Passwords are hashed before storing in MongoDB
* JWT token is used for protected routes

### Roles

* **Admin**

  * Create projects
  * Add members
  * Add admin members
  * Create, edit, and delete tasks
  * Edit and delete projects
* **Member**

  * View assigned projects
  * View tasks inside assigned projects
  * Update task status if permitted

### Dashboard

* Total projects
* Total tasks
* Tasks by status
* Overdue tasks
* Tasks per user
* Greeting on the right side based on time of day

---

## Setup Instructions

### 1. Clone or create the project

```bash
gh repo clone kunal0395/Team-Task-Manager
cd team-task-manager
```

---

### 2. Backend setup

Go to the backend folder:

```bash
cd backend
```

Create and activate virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Mac/Linux:

```bash
source venv/bin/activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `backend/` and add:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/team_task_manager?retryWrites=true&w=majority
DB_NAME=team_task_manager
JWT_SECRET=your_jwt_secret_here
ACCESS_TOKEN_EXPIRE_MINUTES=10080
CLIENT_URL=http://localhost:5173
CLIENT_ORIGINS=http://localhost:5173

ADMIN_NAME=Kunal
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

Run the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend will run at:

```bash
http://localhost:8000
```

API docs:

```bash
http://localhost:8000/docs
```

---

### 3. Frontend setup

Open a new terminal and go to the frontend folder:

```bash
cd frontend
```

Install frontend dependencies:

```bash
npm install
```

Create a `.env` file inside `frontend/` and add:

```env
VITE_API_URL=http://localhost:8000
```

Run the frontend:

```bash
npm run dev
```

Frontend will run at:

```bash
http://localhost:5173
```

---

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account.
2. Create a cluster.
3. Create a database user in **Database Access**.
4. Add your IP in **Network Access**.
5. Copy the connection string from **Connect > Drivers**.
6. Replace `<username>`, `<password>`, and `<cluster-name>` in the backend `.env`.
7. Make sure the password is URL-encoded if it contains special characters like `@`.

Example:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/
```

---

## How the App Works

### Login flow

* Open the login page
* Login as admin using the seeded admin account from backend `.env`
* After login, the app stores JWT token in localStorage

### Project flow

* Admin creates a project
* Creator automatically becomes project admin
* Admin adds users by email
* Members can view only assigned projects

### Task flow

* Admin creates tasks inside a project
* Admin assigns tasks to project members
* Assigned member can update status
* Admin can edit or delete tasks

---

## Important Notes

* Do not commit `.env` files to GitHub.
* Use `.gitignore` to ignore secrets and build files.
* `projects`, `tasks`, and `project_members` collections will appear in MongoDB Atlas only after data is inserted.
* If you change the MongoDB connection string, restart the backend.

---

## Run Order

Start backend first:

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Then start frontend:

```bash
cd frontend
npm run dev
```

---

---

## Submission Checklist

* [ ] Backend working
* [ ] Frontend working
* [ ] MongoDB Atlas connected
* [ ] Login/signup working
* [ ] Project creation working
* [ ] Task creation and update working
* [ ] Dashboard stats working
* [ ] README added
* [ ] `.gitignore` added
* [ ] Demo video recorded

---

## License

This project is for educational and assignment use.
