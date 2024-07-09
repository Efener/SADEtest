var amqp = require('amqplib/callback_api');
const multichain = require("multichain-node")({
  port: 6720,
  host: "192.168.56.1",
  user: "multichainrpc",
  pass: "9Nu8Gb3jodHToyfadAnNPa1BTqr6k8xyk6PXnXZDLhfc",
  timeout: 30000, 
});

var bunyan = require('bunyan');
var log = bunyan.createLogger({
  name: 'myapp',
  streams: [
    {
      level: 'info',
      stream: process.stdout// log INFO and above to stdout
    },
    {
      level: 'error',
      path: '../myapp-error.log'  // log ERROR and above to a file
    }
  ]
});

//RABBITMQ'DAN TEST YOLLA localhost:7235'de arayüz var.















async function read_Send() {
  try {
    amqp.connect('amqp://localhost', function(error0, connection) {
      if (error0) {
        throw error0;
      }
      connection.createChannel(function(error1, channel) {
        if (error1) {
          throw error1;
        }

        var queue = 'hello2';

        channel.assertQueue(queue, {
          durable: false
        });

        channel.prefetch(1);

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, async function(msg) {
          console.log(" [x] Received %s", msg.content.toString());
          let payload = JSON.parse(msg.content.toString());

          try {
            const gelenData = payload; // RABBITMQ'DAN GELECEK DATA

            if (gelenData != null || gelenData.clientID != null) {
              const streamName = gelenData.clientID.toString(); 
              console.log(streamName);
              let streamList = await multichain.listStreams();

              if (!streamList.some((stream) => stream.name === streamName)) {
                await multichain.create({
                  type: "stream",
                  name: streamName,
                  restrict: "write",
                  open: true,
                });
              }
              const publishData = {
                json: [
                  {
                    temperature: gelenData.SensorData.temperature,
                    value: gelenData.SensorData.value,
                    gatewayId: gelenData.SensorData.gatewayId,
                    date: gelenData.SensorData.date,
                    batteryLevel: gelenData.SensorData.batteryLevel,
                    signalLevel: gelenData.SensorData.signalLevel,
                    error: gelenData.SensorData.error,
                    index: gelenData.SensorData.index,
                    latitude: gelenData.SensorData.latitude,
                    longitude: gelenData.SensorData.longitude,
                  },
                ],
              };
              await multichain.publish({
                stream: streamName,
                key: gelenData.ThingId.toString(), 
                data: publishData, 
              });
            }

            console.log("Başarılı");
            channel.ack(msg); 
          } catch (error) {
            log.error(error);
            console.error("Hata:", error);
            throw error; // Hata fırlatılıyor
          }
        }, {
          noAck: false // noAck'i false yaparak manuel onaylama kullanın
        });
      });
    });
  } catch (error) {
    log.error(error);
    console.error("Hata:", error);
  }
}



read_Send();
   
module.exports = { read_Send };
    
  
