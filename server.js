const net = require('net');

// Sunucu ayarları
const HOST = '0.0.0.0';  // Tüm IP adreslerinden gelen bağlantıları kabul etmek için
const PORT = 8001;      // Belirlediğiniz port numarası




// Anlık konum sorgulama: : |L|SK|1||0000001||
//(Örnekte, 17 numaralı sayısal girişin şuandaki değeri sorgulanmıştır. )
//Son durumm sorgulama: Örnek: |L|SD|1||0000001||
//Bağlantı kontrol periyodu ayarı: Örnek: |PC|1||0000001|10|
//Hız aşım alarm ayarı: |L|PH|1||0000001|1|90|30|5|
//Acil durum alarm ayarı(Panik butonu): Örnek: |L|PA|1||0000001|1|1|2|
//TOPLAM ÇALIŞMA SÜRESİ GÖNDERİM PERİYODU AYARI: Örnek: |L|PN|1||0000001|1|10|0| 
//ÇALINMA ALARM VE SİREN PROGRAMLAMA: Örnek: |P3|1||0000001|1|30|60| 
//  


// Yeni bir TCP sunucusu oluşturun
const server = net.createServer((socket) => {
    console.log(`Bağlantı sağlandı: ${socket.remoteAddress}:${socket.remotePort}`);

    // Gelen veriyi al
    socket.on('data', (data) => {
        const message = data.toString();
        console.log(`Alınan veri: ${message}`);
    });

    // Bağlantı sonlandığında
    socket.on('end', () => {
        console.log('Bağlantı sonlandırıldı');
    });

    // Hata durumunda
    socket.on('error', (err) => {
        console.error(`Hata: ${err.message}`);
    });
});

// Sunucuyu belirlenen port üzerinden dinlemeye başla
server.listen(PORT, HOST, () => {
    console.log(`Sunucu dinliyor ${HOST}:${PORT}`);
});
