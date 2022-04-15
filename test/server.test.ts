import { start, init } from "../src/server";

describe("CLI Tests", () => {
  it("should export the server functions", () => {
    expect(init).toBeTruthy();
    expect(start).toBeTruthy();
  });
});
