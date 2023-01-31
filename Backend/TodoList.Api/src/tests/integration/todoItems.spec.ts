// @ts-ignore
import request from "supertest";
import * as httpStatus from "http-status";
import { getApp } from "../../app";

const app = getApp();

describe("TodoItems routes", () => {


  test("should initially have empty list", async () => {
    const response = await request(app)
      .get("/api/todoItems")
      .expect(httpStatus.OK);
    expect(response.body).toHaveLength(0);
  });

  test("should not allow to create an empty todoItem", async () => {
    await request(app).post("/api/todoItems").expect(httpStatus.BAD_REQUEST);

    const response = await request(app)
      .get("/api/todoItems")
      .expect(httpStatus.OK);
    expect(response.body).toHaveLength(0);
  });

    test("should NOT be able to create a todoItem when supplying an id in the req body", async () => {
        await request(app)
            .post("/api/todoItems")
            .send({
                id:"bungId123",
                description: "test",
                isCompleted: false,
            })
            .expect(httpStatus.BAD_REQUEST);

        const response = await request(app)
            .get("/api/todoItems")
            .expect(httpStatus.OK);
        expect(response.body).toHaveLength(0);
    });

    test("should NOT be able to update a todoItem when supplying an id in the req body", async () => {
        await request(app)
            .put("/api/todoItems/123")
            .send({
                id:"bungId123",
                description: "test",
                isCompleted: false,
            })
            .expect(httpStatus.BAD_REQUEST);

        const response = await request(app)
            .get("/api/todoItems")
            .expect(httpStatus.OK);
        expect(response.body).toHaveLength(0);
    });

    test("should be able to create a todoItem", async () => {
        await request(app)
            .post("/api/todoItems")
            .send({
                description: "test",
                isCompleted: false,
            })
            .expect(httpStatus.CREATED);

        const response = await request(app)
            .get("/api/todoItems")
            .expect(httpStatus.OK);
        expect(response.body).toHaveLength(1);
    });


});
