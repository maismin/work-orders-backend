const Worker = require('../models/worker')
const WorkOrder = require('../models/work-order')

const initialWorkers = [
  {
    name: 'Alice',
    companyName: 'Apple',
    email: 'alice@apple.com',
  },
  {
    name: 'Felix',
    companyName: 'Facebook',
    email: 'felix@facebook.com',
  },
  {
    name: 'Mike',
    companyName: 'Microsoft',
    email: 'mike@microsoft.com',
  },
  {
    name: 'Lisa',
    companyName: 'LinkedIn',
    email: 'lisa@linkedin.com',
  },
  {
    name: 'Ursula',
    companyName: 'Uber',
    email: 'ursula@uber.com',
  },
  {
    name: 'Sarah',
    companyName: 'Samsung',
    email: 'sarah@samsung.com',
  },
]

let deadline = new Date(Date.now())
deadline.setFullYear(deadline.getFullYear() + 5)
const initialWorkOrders = [
  {
    title: 'Create new app',
    description: 'a new app that will revolutionize the world',
    deadline,
  },
  {
    title: 'Breaking edge iPhone',
    description: 'the next iPhone',
    deadline,
  },
  {
    title: 'ProjectX',
    description: 'XXXX',
    deadline,
  },
  {
    title: 'SECRET',
    description: 'all your base belongs to us',
    deadline,
  },
  {
    title: 'Witcher',
    description: '!!!',
    deadline,
  },
]

const workersInDB = async () => {
  const workers = await Worker.find({})
  return workers.map(worker => worker.toJSON())
}

const workOrdersInDB = async () => {
  const workOrders = await WorkOrder.find({})
  return workOrders.map(workOrder => workOrder.toJSON())
}

module.exports = {
  initialWorkers,
  initialWorkOrders,
  workersInDB,
  workOrdersInDB,
}
