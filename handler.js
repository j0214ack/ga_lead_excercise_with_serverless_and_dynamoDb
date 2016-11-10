const AWS = require('aws-sdk'); // eslint-disable-line
const uuid = require('node-uuid');

function display(object) {
  return JSON.stringify(object, null, 2);
}

module.exports.leads = (event, context, callback) => {
  console.log('Event: ', display(event));
  console.log('Context: ', display(context));
  console.log('event recieved');
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  console.log('db client created');
  const done = (err, res) => {
    if (err) {
      console.error(err);
    }
    callback(null, {
      statusCode: err ? '400' : '200',
      headers: {
        'Content-Type': 'application/json',
      },
      body: err ? display(err) : JSON.stringify(res),
    });
  };
  switch (event.httpMethod) {
    case 'GET':
      console.log('GET method detected');
      dynamoDb.scan({ TableName: 'ga_lead_excercise' }, done);
      break;
    case 'POST': {
      console.log('POST method detected');
      const item = JSON.parse(event.body).payload.Item;
      item.id = uuid.v1();
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
          const item = JSON.parse(event.body).payload.Item;
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
