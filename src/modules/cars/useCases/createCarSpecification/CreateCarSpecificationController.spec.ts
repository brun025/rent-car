import { hash } from "bcrypt";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";

import { app } from "@shared/infra/http/app";
import createConnection from "@shared/infra/typeorm";

let connection: Connection;
let responseCategories;
describe("Create CarSpecification Controller", () => {
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

  it("should be able to add a new specification to the car ", async () => {
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

    const responseCar = await request(app)
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

    const responseSpecification = await request(app)
      .post("/specifications")
      .send({
        description: "test",
        name: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post(`/cars/specifications/${responseCar.body.id}`)
      .send({
        specifications_id: responseSpecification.body.id
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("name");
    expect(response.body).toHaveProperty("description");
  });

  it("should not be able to add a new specification to a now-existent car", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "admin@rentx.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    const responseSpecification = await request(app)
      .post("/specifications")
      .send({
        description: "test",
        name: "test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const response = await request(app)
      .post(`/cars/specifications/${uuid()}`)
      .send({
        specifications_id: responseSpecification.body.id
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
