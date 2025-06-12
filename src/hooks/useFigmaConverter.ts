import { useState, useCallback } from "react";
import { figmaService } from "@/services/figmaService";
import { DesignConverter } from "@/core/designConverter";
import { useAppContext } from "@/context/AppContext";
import { ConversionResult, FigmaFile, FigmaNode } from "@/types/figma";

export function useFigmaConverter() {
  const { state, dispatch } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  const updateProgress = useCallback(
    (progress: number, status: string) => {
      dispatch({ type: "SET_CONVERSION_PROGRESS", payload: progress });
      dispatch({ type: "SET_CONVERSION_STATUS", payload: status });
    },
    [dispatch],
  );

  const convertDesign = useCallback(async () => {
    if (!state.figmaUrl || !state.accessToken) {
      setError("Please provide both Figma URL and access token");
      return;
    }

    try {
      setError(null);
      dispatch({ type: "SET_CONVERTING", payload: true });
      dispatch({ type: "SET_CONVERSION_RESULT", payload: null });

      updateProgress(0, "Initializing...");

      // Set access token
      figmaService.setAccessToken(state.accessToken);

      updateProgress(10, "Extracting file information...");

      // Extract file key and node IDs from URL
      const fileKey = figmaService.extractFileKey(state.figmaUrl);
      const nodeIds = figmaService.extractNodeIds(state.figmaUrl);

      updateProgress(20, "Fetching design data from Figma...");

      let nodesToConvert: FigmaNode[] = [];

      if (nodeIds.length > 0) {
        // Fetch specific nodes
        const nodesResponse = await figmaService.getFileNodes(fileKey, nodeIds);
        nodesToConvert = Object.values(nodesResponse.nodes);
      } else {
        // Fetch entire file
        const file: FigmaFile = await figmaService.getFile(fileKey);

        // Find all frames and components in the document
        const frames = figmaService.findFrames(file.document);
        const components = figmaService.findComponents(file.document);

        nodesToConvert = [...frames, ...components];
      }

      if (nodesToConvert.length === 0) {
        throw new Error("No convertible elements found in the Figma file");
      }

      updateProgress(40, "Analyzing design structure...");

      // Initialize converter
      const converter = new DesignConverter(state.conversionOptions);

      updateProgress(60, "Converting design to React components...");

      // Convert the first node (or main frame)
      const mainNode = nodesToConvert[0];
      const result: ConversionResult = await converter.convertDesign(mainNode);

      updateProgress(80, "Optimizing generated code...");

      // TODO: Add asset optimization if enabled
      if (state.conversionOptions.optimizeAssets) {
        // Asset optimization logic would go here
      }

      updateProgress(100, "Conversion completed successfully!");

      dispatch({ type: "SET_CONVERSION_RESULT", payload: result });

      if (result.components.length > 0) {
        dispatch({
          type: "SET_SELECTED_COMPONENT",
          payload: result.components[0].name,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      updateProgress(0, "Conversion failed");
    } finally {
      dispatch({ type: "SET_CONVERTING", payload: false });
    }
  }, [
    state.figmaUrl,
    state.accessToken,
    state.conversionOptions,
    dispatch,
    updateProgress,
  ]);

  const validateToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      return await figmaService.validateToken(token);
    } catch (error) {
      return false;
    }
  }, []);

  const clearCache = useCallback(() => {
    figmaService.clearCache();
  }, []);

  const resetConversion = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
    setError(null);
  }, [dispatch]);

  return {
    convertDesign,
    validateToken,
    clearCache,
    resetConversion,
    error,
    isConverting: state.isConverting,
    progress: state.conversionProgress,
    status: state.conversionStatus,
    result: state.conversionResult,
  };
}
