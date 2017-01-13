'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
import util from 'util';



class Atm {
  static withdrawal(req, res) {    
    let cash = req.swagger.params.cash.value;
    let msg = util.format('Você está realizando o saque de R$ %s reais!', cash);
    
    return res.json(msg);
  }
  
  static deposit(req, res) {    
    let cash = req.swagger.params.cash.value;
    let msg = util.format('Você está realizando o depósito de R$ %s reais!', cash);
    
    return res.json(msg);
  }
}

const deposit = Atm.deposit;
const withdrawal = Atm.withdrawal;

export {withdrawal, deposit};