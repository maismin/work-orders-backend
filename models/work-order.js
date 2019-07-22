const mongoose = require('mongoose')

const arrayLimit = arr => arr && arr.length <= 5

const workOrdersSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  deadline: {
    type: Date,
    min: new Date(),
    required: true,
  },
  workers: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Worker',
      },
    ],
    validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
  },
})

workOrdersSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('WorkOrder', workOrdersSchema)
