'use strict';
const faker = require('faker')
const bcrypt = require('bcryptjs')

module.exports = {
  up: (queryInterface, Sequelize) => {
    const Followships = []
    for (let i = 2; i < 13; i++) {
      for (let j = 15; j > 4; j--) {
        if (i !== j) {
          Followships.push({
            followerId: i,
            followingId: j,
            createdAt: new Date(),
            updatedAt: new Date()
          })
        }
      }
    }
    queryInterface.bulkInsert('Followships', Followships, {})

    queryInterface.bulkInsert('Blockships', [{
      blockerId: 25,
      blockingId: 24,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      blockerId: 24,
      blockingId: 23,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      blockerId: 23,
      blockingId: 25,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})

    const Users = []
    Users.push({
      email: 'root@example.com',
      password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
      name: 'root',
      avatar: faker.image.avatar(),
      role: 'admin',
      introduction: faker.lorem.text(),
      createdAt: new Date(),
      updatedAt: new Date()
    })
    for (let i = 1; i < 25; i++) {
      Users.push({
        email: `user${i}@example.com`,
        password: bcrypt.hashSync('12345678', bcrypt.genSaltSync(10), null),
        name: `user${i}`,
        avatar: faker.image.avatar(),
        role: 'user',
        introduction: faker.lorem.text(), // lorem = 亂數
        createdAt: new Date(),
        updatedAt: new Date()
      })
    }
    queryInterface.bulkInsert('Users', Users, {})

    queryInterface.bulkInsert('Replies',
      Array.from({ length: 150 }).map(d =>
        ({
          UserId: Math.floor(Math.random() * 22) + 2,
          TweetId: Math.floor(Math.random() * 100) + 1,
          comment: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date()
        })
      ), {})

    queryInterface.bulkInsert('Tags',
      [{
        TaggedUserId: 1,
        TweetId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }]
      , {})

    const Likes = []
    for (let i = 2; i < 15; i++) {
      let j = i
      while (j < 15) {
        Likes.push({
          UserId: j,
          TweetId: i,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        j++
      }
    }
    queryInterface.bulkInsert('Likes', Likes, {})

    return queryInterface.bulkInsert('Tweets',
      Array.from({ length: 200 }).map(d =>
        ({
          description: faker.lorem.text(),
          userId: Math.floor(Math.random() * 22) + 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ), {})
  },

  down: (queryInterface, Sequelize) => {
    queryInterface.bulkDelete('Tweets', null, {})
    queryInterface.bulkDelete('Followships', null, {})
    queryInterface.bulkDelete('Likes', null, {})
    queryInterface.bulkDelete('Replies', null, {})
    return queryInterface.bulkDelete('Users', null, {})
  }
};
