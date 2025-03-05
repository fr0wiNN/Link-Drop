# Link-Drop

## Project 

### Authors

Joachim Lewandowski *(i6351332)*  
Maksymilian Gach *(i6361755)*

### Project Structure

The project structure goes as follows:

```bash
.
├── backend
│   ├── config # contains configuration for DB connection.
│   ├── controllers # empty for now... will contain functions for flow-control tasks.
│   ├── middleware # empty for now... will contain functions for secure server-client communication.
│   ├── models # adapter for JS -> DB communication.
│   ├── routes # define routes for API calls together with correct error indication.
│   ├── server.js # connects everything together and starts a backend services.
│   ├── services # contains abstract functions with its logic. It uses less abstract modules for lower-level operations - it manages them. 
│   │
│   └── storage # contains all the files sent by users. 
│       └── user_data
│           ├── admin
│           │   └── file_1.txt
│           ├── Alice
│           │   └── hello.txt
│           └── Bob
├── database
│   ├── init.sql # init script for correct DB configuration
│   └── reset.sql # reset script for reseting the database
├── frontend
│   ├── assets
│   │   ├── img # contains images that are displayed by HTML. 
│   │   ├── scripts # contains scripts, that define frontend logic and backend direct API calls. 
│   │   └── styles # CSS styling sheets
│   └── pages # contains all HTML pages. login.html is an entry point.
└── logs # contains all logs created by application
```

## Service Configuration

### Dependencies

Project uses nodejs for backend API

Make sure, you have `node` and `npm` installed. 
To see if you have those installed, by running `node -v` and `npm -v`.

To download neccesery dependencies, run following commands **inside** [backend](./backend/) directory:

```bash
npm install cors 
npm install express
npm install multer
npm install mysql2
```

### Database

Link Drop uses MySQL for storing user and file data. 

To configure one follow these steps:

1. Create a MySQL database using [initialization script](./database/init.sql).
2. Create a `db.js` file **inside** [config](./backend/config/) folder and paste following code, replacing indicated spots:
```js
    const mysql = require("mysql2")

    const pool = mysql.createPool({
        host: "localhost",
        user: "...",
        password: "...",
        database: "link_drop",
        connectionLimit: 10
    });

    const promisePool = pool.promise();
    module.exports = promisePool;
```

### Starting Server 

Start node.js backend server:
```bash
node /backend/server.js
```

If you host the website on local machine, then replace each instance of `pi0040` in [html pages](./frontend/pages/) to `localhost`


