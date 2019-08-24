
#!/usr/bin/python
# Minimal Motion Detection Logic written by Claude Pageau Dec-2014
# Adjustments for FMU Ecuador project by Loreal Anderson Sept-2018
# Adjustments for FMU Ecuador project by Aaron Fulmer Aug-2019
import time
import datetime
import os
import picamera
import picamera.array
import shutil
import subprocess
import sys
from fractions import Fraction

import adafruit_tsl2591
import busio
import psutil
import board

# Create object to reference the TSL2591 (Lux Sensor)
i2c = busio.I2C(board.SCL, board.SDA)
tsl = adafruit_tsl2591.TSL2591(i2c)

# Verify that the images/temp/videos folders exist
rootFolder = "/home/pi/Desktop/"

imageFolder = rootFolder + 'images'
tempFolder = rootFolder + 'temp'
videoFolder = rootFolder + 'videos'

if not os.path.isdir(imageFolder):
    os.makedirs(imageFolder)
if not os.path.isdir(videoFolder):
    os.makedirs(videoFolder)

# Clear out tempFolder
if os.path.isdir(tempFolder):
    shutil.rmtree(tempFolder)
os.makedirs(tempFolder)

# Logging
verbose = True     # False= Non True=Display showMessage

# Motion Settings
threshold = 30     # How Much a pixel has to change
sensitivity = 300  # How Many pixels need to change for motion detection

# Camera Settings
testWidth = 128
testHeight = 80
nightShut = 5.5    # seconds Night shutter Exposure Time default = 5.5  Do not exceed 6 since camera may lock up
nightISO = 800
if nightShut > 6:
    nightShut = 5.9
SECONDS2MICRO = 1000000  # Constant for converting Shutter Speed in Seconds to Microseconds    
nightMaxShut = int(nightShut * SECONDS2MICRO)
nightMaxISO = int(nightISO)
nightSleepSec = 8   # Seconds of long exposure for camera to adjust to low light 

#-----------------------------------------------------------------------------------------------           
def userMotionCode():
    # Users can put code here that needs to be run prior to taking motion capture images
    # Eg Notify or activate something.
    # User code goes here
    
    # Create date timestamps for files
    timestamp  = datetime.datetime.now().strftime("%Y%m%d-%H%M%S") # method calls date/time cast string
    timestamp_jpg  = tempFolder + "/" + timestamp + ".jpg"
    timestamp_mp4  = tempFolder + "/" + timestamp + ".mp4"

    # Capture image
    print("Capturing image...")
    subprocess.call(["raspistill", "-t", "1", "-n", "-o", timestamp_jpg])

    # Move image to 'images' folder
    os.rename(timestamp_jpg, timestamp_jpg.replace("temp", "images"))

    # Capture video
    print("Capturing video...")
    # subprocess.call(["raspivid ", "-t", "10000", "-o", timestamp_mp4])
    subprocess.call(["raspivid", "-t", "15000", "-n", "-o", timestamp_mp4])

    # Move video to 'videos' folder
    os.rename(timestamp_mp4, timestamp_mp4.replace("temp", "videos"))

    return
    
#-----------------------------------------------------------------------------------------------               
def showTime():
    rightNow = datetime.datetime.now()
    currentTime = "%04d%02d%02d-%02d:%02d:%02d" % (rightNow.year, rightNow.month, rightNow.day, rightNow.hour, rightNow.minute, rightNow.second)
    return currentTime    

#-----------------------------------------------------------------------------------------------             
def showMessage(functionName, messageStr):
    if verbose:
        now = showTime()
        print ("%s %s - %s " % (now, functionName, messageStr))
    return

