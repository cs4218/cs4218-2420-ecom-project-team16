import orderModel from "./orderModel"
import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config();

describe("Test OrderModel", () => {
    let orderData
    beforeEach(async () => {
        await mongoose.connect(process.env.MONGO_URL);
        orderData = {
            products: [new mongoose.Types.ObjectId()],
            payment: { method: "Credit Card", amount: 100 },
            buyer: new mongoose.Types.ObjectId(),
            status: "Processing",
          }
    });
    
    afterEach(async () => {
        await mongoose.connection.close()
    })

    test("Save works as intended", async () => {
        const order = new orderModel(orderData);
        const savedOrder = await order.save();

        expect(savedOrder._id).toBeDefined();
        expect(savedOrder.status).toBe("Processing");
        expect(savedOrder.payment.method).toBe("Credit Card");
        expect(savedOrder.products.length).toBe(1);
    });

    test("Error occurs upon incorrect data", async () => {
        let error;
        try {
            orderData.status = "False Data";
            const order = new orderModel(orderData);
            const savedOrder = await order.save();
        } catch (e) {
            error = e
        }
        expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    });
});
