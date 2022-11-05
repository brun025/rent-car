import { hash } from "bcrypt";
import request from "supertest";
import { Connection } from "typeorm";
import { v4 as uuid } from "uuid";
import dayjs from "dayjs";

import { app } from "@shared/infra/http/app";
import createConnection from "@shared/infra/typeorm";

let connection: Connection;
let responseCategories;
let user_id;
let new_user_id;
let car_id;
describe("Create Rental Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user_id = uuid();
    new_user_id = uuid();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, "isAdmin", created_at, driver_license ) 
        values('${user_id}', 'admin', 'admin@rentx.com.br', '${password}', true, 'now()', 'XXXXXX'),
        ('${new_user_id}', 'admin', 'user@rentx.com.br', '${password}', true, 'now()', 'XXXXX')
      `
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new rental ", async () => {
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

    const dayAdd24Hours = dayjs().add(1, "day").toDate();
    car_id = responseCar.body.id

    const response = await request(app)
      .post("/rentals")
      .send({
        user_id: user_id,
        car_id: car_id,
        expected_return_date: dayAdd24Hours,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a new rental if there is another open to the same car ", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "admin@rentx.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

    const dayAdd24Hours = dayjs().add(1, "day").toDate();

    const response = await request(app)
      .post("/rentals")
      .send({
        user_id: new_user_id,
        car_id: car_id,
        expected_return_date: dayAdd24Hours,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });

  it("should not be able to create a new rental if there is another open to the same user ", async () => {
    const responseToken = await request(app).post("/sessions").send({
      email: "admin@rentx.com.br",
      password: "admin",
    });

    const { token } = responseToken.body;

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

    const dayAdd24Hours = dayjs().add(1, "day").toDate();
    car_id = responseCar.body.id

    const response = await request(app)
      .post("/rentals")
      .send({
        user_id: user_id,
        car_id: car_id,
        expected_return_date: dayAdd24Hours,
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(response.status).toBe(400);
  });
});
