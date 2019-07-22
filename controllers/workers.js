const workersRouter = require('express').Router()
const Worker = require('../models/worker')
const WorkOrder = require('../models/work-order')

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
