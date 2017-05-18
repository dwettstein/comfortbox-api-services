'use strict';

describe('/ComfortBoxes', function() {
  var ComfortBox;

  before(function(done) {
    ComfortBox = app.models.ComfortBox;
    ComfortBox.upsert({name: 'CB7', particleId: '220037000f47343432313031', created: new Date()}, function() { done(); });
  });

  it('should get one existing ComfortBox', function(done) {
    request.get('/api/ComfortBoxes').expect(function(res) {
      expect(res.statusCode).to.be.equal(200);
      var resultObj = res.body;
      expect(Array.isArray(resultObj)).to.be.true;
      expect(resultObj.length).to.be.equal(1);
      expect(resultObj[0].particleId).to.be.equal('220037000f47343432313031');
    }).end(done);
  });

  it('should create a new ComfortBox', function(done) {
    request.post('/api/ComfortBoxes').send({name: 'CB8', particleId: '000000000000000000000000', created: new Date()}).expect(function(res) {
      expect(res.statusCode).to.be.equal(200);
      var resultObj = res.body;
      expect(resultObj).to.be.ok;
      expect(resultObj.name).to.be.equal('CB8');
    }).end(done);
  });

  it('should get two existing ComfortBoxes', function(done) {
    request.get('/api/ComfortBoxes').expect(function(res) {
      expect(res.statusCode).to.be.equal(200);
      var resultObj = res.body;
      expect(Array.isArray(resultObj)).to.be.true;
      expect(resultObj.length).to.be.equal(2);
    }).end(done);
  });

  it('should fail create a new ComfortBox with empty particleId', function(done) {
    request.post('/api/ComfortBoxes').send({id: 3, name: 'CB9', particleId: ''}).expect(function(res) {
      expect(res.statusCode).to.be.equal(422);
      var resultObj = res.body;
      expect(resultObj.error.name).to.be.equal('ValidationError');
    }).end(done);
  });
});
