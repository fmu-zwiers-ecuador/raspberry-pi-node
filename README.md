# raspberry-pi-node
This is the NodeJS software running on the Raspberry Pi nodes.

### Endpoints

GET /
 - Returns status information of node.
 
 {
  battery: 57,
  videoCount: 14,
  
 }

GET /video
 - Returns array of videos currently saved.
 
 [
  "/opt/fmu/videos/video1.mp4",
  "/opt/fmu/videos/video2.mp4",
  "/opt/fmu/videos/video3.mp4",
 ]
