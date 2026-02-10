let lib: Promise<typeof import("@sandstone-mc/playground")> | null = null;

export type CustomHandlerFileObject =
  | { key: number; relativePath: string; content: string }
  | { type: "errors"; relativePath: string; content: string; key: number };

export async function compileDataPack(
  tsCode: string
): Promise<{ result: Record<string, string> }> {
  if (!lib) {
    // Load playground from static file to avoid webpack processing
    lib = import(/* webpackIgnore: true */ "/playground/main.js");
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
