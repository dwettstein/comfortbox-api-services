'use strict';

module.exports = function enableAuthentication(server) {
  // enable authentication
  server.enableAuth({datasource: 'db'});

  var AccessToken = server.models.AccessToken;

  var User = server.models.User;

  this.defaultUsername = server.get('defaultUsername');
  this.defaultPassword = server.get('defaultPassword');
  if (typeof this.defaultUsername == 'undefined' || this.defaultUsername === null || this.defaultUsername === '' ||
    typeof this.defaultPassword == 'undefined' || this.defaultPassword === null || this.defaultPassword === '') {
    throw 'The default username and password were not found or are empty in config.json file.';
  }

  User.upsertWithWhere(
    {where: {email: 'defaultUser@localhost.com'}},
    {username: this.defaultUsername, password: this.defaultPassword, email: 'defaultUser@localhost.com'},
    function(err, defaultUser) {
      if (err) {
        console.error(err);
      }
      console.log('Created default user: ', defaultUser);

      AccessToken.destroyAll({
        where: {userId: defaultUser.id},
      });

      var defaultAccessToken = server.get('defaultAccessToken');
      if (typeof this.defaultAccessToken == 'undefined' || this.defaultAccessToken === null || this.defaultAccessToken === '') {
        console.warn('The default access token was not found or is empty in config.json file. Skip creation of it.');
      } else {
        var ONE_YEAR_IN_SEC = 60 * 60 * 24 * 365;
        defaultUser.accessTokens.create({
          id: server.get('defaultAccessToken'),
          ttl: ONE_YEAR_IN_SEC,
        }, function(err, defaultToken) {
          if (err) {
            console.error(err);
          }
          console.log('Created default accessToken: ', defaultToken);
        });
      }
    }
  );

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
    }
    console.log('Added ACL to User: ', acls);
  });
};
