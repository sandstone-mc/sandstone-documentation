let lib: Promise<typeof import("@sandstone-mc/playground")> | null = null;

export type CustomHandlerFileObject =
  | { key: number; relativePath: string; content: string }
  | { type: "errors"; relativePath: string; content: string; key: number };

export async function compileDataPack(
  tsCode: string
): Promise<{ result: Record<string, string> }> {
  
  // 1. Docusaurus SSR Guard: Ensure this only runs in the browser environment
  if (typeof window === "undefined") {
    throw new Error("compileDataPack can only be executed on the client side.");
  }

  if (!lib) {
    try {
      // 2. The Native Import Bypass
      // Using `new Function` hides the import statement from Babel and Webpack entirely, 
      // forcing the browser's native ES module loader to handle it at runtime.
      const nativeImport = new Function('url', 'return import(url)');
      
      lib = nativeImport("https://unpkg.com/@sandstone-mc/playground@latest/dist/main.js") as Promise<typeof import("@sandstone-mc/playground")>;
    } catch (e) {
      console.error("Failed to load @sandstone-mc/playground:", e);
      throw e;
    }
  }

  const { compilePack } = await lib;
  const result = await compilePack({
    "/index.ts": tsCode,
  });

  if (result.success === false) {
    throw new Error(result.error);
  }
  
  return {
    result: result.files,
  };
}