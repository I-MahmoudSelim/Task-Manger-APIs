const request = require("supertest");
const app = require("../src/app");
const JWT = require("jsonwebtoken");

// import user schema
const User = require("../src/Model/userSchema")
const { UserOne, setUpFn, comapreUserOne } = require('./fixtures/DB')



let token = null;

// create testing environment 

beforeAll(setUpFn)
// test.only("", () => { }) //skip this suit

//***************************************************************************
/**************************** TEST signUp route ****************************/
//***************************************************************************
describe("Testing signUp operation", () => {

    let user = {}
    beforeEach(() => {
        user = {
            userName: "signupman",
            name: "SignUP Man",
            email: "signupman@mail.com",
            password: "signUpMan$jest"
        }
    })

    test("Test failure - SingUp with no data ", async () => {
        await request(app)
            .post("/users")
            .send({})
            .expect(400);
    })

    test("Test failure - SingUp without userName", async () => {
        delete user.userName;
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Test failure - SingUp without name ", async () => {
        delete user.name;
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Test failure - SingUp without password", async () => {
        delete user.password;
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Test failure - SingUp without email", async () => {
        delete user.email;
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Test failure - SingUp with invalid password", async () => {
        user.password = "password";
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Test failure - SingUp with invalid email", async () => {
        user.email = "Rwong email";
        await request(app)
            .post("/users")
            .send(user)
            .expect(400);
    })

    test("Should Sign Up correctly ", async () => {
        const response = await request(app)
            .post("/users")
            .send(user)
            .expect(201)

        // Assert that database was changed correctly
        const theUser = await User.findByUN(response.body.user.userName)
        expect(theUser).not.toBeNull();
        expect(response.body.user).not.toBe(user.password)
        delete user.password

        // Assert that user saved correctly
        expect(theUser).toMatchObject(user);
        expect(response.body.user).toMatchObject(user);

    })

    test("Test failure - SingUp with repeated data ", async () => {
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
            email: UserOne.userName.toUpperCase(),
            password: UserOne.password
        }).expect(200)

    // get user data for testing
    const theUser = await User.findByUN(response.body.user.userName)
    expect(theUser).not.toBeNull();

    // Assert that return data is the correct data
    expect(response.body.user).toMatchObject(comapreUserOne);

    token = response.body.token; //save token to use it in another tests

    //test the Data that sended in the token 
    const userdecoded = JWT.verify(token, process.env.JWT_SECRET)
    expect(userdecoded).toMatchObject(comapreUserOne);
    expect(response.body.token).toBe(theUser.tokens[1].token)
})

test("log in with correct data -email-", async () => {
    const response = await request(app)
        .post("/users/login")
        .send({
            email: UserOne.email.toUpperCase(),
            password: UserOne.password
        }).expect(200)

    // get user data for testing
    const theUser = await User.findByUN(response.body.user.userName)
    expect(theUser).not.toBeNull();

    // Assert that return data is the correct data
    expect(response.body.user).toMatchObject(comapreUserOne);

    token = response.body.token; //save token to use it in another tests

    //test the Data that sended in the token 
    const userdecoded = JWT.verify(token, process.env.JWT_SECRET)
    expect(userdecoded).toMatchObject(comapreUserOne);
    expect(response.body.token).toBe(theUser.tokens[2].token)
})

test("Test failure - log in with wrong password -email-", async () => {
    await request(app)
        .post("/users/login")
        .send({
            email: UserOne.email,
            password: UserOne.password + 1
        }).expect(404)
})

test("Test log out from all other sessions '/users/me/logoutall'", async () => {
    const response = await request(app).post("/users/me/logoutall")
        .set("Authorization", `Bearer ${token}`)
        .send()
        .expect(200)
})
test("Test log out from this session '/users/me/logout'", async () => {
    const rse = await request(app).post("/users/me/logoutall")
        .set("Authorization", `Bearer ${token}`)
        .send()
        .expect(200)
})

if (!token) {
    token = JWT.sign(UserOne, process.env.JWT_SECRET)
}



// *************************************************************************
/************************** TEST searching users **************************/
//**************************************************************************

test.each([
    ["name=User One", token, 200],
    ["name=no one", token, 404],
    ["", token, 404],
    ["name=Mahmoud", "token", 401]

])("Should search for another users", async (query, Token, code) => {
    const res = await request(app)
        .get(`/users/find?${query}`)
        .set("Authorization", `Bearer ${Token}`)
        .send()
        .expect(code)

    if (code === 200) {
        for (const resault of res.body) {
            expect(resault.name).toEqual("User One");
        }
    }

})

