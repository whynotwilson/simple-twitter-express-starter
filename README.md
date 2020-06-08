# Simple Twitter

## 安裝

#### NPM的使用
```
- node.js v-10.15.0
- bcrypt-nodejs
- bcryptjs
- body-parser
- bootstrap-select
- chai
- connect-flash
- dotenv
- express
- express-handlebars
- express-session
- faker
- imgur-node-api
- jquery
- jsdom
- jsonwebtoken
- loadsh
- method-override
- mocha
- moment
- multer
- mysql2
- passport
- passport-jwt
- passport-local
- sequelize
- sequelize-cli
- sinon
- sinon-chai
- socket.io
- sequelize-test-helpers
- supertest
```

##### 確認本機是否安裝 [MySql](https://dev.mysql.com/downloads/mysql/)

##### 1.開啟終端機到存放專案本機位置並執行:
`git clone https://github.com/whynotwilson/simple-twitter-express-starter.git`

##### 2.初始設定
```
1. 切換目錄到專案: cd simple-twitter-express-starter
2. 安裝套件: npm install
3. 進入[圖片網站 Imgur](https://api.imgur.com/oauth2/addclient) 註冊，取得clientID
4. 建立.env的檔案，將上述取得的clientID以及自訂的JWT secret code貼至下方
- IMGUR_CLIENT_ID=<Imgur clientID>
- JWT_SECRET=<JWT SECRET>
```

#### 3.修改 /config/config.json
```
- 修改 development mode 的設定，加入資料庫的名字與密碼，刪除"operatorsAliases": false

"development": {
  "username": "root",
  "password": "your password",
  "database": "ac_twitter_workspace",
  "host": "127.0.0.1",
  "dialect": "mysql",
  "operatorsAliases": false
}
```

##### 4.資料庫設定
- 請在 MySQL Workbench 輸入下方指令，建立 ac_twitter_workspace 資料庫
```
create database ac_twitter_workspace
```

##### 5.建立 Table
- npx sequelize db:migrate

##### 6.建立種子資料
- npx sequelize db:seed:all

#### 7.執行程式
```
1. 終端機輸入: npm run dev
2. 開啟網頁輸入: http://localhost:3000
```

## 基本功能

#### 1.除了註冊和登入頁，使用者一定要登入才能使用網站
#### 2.使用者能創建帳號、登入、登出
#### 3.除了信箱和密碼，使用者在註冊時還能設定自己的名稱
#### 4.使用者的名稱不能重覆，若有重覆會跳出錯誤
#### 5.使用者能編輯自己的名稱、介紹和大頭照
#### 6.使用者能瀏覽所有的推播 (tweet)
#### 7.點擊其他使用者的名稱時，能瀏覽該使用者的個人資料及推播
#### 8.使用者能新增推播，推播字數限制在 140 以內，且不能為空白；若不符合規定，會跳回同一頁並顯示錯誤訊息
#### 9.使用者能回覆別人的推播，回覆文字不能為空白；若不符合規定，會跳回同一頁並顯示錯誤訊息
#### 10.使用者可以追蹤/取消追蹤其他使用者（不能追蹤自己）
#### 11.使用者能對別人的推播按 Like/Unlike
#### 12.任何登入使用者都可以瀏覽特定使用者的以下資料：
#### - Tweets：排序依 Tweets 成立日期，最新的在前
#### - Following：該使用者的關注清單，排序依照追蹤紀錄成立的時間，愈新的在愈前面
#### - Follower：該使用者的跟隨者清單，排序依照追蹤紀錄成立的時間，愈新的在愈前面
#### - Like：該使用者 like 過的推播清單，排序依 like 紀錄成立的時間，愈新的在愈前面
#### 13.使用者能在首頁看見跟隨者 (followers) 數量排列前 10 的使用者推薦名單

#### 後台:

#### 1.管理者登入網站後，能夠進入後台頁面
#### 2.管理者可以瀏覽所有的推播與推播回覆內容
#### 3.管理者可以刪除使用者的推播
#### 4.管理者可以瀏覽站內所有的使用者清單
#### 5.該清單會列出他們的活躍程度（包括推播數量、關注人數、跟隨者人數、like 過的推播數）
#### 6.管理者可以瀏覽站內所有的使用者清單，該清單按推播文數排序

## 挑戰功能

#### 1.線上即時對話：可以「私訊」其他人
#### 2.@好友：在文字編輯框可以用 @ 來標記其他 user，標記時會跑出下拉選單，可以依當下輸入的字母來篩選 user
#### 3.封鎖：封鎖某人之後，對方將看不到你的任何動態

## 測試帳號

| Name  | Email             | Password | 預設權限  |
| ----- | ----------------- | -------- | -------- |
| root  | root@example.com  | 12345678 | admin    |
| user1 | user1@example.com | 12345678 | user     |
| user2 | user2@example.com | 12345678 | user     |