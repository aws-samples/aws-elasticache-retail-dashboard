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

//---- Constants
const PORT = process.env.PORT || 8080
const ELASTICACHE_HOST = process.env.ELASTICACHE_HOST || 'docker.for.mac.localhost'
const ELASTICACHE_PORT = process.env.ELASTICACHE_PORT || 6379
process.env.TZ = process.env.TIMEZONE || 'America/New_York'
const CATALOG = require('./catalog')
const moment = require('moment')

//---- Setup Express and socket.io
const app  = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http, { path: '/socket' })


//--- Subscribe to Redis pub/sub channels
const Redis = require('ioredis')
let subscriber = new Redis(ELASTICACHE_PORT, ELASTICACHE_HOST)

subscriber.on('message', async (channel, message) => {
  if (channel === 'orders:') {
    emitOrderData()
  } else if (channel === 'sales:') {
    emitSalesData()
  }
})

subscriber.subscribe('orders:')
subscriber.subscribe('sales:')



//---- 
let client = new Redis(ELASTICACHE_PORT, ELASTICACHE_HOST)

const today = moment().format('YYYYMMDD')

/**
 * [description]
 * @return {[type]} [description]
 */
const loadOrderData = async () => {
  let orderCount = await client.get(`orders:${today}`)
  let uniqueItemCount = await client.scard(`orders:items:${today}`)
  
  let items = await client.zrevrange('orders:items:popular', 0, 9, 'WITHSCORES')
  let popularItems = items.reduce((acc, item, index) => {
    if (index % 2) return acc
    acc.push({
      count: Number(items[index + 1]),
      name: CATALOG[item].name
    })
    return acc
  }, [])

  let latest = await client.lrange('orders:items:latest', 0, 4)
  let latestSales = latest.reduce((acc, item) => {
    acc.push(CATALOG[item].name)
    return acc
  }, [])

  return {
    orderCount: Number(orderCount),
    popularItems: popularItems,
    uniqueItemCount: Number(uniqueItemCount),
    latestSales: latestSales
  }
}

/**
 * [description]
 * @return {[type]} [description]
 */
const loadSalesData = async () => {
  let dates = await client.zrevrange('sales:revenue:days', 0, 6)

  let result = {}
  for (let date of dates) {
    let sales = await client.hgetall(`sales:revenue:${date}`)

    result[date] = {
      hourly: Object.keys(sales).reduce((n, t) => { n[t] = Number(sales[t]); return n }, {}),
      total:  Object.values(sales).reduce((sum, t) => sum + Number(t), 0)
    }
  }

  return result
}

/**
 * [description]
 * @return {[type]} [description]
 */
const emitOrderData = async () => {
  try {
    let data = await loadOrderData()
    io.emit('orders', data)
  } catch (e) {
    console.error(e)
  }
}

/**
 * [description]
 * @return {[type]} [description]
 */
const emitSalesData = async () => {
  try {
    let data = await loadSalesData()
    io.emit('sales', data)
  } catch (e) {
    console.error(e)
  }
}

// helpful middleware for express + async
// from https://medium.com/@Abazhenov/using-async-await-in-express-with-node-8-b8af872c0016
const asyncMiddleware = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next))
    .catch(next)
}

// and finally, our app
app.get('/', (req, res) => {
  res.send('ok')
})

io.on('connection', (socket) => {
  emitSalesData()
  emitOrderData()
})

// helpful api endpoints if you want to view data in your browser
app.get('/data/orders', asyncMiddleware(async (req, res, next) => {
  let data = await loadOrderData()
  res.json(data)
}))

app.get('/data/sales', asyncMiddleware(async (req, res, next) => {
  let data = await loadSalesData()
  res.json(data)
}))

http.listen(PORT, () => {
  console.log(`Connecting to ElastiCache ${ELASTICACHE_HOST}`)
  console.log(`Listening on port ${PORT}`)
})
