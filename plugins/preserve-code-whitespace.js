/**
 * Remark plugin that transforms code blocks with `sandstone` meta
 * into InteractiveSnippet components with preserved whitespace.
 *
 * Usage in markdown:
 * ```ts sandstone height=200
 * MCFunction('example', () => {
 *   give('@a', 'minecraft:diamond', 64)
 * })
 * ```
 *
 * Options:
 * - height=N: Editor height in pixels (default: 200)
 * - filename="name.ts": Optional filename to display
 */

const { visit } = require('unist-util-visit');

function remarkInteractiveSnippet() {
  return (tree) => {
    visit(tree, 'code', (node, index, parent) => {
      // Check if this is a sandstone code block
      const meta = node.meta || '';
      if (!meta.includes('sandstone')) return;

      // Parse meta options
      const heightMatch = meta.match(/height=(\d+)/);
      const filenameMatch = meta.match(/filename="([^"]+)"/);

      const height = heightMatch ? heightMatch[1] : '200';
      const filename = filenameMatch ? filenameMatch[1] : null;

      // Encode the code to preserve whitespace through JSX parsing
      const code = node.value;
      const base64Code = Buffer.from(code).toString('base64');

      // Build JSX attributes
      const attributes = [
        {
          type: 'mdxJsxAttribute',
          name: 'height',
          value: {
            type: 'mdxJsxAttributeValueExpression',
            value: height,
            data: { estree: { type: 'Program', body: [{ type: 'ExpressionStatement', expression: { type: 'Literal', value: parseInt(height, 10) } }], sourceType: 'module' } }
          }
        },
        {
          type: 'mdxJsxAttribute',
          name: 'encodedCode',
          value: base64Code
        }
      ];

      if (filename) {
        attributes.push({
          type: 'mdxJsxAttribute',
          name: 'filename',
          value: filename
        });
      }

      // Replace code node with JSX
      const jsxNode = {
        type: 'mdxJsxFlowElement',
        name: 'InteractiveSnippet',
        attributes,
        children: [],
      };

      parent.children.splice(index, 1, jsxNode);
    });
  };
}

module.exports = remarkInteractiveSnippet;
