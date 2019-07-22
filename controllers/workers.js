const workersRouter = require('express').Router()
const Worker = require('../models/worker')
const WorkOrder = require('../models/work-order')
const _ = require('lodash')

workersRouter.get('/', async (request, response, next) => {
  try {
    const workers = await Worker.find({}).populate('workOrders', {
      title: 1,
      description: 1,
      deadline: 1,
    })
    response.status(200).json(workers.map(worker => worker.toJSON()))
  } catch (exception) {
    next(exception)
  }
})

workersRouter.get('/:id', async (request, response, next) => {
  try {
    const worker = await Worker.findById(request.params.id).populate(
      'workOrders',
      { title: 1, description: 1, deadline: 1 },
    )
    response.status(200).json(worker.toJSON())
  } catch (exception) {
    next(exception)
  }
})

workersRouter.get('/:id/work-orders', async (request, response, next) => {
  try {
    const worker = await Worker.findById(request.params.id).populate(
      'workOrders',
      { title: 1, description: 1, deadline: 1 },
    )
    response.status(200).json(_.pick(worker.toJSON(), 'workOrders'))
  } catch (exception) {
    next(exception)
  }
})

workersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    const worker = new Worker({
      name: body.name,
      companyName: body.companyName,
      email: body.email,
    })

    const savedWorker = await worker.save()
    response.status(201).json(savedWorker.toJSON())
  } catch (exception) {
    next(exception)
  }
})

workersRouter.delete('/:id', async (request, response, next) => {
  try {
    const worker = await Worker.findById(request.params.id)

    await Worker.findByIdAndRemove(request.params.id)

    for (let workOrderId of worker.workOrders) {
      let workOrder = await WorkOrder.findById(workOrderId)
      workOrder.workers = workOrder.workers.filter(
        w => w.toString() !== worker._id.toString(),
      )
      await WorkOrder.findByIdAndUpdate(workOrderId, workOrder)
    }

    response.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

module.exports = workersRouter
