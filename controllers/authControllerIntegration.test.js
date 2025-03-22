import { expect, jest } from "@jest/globals";
import { forgotPasswordController, getAllOrdersController, getAllUsersController, getOrdersController, loginController, orderStatusController, registerController, testController, updateProfileController } from "./authController";
import userModel from "../models/userModel";
import { comparePassword, hashPassword } from "../helpers/authHelper";
import JWT from "jsonwebtoken";
import orderModel from "../models/orderModel.js";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import dotenv from "dotenv";
import categoryModel from "../models/categoryModel.js";
import productModel from "../models/productModel.js";

describe("Test Register Controller Integration", () => {
    let mongoServer, user, req, res;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {});
    });
    beforeEach(async () => {
        user = await new userModel({
            name: "Tester",
            email: "Test@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: "12345678",
            answer: "Test",
            role: 1,
        }).save();
        req = {
            body: {
                name: "Tester",
                email: "Test@gmail.com",
                phone: "11111111",
                address: "123 Football Street",
                password: "12345678",
                answer: "Test",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test("Reject Existing User", async () => {
        await registerController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Already Register please login",
        });
    });

    test("Successful Registration of new user", async () => {
        req.body.email = "new@gmail.com";
        await registerController(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.send).toHaveBeenCalledTimes(1);
    });

    test("Error during password hashing (Should not occur)", async () => {
        req.body.email = "new@gmail.com"
        req.body.password = 12345678
        await registerController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.send).toHaveBeenCalledTimes(1);
    });
});

describe("Test Login Controller Integration", () => {
    let mongoServer, user, req, res;
    beforeAll(async () => {
        // Add env config for JWT Token to function
        dotenv.config();
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {});
    });
    beforeEach(async () => {
        const password = await hashPassword("12345678");
        user = await new userModel({
            name: "Tester",
            email: "Test@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: password,
            answer: "Test",
            role: 1,
        }).save();
        req = {
            body: {
                email: "Test@gmail.com",
                password: "12345678",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test("Reject Non-existent User", async () => {
        req.body.email = "new@gmail.com"
        await loginController(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Email is not registerd",
        });
    });

    test("Reject Non matching password", async () => {
        req.body.password = "Not the same"
        await loginController(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Invalid Password",
        });
    });

    test("Successful login", async () => {
        await loginController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();
    });
});

describe("Test Forgot Password Controller Integration", () => {
    let mongoServer, user, req, res;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {});
    });
    beforeEach(async () => {
        const password = await hashPassword("12345678");
        user = await new userModel({
            name: "Tester",
            email: "Test@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: password,
            answer: "Test",
            role: 1,
        }).save();
        req = {
            body: {
                email: "Test@gmail.com",
                answer: "Test",
                newPassword: "abcdefgh",
            },
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test("User does not exist within the database", async () => {
        req.body.email = "new@gmail.com"
        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toHaveBeenCalledWith({
            success: false,
            message: "Wrong Email Or Answer",
        });
    });

    test("Successful change of password", async () => {
        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalledWith({
            success: true,
            message: "Password Reset Successfully",
        });
        // Check that updating was correct
        const user = await userModel.findOne({ email: req.body.email, answer: req.body.answer });
        const comparison = await comparePassword(req.body.newPassword, user.password);
        expect(comparison).toBe(true);
    });

    test("Unable to hash password (Should not happen)", async () => {
        req.body.newPassword = 12345678;
        await forgotPasswordController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalled();
    });
});

describe("Test Update Profile Controller Integration", () => {
    let mongoServer, user, req, res;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {});
    });
    beforeEach(async () => {
        const password = await hashPassword("12345678");
        user = await new userModel({
            name: "Tester",
            email: "Test@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: password,
            answer: "Test",
            role: 1,
        }).save();
        req = {
            body: {
                name: "Tester",
                email: "Test@gmail.com",
                phone: "11111111",
                address: "123 Football Street",
                password: "12345678",
            },
            user: user,
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test("Unable to find ID (Technically should not occur", async () => {
        req.user = {};
        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ message: "No user found" });
    });

    test("Successful Updating of ALL information", async () => {
        req.body = {
            name: "New Tester",
            email: "Test@gmail.com",
            phone: "22222222",
            address: "234 Football Street",
            password: "qwertyui",
        }
        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();
        const updatedUser = await userModel.findById(req.user._id);
        expect(updatedUser.name).toBe("New Tester");
        expect(updatedUser.phone).toBe("22222222");
        expect(updatedUser.address).toBe("234 Football Street");
        const bool = await comparePassword("qwertyui", await hashPassword("qwertyui"))
        expect(bool).toBe(true);
    });

    /**
     * Do pairwise starting to check that data updates correctly
     * 
     * Table
     * *************************************
     * * name * password * address * phone *
     * *  1   *    1     *    0    *    0  *
     * *  1   *    0     *    1    *    1  *
     * *  0   *    1     *    1    *    0  *
     * *  0   *    0     *    0    *    1  *
     * *************************************
     */

    test("Pairwise Test Case 1: Name and Phone updated", async () => {
        req.body.name = "New Tester";
        req.body.phone = "22222222";

        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();

        const updatedUser = await userModel.findById(req.user._id);
        expect(updatedUser.name).toBe("New Tester");
        expect(updatedUser.phone).toBe("22222222");
    });

    test("Pairwise Test Case 2: Name, Address, and Password updated", async () => {
        req.body.name = "New Tester";
        req.body.address = "234 Football Street";
        req.body.password = "qwertyui";

        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();

        const updatedUser = await userModel.findById(req.user._id);
        expect(updatedUser.name).toBe("New Tester");
        expect(updatedUser.address).toBe("234 Football Street");

        const bool = await comparePassword("qwertyui", await hashPassword("qwertyui"));
        expect(bool).toBe(true);
    });

    test("Pairwise Test Case 3: Phone and Address updated", async () => {
        req.body.phone = "22222222";
        req.body.address = "234 Football Street";

        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();

        const updatedUser = await userModel.findById(req.user._id);
        expect(updatedUser.phone).toBe("22222222");
        expect(updatedUser.address).toBe("234 Football Street");
    });

    test("Pairwise Test Case 4: Password updated", async () => {
        req.body.password = "qwertyui";

        await updateProfileController(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.send).toHaveBeenCalled();

        const bool = await comparePassword("qwertyui", await hashPassword("qwertyui"));
        expect(bool).toBe(true);
    });
});

