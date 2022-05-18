# todd-coin-api

Todd Coin is a Cryptocurrency for Good.

This is the Todd Coin Application Programming Interface (API)

The Todd Coin API adheres to the [JSON API](https://jsonapi.org/format/) standard.

# Releases

The Todd Coin API is distributed as a Docker container.

[![Release](https://github.com/xilution/todd-coin-api/actions/workflows/release.yml/badge.svg)](https://github.com/xilution/todd-coin-api/actions/workflows/release.yml)

https://hub.docker.com/r/xilution/todd-coin-api

# Development

## First Things First

`npm install`

## To Build the Docker Image

`npm run docker-build`

## To Start the Database and API

`npm run docker-componse-up`

## To Initialize the Database

This is a one time task

`npm run init-db`

## To Stop the Database and API

`npm run docker-componse-down`

## To View Database and Node Logs

`npm run docker-componse-logs`

## To Delete the Database Data

`rm -rf ~/.todd-coin/pg-data`
