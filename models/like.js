'use strict';
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define('Like', {
    UserId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    TweetId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tweets',
        key: 'id'
      }
    }
  }, {});
  Like.associate = function (models) {
    Like.belongsTo(models.User)
    Like.belongsTo(models.Tweet)
  };
  return Like;
};