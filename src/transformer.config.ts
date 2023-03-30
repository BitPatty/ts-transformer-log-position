import assert from 'node:assert';
import ts from 'typescript';

export type TransformerOptions = {
  expressions: string | string[];
  projectRoot: string;
  templateString: string;
  incrementCharNumber: boolean;
  incrementLineNumber: boolean;
  split: boolean;
};

// The access tree is a reverse tree based on the order of property access
// expressions.
//
// The expressions ["console.log", "console.warn", "foo.bar.log"] are mapped
// into the following reverse tree, where the topmost children are the log
// log functions:
//
// ──────────────────┬─────────────┬──────
//                   │             │
//                   │             │
//               ┌───▼───┐     ┌───▼───┐
//               │  log  │     │ warn  │
//               └┬──┬───┘     └───┬───┘
//                │  │             │
//      ┌─────────┘  │             │
//      │            │             │
//  ┌───▼───┐   ┌────▼────┐   ┌────▼────┐
//  │  bar  │   │ console │   │ console │
//  └───┬───┘   └─────────┘   └─────────┘
//      │
//      │
//  ┌───▼───┐
//  │  foo  │
//  └───────┘

export type AccessTreeNode = {
  leaf: boolean;
  children?: {
    [_: string]: AccessTreeNode;
  };
};

export type AccessTreeRootNode = AccessTreeNode;

export class TransformerConfig {
  public readonly accessTree: AccessTreeRootNode;
  public readonly projectRoot: string | undefined;
  public readonly templateString: string;

  public readonly incrementCharNumber: boolean;
  public readonly incrementLineNumber: boolean;
  public readonly split: boolean;

  public constructor(
    program: ts.Program,
    options?: Partial<TransformerOptions>,
  ) {
    this.#validateOptions(options);
    const defaultOptions = this.#buildDefaultOptions(program);

    for (const key of Object.keys(defaultOptions) as Array<
      keyof TransformerOptions
    >) {
      switch (key) {
        case 'expressions':
          this.accessTree =
            typeof options?.expressions === 'string'
              ? this.#buildAccessTree([options.expressions])
              : this.#buildAccessTree(
                  options?.expressions ?? defaultOptions.expressions,
                );
          break;
        case 'incrementCharNumber':
        case 'incrementLineNumber':
        case 'split':
          this[key] = options?.[key] ?? defaultOptions[key];
          break;
        case 'projectRoot':
        case 'templateString':
          this[key] = options?.[key] ?? defaultOptions[key];
          break;
      }
    }
  }

  /**
   * Checks whether the specified string is defined and contains
   * at least one character
   *
   * @param str  The string
   * @returns    True if the string contains at least one character
   */
  #isMeaningfulString(str: string | undefined): boolean {
    if (typeof str === 'undefined') return false;
    if (typeof str !== 'string') return false;
    if (str.trim().length === 0) return false;
    return true;
  }

  /**
   * Validates the transformer options
   *
   * @param options  The options
   */
  #validateOptions(options?: Partial<TransformerOptions>): void {
    if (!options) return;

    for (const key of Object.keys(options)) {
      const err = `Invalid configuration for '${key}'`;
      switch (key) {
        case 'expressions':
          if (typeof options.expressions === 'string')
            assert(this.#isMeaningfulString(options.expressions), err);
          else
            assert(
              Array.isArray(options.expressions) &&
                options.expressions.every(
                  (e) => this.#isMeaningfulString(e),
                  err,
                ),
            );
          break;
        case 'projectRoot':
        case 'templateString':
          assert(this.#isMeaningfulString(options[key]), err);
          break;
        case 'incrementCharNumber':
        case 'incrementLineNumber':
        case 'split':
          assert(typeof options[key] === 'boolean', err);
          break;
        default:
          throw new Error(`Unknown configuration option '${key}'`);
      }
    }
  }

  /**
   * Builds the default options for the current context
   *
   * @param program  The program
   * @returns        The default options
   */
  #buildDefaultOptions(
    program: ts.Program,
  ): Omit<TransformerOptions, 'expressions'> & { expressions: string[] } {
    return {
      expressions: [
        'console.log',
        'console.warn',
        'console.debug',
        'console.error',
        'console.trace',
      ],
      templateString: '[{projectFilePath}:{line}:{character}]',
      split: true,
      projectRoot: program.getCurrentDirectory(),
      incrementCharNumber: false,
      incrementLineNumber: false,
    };
  }

  /**
   * Builds the property access tree
   *
   * @param val  The expression paths
   * @returns    The access tree
   */
  #buildAccessTree(val: string[]): AccessTreeNode {
    if (val.length === 1 && val[0] === '')
      return {
        leaf: true,
      };

    const currentLevel = val.map((v) => {
      const next = v.split('.');
      const current = next.pop();
      return [current, next.join('.')] as [string, string];
    });

    const res: Required<AccessTreeNode> = {
      leaf: val.some((v) => v.length === 0),
      children: {},
    };

    for (const root of currentLevel) {
      res.children[root[0]] = this.#buildAccessTree(
        currentLevel.filter((v) => v[0] === root[0]).map((v) => v[1]),
      );
    }

    return res;
  }
}
