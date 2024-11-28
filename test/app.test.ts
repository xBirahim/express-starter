import app from "@/app";
import request from "supertest";

describe("app", () => {
    it("responds with a not found message", (done) => {
        request(app)
            .get("/what-is-this-even")
            .set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(404, done);
    });
});
