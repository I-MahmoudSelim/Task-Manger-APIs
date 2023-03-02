const app = require("../src/app")
const request = require("supertest")
const JWT = require("jsonwebtoken")

const User = require("../src/Model/userSchema")
const Task = require("../src/Model/taskSchema")
const { UserOne, setUpFn, UserTwo, TaskOne, TaskTwo, TaskThree } = require("./fixtures/DB");

beforeEach(setUpFn);

const tokenOne = JWT.sign(UserOne, process.env.JWT_SECRET);
const tokenTwo = JWT.sign(UserTwo, process.env.JWT_SECRET);
const jestTask = { description: "task form test file" }
test.each([
    [jestTask, "", 401],
    [{}, tokenOne, 400],
    [jestTask, tokenOne, 201]
])("testing creating a new task ", async (task, token, code) => {
    const res = await request(app).post("/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send(task)
        .expect(code)
    if (code == 200) {
        // Assert that the return is the task
        expect(res.body).toMatchObject(task)
        // Assert that the fetched task is correct
        const TaskOne_b = await Task.findById(res.body._id)
        expect(TaskOne_b).toMatchObject(task)
    }
})

test.each([
    [tokenOne, 404],
    ["", 401],
    [tokenTwo, 200]
])("Fetching my task by its id", async (token, code) => {
    const res = await request(app).get(`/tasks/${TaskThree._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send()
        .expect(code)
    // Assert that we fetch the correct task
    if (code === 200) {
        expect(res.body.description).toEqual(TaskThree.description)
        expect(res.body.complete).toEqual(TaskThree.complete)
    }
})

test.each([
    [tokenOne, 404],
    ["", 401],
    [tokenTwo, 200]
])("Deleting my task by its id", async (token, code) => {
    const res = await request(app).delete(`/tasks/${TaskThree._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send()
        .expect(code)
    // Assert that we delete the selected task
    if (code === 200) {
        expect(await Task.findById(TaskThree._id)).toBeNull()
    } else {  // Assert that we do not delete that task
        expect(await Task.findById(TaskThree._id)).not.toBeNull()
    }
})

// taskThreeEdit_refuse
const tTE_R = {
    description: "task three description modified",
    complete: true,
    creator: UserOne._id
}
// taskThreeEdit_accepted
const tTE_A = {
    description: "task three description modified",
    complete: true,
}

test.each([
    [tTE_A, tokenOne, 401],
    [tTE_A, "", 401],
    [tTE_R, tokenTwo, 403],
    [tTE_A, tokenTwo, 200]
])("Updating my task by its id", async (task, token, code) => {
    const res = await request(app).patch(`/tasks/${TaskThree._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send(task)
        .expect(code)
    // Assert that we delete the selected task
    if (code === 200) {
        expect(await Task.findById(TaskThree._id)).toMatchObject(task)
    } else {  // Assert that we do not delete that task
        expect(await Task.findById(TaskThree._id)).toMatchObject(TaskThree)
    }
})


// [{ complete: true, sortBy: "complete:des", limit: 1, skip: 0 }],
// [{ complete: false, sortBy: "complete:des", limit: 2, skip: 0 }]
test.each([
    ["complete=true"],
    ["complete=false&sortBy=complete:des&limit=1&skip=0"]
])("fetching all my task", async (query) => {
    const res = await request(app).get(`/tasks?${query}`)
        .set("Authorization", `Bearer ${tokenOne}`)

        .send()
        .expect(200)

    // Assert that we delete the selected task
    if (query === "complete=true") {
        expect(res.body[0].description).toEqual(TaskOne.description)
    } else {  // Assert that we do not delete that task
        expect(res.body[0].description).toEqual(TaskTwo.description)
    }
})