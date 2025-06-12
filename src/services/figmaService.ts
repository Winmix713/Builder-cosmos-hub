import axios, { AxiosInstance, AxiosResponse } from "axios";
import { FigmaFile, FigmaNode } from "@/types/figma";

class FigmaService {
  private api: AxiosInstance;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.api = axios.create({
      baseURL: "https://api.figma.com/v1",
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          throw new Error(
            "Invalid Figma access token. Please check your token and try again.",
          );
        }
        if (error.response?.status === 403) {
          throw new Error(
            "Access denied. Please ensure your token has permission to access this file.",
          );
        }
        if (error.response?.status === 404) {
          throw new Error(
            "Figma file not found. Please check the URL and try again.",
          );
        }
        if (error.code === "ECONNABORTED") {
          throw new Error("Request timeout. Please try again.");
        }
        throw new Error(
          error.response?.data?.message ||
            "An error occurred while fetching from Figma API",
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
        "Invalid Figma URL. Please provide a valid Figma file URL.",
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

  async getFile(fileKey: string): Promise<FigmaFile> {
    const cacheKey = `file_${fileKey}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response: AxiosResponse<FigmaFile> = await this.api.get(
        `/files/${fileKey}`,
      );
      const file = response.data;

      this.cache.set(cacheKey, file);
      return file;
    } catch (error) {
      console.error("Error fetching Figma file:", error);
      throw error;
    }
  }

  async getFileNodes(
    fileKey: string,
    nodeIds: string[],
  ): Promise<{ nodes: Record<string, FigmaNode> }> {
    if (nodeIds.length === 0) {
      throw new Error("No node IDs provided");
    }

    const cacheKey = `nodes_${fileKey}_${nodeIds.join(",")}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.api.get(`/files/${fileKey}/nodes`, {
        params: {
          ids: nodeIds.join(","),
        },
      });

      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching Figma nodes:", error);
      throw error;
    }
  }

  async getImages(
    fileKey: string,
    nodeIds: string[],
    format: "jpg" | "png" | "svg" | "pdf" = "png",
    scale: number = 1,
  ): Promise<{ images: Record<string, string> }> {
    const cacheKey = `images_${fileKey}_${nodeIds.join(",")}_${format}_${scale}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

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
      console.error("Error fetching Figma images:", error);
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

  findTextNodes(node: FigmaNode): FigmaNode[] {
    const textNodes: FigmaNode[] = [];

    if (node.type === "TEXT") {
      textNodes.push(node);
    }

    if (node.children) {
      for (const child of node.children) {
        textNodes.push(...this.findTextNodes(child));
      }
    }

    return textNodes;
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

  async downloadAsset(url: string): Promise<Blob> {
    try {
      const response = await axios.get(url, {
        responseType: "blob",
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading asset:", error);
      throw new Error("Failed to download asset");
    }
  }
}

export const figmaService = new FigmaService();
