import { compilePack } from "@sandstone-mc/playground";
export type CustomHandlerFileObject =
  | { key: number; relativePath: string; content: string }
  | { type: "errors"; relativePath: string; content: string; key: number };

export async function compileDataPack(
  tsCode: string
): Promise<{ result: Record<string, string> }> {
  const result = await compilePack({
    "/index.ts": tsCode,
  });

  console.log({
    tsCode,
    result,
  });
  if (result.success === false) {
    throw new Error(result.error);
  }
  return {
    result: result.files,
  };
}
