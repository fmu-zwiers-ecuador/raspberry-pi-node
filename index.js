// Raspberry Pi Node
var express = require('express');
var app = express();
var fs = require('fs');
var os = require('os');

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

//fs sys module
app.delete('/api/video/:filename', function (req, res) {

    var fileName = '';

    if (os.platform() === 'darwin')
    {
        fileName = '/Users/lorealanderson/Desktop/videos/' + req.params.filename;
    }
    else if (os.platform() === 'linux')
    {
        fileName = '/home/pi/Desktop/videos/' + req.params.filename;
    }

    fs.unlink(fileName, (err) => {
        res.send("Deleted video from node: " + fileName);
    });

})

app.delete('/api/image/:filename', function (req, res) {

    var fileName = '';

    if (os.platform() === 'darwin')
    {
        fileName = '/Users/lorealanderson/Desktop/images/' + req.params.filename;
    }
    else if (os.platform() === 'linux')
    {
        fileName = '/home/pi/Desktop/images/' + req.params.filename;
    }

    fs.unlink(fileName, (err) => {
        res.send("Deleted video from node: " + fileName);
    });
})

app.get('/api/sensors', function (req, res) {

    var sensors = {
        fahrenheit: 95,
    }

    res.send(sensors);
    
})

// ExpressJS serve static files
var staticFolder = '';

if (os.platform() === 'darwin')
{
    staticFolder = '/Users/lorealanderson/Desktop';
}
else if (os.platform() === 'linux')
{
    staticFolder = '/home/pi/Desktop';
}

app.use('/api/download/images', express.static(staticFolder + '/images'));
app.use('/api/download/videos', express.static(staticFolder + '/videos'));

// Start Express Web Server
app.listen(3000)