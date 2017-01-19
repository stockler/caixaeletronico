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

function calc(currency, value, leftover, index, length) {
  let nCurrency = [];
  for (let i = index; i < length; i++) {
    let obj = currency[i];

    const newObj = {
      name: obj.name
    };
    const cash = parseInt(obj.name);
    if (leftover > 0) {
      value += leftover;
      leftover = 0;
    }
    let result = parseInt(value/cash);
    if (result > obj.qtd) {
      leftover = (result - obj.qtd)*cash;
      newObj.qtd = obj.qtd;
      
    } else {
      newObj.qtd = result;
    }
    
    value %= cash;
    
    nCurrency.push(newObj);
  }

  return [nCurrency, value, leftover];
}

function cashRescue(value, currency) {
  let leftover = 0;
  
  const last= value%10;
  console.log("last :: "+ last);

  value = value - last;
  
  currency = currency
    .sort(function(o1, o2) {
      return o1.name - o2.name;
    })
    .reverse();

  let j = currency.length - 2;

  let [nCurrency, nValue, nLeftover] = calc(currency, value, 0, 0, j);

  value = nValue;
  leftover = nLeftover;

  value = value + last;

  let [n2Currency, n2Value, n2Leftover] = calc(currency, value, leftover, j, currency.length);
  
  value = n2Value;
  leftover = n2Leftover;

  if (value >= 1) {
    value = nValue + last;

    let [n3Currency, n3Value, n3Leftover] = calc(currency, value, leftover, j+1, currency.length);

    nCurrency = nCurrency.concat(n3Currency);
    value = n3Value;
    leftover = n3Leftover;
  } else {
    nCurrency = nCurrency.concat(n2Currency);
  }
  
  return [nCurrency, value];
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

        const [result, rest] = cashRescue(value, cash);
        
        if (rest >= 1) {
          let msg = util.format('O valor requisitado não pode ser sacado. Por favor, tente outro valor válido!');           
          return res.status(500).json(msg); 
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
        console.log("Error ", err);
        let msg = util.format(err);    
        return res.status(500).json(msg);
      });   
    
  }
  
  static deposit(req, res) {    
    let cash = req.swagger.params.body.value;

    console.log(cash);

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
        console.log(result);
        console.log(value);
        let msg = util.format('Você está realizando o depósito de R$ %s reais!', value);    
        return res.json(msg);
      })
      .catch((err) => {
        console.log("Error ", err);
        let msg = util.format(err);    
        return res.status(500).json(msg);
      }); 
    
  }
}

const deposit = Atm.deposit;
const withdrawal = Atm.withdrawal;

export {withdrawal, deposit};