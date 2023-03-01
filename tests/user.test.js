const request = require("supertest");
const app = require("../src/app");
const JWT = require("jsonwebtoken");
const mongoose = require("mongoose");
// import user schema
const User = require("../src/Model/userSchema")



const testUser = {
    _id: mongoose.Types.ObjectId(),
    name: "testing Man",
    userName: "testing",
    email: "testing@jest.com",
    password: "testing$jest"
}

const comapreUser = {
    name: "testing Man",
    userName: "testing",
    email: "testing@jest.com",
}
let token = null;

// create testing environment 
beforeAll(async () => {
    await User.deleteMany();
    await new User(testUser).save();
})

//***************************************************************************
/**************************** TEST signUp route ****************************/
//***************************************************************************
describe("Testing signUp operation", () => {

    let user = {}
    beforeEach(() => {
        user = {
            userName: "mahmoud1",
            name: "Mahmoud",
            email: "mahmod@mail.com",
            password: "1234abc!!"
        }
    })

    test("Try to sing up with no data ", async () => {
        await request(app)
            .post("/users")
            .send({})
            .expect(400);
    })

    test("Try to sign up without userName", async () => {
        delete user.userName;
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Try to sign up without name ", async () => {
        delete user.name;
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Try to sign up without password", async () => {
        delete user.password;
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Try to sign up without email", async () => {
        delete user.email;
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Try to sign up with invalid password", async () => {
        user.password = "password";
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Try to sign up with invalid email", async () => {
        user.email = "Rwong email";
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("should sign up correctly ", async () => {
        const response = await request(app)
            .post("/users")
            .send(user)
            .expect(201)

        // Assert that database was changed correctly
        const theUser = await User.findByUN(response.body.user.userName)
        expect(theUser).not.toBeNull();
        delete user.password

        // Assert that user saved correctly
        expect(theUser).toMatchObject(user);
        expect(response.body.user).toMatchObject(user);

    })

    test("Try to sign up with repeated data ", async () => {
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })
})

//***************************************************************************
/**************************** TEST logIn route ****************************/
//***************************************************************************



test("log in with correct data -userName-", async () => {
    const response = await request(app)
        .post("/users/login")
        .send({
            email: testUser.userName.toUpperCase(),
            password: testUser.password
        }).expect(200)



    // Assert that return data is the correct data
    expect(response.body.user).toMatchObject(comapreUser);

    token = response.body.token; //save token to use it in another tests
    const userdecoded = JWT.verify(token, process.env.JWT_SECRET)
    expect(userdecoded).toMatchObject(comapreUser);
})

test("log in with correct data -email-", async () => {
    const response = await request(app)
        .post("/users/login")
        .send({
            email: testUser.email.toUpperCase(),
            password: testUser.password
        }).expect(200)

    // Assert that return data is the correct data
    expect(response.body.user).toMatchObject(comapreUser);

    token = response.body.token; //save token to use it in another tests
    const userdecoded = JWT.verify(token, process.env.JWT_SECRET)
    expect(userdecoded).toMatchObject(comapreUser);

})


test("failed test - log in with wrong password -email-", async () => {
    await request(app)
        .post("/users/login")
        .send({
            email: testUser.email,
            password: testUser.password + 1
        }).expect(404)
})

// *************************************************************************
//TEST fetching profile 
//**************************************************************************
if (!token) {
    token = JWT.sign(testUser, process.env.JWT_SECRET)
}

test("Try to log  my profile", async () => {
    const response = await request(app)
        .get("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send()
        .expect(200)

    console.log(response.body)

    // Assert that return profile is the client's profile
    expect(response.body).toMatchObject(comapreUser);
})


test("Try to log  my profile without auth", async () => {
    await request(app)
        .get("/users/me")
        .send()
        .expect(401)
})





// *************************************************************************
//TEST fetching profile
//**************************************************************************
test("Delete your account", async () => {
    await request(app)
        .delete("/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send()
        .expect(200)
})

test("Delete your account without auth", async () => {
    await request(app)
        .delete("/users/me")
        .send()
        .expect(401)
})