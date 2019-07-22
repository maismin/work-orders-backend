const mongoose = require('mongoose')
require('mongoose-type-email')
const uniqueValidator = require('mongoose-unique-validator')

mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

const workerSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  companyName: String,
  email: {
    type: mongoose.SchemaTypes.Email,
    unique: true,
    required: true,
  },
  workOrders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkOrder',
    },
  ],
})

workerSchema.plugin(uniqueValidator)

workerSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Worker', workerSchema)
