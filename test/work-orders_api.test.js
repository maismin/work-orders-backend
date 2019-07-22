const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Worker = require('../models/worker')
const WorkOrder = require('../models/work-order')

describe('Creating a work order', () => {
  beforeEach(async () => {
    await Worker.deleteMany({})
    await WorkOrder.deleteMany({})
  })

  it('succeeds with valid fields', async () => {
    let deadline = new Date(Date.now())
    deadline.setFullYear(deadline.getFullYear() + 5)
    const newWorkOrder = {
      title: 'New iPhone',
      description: 'Design a new iPhone',
      deadline,
    }

    const result = await api
      .post('/api/work-orders')
      .send(newWorkOrder)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const newWorkOrderInDB = await WorkOrder.findById(result.body.id)

    expect(newWorkOrderInDB.title).toBe(newWorkOrder.title)
    expect(newWorkOrderInDB.description).toBe(newWorkOrder.description)
    expect(newWorkOrderInDB.date).toBe(newWorkOrder.date)
  })

  it('fails if title is missing', async () => {
    let deadline = new Date(Date.now())
    deadline.setFullYear(deadline.getFullYear() + 5)
    const newWorkOrder = {
      description: 'Design a new iPhone',
      deadline,
    }

    const result = await api
      .post('/api/work-orders')
      .send(newWorkOrder)
      .expect(400)

    expect(result.body.error).toContain('Path `title` is required')
  })

  it('fails if deadline is missing', async () => {
    const newWorkOrder = {
      title: 'New iPhone',
      description: 'Design a new iPhone',
    }

    const result = await api
      .post('/api/work-orders')
      .send(newWorkOrder)
      .expect(400)

    expect(result.body.error).toContain('Path `deadline` is required')
  })

  it('fails if deadline is in the past', async () => {
    let deadline = new Date(Date.now())
    deadline.setFullYear(deadline.getFullYear() - 5)
    const newWorkOrder = {
      title: 'New iPhone',
      description: 'Design a new iPhone',
      deadline,
    }

    const result = await api
      .post('/api/work-orders')
      .send(newWorkOrder)
      .expect(400)

    expect(result.body.error).toContain('is before minimum allowed value')
  })
})

describe('Assigning a worker to a work order', () => {
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

  it('succeeds if the work order has <= 5 workers', async () => {
    const workers = await helper.workersInDB()
    const workOrders = await helper.workOrdersInDB()

    workers.pop()
    const workOrder = workOrders[0]
    let result
    for (let worker of workers) {
      result = await api.post(
        `/api/work-orders/${workOrder.id}/workers/${worker.id}`,
      )
    }

    const returnedWorkOrder = result.body
    expect(returnedWorkOrder.workers.length).toBe(workers.length)
  })

  it('fails if the work order has > 5 workers', async () => {
    const workers = await helper.workersInDB()
    const workOrders = await helper.workOrdersInDB()

    const workOrder = workOrders[0]
    let result
    for (let worker of workers) {
      result = await api.post(
        `/api/work-orders/${workOrder.id}/workers/${worker.id}`,
      )
    }

    expect(result.body.error).toContain('workers exceeds the limit of 5')
  })

  it('fails if worker is assigned to same work order', async () => {
    const workers = await helper.workersInDB()
    const workOrders = await helper.workOrdersInDB()

    const worker = workers[0]
    const workOrder = workOrders[0]

    await api.post(`/api/work-orders/${workOrder.id}/workers/${worker.id}`)

    const result = await api.post(
      `/api/work-orders/${workOrder.id}/workers/${worker.id}`,
    )

    expect(result.body.error).toContain('Duplicate worker in work order')
  })
})

afterAll(() => {
  mongoose.connection.close()
})
