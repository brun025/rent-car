import { ICreateUserDTO } from "@modules/accounts/dtos/ICreateUserDTO";
import { UsersRepositoryInMemory } from "@modules/accounts/repositories/in-memory/UsersRepositoryInMemory";
import { AppError } from "@shared/errors/AppError";

import { CreateUserUseCase } from "../createUser/CreateUserUseCase";

let usersRepositoryInMemory: UsersRepositoryInMemory;

let createUserUseCase: CreateUserUseCase;

describe("Create User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to create a new user", async () => {
    const user: ICreateUserDTO = {
      driver_license: "000123",
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    };
    await createUserUseCase.execute(user);

    const userCreated = await usersRepositoryInMemory.findByEmail(
      user.email
    );

    expect(userCreated).toHaveProperty("driver_license");
    expect(userCreated).toHaveProperty("email");
    expect(userCreated).toHaveProperty("password");
    expect(userCreated).toHaveProperty("name");
  });

  it("should not be able to create a new user with e-mail already exists", async () => {
    const user: ICreateUserDTO = {
      driver_license: "000123",
      email: "user@user.com",
      password: "1234",
      name: "User Test",
    };

    await createUserUseCase.execute(user);

    await expect(
      createUserUseCase.execute(user)
    ).rejects.toEqual(new AppError("User already exists"));
  });

});
