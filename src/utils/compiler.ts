let lib: Promise<typeof import("@sandstone-mc/playground")> =
  "window" in globalThis ? import("@sandstone-mc/playground") : null;
export type CustomHandlerFileObject =
  | { key: number; relativePath: string; content: string }
  | { type: "errors"; relativePath: string; content: string; key: number };

export async function compileDataPack(
  tsCode: string
): Promise<{ result: Record<string, string> }> {
  if (!lib) {
    lib = import("@sandstone-mc/playground");
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
