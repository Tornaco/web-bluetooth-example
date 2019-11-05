/*
A minimal Web Bluetooth connection example

created 6 Aug 2018
by Tom Igoe
*/
var myDevice;
var myService = 'battery_service';        // fill in a service you're looking for here
var myCharacteristic = 'battery_level';   // fill in a characteristic from the service here

var serviceCharacteristic;

function connect(){
  navigator.bluetooth.requestDevice({
    // filters: [myFilters]       // you can't use filters and acceptAllDevices together
    optionalServices: [myService],
    acceptAllDevices: true
  })
  .then(function(device) {
    // save the device returned so you can disconnect later:
    myDevice = device;
    console.log(device);
    // connect to the device once you find it:
    return device.gatt.connect();
  })
  .then(function(server) {
    // get the primary service:
    return server.getPrimaryService(myService);
  })
  .then(function(service) {
    // get the  characteristic:
    return service.getCharacteristics();
  })
  .then(function(characteristics) {
    // subscribe to the characteristic:
    serviceCharacteristic = characteristics
    for (c in characteristics) {
      characteristics[c].startNotifications()
      .then(subscribeToChanges);
    }
  })
  .catch(function(error) {
    // catch any errors:
    console.error('Connection failed!', error);
  });
}

// subscribe to changes from the meter:
function subscribeToChanges(characteristic) {
  characteristic.oncharacteristicvaluechanged = handleData;
}

// handle incoming data:
function handleData(event) {
  // get the data buffer from the meter:
  var buf = new Uint8Array(event.target.value);
  console.log(buf);
}

// disconnect function:
function disconnect() {
  if (myDevice) {
    // disconnect:
    myDevice.gatt.disconnect();
  }
}

// Send data:
function sendData() {
  var inputValue = document.getElementById("input_data_to_send").value;
  console.log(inputValue)

  if (inputValue && serviceCharacteristic) {
    console.log("Write value");
    console.log(serviceCharacteristic);
    var valueBytes = new TextEncoder().encode(inputValue);
    console.log(valueBytes);

    for (c in serviceCharacteristic) {
      const promise = serviceCharacteristic[c].writeValue(valueBytes);
      promise.then(val => {
        console.log(val);
      });
    }
  }
}
