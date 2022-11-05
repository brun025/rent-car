import { hash } from "bcrypt";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";

import { app } from "@shared/infra/http/app";
import createConnection from "@shared/infra/typeorm";

let connection: Connection;
describe("Authenticate Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driver_license ) 
        values('${id}', 'admin', 'admin@rentx.com.br', '${password}', true, 'now()', 'XXXXXX')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate an user ", async () => {
    const response = await request(app).post("/sessions").send({
      email: "admin@rentx.com.br",
      password: "admin",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("user");

  });

  it("should not be able to authenticate with incorrect password", async () => {
    const response = await request(app).post("/sessions").send({
      email: "admin@rentx.com.br",
      password: "incorrectPassword",
    });

    expect(response.status).toBe(400);
  });
});
