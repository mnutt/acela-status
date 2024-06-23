#!/usr/bin/env node

const Table = require('cli-table3');

const origin = process.argv[2] || 'nyp';
const dest = process.argv[3] || 'rte';

const day = new Date().toISOString().split('T')[0];

const url = `https://www.amtrak.com/dotcom/travel-service/statuses/stations?origin-code=${origin}&destination-code=${dest}&departure-date=${day}`;
const referer = 'https://www.amtrak.com/tickets/train-status.html';

function time(dateString) {
  return dateString.match(/[\d\-]+T([\d\:]+)/)[1];
}

(async () => {
  const response = await fetch(url, {
    method: 'GET',
    headers: { referer }
  });

  const apiResponse = await response.json();

  if (!apiResponse.data) {
    console.error(apiResponse);
  }

  const trains = apiResponse.data.map(segment => {
    const train = segment.travelLegs[0];
    const travelService = train.travelService;
    const origin = train.origin;
    const destination = train.destination;

    return {
      TrainNumber: travelService.number,
      DepartureTime: time(origin.departure.schedule.dateTime),
      ArrivalTime: time(destination.arrival.schedule.dateTime),
      Status: destination.arrival.statusInfo.status,
      Message: destination.arrival.statusInfo.displayMessage || ""
    };
  });

  // Create a table
  const table = new Table({
    head: ['Train Number', 'Status', 'Departure Time', 'Arrival Time', 'Message'],
    colWidths: [15, 13, 17, 15, 30]
  });

  // Add rows to the table
  trains.forEach(train => {
    table.push([
      train.TrainNumber,
      train.Status,
      train.DepartureTime,
      train.ArrivalTime,
      train.Message
    ]);
  });

  console.log('');
  console.log(`========================================================================`);
  console.log(`ACELA Trains from ${origin} to ${dest} on ${day}:`);
  console.log(`========================================================================`);
  console.log('');

  // Display the table
  console.log(table.toString());

})();
