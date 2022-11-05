import { SpecificationsRepositoryInMemory } from "@modules/cars/repositories/in-memory/SpecificationsRepositoryInMemory";

import { AppError } from "@shared/errors/AppError";
import { CreateSpecificationUseCase } from "./CreateSpecificationUseCase";

let specificationsRepositoryInMemory: SpecificationsRepositoryInMemory;
let createSpecificationUseCase: CreateSpecificationUseCase;

describe("Create Car Specification", () => {
  beforeEach(() => {
    specificationsRepositoryInMemory = new SpecificationsRepositoryInMemory();
    createSpecificationUseCase = new CreateSpecificationUseCase(
      specificationsRepositoryInMemory
    );
  });

  it("should be able to create a new specification", async () => {
    const specification = await createSpecificationUseCase.execute({
      description: "test",
      name: "test",
    });

    expect(specification).toHaveProperty("name");
    expect(specification).toHaveProperty("description");
  });

  it("should not be able to create a new specification with exists name", async () => {
    await createSpecificationUseCase.execute({
      description: "test",
      name: "test",
    });
    
    await expect(
      createSpecificationUseCase.execute({
        description: "test",
        name: "test",
      })
    ).rejects.toEqual(new AppError("Specification already exists!"));
  });
});
