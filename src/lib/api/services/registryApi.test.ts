import MockAdapter from "axios-mock-adapter";
import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { httpClient } from "../httpClient";
import { getRegistryAddins, getRegistryCategories } from "./registryApi";

const mock = new MockAdapter(httpClient);

describe("registryApi", () => {
  beforeEach(() => {
    mock.reset();
  });

  afterEach(() => {
    mock.reset();
  });

  it("loads addins from backend endpoint", async () => {
    mock.onGet("/registry/addins").reply(200, [{ name: "A", addinId: "id-1" }]);

    const result = await getRegistryAddins();
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("A");
  });

  it("loads categories from backend endpoint", async () => {
    mock.onGet("/registry/categories").reply(200, [{ name: "Root", fullPath: "/Root" }]);

    const result = await getRegistryCategories();
    expect(result).toHaveLength(1);
    expect(result[0].fullPath).toBe("/Root");
  });
});
