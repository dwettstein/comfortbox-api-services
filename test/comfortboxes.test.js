'use strict';

describe('/comfortboxes', function() {
  var Comfortbox;

  before(function(done) {
    Comfortbox = app.models.Comfortbox;
    Comfortbox.upsert({id: 1, name: 'CB7', particleId: '220037000f47343432313031'}, function() { done(); });
  });

  it('should get one existing comfortbox', function(done) {
    request.get('/api/comfortboxes').expect(function(res) {
      expect(res.statusCode).to.be.equal(200);
      var resultObj = res.body;
      expect(Array.isArray(resultObj)).to.be.true;
      expect(resultObj.length).to.be.equal(1);
      expect(resultObj[0].particleId).to.be.equal('220037000f47343432313031');
    }).end(done);
  });

  it('should create a new comfortbox', function(done) {
    request.post('/api/comfortboxes').send({id: 2, name: 'CB8', particleId: '000000000000000000000000'}).expect(function(res) {
      expect(res.statusCode).to.be.equal(200);
      var resultObj = res.body;
      expect(resultObj).to.be.ok;
      expect(resultObj.name).to.be.equal('CB8');
    }).end(done);
  });

  it('should get two existing comfortbox', function(done) {
    request.get('/api/comfortboxes').expect(function(res) {
      expect(res.statusCode).to.be.equal(200);
      var resultObj = res.body;
      expect(Array.isArray(resultObj)).to.be.true;
      expect(resultObj.length).to.be.equal(2);
    }).end(done);
  });

  it('should fail create a new comfortbox with empty particleId', function(done) {
    request.post('/api/comfortboxes').send({id: 3, name: 'CB9', particleId: ''}).expect(function(res) {
      expect(res.statusCode).to.be.equal(422);
      var resultObj = res.body;
      expect(resultObj.error.name).to.be.equal('ValidationError');
    }).end(done);
  });
});