describe("Test get Orders Controller Integration", () => {
    let mongoServer, user, category, product, order, req, res;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {});
    });
    beforeEach(async () => {
        const password = await hashPassword("12345678");
        user = await new userModel({
            name: "Tester",
            email: "Test@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: password,
            answer: "Test",
            role: 1,
        }).save();
        category = await new categoryModel({
            name: "Electronics",
            slug: "electronics"
        }).save();
        product = await new productModel({
            name: "Textbook",
            slug: "textbook",
            description: "A textbook",
            price: 7.99,
            category: category,
            quantity: 50,
        }).save();
        order = await new orderModel({
            products: [product],
            buyer: user,
        }).save();
        req = {
            body: {
                name: "Tester",
                email: "Test@gmail.com",
                phone: "11111111",
                address: "123 Football Street",
                password: "12345678",
            },
            user: user,
        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });
    
    test("Buyer ID do not exist", async () => {
        req.user = {};
        await getOrdersController(req, res);
        expect(res.json).toHaveBeenCalled();
    });

    test("Successful get of orders", async () => {
        let jsonResponse;
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn((data) => {
                jsonResponse = data;
            }),
        };
    
        await getOrdersController(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(jsonResponse.length).toBe(1);
    });
});

describe("Test getAllControllers Integration", () => {
    let mongoServer, user, category, product, order, req, res;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {});
    });
    beforeEach(async () => {
        const password = await hashPassword("12345678");
        user = await new userModel({
            name: "Tester",
            email: "Test@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: password,
            answer: "Test",
            role: 1,
        }).save();
        category = await new categoryModel({
            name: "Electronics",
            slug: "electronics"
        }).save();
        product = await new productModel({
            name: "Textbook",
            slug: "textbook",
            description: "A textbook",
            price: 7.99,
            category: category,
            quantity: 50,
        }).save();
        order = await new orderModel({
            products: [product],
            buyer: user,
        }).save();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test("Successful get of orders", async () => {
        let jsonResponse;
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn((data) => {
                jsonResponse = data;
            }),
        };
    
        await getAllOrdersController(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(jsonResponse.length).toBe(1);
    });
});

describe("Test orderStatusController Integration", () => {
    let mongoServer, user, category, product, order, req, res;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {});
    });
    beforeEach(async () => {
        const password = await hashPassword("12345678");
        user = await new userModel({
            name: "Tester",
            email: "Test@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: password,
            answer: "Test",
            role: 1,
        }).save();
        category = await new categoryModel({
            name: "Electronics",
            slug: "electronics"
        }).save();
        product = await new productModel({
            name: "Textbook",
            slug: "textbook",
            description: "A textbook",
            price: 7.99,
            category: category,
            quantity: 50,
        }).save();
        order = await new orderModel({
            products: [product],
            buyer: user,
        }).save();
        req = {
            params: {
                orderId: order.id,
            },
            body: {
                status: "Processing",
            }

        };
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn()
        };
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test("Did not update order status due to error", async () => {
        req.body.status = "Nothing here";
        await orderStatusController(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith({ message : "Status is not recognized"});
    });

    test("Missing OrderID", async () => {
        req.params = null;
        await orderStatusController(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test("Successful Update", async () => {
        await orderStatusController(req, res);
        expect(res.json).toHaveBeenCalled();
        const updatedOrder = await orderModel.findById(req.params.orderId);
        const bool = updatedOrder.status === "Processing";
        expect(bool).toBe(true);
    });
});

describe("Test getAllUsersController Integration", () => {
    let mongoServer, user, req, res, jsonResponse;
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();

        await mongoose.connect(mongoUri, {});
    });
    beforeEach(async () => {
        const password = await hashPassword("12345678");
        user = await new userModel({
            name: "Tester",
            email: "Test@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: password,
            answer: "Test",
            role: 1,
        }).save();
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            send: jest.fn(),
            json: jest.fn((data) => {
                jsonResponse = data;
            }),
        };
    });

    afterEach(async () => {
        await userModel.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    test("Successful Obtaining one user", async () => {
        await getAllUsersController(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(jsonResponse.length).toBe(1);
    });

    test("Successfully obtain ALL users", async () => {
        const newPassword = await hashPassword("asdfghjk")
        const newUser = await new userModel({
            name: "Tester",
            email: "new@gmail.com",
            phone: "11111111",
            address: "123 Football Street",
            password: newPassword,
            answer: "Test",
            role: 1,
        }).save();
        await getAllUsersController(req, res);
        expect(res.json).toHaveBeenCalled();
        expect(jsonResponse.length).toBe(2);
    });
});