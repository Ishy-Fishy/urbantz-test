const low = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const adapter = new FileAsync('db.json');
const config = require('../db.config.json');
const {StatusEnum} = require('./enums')

const db = (async () => {
  const _db = await low(adapter);
  await _db.defaults(config).write();
  return _db;
})()

async function getOhmById(id) {
  const _db = await db;
  const ohm = _db.get('ohms')
      .find({id})
      .value()

  return ohm;
}

async function updateById(id, payload) {
  const _db = await db;

  const ohm = await _db.get('ohms')
      .find({id})
      .assign(payload)
      .write()

  return ohm;
}

function validateNextStatus(ohm, status) {
  const statusOptionOrder = [
    StatusEnum.CREATED,
    StatusEnum.PREPARING,
    // Added an extra bogus status in the middle just to showcase the flexibility of the status transition system
    [StatusEnum.READY, 'PREPARED'],
    StatusEnum.IN_DELIVERY,
    [StatusEnum.DELIVERED, StatusEnum.REFUSED]
  ]
  const ohmStatusIndex = _findOptionIndex(statusOptionOrder, ohm.status)
  return _indexContainsOption(ohmStatusIndex + 1, statusOptionOrder, status)
}

function _indexContainsOption(index, statusArr, option) {
  const options = statusArr[index];
  if (Array.isArray(options)) {
    return options.includes(option)
  }
  return options === option
}

function _findOptionIndex(statusArr, option) {
  return statusArr.findIndex((statusOption) => {
    if (Array.isArray(statusOption)) {
      return statusOption.includes(option)
    }
    return statusOption === option;
  })
}

module.exports = {getOhmById, updateById, validateNextStatus}