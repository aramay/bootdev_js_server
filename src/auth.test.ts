import { describe, it, expect, beforeAll } from "vitest";
import { checkPasswordHash, hashPassword, makeJWT, validateJWT } from "./auth"


describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  const userID = "someUserID1234"
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it.skip("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });

  it("should make jwt token", async() => {
    const result = makeJWT(userID, 60 * 60, "somesecret")
    console.log("makeJWT ", result)

    const verify = validateJWT(result, "somesecret")
    console.log("verify ", verify)
    expect(verify).toBe(userID)
  })
});