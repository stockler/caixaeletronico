'use strict';

import should from 'should';
import request from 'supertest';
import server from '../../../app';

describe('controllers', () => {

  describe('atm', () => {

    describe('GET /rest/withdrawal/100', () => {

      it('should return a withdrawal cash', (done) => {

        request(server)
          .get('/rest/withdrawal/100')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);

            res.body.should.be.a.Array();

            done();
          });
      });

    });
    
    describe('POST /rest/deposit/300', () => {      

      it('should return a deposit cash', (done) => {

        request(server)
          .post('/rest/deposit/300')
          .set('Content-Type', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end((err, res) => {
            should.not.exist(err);

            res.body.should.eql('Você está realizando o depósito de R$ 300 reais!');

            done();
          });
      });

    });

  });

});
