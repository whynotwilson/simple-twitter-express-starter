'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Tags', 'TweetId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      reference: {
        model: 'Tweets',
        key: 'id'
      }
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('Tags', 'TweetId')
  }
};
