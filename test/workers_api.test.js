const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Worker = require('../models/worker')
const WorkOrder = require('../models/work-order')

describe('Creating a worker', () => {
  beforeEach(async () => {
    await Worker.deleteMany({})
  })

  it('succeeds with valid fields', async () => {
    const newWorker = {
      name: 'Alice',
      companyName: 'Apple',
      email: 'Alice@apple.com',
    }

    const result = await api
      .post('/api/workers')
      .send(newWorker)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const newWorkerInDB = await Worker.findById(result.body.id)

    expect(newWorkerInDB.name).toBe(newWorker.name)
    expect(newWorkerInDB.companyName).toBe(newWorker.companyName)
    expect(newWorkerInDB.email).toBe(newWorker.email.toLowerCase())
  })

  it('fails if name is missing', async () => {
    const newWorker = {
      companyName: 'Apple',
      email: 'Alice@apple.com',
    }

    const result = await api
      .post('/api/workers')
      .send(newWorker)
      .expect(400)

    expect(result.body.error).toContain('Path `name` is required')
  })

  it('fails if email is missing', async () => {
    const newWorker = {
      name: 'Alice',
      companyName: 'Apple',
    }

    const result = await api
      .post('/api/workers')
      .send(newWorker)
      .expect(400)

    expect(result.body.error).toContain('Path `email` is required')
  })

  it('fails if email is not unique', async () => {
    const newWorker = {
      name: 'Alice',
      companyName: 'Apple',
      email: 'Alice@apple.com',
    }

    const newWorkerWithSameEmail = {
      name: 'Bob',
      companyName: 'Google',
      email: 'Alice@apple.com',
    }

    await api.post('/api/workers').send(newWorker)

    const result = await api
      .post('/api/workers')
      .send(newWorkerWithSameEmail)
      .expect(400)

    expect(result.body.error).toContain('expected `email` to be unique')
  })
})

describe('Deleting a worker', () => {
  beforeEach(async () => {
    await Worker.deleteMany({})
    await WorkOrder.deleteMany({})

    const workerObjects = helper.initialWorkers.map(
      worker => new Worker(worker),
    )

    const workOrderObjects = helper.initialWorkOrders.map(
      workOrder => new WorkOrder(workOrder),
    )

    const workerPromiseArray = workerObjects.map(worker => worker.save())
    const workOrderPromiseArray = workOrderObjects.map(workOrder =>
      workOrder.save(),
    )

    await Promise.all([...workerPromiseArray, ...workOrderPromiseArray])
  })

  it('succeeds when worker has no work orders', async () => {
    const workers = await helper.workersInDB()
    const worker = workers[0]

    await api.delete(`/api/workers/${worker.id}`).expect(204)

    const leftOverWorkers = await helper.workersInDB()
    expect(workers.length).toBe(leftOverWorkers.length + 1)
  })

  it('succeeds when worker has work orders', async () => {
    const workers = await helper.workersInDB()
    const firedWorker = workers[0]

    const workOrders = await helper.workOrdersInDB()
    const numOrders = 3

    for (let i = 0; i < numOrders; i++) {
      await api.post(
        `/api/work-orders/${workOrders[i].id}/workers/${firedWorker.id}`,
      )
    }

    await api.delete(`/api/workers/${firedWorker.id}`)

    const leftOverWorkers = await helper.workersInDB()
    const leftOverWorkersEmails = leftOverWorkers.map(worker => worker.email)
    expect(leftOverWorkersEmails).not.toContain(firedWorker.email)

    const updatedWorkOrders = await helper.workOrdersInDB()
    const updatedWorkOrdersWorkers = updatedWorkOrders
      .map(workOrder => workOrder.workers.length)
      .slice(0, numOrders)
    const expected = [0, 0, 0]
    expect(updatedWorkOrdersWorkers).toEqual(expected)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
