from datetime import datetime
from fastapi import APIRouter, Depends
from app.core.database import get_database
from app.core.security import get_current_user, object_id

router = APIRouter()

@router.get("")
async def dashboard(current_user=Depends(get_current_user)):
    db = get_database()
    uid = object_id(current_user["_id"])

    if current_user["globalRole"] == "admin":
        projects = await db.projects.find().to_list(length=None)
        tasks = await db.tasks.find().to_list(length=None)
    else:
        memberships = await db.project_members.find({"userId": uid}).to_list(length=None)
        project_ids = [m["projectId"] for m in memberships]
        projects = await db.projects.find({"_id": {"$in": project_ids}}).to_list(length=None)
        tasks = await db.tasks.find({"projectId": {"$in": project_ids}}).to_list(length=None)

    total_projects = len(projects)
    total_tasks = len(tasks)
    todo = len([t for t in tasks if t.get("status") == "To Do"])
    in_progress = len([t for t in tasks if t.get("status") == "In Progress"])
    done = len([t for t in tasks if t.get("status") == "Done"])
    overdue = len([t for t in tasks if t.get("status") != "Done" and t.get("dueDate") and t["dueDate"] < datetime.utcnow()])

    tasks_per_user = {}
    for task in tasks:
        assigned = task.get("assignedTo")
        if assigned:
            user = await db.users.find_one({"_id": assigned})
            name = user["name"] if user else "Unassigned"
        else:
            name = "Unassigned"
        tasks_per_user[name] = tasks_per_user.get(name, 0) + 1

    return {
        "totalProjects": total_projects,
        "totalTasks": total_tasks,
        "todo": todo,
        "inProgress": in_progress,
        "done": done,
        "overdueTasks": overdue,
        "tasksPerUser": tasks_per_user
    }