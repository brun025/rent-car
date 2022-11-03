import { ICreateUserDTO } from "@modules/accounts/dtos/ICreateUserDTO";
import { UsersRepositoryInMemory } from "@modules/accounts/repositories/in-memory/UsersRepositoryInMemory";
import { UsersTokensRepositoryInMemory } from "@modules/accounts/repositories/in-memory/UsersTokensRepositoryInMemory";
import { DayjsDateProvider } from "@shared/container/providers/DateProvider/implementations/DayjsDateProvider";

import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { ProfileUserUseCase } from "./ProfileUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;
let userTokensRepositoryInMemory: UsersTokensRepositoryInMemory;
let dateProvider: DayjsDateProvider;

let createUserUseCase: CreateUserUseCase;
let profileUserUseCase: ProfileUserUseCase;

describe("Profile User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    userTokensRepositoryInMemory = new UsersTokensRepositoryInMemory();
    dateProvider = new DayjsDateProvider();

    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory,
      userTokensRepositoryInMemory,
      dateProvider
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    profileUserUseCase = new ProfileUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to show a profile", async () => {
    const user: ICreateUserDTO = {
      driver_license: "000123",
      email: "user@test.com",
      password: "1234",
      name: "User Test",
    };
    await createUserUseCase.execute(user);

    const auth = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    const profile = await profileUserUseCase.execute(auth.user.id);

    expect(profile).toHaveProperty("email");
    expect(profile).toHaveProperty("name");
    expect(profile).toHaveProperty("id");
  });
});
