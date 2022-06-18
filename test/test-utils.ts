const createLogStatement = (value: string) => `console.log(${value});`;
const createTemplateLiteral = (value: string) => '`${' + value + '}`';
const getConsoleIndex = (stmt: string) => stmt.indexOf('console');

export { createLogStatement, createTemplateLiteral, getConsoleIndex };
