/* eslint-disable no-console */
/* eslint no-param-reassign: ["error", { "props": false }] */
const AWS = require('aws-sdk'); // eslint-disable-line
const uuid = require('node-uuid');

function display(object) {
  return JSON.stringify(object, null, 2);
}

function removeEmptyStringElements(obj) {
  for (var prop in obj) { // eslint-disable-line
    if (typeof obj[prop] === 'object') { // dive deeper in
      removeEmptyStringElements(obj[prop]);
    } else if (obj[prop] === '') { // delete elements that are empty strings
      delete obj[prop];
    }
  }
  return obj;
}

module.exports.leads = (event, context, callback) => {
  console.log('Event: ', display(event));
  console.log('Context: ', display(context));
  const dynamoDb = new AWS.DynamoDB.DocumentClient();

  const done = (err, res) => {
    if (err) {
      console.error(err);
    }
    callback(null, {
      statusCode: err ? '400' : '200',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: err ? display(err) : JSON.stringify(res),
    });
  };

  switch (event.httpMethod) {
    case 'GET':
      dynamoDb.scan({ TableName: 'ga_lead_excercise' }, done);
      break;
    case 'POST': {
      const item = removeEmptyStringElements(JSON.parse(event.body).payload.Item);
      item.id = uuid.v1();
      item.createdAt = Date.now();
      console.log(item);
      dynamoDb.put({
        TableName: 'ga_lead_excercise',
        Item: item,
      }, done);
      break;
    }
    case 'PUT':
      dynamoDb.get({
        TableName: 'ga_lead_excercise',
        Key: {
          id: event.queryStringParameters.id,
        },
      }, (err) => {
        if (err) {
          done(err);
        } else {
          const item = removeEmptyStringElements(JSON.parse(event.body).payload.Item);
          item.id = event.queryStringParameters.id;
          dynamoDb.put({
            TableName: 'ga_lead_excercise',
            Item: item,
          }, done);
        }
      });
      break;
    case 'DELETE':
      dynamoDb.delete({
        TableName: 'ga_lead_excercise',
        Key: {
          id: event.queryStringParameters.id,
        },
      }, done);
      break;
    default:

  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
};

module.exports.ga = (event, context) => {
  console.log('Event: ', display(event));
  console.log('Context: ', display(context));
};
