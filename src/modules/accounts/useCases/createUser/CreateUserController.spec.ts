import request from "supertest";
import { Connection } from "typeorm";

import { app } from "@shared/infra/http/app";
import createConnection from "@shared/infra/typeorm";
import { ICreateUserDTO } from "@modules/accounts/dtos/ICreateUserDTO";

let connection: Connection;
describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user ", async () => {
    const user: ICreateUserDTO = {
      driver_license: "000123",
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    };

    const response = await request(app).post("/users").send(user);

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new user with e-mail already exists", async () => {
    const user: ICreateUserDTO = {
      driver_license: "000123",
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    };

    const response = await request(app).post("/users").send(user);

    expect(response.status).toBe(400);
  });
});
