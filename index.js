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

    var videos = [ "video1.mp4", "video2.mp4", "video3.mp4" ];

    res.send(videos);

})

app.get('/api/video/:filename', function (req, res) {

    var fileName = req.params.filename;

    res.send("Downloading video content for file: " + fileName);

})

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

// Start Express Web Server
app.listen(3000)