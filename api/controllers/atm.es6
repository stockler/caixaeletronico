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

function cashRescue(value, currency) {
  let leftover = 0;
  
  const last= value%10;
  console.log("last :: "+ last);
  
  currency = currency
    .sort(function(o1, o2) {
      return o1.name - o2.name;
    })
    .reverse()
    .map(function(obj) {
      
      const newObj = {
        name: obj.name
      };
      const cash = parseInt(obj.name);
      if (leftover) {
        value += leftover;
        leftover = 0;
      }
      let result = parseInt(value/cash);
      if (result > obj.qtd) {
        leftover = (result - obj.qtd)*cash;
        newObj.qtd = obj.qtd;
        
        console.log(result);
        console.log(obj.qtd);
        console.log(leftover);
        console.log("------------------");
        
      } else {
        newObj.qtd = result;
      }
      
      console.log(value, leftover);
      
      
      console.log("=============================");
      
      
      value %= cash;
      
      console.log(value);
      
      return newObj;
    });
  
    
    
  console.log(currency);
  
  return currency;
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
        const result = cashRescue(value, cash);
        const withdrawal = cash.map(function(value, index) {
          return {
            name: value.name,
            qtd: result[index]
          };          
        });        
        
        const updateAtm = AtmModel
          .update()
        
        let msg = util.format('Você está realizando o saque de R$ %s reais!', JSON.stringify(withdrawal));           
        return res.status(200).json(msg);      
      })      
      .catch((err) => {
        console.log("Error ", err);
        let msg = util.format(err);    
        return res.status(500).json(msg);
      });   
    
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