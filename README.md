# raspberry-pi-node
This is the NodeJS software running on the Raspberry Pi nodes.

## TO INSTALL 
- Open a Terminal and type:

  cd /home/pi
  
  wget https://raw.githubusercontent.com/fmu-zwiers-ecuador/raspberry-pi-node/master/install.sh
  
  chmod 755 install.sh
  
  ./install.sh

- You will be prompted that the installation completed. It will be running at this time. To confirm:

  systemctl status motion

## REST API Endpoints

#### GET /api
 - Returns status information of node.
 
 ```json
 {
  "battery": 57,
  "videoCount": 3,
  "storageAvailable": 5000000000,
  "storageUsed": 500000000
 }
  ```

#### GET /api/video
 - Returns array of videos currently saved.
```json
 [
  "video1.mp4",
  "video2.mp4",
  "video3.mp4",
 ]
 ```
 
#### GET /api/video/{filename}
 - Downloads a video from the node.
 
#### DELETE /api/video/{filename}
 - Deletes a given video from the node.

#### GET /api/sensors
 - Returns any sensor data attached to this node.
 
 ```json
 {
  "fahrenheit": 95,
 }
  ```
 
