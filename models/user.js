'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    avatar: DataTypes.STRING,
    introduction: DataTypes.TEXT,
    role: DataTypes.STRING
  }, {});
  User.associate = function (models) {
    User.hasMany(models.Like)
    User.hasMany(models.Reply)
    User.hasMany(models.Tweet)

    // 可以使用 user.Followers() 方法，根據被追隨的人找出追隨者
    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: 'followingId',
      as: 'Followers'
    })

    // 根據「追隨的人」找出「被他追隨的人」
    User.belongsToMany(User, {
      through: models.Followship,
      foreignKey: 'followerId',
      as: 'Followings'
    })

    // 根據「封鎖他的人」找出「被他封鎖的人」
    User.belongsToMany(User, {
      through: models.Blockship,
      foreignKey: 'blockingId',
      as: 'Blockers'
    })

    // 根據「被他封鎖的人」找出「封鎖他的人」
    User.belongsToMany(User, {
      through: models.Blockship,
      foreignKey: 'blockerId',
      as: 'Blockings'
    })

    User.belongsToMany(models.Tweet, {
      through: models.Like,
      foreignKey: 'UserId',
      as: 'LikedTweets'
    })
  };
  return User;
};