#-----------------------------------------------------------------------------------------------               
def checkForMotion(data1, data2):
    # Find motion between two data streams based on sensitivity and threshold
    motionDetected = False
    pixColor = 1 # red=0 green=1 blue=2
    pixChanges = 0;
    for w in range(0, testWidth):
        for h in range(0, testHeight):
            # get the diff of the pixel. Conversion to int
            # is required to avoid unsigned short overflow.
            pixDiff = abs(int(data1[h][w][pixColor]) - int(data2[h][w][pixColor]))
            if  pixDiff > threshold:
                pixChanges += 1
            if pixChanges > sensitivity:
                break; # break inner loop
        if pixChanges > sensitivity:
            break; #break outer loop.
    if pixChanges > sensitivity:
        motionDetected = True
    return motionDetected 
    
#-----------------------------------------------------------------------------------------------             
def getStreamImage(daymode):
    # Capture an image stream to memory based on daymode
    isDay = daymode
    with picamera.PiCamera() as camera:
        time.sleep(.5)
        camera.resolution = (testWidth, testHeight)
        with picamera.array.PiRGBArray(camera) as stream:
            if isDay:
                camera.exposure_mode = 'auto'
                camera.awb_mode = 'auto' 
            else:
                # Take Low Light image            
                # Set a framerate of 1/6fps, then set shutter
                # speed to 6s and ISO to 800
                camera.framerate = Fraction(1, 6)
                camera.shutter_speed = nightMaxShut
                camera.exposure_mode = 'off'
                camera.iso = nightMaxISO
                # Give the camera a good long time to measure AWB
                # (you may wish to use fixed AWB instead)
                time.sleep( nightSleepSec )
            camera.capture(stream, format='rgb')
            return stream.array

#-----------------------------------------------------------------------------------------------           
def Main():
    '''
    dayTime = True
    msgStr = "Checking for Motion dayTime=%s threshold=%i sensitivity=%i" % ( dayTime, threshold, sensitivity)
    showMessage("Main",msgStr)
    stream1 = getStreamImage(dayTime)
    while True:
        stream2 = getStreamImage(dayTime)
        if checkForMotion(stream1, stream2):
            userMotionCode()
        stream1 = stream2
    '''
    stream1 = getStreamImage(True)		# Get a baseline image for use with camera motion detection
    while True:
        dayTime = tsl.lux > 6			# Repeatedly check light levels to decide between day and night mode
        if dayTime:				        # If there is enough light for day mode...
            try:
                    pid = [p for p in psutil.pids() if psutil.Process(p).name() == "python"]  # Get a list of the PIDs of all rumming instances of python 2
                    print(pid[0])				# Print the first (and, ideally, only) element of the list for debugging
                    os.system("sudo kill " + str(pid[0]))	# As super-user, kill the process
                    stream1 = getStreamImage(True)		    # Get a new baseline image for camera motion detection
            
            except:	# If an exception is thrown in finding the PID of the PIR motion script... (Implying PIR script is not running)
                    stream2 = getStreamImage(True)		    # Take a new picture
                    if checkForMotion(stream1, stream2):	# If there is sufficient difference to indicate motion...
                        userMotionCode()			        # Execute the user motion code
                    stream1 = stream2				        # Set the baseline image to the newest image
        else:					# If there is not enough light for daymode...
            try:
                    pList = [p for p in psutil.pids() if psutil.Process(p).name() == "python"]	# Get a list of the PIDs of all running instances of python 2
                    print(pList)				    # Print the list of PIDs for debugging
                    if len(pList)  == 0:			# If there no running instances of python 2 (PIR script is not running)...
                        print(os.system("sudo python /home/pi/Desktop/pir.py &")) # Start an instance of the PIR script as a super-user
                        time.sleep(0.3)				# Pause the script for 1/3 of a second to allow the process to start
            except:
                    pass
                    '''
                    	Nothing is placed here because if there is an error in starting the PIR script, then day mode should
                    continue to function as normal even if night mode won't. Having all of this in a try-except block allows
                    for this.
                    '''
    return
     
#-----------------------------------------------------------------------------------------------           
if __name__ == '__main__':
    try:
        Main()
    finally:
        print("")
        print("+++++++++++++++++++")
        print("  Exiting Program")
        print("+++++++++++++++++++")
        print("")
               
            
