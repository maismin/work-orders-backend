const workOrdersRouter = require('express').Router()
const Worker = require('../models/worker')
const WorkOrder = require('../models/work-order')
const _ = require('lodash')

workOrdersRouter.get('/', async (request, response, next) => {
  try {
    const sortQuery = {}
    if (!_.isEmpty(request.query)) {
      request.query.sort.split(',').forEach(queryStr => {
        const queryStrSplit = queryStr.split('.')
        sortQuery[queryStrSplit[0]] = queryStrSplit[1]
      })
    }

    const workOrders = await WorkOrder.find({})
      .populate('workers', { name: 1, companyName: 1, email: 1 })
      .sort(sortQuery)
    response.status(200).json(workOrders.map(workOrder => workOrder.toJSON()))
  } catch (exception) {
    next(exception)
  }
})

workOrdersRouter.get('/:id', async (request, response, next) => {
  try {
    const workOrder = await WorkOrder.findById(request.params.id).populate(
      'workers',
      { name: 1, companyName: 1, email: 1 },
    )
    response.status(200).json(workOrder.toJSON())
  } catch (exception) {
    next(exception)
  }
})

workOrdersRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body

    const workOrder = new WorkOrder({
      title: body.title,
      description: body.description,
      deadline: body.deadline,
    })

    const savedWorkOrder = await workOrder.save()
    response.status(201).json(savedWorkOrder.toJSON())
  } catch (exception) {
    next(exception)
  }
})

workOrdersRouter.post(
  '/:workOrderId/workers/:workerId',
  async (request, response, next) => {
    try {
      const worker = await Worker.findById(request.params.workerId)
      const workOrder = await WorkOrder.findById(request.params.workOrderId)

      if (
        workOrder.workers.some(w => w._id.toString() === worker._id.toString())
      ) {
        response.status(400).json({ error: 'Duplicate worker in work order' })
      } else {
        workOrder.workers = workOrder.workers.concat(worker._id)
        workOrder
          .save()
          .then(returnedWorkOrder => {
            returnedWorkOrder
              .populate('workers', { name: 1, companyName: 1, email: 1 })
              .execPopulate()
              .then(async savedWorkOrder => {
                worker.workOrders = worker.workOrders.concat(workOrder._id)
                await worker.save()
                response.status(200).json(savedWorkOrder.toJSON())
              })
          })
          .catch(exception => {
            const error = {}
            if (exception.name === 'ValidationError') {
              error.name = exception.name
              for (let field in exception.errors) {
                error.message = exception.errors[field].message
              }
            }
            next(error)
          })
      }
    } catch (exception) {
      next(exception)
    }
  },
)

module.exports = workOrdersRouter
