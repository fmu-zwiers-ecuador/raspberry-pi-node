// Raspberry Pi Node
var express = require('express')
var app = express()


console.log('Initializing Raspberry Pi Node');

// Define Node Endpoints
app.get('/', function (req, res) {
    res.send('Raspberry Pi Node')
})

app.get('/api', function (req, res) {

    var status = {
        battery: 57,
        videoCount: 3,
        storageAvailable: 5000000000,
        storageUsed: 500000000
    }

    res.send(status);

})

app.get('/api/video', function (req, res) {

   // var videos = [ "video1.mp4", "video2.mp4", "video3.mp4" ];
   const fs = require("fs");

   let directory = "/Users/lorealanderson/Desktop";
   let dirBuf = Buffer.from(directory);
   let files = fs.readdirSync(directory, '');
   console.log(files);
    //array of files on the pc
    res.send(files);

})

//fs sys module
app.delete('/api/video/:filename', function (req, res) {

    var fileName = req.params.filename;

    res.send("Deleted video from node: " + fileName);

})

app.get('/api/sensors', function (req, res) {

    var sensors = {
        fahrenheit: 95,
    }

    res.send(sensors);
    
})

// ExpressJS serve static files
app.use('/api/download', express.static('/Users/lorealanderson/Desktop'));
//app.use('/api/download', express.static('/home/pi/Desktop/videos'));

// Start Express Web Server
app.listen(3000)