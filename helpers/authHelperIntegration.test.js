import { comparePassword, hashPassword } from "./authHelper";
import bcrypt from "bcrypt";

describe("Test Auth Helper Function Integration with Bcrypt", () => {
    test("Test Bcrypt does not fail for comparePassword", async () => {
        const password = await hashPassword("Password");
        expect(password).not.toBeNull();
    });

    test("Test Bcrypt Compare", async () => {
        const password = await hashPassword("Password");
        const bool = await comparePassword("Password", password);
        expect(bool).toBe(true);
    });
});