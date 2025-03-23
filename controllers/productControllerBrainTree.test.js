import { jest } from "@jest/globals";
import { describe, expect } from "@jest/globals";
import { braintreeTokenController, brainTreePaymentController } from "./productController";
import braintree from "braintree";
import orderModel from "../models/orderModel";

jest.mock("braintree", () => {
	const mockGenerate = jest.fn();
	const mockSale = jest.fn();
  
	return {
	  BraintreeGateway: jest.fn().mockImplementation(() => ({
		transaction: {
		  sale: mockSale,
		},
		clientToken: {
		  generate: mockGenerate,
		},
	  })),
	  Environment: {
		Sandbox: "sandbox",
	  },
	  __mockSale: mockSale,
	  __mockGenerate: mockGenerate,
	};
  });

jest.mock("../models/orderModel.js", () => ({
	create: jest.fn(),
}));

const mockGenerate = braintree.__mockGenerate;
const mockSale = braintree.__mockSale;

describe("braintreeTokenController", () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();

		process.env.BRAINTREE_MERCHANT_ID = "mockMerchantId";
		process.env.BRAINTREE_PUBLIC_KEY = "mockPublicKey";
		process.env.BRAINTREE_PRIVATE_KEY = "mockPrivateKey";

		req = {};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
			send: jest.fn(),
		};
	});

	it("Should successfully generate a token", async () => {
		const mockToken = { token: "mockToken" };
		mockGenerate.mockImplementation((_, callback) => {
			callback(null, mockToken);
		});
		await braintreeTokenController(req, res);
		expect(mockGenerate).toHaveBeenCalled();
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining(mockToken)
		);
	});

	it("Should handle 500 callback error", async () => {
		mockGenerate.mockImplementation((_, callback) => {
			callback("mockError");
		});
		await braintreeTokenController(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith("mockError");
	});

	it("Should handle 500 thrown error", async () => {
		mockGenerate.mockImplementation(() => {
			throw "mockError";
		});
		await braintreeTokenController(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining({ error: "mockError" })
		);
	});
});

describe("brainTreePaymentController", () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();

		process.env.BRAINTREE_MERCHANT_ID = "mockMerchantId";
		process.env.BRAINTREE_PUBLIC_KEY = "mockPublicKey";
		process.env.BRAINTREE_PRIVATE_KEY = "mockPrivateKey";

		req = {
			body: {
				nonce: "mockNonce",
				cart: [],
			},
			user: { _id: "mockId" },
		};
		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
			send: jest.fn(),
		};
	});

	it("Should successfully process the transaction", async () => {
		req.body.cart = [{ price: 2.4, _id: "1" }, { price: 1.3, _id: "2" }];
		req.body.nonce = "mockNonce";
		req.user._id = "mockUserId";
		const mockResult = { success: true };
	
		mockSale.mockImplementation((data, callback) => {
		  callback(null, mockResult);
		});
	
		await brainTreePaymentController(req, res);
	
		expect(mockSale).toHaveBeenCalledWith(
		  expect.objectContaining({
			amount: 3.7,
			paymentMethodNonce: req.body.nonce,
			options: { submitForSettlement: true },
		  }),
		  expect.any(Function)
		);
		expect(orderModel.create).toHaveBeenCalledWith(
			expect.objectContaining({
				products: ["1", "2"],
				payment: mockResult,
				buyer: req.user._id,
			})
		);
		expect(res.json).toHaveBeenCalledWith({ ok: true });
	});

	it("Should successfully process transaction with no products", async () => {
		req.body.cart = [];
		req.body.nonce = "mockNonce";
		req.user._id = "mockUserId";
		const mockResult = { success: true };

		mockSale.mockImplementation((data, callback) => {
			callback(null, mockResult);
		});

		await brainTreePaymentController(req, res);

		expect(mockSale).toHaveBeenCalledWith(
			expect.objectContaining({
				amount: 0,
				paymentMethodNonce: req.body.nonce,
				options: { submitForSettlement: true },
			}),
			expect.any(Function)
		);
		expect(orderModel.create).toHaveBeenCalledWith(
			expect.objectContaining({
				products: [],
				payment: mockResult,
				buyer: req.user._id,
			})
		);
		expect(res.json).toHaveBeenCalledWith({ ok: true });
	});

	it("Should successfully process transaction with unpriced products", async () => {
		req.body.cart = [{ _id: "1" }, { _id: "2", price: "Not Number" }, { price: 1.3, _id: "3" }];
		req.body.nonce = "mockNonce";
		req.user._id = "mockUserId";
		const mockResult = { success: true };

		mockSale.mockImplementation((data, callback) => {
			callback(null, mockResult);
		});

		await brainTreePaymentController(req, res);

		expect(mockSale).toHaveBeenCalledWith(
			expect.objectContaining({
				amount: 1.3,
				paymentMethodNonce: req.body.nonce,
				options: { submitForSettlement: true },
			}),
			expect.any(Function)
		);
		expect(orderModel.create).toHaveBeenCalledWith(
			expect.objectContaining({
				products: ["1", "2", "3"],
				payment: mockResult,
				buyer: req.user._id,
			})
		);
		expect(res.json).toHaveBeenCalledWith({ ok: true });
	});

	it("Should throw 400 if no cart is provided", async () => {
		req.body.cart = undefined;
		await brainTreePaymentController(req, res);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith({"error": "Cart is required"});
	});

	it("Should throw 400 if cart is not array", async () => {
		req.body.cart = "notArray";
		await brainTreePaymentController(req, res);
		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith({"error": "Cart is required"});
	});

	it("Should handle braintree error", async () => {
		mockSale.mockImplementation((data, callback) => {
			callback("mockError");
		});
		await brainTreePaymentController(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining({ error: "mockError" })
		);
	});

	it("Should handle no result", async () => {
		mockSale.mockImplementation((data, callback) => {
			callback(null, null);
		});
		await brainTreePaymentController(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining({ error: null, result: null })
		);
	});

	it("Should handle no success", async () => {
		mockSale.mockImplementation((data, callback) => {
			callback(null, { success: false });
		});
		await brainTreePaymentController(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining({ error: null, result: { success: false } })
		);
	});

	it("Should handle braintree failure", async () => {
		mockSale.mockImplementation((data, callback) => {
			throw "mockError";
		});
		await brainTreePaymentController(req, res);
		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith(
			expect.objectContaining({ 
				success: false,
				error: "mockError",
				message: "Error while payment"
			})
		);
	});
});
