import { CategoriesRepositoryInMemory } from "@modules/cars/repositories/in-memory/CategoriesRepositoryInMemory";
import { ListCategoriesUseCase } from "./ListCategoriesUseCase";

let listCategoryUseCase: ListCategoriesUseCase;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;

describe("List Category Controller", () => {
  beforeEach(() => {
    categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
    listCategoryUseCase = new ListCategoriesUseCase(
      categoriesRepositoryInMemory
    );
  });

  it("should be able to list all categories", async () => {
    const category = await categoriesRepositoryInMemory.create({
      name: "Category Test",
      description: "Category description Test",
    });

    const categories = await listCategoryUseCase.execute();

    expect(categories[0]).toHaveProperty('name');
    expect(categories[0]).toHaveProperty('description');
  });
});
