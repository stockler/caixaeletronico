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
import AtmModel from '../models/atm';

function recursiveCalc(cashList, currency, value, leftover, index, last) {

  if (value <= 1 || index === currency.length) {
    return value;
  } 

  let obj = currency[index];

  const newObj = {
    name: obj.name
  };
  const cash = parseInt(obj.name);
  if (leftover > 0) {
    value += leftover;
    leftover = 0;
  }
  let result = parseInt(value/cash);

  if (result > 0) {
    if (result > obj.qtd) {
      leftover = (result - obj.qtd)*cash;
      newObj.qtd = obj.qtd;
      
    } else {
      newObj.qtd = result;
    }

    cashList.push(newObj); 
    value %= cash;
  }

  if (value < 10 && last > 0) {
    value += last;
    last = 0;
  }
  
  return recursiveCalc(cashList, currency, value, leftover, index + 1, last);
  
}

function cashRescue(value, currency) {
  let leftover = 0;
  
  const last = value % 10;

  value = value - last;
  
  currency = currency
    .sort((o1, o2) => {
      return o1.name - o2.name;
    })
    .reverse();

  const result = [];

  value = recursiveCalc(result, currency, value, 0, 0, last);
  
  return [result, value];
}

class Atm {
  static withdrawal(req, res) {    
    let value = parseInt(req.swagger.params.cash.value);
    
    AtmModel
      .find({
        qtd: {
          $gt: 0
        }
      })
      .then((cash) => {

        const total = cash.reduce((a, b) => {
          return parseInt(b.name)*b.qtd + a;
        }, 0);

        if (value > total) {
          let msg = `Desculpem-nos, não temos esse valor em notas. Por favor, tente outro valor menor que R$ ${total} Reais!`;           
          throw new Error(msg); 
        }

        const [result, rest] = cashRescue(value, cash);
        
        if (rest >= 1) {
          let msg = 'O valor requisitado não pode ser sacado. Por favor, tente outro valor válido!';           
          throw new Error(msg); 
        }   

        return result;
      })
      .then((result) => {

        const data = result.map((obj) => {

          return AtmModel
            .update({
              name: obj.name
            }, {
              $inc: {
                qtd: obj.qtd * (-1)
              }
            })
            .then((result) => {
              return result;
            });
        });

        return [result, data];
      })  
      .spread((result, data) => {                   
        return res.status(200).json(result);      
      })      
      .catch((err) => {
        let msg = util.format(err.message);    
        return res.status(500).json(msg);
      });   
    
  }
  
  static deposit(req, res) {    
    let cash = req.swagger.params.body.value;

    let promiseAll = [];

    let value = 0;

    for (let prop in cash) {

      value += parseInt(prop) * cash[prop];

      promiseAll.push(AtmModel
        .update({
          name: prop
        }, {
          $inc: {
            qtd: cash[prop]
          }
        })
        .then((result) => {
          return result;
        })
      );
    }

    Promise
      .all(promiseAll)
      .then((result) => {
        let msg = util.format('Você está realizando o depósito de R$ %s reais!', value);    
        return res.json(msg);
      })
      .catch((err) => {
        let msg = util.format(err.message);    
        return res.status(500).json(msg);
      }); 
    
  }
}

const deposit = Atm.deposit;
const withdrawal = Atm.withdrawal;

export {withdrawal, deposit};