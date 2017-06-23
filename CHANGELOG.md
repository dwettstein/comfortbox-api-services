# Change Log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]
### Added
- Switch DB to Cassandra

## [0.2.0] - 2017-06-09
### Added
- Function setWorktime for configuring ComfortBox
- Optional property `labels` (array of strings) to model ComfortBox

## [0.1.0] - 2017-05-19
### Added
- Configure ComfortBox with unified API:
  - setInterval
  - setMqttHost
  - setShowDataRegularly
  - displayData
  - displayHexColor
  - displayLed
  - displayText
- Check if a ComfortBox is online
- Query data of a ComfortBox
- List all ComfortBoxes in DB
- List all metric names of a ComfortBox in DB
- Automatically register unknown ComfortBoxes which occur in the message queue
- Use HTTPS for communicating with API and server
- Brief documentation about setting up the server

[Unreleased]: https://github.com/dwettstein/comfortbox-api-services/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/dwettstein/comfortbox-api-services/tree/v0.2.0
[0.1.0]: https://github.com/dwettstein/comfortbox-api-services/tree/v0.1.0
