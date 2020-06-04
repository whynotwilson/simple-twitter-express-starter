'use strict';
module.exports = (sequelize, DataTypes) => {
  const Blockship = sequelize.define('Blockship', {
    blockerId: DataTypes.INTEGER,
    blockingId: DataTypes.INTEGER
  }, {});
  Blockship.associate = function(models) {
    // associations can be defined here
  };
  return Blockship;
};