/**
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

const AWS = require('aws-sdk')
const Catalog = require('./catalog')
const program = require('commander')
const moment = require('moment')
const fs = require('fs')

const MAX_ORDER_SIZE = 5
const MAX_ORDERS_PER_DAY = 20

const TIMEZONE_FILE = 'timezone.txt'
const DEFAULT_TIMEZONE = 'America/New_York'

// setup kinesis client
const kinesis = new AWS.Kinesis()

//
const getRandomInt = (max, min = 0) => {
  return Math.floor(Math.random() * (max - min) + min)
}

//
const getRandomTimeOn = (day = moment()) => {
  let startOfDay = day.startOf('date')
  let endOfDay = day.clone().endOf('day')

  let timestamp = getRandomInt(endOfDay, startOfDay)
  return moment(timestamp)
}

//
const generateItem = () => {
  let index = getRandomInt(Object.keys(Catalog).length)

  let item = {
    sku: Object.keys(Catalog)[index],
    name: Object.values(Catalog)[index].name,
    price: Object.values(Catalog)[index].price,
    quantity: getRandomInt(4)
  }

  return item
}

//
const generateOrder = (date) => {
  let orderSize = getRandomInt(MAX_ORDER_SIZE, 1)
  let order = {
    timestamp: date.format('X'),
    items: Array(orderSize).fill().map(i => generateItem())
  }

  return order
}

//
const pushOrdersToKinesis = (streamName, orders) => {
  let params = {
    Records: orders,
    StreamName: streamName
  }

  kinesis.putRecords(params, (error, data) => {
    if (error) {
      console.error(error)
    } else {
      console.log('...Pushed new orders to Kinesis')
    }
  })
}

//
const generateHistoricalData = (streamName) => {
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    let date = moment().subtract(dayOffset, 'days')
    let orderCount = getRandomInt(MAX_ORDERS_PER_DAY)
    
    let records = Array.from({length: orderCount}).reduce(acc => {
      let record = {
        Data: JSON.stringify(generateOrder(getRandomTimeOn(date))),
        PartitionKey: 'one'
      }

      acc.push(record)
      return acc
    }, [])

    console.log(`Generating orders for ${date.format('MMM DD YYYY')}`)
    pushOrdersToKinesis(streamName, records)
  }
}

//
program
  .version('1.0.0')
  .description('Sample order generator for Amazon ElastiCache Retail Dashboard')

program
  .command('generateOrders <kinesisStreamName>')
  .description('Generate orders and push to Kinesis')
  .action((kinesisStream, cmd) => {
    fs.readFile(TIMEZONE_FILE, (error, data) => {
      if (error) {
        console.warn(`Unable to load timezone, setting to ${DEFAULT_TIMEZONE}`)
        process.env.TZ = DEFAULT_TIMEZONE
      }

      console.log(`Setting timezone to ${data}`)
      process.env.TZ = data
      generateHistoricalData(kinesisStream)
    })
  })

program.parse(process.argv)
