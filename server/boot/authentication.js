'use strict';

module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth({datasource: 'db'});

  var User = server.models.User;
  User.replaceOrCreate({
    username: server.get('defaultUsername'),
    password: server.get('defaultPassword'),
    email: server.get('defaultEmail'),
  }, function(err, defaultUser) {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log('Created default user: ', defaultUser);

    var ONE_YEAR_IN_SEC = 60 * 60 * 24 * 365;
    defaultUser.accessTokens.create({
      id: server.get('defaultAccessToken'),
      ttl: ONE_YEAR_IN_SEC,
    }, function(err, defaultToken) {
      if (err) {
        console.error(err);
        throw err;
      }
      console.log('Created default accessToken: ', defaultToken);
    });
  });

  User.disableRemoteMethodByName('prototype.__count__accessTokens');
  User.disableRemoteMethodByName('prototype.__create__accessTokens');
  User.disableRemoteMethodByName('prototype.__delete__accessTokens');
  User.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
  User.disableRemoteMethodByName('prototype.__findById__accessTokens');
  User.disableRemoteMethodByName('prototype.__get__accessTokens');
  User.disableRemoteMethodByName('prototype.__updateById__accessTokens');

  var ACL = server.models.ACL;
  ACL.create({
    model: 'User',
    accessType: '*',
    principalType: 'ROLE',
    principalId: '$unauthenticated',
    permission: 'DENY',
    property: 'create',
  }, function(err, acls) {
    if (err) {
      console.error(err);
      throw err;
    }
    console.log('Added ACL to User: ', acls);
  });
};
