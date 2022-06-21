describe('Ignores', () => {
  test('Ignores Line', () => {
    expect(`
      // @ts-transformer-log-position ignore
      console.log('foo');
    `).transformsInto(
      `
      // @ts-transformer-log-position ignore
      console.log('foo');
      `,
    );
  });

  test('Only ignores next Line', () => {
    expect(`
      console.log('foo');
      // @ts-transformer-log-position ignore
      console.log('foo');
      console.log('foo');
      // @ts-transformer-log-position ignore
      console.log('foo');
      console.log('foo');
    `).transformsInto(
      `
      console.log("test", 'foo');
      // @ts-transformer-log-position ignore
      console.log('foo');
      console.log("test", 'foo');
      // @ts-transformer-log-position ignore
      console.log('foo');
      console.log("test", 'foo');
          `,
      {
        templateString: 'test',
      },
    );
  });

  test('Ignores entire file', () => {
    expect(`
    // @ts-transformer-log-position disable
    console.log('foo1');
    console.loG('foo2');   
    
    `).transformsInto(`
    // @ts-transformer-log-position disable
    console.log('foo1');
    console.loG('foo2');   
    `);
  });
});
