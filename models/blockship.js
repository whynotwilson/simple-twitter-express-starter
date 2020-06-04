'use strict';
module.exports = (sequelize, DataTypes) => {
  const blockship = sequelize.define('blockship', {
    blockerId: DataTypes.INTEGER,
    blockingId: DataTypes.INTEGER
  }, {});
  blockship.associate = function(models) {
    // associations can be defined here
  };
  return blockship;
};