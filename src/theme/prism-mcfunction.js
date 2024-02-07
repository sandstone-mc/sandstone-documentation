// JSON or NBT
var jsonNbt = {
	'quoted-property': {
		pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?=\s*:)/,
		lookbehind: true,
		greedy: true,
    alias: 'property',
	},
  // Unquoted property
	'unquoted-property': {
		pattern: /(^|[^\\])\w+(?=\s*:)/,
		lookbehind: true,
		greedy: true,
    alias: 'property',
	},
	'string': {
		pattern: /(^|[^\\])"(?:\\.|[^\\"\r\n])*"(?!\s*:)/,
		lookbehind: true,
		greedy: true,
	},
  'array': {
    pattern: /\[\s*[A-Z]\s*;/,
    alias: 'punctuation',
    inside: {
      'type': {
        pattern: /[A-Z]/,
        alias: 'property',
      },
      'punctuation': /[\[\];]/
    }
  },
	'number': /-?\d+(?:\.\d+)?[a-zA-Z]?\b/i,
	'punctuation': /[{}[\],]/,
	'operator': /:/,
	'boolean': /\b(?:true|false)\b/,
};

var mcfunction = {
  'comment': {
    pattern: /^#.*/m
  },
  'selector': {
    pattern: /@[a-z](?:\[(?:\s*\w+\s*\=\s*(?:[\w\.:]+|[\^\~]?-?\d+(?:\.\d+)?|-?\d+(?:\.\d+)?\.\.-?\d+(?:\.\d+)?|-?\d+(?:\.\d+)?\.\.|\.\.-?\d+(?:\.\d+)?|".+"|\[.+\]|\{.+\}|-?\b\d+(?:\.\d+)?[a-zA-Z]?)\s*,?)*\])?/,
    inside: {
      'operator': /=/,
    }
  },
  'range': {
    pattern: /-?\d+(?:\.\d+)?\.\.-?\d+(?:\.\d+)?|-?\d+(?:\.\d+)?\.\.|\.\.-?\d+(?:\.\d+)?/,
    inside: {
      'number': /-?\d+(?:\.\d+)?/,
      'operator': /\./
    },
  },
  'coordinates': {
    pattern: /[\^\~]?-?\d+(?:\.\d+)?\b/,
    alias: 'number',
  },
  'namespaced-resource': {
    pattern: /\w+[:\.][\w/]+/,
    alias: 'string',
  },
  'command': {
    pattern: /^\w+\b/m,
    alias: 'keyword',
  },
  'execute-command': {
    pattern: /run\s+\w+\b/,
    inside: {
      constant: /run/,
      keyword: /\w+/,
    }
  },
  'subcommand': {
    pattern: /\b\w+\b/,
    alias: 'constant',
  },
  'jsonOrNBT': {
    pattern: /".+"|\[.+\]|\{.+\}|-?\b\d+(?:\.\d+)?[a-zA-Z]?\b/i,
    lookbehind: false,
    greedy: true,
    inside: jsonNbt,
  },
}

var { selector, command, subcommand, comment, ...mcFunctionNoSelector } = mcfunction

mcfunction.selector.inside = {
  'selector': {
    pattern: /@[a-z]/,
    alias: 'selector',
  },
  'brackets': {
    pattern: /[\[\]]/,
    alias: 'operator',
  },
  'property': {
    pattern: /\w+\=/,
    alias: 'constant',
  },
  ...mcFunctionNoSelector,
  'comma': {
    pattern: /,/,
    alias: 'operator  ',
  },
}

Prism.languages.mcfunction = mcfunction