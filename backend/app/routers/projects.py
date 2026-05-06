from fastapi import APIRouter, Depends, HTTPException
from app.core.database import get_database
from app.core.security import get_current_user, object_id, require_admin
from app.core.serializers import serialize_project, serialize_member, serialize_task, serialize_user
from app.schemas.project import ProjectCreate, ProjectUpdate, AddMemberRequest

router = APIRouter()

async def is_project_admin(db, user_id, project_id):
    member = await db.project_members.find_one({
        "userId": user_id,
        "projectId": project_id
    })
    return member and member.get("role") == "admin"

async def is_project_member(db, user_id, project_id):
    member = await db.project_members.find_one({
        "userId": user_id,
        "projectId": project_id
    })
    return member is not None

@router.get("")
async def get_my_projects(current_user=Depends(get_current_user)):
    db = get_database()
    user_oid = object_id(current_user["_id"])

    if current_user["globalRole"] == "admin":
        projects = await db.projects.find().sort("createdAt", -1).to_list(length=None)
        memberships = await db.project_members.find({"userId": user_oid}).to_list(length=None)
        role_map = {str(m["projectId"]): m["role"] for m in memberships}

        return [
            serialize_project(project, role_map.get(str(project["_id"]), "admin"))
            for project in projects
        ]

    memberships = await db.project_members.find({"userId": user_oid}).to_list(length=None)
    project_ids = [m["projectId"] for m in memberships]

    if not project_ids:
        return []

    projects = await db.projects.find({"_id": {"$in": project_ids}}).sort("createdAt", -1).to_list(length=None)
    role_map = {str(m["projectId"]): m["role"] for m in memberships}

    return [
        serialize_project(project, role_map.get(str(project["_id"]), "member"))
        for project in projects
    ]

@router.post("")
async def create_project(
    payload: ProjectCreate,
    current_user=Depends(require_admin),
):
    db = get_database()
    user_oid = object_id(current_user["_id"])

    result = await db.projects.insert_one({
        "name": payload.name.strip(),
        "description": payload.description or "",
        "createdBy": user_oid
    })

    await db.project_members.insert_one({
        "projectId": result.inserted_id,
        "userId": user_oid,
        "role": "admin"
    })

    project = await db.projects.find_one({"_id": result.inserted_id})
    return serialize_project(project, "admin")

@router.get("/{project_id}")
async def get_project_details(
    project_id: str,
    current_user=Depends(get_current_user),
):
    db = get_database()
    pid = object_id(project_id)
    uid = object_id(current_user["_id"])

    allowed = current_user["globalRole"] == "admin" or await is_project_member(db, uid, pid)
    if not allowed:
        raise HTTPException(status_code=403, detail="Not allowed to view this project")

    project = await db.projects.find_one({"_id": pid})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    creator = await db.users.find_one({"_id": project["createdBy"]})
    project = serialize_project(project)
    project["createdBy"] = serialize_user(creator)

    raw_members = await db.project_members.find({"projectId": pid}).to_list(length=None)
    members = []
    for member in raw_members:
        user = await db.users.find_one({"_id": member["userId"]})
        member["userId"] = user
        members.append(serialize_member(member))

    raw_tasks = await db.tasks.find({"projectId": pid}).sort("createdAt", -1).to_list(length=None)
    tasks = []
    for task in raw_tasks:
        if task.get("assignedTo"):
            user = await db.users.find_one({"_id": task["assignedTo"]})
            task["assignedTo"] = user
        tasks.append(serialize_task(task))

    return {
        "project": project,
        "members": members,
        "tasks": tasks
    }

@router.put("/{project_id}")
async def update_project(
    project_id: str,
    payload: ProjectUpdate,
    current_user=Depends(get_current_user),
):
    db = get_database()
    pid = object_id(project_id)
    uid = object_id(current_user["_id"])

    allowed = current_user["globalRole"] == "admin" or await is_project_admin(db, uid, pid)
    if not allowed:
        raise HTTPException(status_code=403, detail="Only project admin can update project")

    update_data = {}
    if payload.name is not None:
        update_data["name"] = payload.name.strip()
    if payload.description is not None:
        update_data["description"] = payload.description

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    result = await db.projects.update_one({"_id": pid}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    updated = await db.projects.find_one({"_id": pid})
    return serialize_project(updated)

@router.post("/{project_id}/members")
async def add_member(
    project_id: str,
    payload: AddMemberRequest,
    current_user=Depends(get_current_user),
):
    db = get_database()
    pid = object_id(project_id)
    uid = object_id(current_user["_id"])

    allowed = current_user["globalRole"] == "admin" or await is_project_admin(db, uid, pid)
    if not allowed:
        raise HTTPException(status_code=403, detail="Only project admin can add members")

    user = await db.users.find_one({"email": payload.email.lower()})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = await db.project_members.find_one({"projectId": pid, "userId": user["_id"]})
    if existing:
        raise HTTPException(status_code=400, detail="User already in this project")

    result = await db.project_members.insert_one({
        "projectId": pid,
        "userId": user["_id"],
        "role": payload.role
    })

    member = await db.project_members.find_one({"_id": result.inserted_id})
    member["userId"] = user
    return serialize_member(member)

@router.delete("/{project_id}/members/{member_user_id}")
async def remove_member(
    project_id: str,
    member_user_id: str,
    current_user=Depends(get_current_user),
):
    db = get_database()
    pid = object_id(project_id)
    uid = object_id(current_user["_id"])
    member_oid = object_id(member_user_id)

    allowed = current_user["globalRole"] == "admin" or await is_project_admin(db, uid, pid)
    if not allowed:
        raise HTTPException(status_code=403, detail="Only project admin can remove members")

    await db.project_members.delete_one({"projectId": pid, "userId": member_oid})
    return {"message": "Member removed"}

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user=Depends(get_current_user),
):
    db = get_database()
    pid = object_id(project_id)
    uid = object_id(current_user["_id"])

    allowed = current_user["globalRole"] == "admin" or await is_project_admin(db, uid, pid)
    if not allowed:
        raise HTTPException(status_code=403, detail="Only project admin can delete project")

    await db.projects.delete_one({"_id": pid})
    await db.project_members.delete_many({"projectId": pid})
    await db.tasks.delete_many({"projectId": pid})

    return {"message": "Project deleted"}