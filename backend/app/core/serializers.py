from datetime import datetime
from bson import ObjectId

def oid(value):
    return str(value) if isinstance(value, ObjectId) else value

def dt(value):
    if isinstance(value, datetime):
        return value.isoformat()
    return value

def serialize_user(user):
    if not user:
        return None
    return {
        "_id": oid(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "globalRole": user.get("globalRole", "member"),
        "createdAt": dt(user.get("createdAt")),
        "updatedAt": dt(user.get("updatedAt")),
    }

def serialize_project(project, my_role=None):
    if not project:
        return None
    data = {
        "_id": oid(project["_id"]),
        "name": project["name"],
        "description": project.get("description", ""),
        "createdBy": project.get("createdBy"),
        "createdAt": dt(project.get("createdAt")),
        "updatedAt": dt(project.get("updatedAt")),
    }
    if isinstance(data["createdBy"], dict):
        data["createdBy"] = serialize_user(data["createdBy"])
    else:
        data["createdBy"] = oid(data["createdBy"])
    if my_role is not None:
        data["myRole"] = my_role
    return data

def serialize_member(member):
    if not member:
        return None
    user = member.get("userId")
    if isinstance(user, dict):
        user = serialize_user(user)

    return {
        "_id": oid(member["_id"]),
        "projectId": oid(member["projectId"]),
        "userId": user,
        "role": member.get("role", "member"),
        "joinedAt": dt(member.get("joinedAt")),
        "createdAt": dt(member.get("createdAt")),
        "updatedAt": dt(member.get("updatedAt")),
    }

def serialize_task(task):
    if not task:
        return None

    assigned_to = task.get("assignedTo")
    if isinstance(assigned_to, dict):
        assigned_to = serialize_user(assigned_to)

    return {
        "_id": oid(task["_id"]),
        "title": task["title"],
        "description": task.get("description", ""),
        "dueDate": dt(task.get("dueDate")),
        "priority": task.get("priority", "Medium"),
        "status": task.get("status", "To Do"),
        "projectId": oid(task["projectId"]),
        "assignedTo": assigned_to,
        "createdBy": oid(task["createdBy"]),
        "createdAt": dt(task.get("createdAt")),
        "updatedAt": dt(task.get("updatedAt")),
    }