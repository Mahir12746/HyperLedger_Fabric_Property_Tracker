/*
 * Module dependencies
 */
const express = require('express')
const cors = require('cors')
const query = require('./query');
const createProperty = require('./createProperty')
const changeAll = require('./changeAll')
const bodyParser = require('body-parser')


const app = express()

// To control CORSS-ORIGIN-RESOURCE-SHARING( CORS )
app.use(cors())
app.options('*', cors()); 

// To parse encoded data
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 


// get all car
app.get('/get-property', function (req, res) {
    query.main( req.query )
    .then(result => {
        const parsedData = JSON.parse( result )
        let propertyList

        // Check if key or city is provided
        if(  req.query.key){
            if (req.query.key){
                propertyList = [
                    {
                        Key: req.query.key,
                        Record: {
                            ...parsedData
                        }
                    }
                ]
                res.send( propertyList )
                return

            }
        }

        propertyList = parsedData
        res.send( propertyList )
    })
    .catch(err => {
        console.error({ err })
        res.send('FAILED TO GET DATA!')
    })
})

// create a new Property
app.post('/create', function (req, res) {
    createProperty.main( req.body  )
    .then(result => {
        res.send({message: 'Created successfully'})
    })
    .catch(err => {
        console.error({ err })
        res.send('FAILED TO LOAD DATA!')
    })
})

// change Property details
app.post('/update', function (req, res) {
    changeAll.main( req.body  )
    .then(result => {
        res.send({message: 'Updated successfully'})
    })
    .catch(err => {
        console.error({ err })
        res.send('FAILED TO LOAD DATA!')
    })
})

app.listen(3000, () => console.log('Server is running at port 3000'))