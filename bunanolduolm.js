const mqtt = require("mqtt");
const xlsx = require("xlsx");
const client = mqtt.connect("mqtt://broker.emqx.io"); // Protokol ile birlikte URL
const multichain = require("multichain-node")({
  port: 6720,
  host: "192.168.56.1",
  user: "multichainrpc",
  pass: "9Nu8Gb3jodHToyfadAnNPa1BTqr6k8xyk6PXnXZDLhfc",
  timeout: 30000, 
});

const fileName = "test_kayit.xlsx";
const fs = require("fs");

setInterval(() => {
  read_Send()
}, 500);


//  MQTT TEST
// Excel dosyasını yükle
const workbook =  xlsx.readFile("Sensor_Data.xlsx");
const sheetName = workbook.SheetNames[0]; // İlk sayfayı seçiyoruz
const worksheet = workbook.Sheets[sheetName];


let test = xlsx.utils.sheet_to_json(worksheet);

 client.on("connect", () => {
  console.log("Bağlantı sağlandı!");
  client.subscribe("presence", (err) => {
    if (!err) {
      console.log("Konuya abone olundu: presence");

      // Excel'den okunan verileri MQTT ile gönder
      test.forEach((row) => {
        client.publish("presence", JSON.stringify([row]));
      });
    }
  });
}); 






















// Client side



client.on("message", async (topic, message) => {
  let parsedMessage;
  try {
    parsedMessage = JSON.parse(message.toString())[0];
    console.log(parsedMessage);
    if (!fs.existsSync(fileName)) {  // dosya yoksa oluştur
      const newWorkbook = xlsx.utils.book_new();
      const newWorksheet = xlsx.utils.json_to_sheet([]);
      xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, "Sheet1");
      xlsx.writeFile(newWorkbook, fileName);
    }
    // Gelen veriyi excel dosyasının sonuna eklemek için oku
    const test_database = xlsx.readFile("test_kayit.xlsx"); // kayitlarımızı okuduk.

    const sheet = test_database.Sheets[test_database.SheetNames[0]];
    const database = xlsx.utils.sheet_to_json(sheet); // json'a çektik




          // Gelen veriyi excel dosyasının sonuna ekle
        const newRow = {
          SensorId: parsedMessage.SensorId,
          SensorData: parsedMessage.SensorData,
          ThingId: parsedMessage.ThingId,
        };
        database.push(newRow);
        const newWorksheet = xlsx.utils.json_to_sheet(database);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, test_database.SheetNames[0]);
        xlsx.writeFile(newWorkbook, "test_kayit.xlsx");
  
    
      }
      catch(err)
      {
        console.error("Hata:", err);
      }
    })
      



  

   

async function read_Send() {
    

  try {
      
  // sunucu giderse ramdeki her şey gider diye özellikle her seferinde tek tek excel güncellenir ve tekrar açılır.
  const test_database = xlsx.readFile("test_kayit.xlsx"); // kayitlarımızı okuduk.
  const sheet = test_database.Sheets[test_database.SheetNames[0]];
  const database = xlsx.utils.sheet_to_json(sheet); // json'a çektik
  
  const firstRow = database[0];
  
  
  if (firstRow != null ) {
  
  
  const streamName = firstRow.SensorId.toString(); // Stream adını string yap
  console.log(streamName);
  // Streamlerin listesini al
  let streamList = await multichain.listStreams();
  
  // Eğer stream yoksa, oluştur
  if (!streamList.some((stream) => stream.name === streamName)) {
    await multichain.create({
      type: "stream",
      name: streamName,
      restrict: "write",
      open: true,
    });
  }
  
  
  
  
   
  /*      const excelData = {
          SensorData: {
            temperature: firstRow.SensorData.temperature,
            value: firstRow.SensorData.value,
            gatewayId: firstRow.SensorData.gatewayId,
            date: firstRow.SensorData.date,
            batteryLevel: firstRow.SensorData.batteryLevel,
            signalLevel: firstRow.SensorData.signalLevel,
            error: firstRow.SensorData.error,
            index: firstRow.SensorData.index,
            latitude: firstRow.SensorData.latitude,
            longitude: firstRow.SensorData.longitude,
          },
        }; */
        const publishData = {
          json: [
            {
              temperature: firstRow.SensorData.temperature,
              value: firstRow.SensorData.value,
              gatewayId: firstRow.SensorData.gatewayId,
              date: firstRow.SensorData.date,
              batteryLevel: firstRow.SensorData.batteryLevel,
              signalLevel: firstRow.SensorData.signalLevel,
              error: firstRow.SensorData.error,
              index: firstRow.SensorData.index,
              latitude: firstRow.SensorData.latitude,
              longitude: firstRow.SensorData.longitude,
            },
          ],
        };
        await multichain.publish({
          stream: streamName,
          key: firstRow.ThingId.toString(), // Key'i string yap
          data: publishData, // Veriyi JSON string yaparak sakla
        });
  
        // Başarılı publish sonrası ilk satırı sil ve dosyayı güncelle
        const remainingData = database.slice(1); // İlk satırı çıkar
        const updatedWorksheet = xlsx.utils.json_to_sheet(remainingData);
        const updatedWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(updatedWorkbook, updatedWorksheet, test_database.SheetNames[0]);
        xlsx.writeFile(updatedWorkbook, "test_kayit.xlsx");
      } 
  

      console.log("Başarılı");
  
  }
  catch (error) {
      console.error("Hata:", error);
  }
  
  }
  

   
module.exports = { read_Send };
    
  