# comfortbox-api-services
This is the source code repository for my Master's thesis project: RESTful services and automation for comfort-oriented smart devices.

In a nutshell, the goal of this project is to build up proper data-storage and a well-defined RESTful API for ComfortBoxes. Furthermore, I want to add some additional value by allowing to integrate a ComfortBox into workflows.

If you are more interested in the ComfortBox itself, please have a look at the GitHub repository here:  https://github.com/DurandA/comfortbox

### Big picture
<img src="./docs/images/big_picture.png" alt="Big picture" width="500px"/>

### Screenshots
| RabbitMQ                                | KairosDB                                | API Explorer                                    | Grafana                               |
|-----------------------------------------|-----------------------------------------|-------------------------------------------------|---------------------------------------|
| ![RabbitMQ](./docs/images/rabbitmq.png) | ![KairosDB](./docs/images/kairosdb.png) | ![API Explorer](./docs/images/api_explorer.png) | ![Grafana](./docs/images/grafana.png) |

## Installation instructions
For setting up RabbitMQ, KairosDB and Grafana, take a look at the documentation [here](./docs/setup_server.md).


## Run the tests
For running the unit tests, just run `npm install` and `npm test` or directly `./node_modules/.bin/mocha` in the root folder.

The tests use the following libraries:
- [mocha](https://mochajs.org/)
- [chai](http://chaijs.com/)
- [supertest](https://github.com/visionmedia/supertest)

Inspired by: https://stackoverflow.com/questions/35005001/loopback-testing-with-supertest-mocha-and-models#35256151

---
The API is created with [LoopBack](http://loopback.io).
