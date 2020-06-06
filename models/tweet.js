'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tweet = sequelize.define('Tweet', {
    description: DataTypes.TEXT,
    UserId: DataTypes.INTEGER
  }, {});
  Tweet.associate = function (models) {
    Tweet.hasMany(models.Like)
    Tweet.hasMany(models.Reply)
    Tweet.belongsTo(models.User)
    Tweet.hasMany(model.Tag)
    Tweet.belongsToMany(models.User, {
      through: models.Like,
      foreignKey: 'TweetId',
      as: 'LikedUsers'
    })

  };
  return Tweet;
};