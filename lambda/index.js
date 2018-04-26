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


'use strict'

const Redis = require('ioredis')
const moment = require('moment')
const zlib = require('zlib')

//---- Constants
const ELASTICACHE_HOST = process.env.ELASTICACHE_HOST
const ELASTICACHE_PORT = process.env.ELASTICACHE_PORT || 6379
process.env.TZ = process.env.TIMEZONE || 'America/New_York'

const ORDERS_KEY = "orders:"
const LATEST_ITEMS_KEY = "orders:items:latest"
const POPULAR_ITEMS_KEY = "orders:items:popular"
const UNIQUE_ITEMS_KEY = "orders:items:"
const SALES_DATA_KEY = "sales:revenue:days"
const SALES_REVENUE_KEY = "sales:revenue:"

const oneWeek = 60*60*24*7

//---- Handler
exports.handler = (event, context, callback) => {
  //---- Redis client
  // Opening the connection to Redis here as we must close for the function to finish
  let client = new Redis(ELASTICACHE_PORT, ELASTICACHE_HOST)

  let recordPromises = event.Records.map((record) => {
    let data = Buffer.from(record.kinesis.data, 'base64').toString('ascii')
    let order = JSON.parse(data)

    // get the timestamp of the order in the producer's local time
    let timestamp = moment(order.timestamp, 'X')
    let today = timestamp.format('YYYYMMDD')
    console.log(`Loading data for ${timestamp.format('MMM DD YYYY')}`)

    let pipeline = client.pipeline()
    
    // increment daily order count
    pipeline.incr(ORDERS_KEY+today)
    pipeline.expire(ORDERS_KEY+today, oneWeek)

    // iterate over items in the order
    var orderRevenue = 0
    for (let item of order.items) {
      // update popular item leaderboard
      pipeline.zincrby(POPULAR_ITEMS_KEY, parseFloat(item.quantity), item.sku)
      
      // update unique count of items sold today
      pipeline.sadd(UNIQUE_ITEMS_KEY+today, item.sku)
      pipeline.expire(UNIQUE_ITEMS_KEY+today, oneWeek)

      // add to the list of latest products purchased
      pipeline.lpush(LATEST_ITEMS_KEY, item.sku)
      pipeline.ltrim(LATEST_ITEMS_KEY, 0, 100)

      // increment order revenue
      orderRevenue += parseFloat(item.quantity) * item.price
    }

    // update sales revenue
    pipeline.zadd(SALES_DATA_KEY, 0, today)
    pipeline.hincrbyfloat(SALES_REVENUE_KEY+today, timestamp.hour(), orderRevenue)
    pipeline.expire(SALES_REVENUE_KEY+today, oneWeek)    

    // execute our pipeline and finish up
    return pipeline.exec((error, results) => {
      if (!error) {
        console.log(`Finished processing order, number ${results[0][1]} of the day`)
      }
    })
  })

  Promise.all(recordPromises)
    .then(result => {
      // publish notification of new data
      client.publish('orders:', 'New order data')
      client.publish('sales:', 'New sales data')

      client.quit()
      callback(null, { message: `Finished processing ${event.Records.length} records` })
    })
    .catch(error => {
      callback(error)
    })
}
