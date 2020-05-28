'use strict';
const faker = require('faker')
const bcrypt = require('bcryptjs')

module.exports = {
  up: (queryInterface, Sequelize) => {
    queryInterface.bulkInsert('Users', [{
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: "root",
      avatar: 'https://loremflickr.com/320/240/restaurant,food/?random=${Math.random() * 100}',
      role: 'admin',
      introduction: faker.lorem.text(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user1@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'user1',
      avatar: 'https://loremflickr.com/320/240/restaurant,food/?random=${Math.random() * 100}',
      role: 'user',
      introduction: faker.lorem.text(),
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'user2@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'user2',
      avatar: 'https://loremflickr.com/320/240/restaurant,food/?random=${Math.random() * 100}',
      role: 'user',
      introduction: faker.lorem.text(),
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})

    return queryInterface.bulkInsert('Tweets',
      Array.from({ length: 50 }).map(d =>
        ({
          description: faker.lorem.text(),
          userId: Math.floor(Math.random() * 3) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {})
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Tweets', null, {});
    return queryInterface.bulkDelete('Users', null, {});
  }
};
