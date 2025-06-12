import axios, { AxiosInstance, AxiosResponse } from "axios";
import { FigmaFile, FigmaNode } from "@/types/figma";
import { DEBUG, Timer } from "@/utils/debug";

class FigmaService {
  private api: AxiosInstance;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.api = axios.create({
      baseURL: "https://api.figma.com/v1",
      timeout: 30000,
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error(
            "Érvénytelen Figma access token. Kérjük, ellenőrizze a tokent és próbálja újra.",
          );
        }
        if (error.response?.status === 403) {
          throw new Error(
            "Hozzáférés megtagadva. Ellenőrizze, hogy a token rendelkezik-e a fájl elérési jogával.",
          );
        }
        if (error.response?.status === 404) {
          throw new Error(
            "A Figma fájl nem található. Ellenőrizze az URL-t és próbálja újra.",
          );
        }
        if (error.code === "ECONNABORTED") {
          throw new Error("Kérés időtúllépés. Kérjük, próbálja újra.");
        }
        throw new Error(
          error.response?.data?.message ||
            "Hiba történt a Figma API hívás során",
        );
      },
    );
  }

  setAccessToken(token: string) {
    this.api.defaults.headers.common["X-Figma-Token"] = token;
  }

  extractFileKey(url: string): string {
    const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
    if (!match) {
      throw new Error(
        "Érvénytelen Figma URL. Kérjük, adjon meg egy érvényes Figma fájl URL-t.",
      );
    }
    return match[1];
  }

  extractNodeIds(url: string): string[] {
    const match = url.match(/node-id=([^&]+)/);
    if (match) {
      return match[1].split(",").map((id) => id.replace(/%3A/g, ":"));
    }
    return [];
  }

  async fetchFigmaFile(fileKey: string, token: string): Promise<FigmaFile> {
    const timer = new Timer(`Figma file fetch: ${fileKey}`);
    const cacheKey = `file_${fileKey}`;

    if (this.cache.has(cacheKey)) {
      DEBUG.log("Cache hit for file:", fileKey);
      timer.end();
      return this.cache.get(cacheKey);
    }

    this.setAccessToken(token);
    DEBUG.log("Fetching Figma file:", fileKey);

    try {
      const response: AxiosResponse<FigmaFile> = await this.api.get(
        `/files/${fileKey}?geometry=paths`,
      );

      const file = response.data;
      DEBUG.inspectFigmaResponse(file);

      this.cache.set(cacheKey, file);
      timer.end();
      return file;
    } catch (error) {
      DEBUG.error("Hiba a Figma fájl lekérése során:", error);
      timer.end();
      throw error;
    }
  }

  async getFileNodes(
    fileKey: string,
    nodeIds: string[],
    token: string,
  ): Promise<{ nodes: Record<string, FigmaNode> }> {
    if (nodeIds.length === 0) {
      throw new Error("Nem adtak meg node ID-kat");
    }

    const cacheKey = `nodes_${fileKey}_${nodeIds.join(",")}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    this.setAccessToken(token);

    try {
      const response = await this.api.get(`/files/${fileKey}/nodes`, {
        params: {
          ids: nodeIds.join(","),
          geometry: "paths",
        },
      });

      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error("Hiba a Figma node-ok lekérése során:", error);
      throw error;
    }
  }

  async getImages(
    fileKey: string,
    nodeIds: string[],
    format: "jpg" | "png" | "svg" | "pdf" = "svg",
    scale: number = 1,
    token: string,
  ): Promise<{ images: Record<string, string> }> {
    const cacheKey = `images_${fileKey}_${nodeIds.join(",")}_${format}_${scale}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    this.setAccessToken(token);

    try {
      const response = await this.api.get(`/images/${fileKey}`, {
        params: {
          ids: nodeIds.join(","),
          format,
          scale,
        },
      });

      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error("Hiba a képek lekérése során:", error);
      throw error;
    }
  }

  findComponents(node: FigmaNode): FigmaNode[] {
    const components: FigmaNode[] = [];

    if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
      components.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        components.push(...this.findComponents(child));
      }
    }

    return components;
  }

  findFrames(node: FigmaNode): FigmaNode[] {
    const frames: FigmaNode[] = [];

    if (node.type === "FRAME") {
      frames.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        frames.push(...this.findFrames(child));
      }
    }

    return frames;
  }

  findInstances(node: FigmaNode): FigmaNode[] {
    const instances: FigmaNode[] = [];

    if (node.type === "INSTANCE") {
      instances.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        instances.push(...this.findInstances(child));
      }
    }

    return instances;
  }

  clearCache() {
    this.cache.clear();
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      this.setAccessToken(token);
      await this.api.get("/me");
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const figmaService = new FigmaService();
