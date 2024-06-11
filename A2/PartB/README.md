# HTTP Server to communicate with Hyperledger fabric

Provides CRUD APIS for Hyperledger fabric deployed on local using Microfab.  
I'm running a Node.js application with fastify to serve these requests.

## Setup
> NOTE: Please configure your node version to v12 before running the command

Please run the below command to install all the required dependencies for the project.
```bash
npm i
```
## Running the server
Please run the below command to start the server.
```bash
npm start
```

## APIs
List of CRUD APIs.

| Name | API
-|-
CREATE| curl --request POST \ --url http://localhost:8000/asset \ --header 'Content-Type: application/json' \ --data '{ "id": "123", "value": "someValue" }' 
READ | curl --request GET \ --url http://localhost:8000/asset/123
UPDATE | curl --request PUT \ --url http://localhost:8000/asset/123 \ --header 'Content-Type: application/json' \ --data '{ "id": "123", "value": "Vaibhav" }'
DELETE | curl --request DELETE \ --url http://localhost:8000/asset/123 \ --header 'Content-Type: application/json' \ --data '{}' 