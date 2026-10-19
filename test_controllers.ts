
import { Controller, route, MODULE_ID_SYMBOL, ROUTES_SYMBOL } from './src/core/controllers/Controller';

@Controller('test-module')
class TestController {
  @route('/hello')
  sayHello(params: any) {
    return `Hello, ${params.name}!`;
  }

  @route('/add')
  add(params: { a: number, b: number }) {
    return params.a + params.b;
  }
}

const ctrl = new TestController();
const constructor = TestController as any;

console.log('Module ID:', constructor[MODULE_ID_SYMBOL]);
console.log('Routes:', constructor[ROUTES_SYMBOL]);

const method = constructor[ROUTES_SYMBOL].get('/hello');
console.log('Method for /hello:', method);
if (method && typeof (ctrl as any)[method] === 'function') {
    console.log('Result:', (ctrl as any)[method]({ name: 'World' }));
} else {
    console.log('Method is not a function or not found');
}

const method2 = constructor[ROUTES_SYMBOL].get('/add');
console.log('Method for /add:', method2);
if (method2 && typeof (ctrl as any)[method2] === 'function') {
    console.log('Result:', (ctrl as any)[method2]({ a: 5, b: 10 }));
} else {
    console.log('Method is not a function or not found');
}
