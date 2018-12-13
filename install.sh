# Install updates
sudo apt-get update
sudo apt-get -y upgrade

# Install dependencies
sudo apt-get install -y nano python nodejs npm git

# Download latest code from repo
cd /home/pi
git clone https://github.com/fmu-zwiers-ecuador/raspberry-pi-node.git
cd raspberry-pi-node
npm install
cd ../

# Install motion service
sudo cp raspberry-pi-node/motion.service /etc/systemd/system/motion.service
sudo systemctl start motion.service
sudo systemctl enable motion.service

# Inform user the installation is complete
echo 
echo 
echo Motion service installed!