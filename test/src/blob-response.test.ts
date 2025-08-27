import { DriverBuilder } from "../../src/index";
import { MethodAPI } from "../../src/types/driver";

describe("Blob Response Support Tests", () => {
  let driver: any;

  beforeEach(() => {
    driver = new DriverBuilder()
      .withBaseURL("https://api.example.com")
      .withServices([
        { id: "downloadImage", url: "images/photo.jpg", method: MethodAPI.get },
        { id: "downloadPdf", url: "documents/report.pdf", method: MethodAPI.get },
        { id: "uploadFile", url: "files/upload", method: MethodAPI.post },
      ])
      .build();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("execServiceByFetch blob support", () => {
    it("should handle blob response correctly", async () => {
      const mockBlob = new Blob(["fake image data"], { type: "image/jpeg" });
      
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 
          "Content-Type": "image/jpeg"
        }),
        blob: async () => mockBlob,
        text: async () => { throw new Error("Should not call text for blob"); },
        arrayBuffer: async () => { throw new Error("Should not call arrayBuffer for blob"); },
      });

      const response = await driver.execServiceByFetch(
        { id: "downloadImage" },
        null,
        { responseType: 'blob' }
      );

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockBlob);
      expect(response.data instanceof Blob).toBe(true);
    });

    it("should handle image content-type as blob automatically", async () => {
      const mockBlob = new Blob(["fake image data"], { type: "image/png" });
      
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 
          "Content-Type": "image/png"
        }),
        blob: async () => mockBlob,
      });

      const response = await driver.execServiceByFetch({ id: "downloadImage" });

      expect(response.ok).toBe(true);
      expect(response.data).toEqual(mockBlob);
      expect(response.data instanceof Blob).toBe(true);
    });

    it("should handle PDF files as blob", async () => {
      const mockBlob = new Blob(["%PDF-1.4 fake pdf"], { type: "application/pdf" });
      
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 
          "Content-Type": "application/pdf"
        }),
        blob: async () => mockBlob,
      });

      const response = await driver.execServiceByFetch({ id: "downloadPdf" });

      expect(response.ok).toBe(true);
      expect(response.data).toEqual(mockBlob);
      expect(response.data instanceof Blob).toBe(true);
    });

    it("should handle arraybuffer response type", async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 
          "Content-Type": "application/octet-stream"
        }),
        arrayBuffer: async () => mockArrayBuffer,
        text: async () => { throw new Error("Should not call text for arraybuffer"); },
        blob: async () => { throw new Error("Should not call blob for arraybuffer"); },
      });

      const response = await driver.execServiceByFetch(
        { id: "downloadImage" },
        null,
        { responseType: 'arraybuffer' }
      );

      expect(response.ok).toBe(true);
      expect(response.data).toEqual(mockArrayBuffer);
      expect(response.data instanceof ArrayBuffer).toBe(true);
    });

    it("should handle text response type", async () => {
      const mockText = "This is plain text data";
      
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 
          "Content-Type": "text/plain"
        }),
        text: async () => mockText,
      });

      const response = await driver.execServiceByFetch(
        { id: "downloadImage" },
        null,
        { responseType: 'text' }
      );

      expect(response.ok).toBe(true);
      expect(response.data).toBe(mockText);
      expect(typeof response.data).toBe('string');
    });

    it("should still handle JSON as before (backward compatibility)", async () => {
      const mockData = { message: "success", data: [1, 2, 3] };
      
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 
          "Content-Type": "application/json"
        }),
        text: async () => JSON.stringify(mockData),
      });

      const response = await driver.execServiceByFetch({ id: "uploadFile" }, { file: "test" });

      expect(response.ok).toBe(true);
      expect(response.data).toEqual(mockData);
    });

    it("should handle non-JSON text gracefully when content-type is not JSON", async () => {
      const mockText = "Some plain text that's not JSON";
      
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Headers({ 
          "Content-Type": "text/html"
        }),
        text: async () => mockText,
      });

      const response = await driver.execServiceByFetch({ id: "uploadFile" });

      expect(response.ok).toBe(true);
      expect(response.data).toBe(mockText);
      expect(typeof response.data).toBe('string');
    });
  });

  describe("execService (Axios) blob support", () => {
    it("should handle blob response in axios", async () => {
      const mockBlob = new Blob(["fake image data"], { type: "image/jpeg" });
      
      // Mock axios response with blob responseType
      driver.get = jest.fn().mockResolvedValue({
        status: 200,
        statusText: "OK",
        data: mockBlob,
        headers: { "content-type": "image/jpeg" },
        config: { responseType: 'blob' }
      });

      const response = await driver.execService(
        { id: "downloadImage" },
        null,
        { responseType: 'blob' }
      );

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(response.data).toEqual(mockBlob);
      expect(response.data instanceof Blob).toBe(true);
    });

    it("should handle arraybuffer response in axios", async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      
      driver.get = jest.fn().mockResolvedValue({
        status: 200,
        statusText: "OK",
        data: mockArrayBuffer,
        headers: { "content-type": "application/octet-stream" },
        config: { responseType: 'arraybuffer' }
      });

      const response = await driver.execService(
        { id: "downloadImage" },
        null,
        { responseType: 'arraybuffer' }
      );

      expect(response.ok).toBe(true);
      expect(response.data).toEqual(mockArrayBuffer);
      expect(response.data instanceof ArrayBuffer).toBe(true);
    });

    it("should handle stream response in axios", async () => {
      const mockStream = { pipe: jest.fn() }; // Mock stream object
      
      driver.get = jest.fn().mockResolvedValue({
        status: 200,
        statusText: "OK",
        data: mockStream,
        headers: { "content-type": "application/octet-stream" },
        config: { responseType: 'stream' }
      });

      const response = await driver.execService(
        { id: "downloadImage" },
        null,
        { responseType: 'stream' }
      );

      expect(response.ok).toBe(true);
      expect(response.data).toEqual(mockStream);
    });
  });
});