// *************************************************************************
/************** TEST users' avatar requests on users/me/avatar ************/
//**************************************************************************
describe("TEST users' avatar requests on users/me/avatar", () => {

    ///// TEST post request 

    test("Test failure -uploading avatar without auth", async () => {
        const res = await request(app)
            .post("/users/me/avatar")
            .attach("avatar", "tests/fixtures/profile-pic.jpg")
            .expect(401)

        // Assert that user has not avatar
        const theUser = await User.findByUN(UserOne.userName)
        expect(theUser.avatar).toBeUndefined()
    })

    test("Test failure -uploading avatar wrong file type", async () => {
        const res = await request(app)
            .post("/users/me/avatar")
            .set("Authorization", `Bearer ${token}`)
            .attach("avatar", "tests/fixtures/sample-doc-file.doc")
            .expect(400)

        // Assert that user has not avatar
        const theUser = await User.findByUN(UserOne.userName)
        expect(theUser.avatar).toBeUndefined()
    })

    test("Test uploading avatar with auth", async () => {
        const res = await request(app)
            .post("/users/me/avatar")
            .set("Authorization", `Bearer ${token}`)
            .attach("avatar", "tests/fixtures/profile-pic.jpg")
            .expect(200)

        // Assert that user has avatar
        const theUser = await User.findByUN(UserOne.userName)
        expect(theUser.avatar).toEqual(expect.any(Buffer))
    })

    ///// TEST get request

    test("Test failure-Test display avatar without auth", async () => {
        const res = await request(app)
            .get("/users/me/avatar")
            .expect(401)
    })

    test("Test display avatar with auth", async () => {
        const res = await request(app)
            .get("/users/me/avatar")
            .set("Authorization", `Bearer ${token}`)
            .expect(200)

        // Assert that res is user and has avatar 
        expect(res.body).toEqual(expect.any(Buffer))

    })

    ///// TEST delete request

    // test("Test failure-Test deleteing avatar without auth", async () => {
    //     const res = await request(app)
    //         .delete("/users/me/avatar")
    //         .expect(401)

    //     // Assert that user still has avatar 
    //     const theUser = await User.findByUN(UserOne.userName)
    //     expect(theUser.avatar).toEqual(expect.any(Buffer))
    // })
    test("Test deleteing avatar with auth", async () => {
        const res = await request(app)
            .delete("/users/me/avatar")
            .set("Authorization", `Bearer ${token}`)
            .expect(200)

        // Assert that user's avatar is deleted
        const theUser = await User.findByUN(UserOne.userName)
        expect(theUser.avatar).toBeUndefined()
    })

})

// *************************************************************************
/***************** TEST users'account  requests on users/me ***************/
//**************************************************************************

describe("TEST users'account requests on users/me", () => {

    //// TEST get request 

    test("display my profile page", async () => {
        const response = await request(app)
            .get("/users/me")
            .set("Authorization", `Bearer ${token}`)
            .send()
            .expect(200)

        // Assert that return profile is the client's profile
        expect(response.body).toMatchObject(comapreUserOne);
    })


    test("Test failure - display my profile page without auth", async () => {
        await request(app)
            .get("/users/me")
            .send()
            .expect(401)
    })

    //// TEST patch request

    test("Test failure - update the account without auth token", async () => {
        request(app).patch("/users/me")
            .send({ name: "Mahmoud" })
            .expect(401)
    })
    test.each([
        [{}, 400],
        [{ location: "cairo" }, 403],
        [{ name: "Mahmoud" }, 200]
    ])("update with auth once vailed unvalid properties", async (data, code) => {
        const res = await request(app).patch("/users/me")
            .set("Authorization", `Bearer ${token}`)
            .send(data)
            .expect(code)
        const theUser = await User.findByUN(res.body.userName)
        if (code == 200) {
            expect(theUser).toMatchObject(data)
        } else {
            expect(data).not.toEqual(theUser)
        }
    })

    ////TEST delete request

    test("Test failure - Delete your account without auth", async () => {
        await request(app)
            .delete("/users/me")
            .send()
            .expect(401)
    })

    test("Delete your account", async () => {
        await request(app)
            .delete("/users/me")
            .set("Authorization", `Bearer ${token}`)
            .send()
            .expect(200)

        // Assert that user data is deleted
        const theUser = await User.findByUN(UserOne.userName)
        expect(theUser).toBeNull();
    })

})