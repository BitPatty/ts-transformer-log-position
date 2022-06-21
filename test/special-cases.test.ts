describe('Special K', () => {
  test('Can use `this` keyword for logs', () => {
    expect(`
      class Test {
        public logSelf() { }
        public test() { this.logSelf(); }
      }`).transformsInto(
      `
      class Test {
        logSelf() { }
        test() { this.logSelf("test"); }
      }
      `,
      {
        expressions: 'this.logSelf',
        templateString: 'test',
      },
    );
  });

  test('Can use `this` keyword for nested log functions', () => {
    expect(`
      class Test {
        public test: Test;
        public logSelf() { }
        public test() { this.test.logSelf(); }
      }`).transformsInto(
      `
      class Test {
        test;

        logSelf() { }
        test() { this.test.logSelf("test"); }
      }
      `,
      {
        expressions: 'this.test.logSelf',
        templateString: 'test',
      },
    );
  });
});
