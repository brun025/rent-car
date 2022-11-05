import { hash } from "bcrypt";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";

import { app } from "@shared/infra/http/app";
import createConnection from "@shared/infra/typeorm";

let connection: Connection;
let responseCategories;
describe("Create Car Controller", () => {
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

  it("should be able to create a new car ", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "admin@rentx.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/categories")
      .send({
        name: "Category Supertest",
        description: "Category Supertest",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    responseCategories = await request(app).get("/categories");

    const response = await request(app)
      .post("/cars")
      .send({
        name: "Name Car",
        description: "Description Car",
        daily_rate: 100,
        license_plate: "ABZ-1234",
        fine_amount: 60,
        brand: "Brand",
        category_id: responseCategories.body[0].id
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a car with exists license plate", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "admin@rentx.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    await request(app)
      .post("/cars")
      .send({
        name: "Name Car",
        description: "Description Car",
        daily_rate: 100,
        license_plate: "ABC-1234",
        fine_amount: 60,
        brand: "Brand",
        category_id: responseCategories.body[0].id
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post("/cars")
      .send({
        name: "Name Car",
        description: "Description Car",
        daily_rate: 100,
        license_plate: "ABC-1234",
        fine_amount: 60,
        brand: "Brand",
        category_id: responseCategories.body[0].id
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it("should not be able to create a car with available true by default", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "admin@rentx.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post("/cars")
      .send({
        name: "Name Car",
        description: "Description Car",
        daily_rate: 100,
        license_plate: "BBBB-1234",
        fine_amount: 60,
        brand: "Brand",
        category_id: responseCategories.body[0].id
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.body.available).toBe(true);
  });
});
