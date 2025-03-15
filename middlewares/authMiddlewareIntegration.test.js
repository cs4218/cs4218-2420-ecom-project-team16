import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { isAdmin, requireSignIn } from "./authMiddleware.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";

describe("Test requireSignIn Integration", () => {
    let req, res, next, validToken;
    beforeAll(() => {
        dotenv.config();
    
    })
    beforeEach(() => {
        jest.clearAllMocks();
        validToken = JWT.sign(
            { _id: 1 }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1h" }
        );
        req = {
            headers: {
                authorization: `${validToken}`
            },
            user: {
                _id: 1
              },
            };
        next = jest.fn();
    });

    test("requireSignIn no error", async () => {
            await requireSignIn(req, res, next);
            expect(next).toBeCalledTimes(1);
    });

    test("Wrong JWT Secret", async () => {
        req = {
            headers: {
                authorization: "Invalid"
            },
            user: {
                _id: 1
              },
            };
        await requireSignIn(req, res, next);
        expect(next).toBeCalledTimes(0);
    });
});

describe("Test isAdmin Integration" , () => {
    let mongoServer, user, req, res, nextFunction;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        // Connect mongoose to the in-memory DB
        await mongoose.connect(mongoUri, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
    });
    beforeEach(async () => {
        user = await new userModel({
              name: "Tester",
              email: "Test@gmail.com",
              phone: "11111111",
              address: "123 Football Street",
              password: 12345678,
              answer: "Test",
              role: 1,
        }).save();
        req = {
            user: user,
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
        nextFunction = jest.fn()
    });

    afterEach(async () => {
        // Clear all data after each test
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        // Close the MongoDB connection and stop the in-memory server
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test("Successful Integration with userModel", async () => {
        await isAdmin(req, res, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.send).not.toHaveBeenCalledWith();
    });

    test("Unable to access if not admin", async () => {
        user = await new userModel({
            name: "Tester",
            email: "Another@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: 12345678,
            answer: "Test",
            role: 0,
        }).save();
        req = {
          user: user,
        };
        await isAdmin(req, res, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "UnAuthorized Access",
        });
    });

    test("Error inserting into new DB resulting in correct res", async () => {
        req = {
          user: null,
        };
        await isAdmin(req, res, nextFunction);

        expect(nextFunction).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.send).toHaveBeenCalled();
    });
});