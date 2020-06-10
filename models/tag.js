'use strict';
module.exports = (sequelize, DataTypes) => {
  const Tag = sequelize.define('Tag', {
    TaggedUserId: DataTypes.INTEGER
  }, {});
  Tag.associate = function (models) {
    Tag.belongsTo(models.Tweet)
  };
  return Tag;
};