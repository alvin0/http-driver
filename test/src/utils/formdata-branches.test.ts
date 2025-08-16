import { compileBodyFetchWithContextType } from "../../../src/utils/index";

describe("objectToFormData branches via compileBodyFetchWithContextType", () => {
  test("handles arrays of primitives and nested objects", () => {
    const payload = {
      name: "file-upload",
      arr: ["one", 2, { inner: "v" }],
      obj: { a: null, b: 2, c: { d: undefined, e: "ok" } },
    };
    const fd = compileBodyFetchWithContextType("multipart/form-data", payload);
    // Should return a FormData, presence of append function is enough to assert type
    expect(typeof (fd as FormData).append).toBe("function");
  });

  test("defaults to JSON string for unknown content-type", () => {
    const s = compileBodyFetchWithContextType("text/plain", { k: "v" });
    expect(s).toBe(JSON.stringify({ k: "v" }));
  });
});