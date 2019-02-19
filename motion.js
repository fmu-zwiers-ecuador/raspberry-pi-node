// Raspberry Pi Node
var express = require('express');
var app = express();
var diskspace = require('diskspace');
var fs = require('fs');
var os = require('os');

// Initialize Raspberry Pi Node
console.log('Initializing Raspberry Pi Node');

// Add helper functions to be called by API
var motionActive = false;

// Create needed directories
if (!fs.existsSync("/home/pi/Desktop/images")){
    fs.mkdirSync("/home/pi/Desktop/images");
}
if (!fs.existsSync("/home/pi/Desktop/temp")){
    fs.mkdirSync("/home/pi/Desktop/temp");
}
if (!fs.existsSync("/home/pi/Desktop/videos")){
    fs.mkdirSync("/home/pi/Desktop/videos");
}

function startMotion()
{
	require('child_process').spawn('/usr/bin/python', ['/home/pi/raspberry-pi-node/motion.py']);

	console.log('Python motion capture started.');
	motionActive = true;
}

function stopMotion()
{
	require('child_process').execSync('pkill -9 python || true');

	console.log('Python motion capture stopped.');
	motionActive = false;
}

// Kill all current motion capture and then restart.
stopMotion();

// Define Node Endpoints
app.get('/', function (req, res) {
    res.send('Raspberry Pi Node')
})

app.get('/api', function (req, res) {

    diskspace.check('/', function(err, result)
    {

        const dir = '/home/pi/Desktop/videos';
        var fileCount = 0;

        var files = fs.readdirSync(dir);
        fileCount = files.length;

        var status = {
	    batteryLevel: 0,
            motionActive: motionActive,
            videoCount: fileCount,
            storageAvailable: result.total,
            storageFree: result.free,
            storageUsed: result.used,
        }

        res.send(status);
    });

})

app.get('/api/videos', function (req, res) {

    const dir = '/home/pi/Desktop/videos';

    var files = fs.readdirSync(dir);

    var videos = [];

    files.forEach(file => {
        videos.push(file);
    })

    res.send(videos);

})

app.get('/api/motion/start', function (req, res) {

	stopMotion();
	startMotion();

	res.send("Python motion capture started.");

})

app.get('/api/motion/stop', function (req, res) {

	stopMotion(false);

	res.send("Python motion capture stopped.");

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
app.listen(3000);