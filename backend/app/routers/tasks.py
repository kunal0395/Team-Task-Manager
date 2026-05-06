from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_database
from app.core.security import get_current_user, object_id
from app.core.serializers import serialize_task
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate

router = APIRouter()

async def is_project_admin(db, user_id, project_id):
    member = await db.project_members.find_one({"userId": user_id, "projectId": project_id})
    return member and member.get("role") == "admin"

async def is_project_member(db, user_id, project_id):
    member = await db.project_members.find_one({"userId": user_id, "projectId": project_id})
    return member is not None

@router.get("/project/{project_id}")
async def get_project_tasks(project_id: str, current_user=Depends(get_current_user)):
    db = get_database()
    pid = object_id(project_id)
    uid = object_id(current_user["_id"])

    allowed = current_user["globalRole"] == "admin" or await is_project_member(db, uid, pid)
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed")

    tasks = await db.tasks.find({"projectId": pid}).sort("createdAt", -1).to_list(length=None)
    result = []

    for task in tasks:
        if task.get("assignedTo"):
            user = await db.users.find_one({"_id": task["assignedTo"]})
            task["assignedTo"] = user
        result.append(serialize_task(task))

    return result

@router.post("")
async def create_task(payload: TaskCreate, current_user=Depends(get_current_user)):
    db = get_database()
    uid = object_id(current_user["_id"])
    pid = object_id(payload.projectId)

    allowed = current_user["globalRole"] == "admin" or await is_project_admin(db, uid, pid)
    if not allowed:
        raise HTTPException(status_code=403, detail="Only project admin can create tasks")

    assigned_oid = None
    if payload.assignedTo:
        assigned_oid = object_id(payload.assignedTo)
        member = await db.project_members.find_one({"projectId": pid, "userId": assigned_oid})
        if not member:
            raise HTTPException(status_code=400, detail="Assigned user must be a project member")

    due_dt = datetime.combine(payload.dueDate, datetime.min.time())

    result = await db.tasks.insert_one({
        "title": payload.title.strip(),
        "description": payload.description or "",
        "dueDate": due_dt,
        "priority": payload.priority,
        "status": "To Do",
        "projectId": pid,
        "assignedTo": assigned_oid,
        "createdBy": uid
    })

    task = await db.tasks.find_one({"_id": result.inserted_id})
    if task.get("assignedTo"):
        user = await db.users.find_one({"_id": task["assignedTo"]})
        task["assignedTo"] = user

    return serialize_task(task)

@router.patch("/{task_id}/status")
async def update_task_status(
    task_id: str,
    payload: TaskStatusUpdate,
    current_user=Depends(get_current_user),
):
    db = get_database()
    tid = object_id(task_id)
    uid = object_id(current_user["_id"])

    task = await db.tasks.find_one({"_id": tid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    allowed = (
        current_user["globalRole"] == "admin"
        or str(task.get("assignedTo")) == str(uid)
        or await is_project_admin(db, uid, task["projectId"])
    )
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed")

    await db.tasks.update_one({"_id": tid}, {"$set": {"status": payload.status}})
    updated = await db.tasks.find_one({"_id": tid})
    if updated.get("assignedTo"):
        user = await db.users.find_one({"_id": updated["assignedTo"]})
        updated["assignedTo"] = user

    return serialize_task(updated)

@router.put("/{task_id}")
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    current_user=Depends(get_current_user),
):
    db = get_database()
    tid = object_id(task_id)
    uid = object_id(current_user["_id"])

    task = await db.tasks.find_one({"_id": tid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    allowed = current_user["globalRole"] == "admin" or await is_project_admin(db, uid, task["projectId"])
    if not allowed:
        raise HTTPException(status_code=403, detail="Only admin can edit task")

    update_data = {}
    if payload.title is not None:
        update_data["title"] = payload.title.strip()
    if payload.description is not None:
        update_data["description"] = payload.description
    if payload.dueDate is not None:
        update_data["dueDate"] = datetime.combine(payload.dueDate, datetime.min.time())
    if payload.priority is not None:
        update_data["priority"] = payload.priority
    if payload.status is not None:
        update_data["status"] = payload.status
    if payload.assignedTo is not None:
        if payload.assignedTo == "":
            update_data["assignedTo"] = None
        else:
            assigned_oid = object_id(payload.assignedTo)
            member = await db.project_members.find_one({"projectId": task["projectId"], "userId": assigned_oid})
            if not member:
                raise HTTPException(status_code=400, detail="Assigned user must be a project member")
            update_data["assignedTo"] = assigned_oid

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db.tasks.update_one({"_id": tid}, {"$set": update_data})
    updated = await db.tasks.find_one({"_id": tid})
    if updated.get("assignedTo"):
        user = await db.users.find_one({"_id": updated["assignedTo"]})
        updated["assignedTo"] = user

    return serialize_task(updated)

@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user=Depends(get_current_user)):
    db = get_database()
    tid = object_id(task_id)
    uid = object_id(current_user["_id"])

    task = await db.tasks.find_one({"_id": tid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    allowed = current_user["globalRole"] == "admin" or await is_project_admin(db, uid, task["projectId"])
    if not allowed:
        raise HTTPException(status_code=403, detail="Only admin can delete task")

    await db.tasks.delete_one({"_id": tid})
    return {"message": "Task deleted"}