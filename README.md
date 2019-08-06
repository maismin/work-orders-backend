# Backend - Work Orders

## Description
This backend application allows for the creation of workers and work-orders (tasks). Workers can be assigned to and multi-task many work-orders concurrently. A work-order has a max limit of five workers at a time.

## Local Installation

1. Install [MongoDB Community Edition](https://docs.mongodb.com/manual/administration/install-community/)
2. Install [Postman](https://www.getpostman.com/downloads/)
3. Start up Mongo daemon (for Linux)
```bash
$ sudo service mongod start
```
4. Unzip the project, `cd` to it, and run
```bash
$ npm install
```
5. Start the backend with
```bash
$ npm run watch
```
6. Use Postman to interface with the API at (http://localhost:3003)

## env Setup

Create a `.env` file at the `project root` directory with the following

```
MONGODB_URI=mongodb://localhost:27017/hatchway-backend

DEV_MONGODB_URI=mongodb://localhost:27017/hatchway-backend

TEST_MONGODB_URI=mongodb://localhost:27017/hatchway-backend-test

PORT=3003
```

## Additional Commands

Run the following command for unit testing on the API

```bash
$ npm run test
```

Run the following command for test coverage
```bash
$ npm run test -- --coverage
```
From the `project root` directory, navigate to `/coverage/lcov-report/index.html` for the HTML report

## API

Deployed to [Heroku](https://pacific-savannah-92527.herokuapp.com)

### Workers

Endpoints that manipulate or display worker information

**Show all workers** : `GET /api/workers`
* **Parameters**: None
* **Query**: None
* **Body**: None
* **Response**

  * Success Code: 200

**Show a worker** :`GET /api/workers/:id`
* **Parameters**
  * `id=[string]`
* **Query**: None
* **Body**: None
* **Response**
  * Success Code: 200

**Show a worker's work orders** : `GET /api/workers/:id/work-orders`
* **Parameters**
  * `id=[string]`
* **Query**: None
* **Body**: None
* **Response**
  * Success Code: 200

**Create a worker** : `POST /api/workers`
* **Parameters**: None
* **Query**: None
* **Body**: `{"name": "Alex","companyName": "Google","email": "alex@gmail.com"}`
* **Response**
  * Success Code: 201

**Delete a worker** : `DELETE /api/workers/:id`
* **Parameters**
  * `id=[string]`
* **Query**: None
* **Body**: None
* **Response**
  * Success Code: 204
   


### Work Orders

Endpoints for viewing and changing work orders

**Show all work orders** : `GET /api/work-orders`
* **Parameters**: None
* **Query**:
  * `?sort=`
    * `deadline.[asc|desc]`
* **Body**: None
* **Response**
  * Success Code: 200

**Show a work order** : `GET /api/work-orders/:id`
* **Parameters**
  * `id=[string]`
* **Query**: None
* **Body**: None
* **Response**
  * Success Code: 200

**Create a work order** : `POST /api/work-orders`
* **Parameters**: None
* **Query**: None
* **Body**: `{"title": "T10", "description": "Task10", "deadline": "2030-01-01"}`
* **Response**
  * Success Code: 201

**Assign a worker to a work order** : `POST /api/work-orders/:workOrderId/workers/:workerId`
* **Parameters**
* **Query**: None
* **Body**: None
* **Response**
  * Success Code: 200
