# Install updates
sudo apt-get update
sudo apt-get -y upgrade

# Install dependencies
sudo apt-get install -y nano python nodejs git

# Download latest code from repo
cd /home/pi
git clone https://github.com/fmu-zwiers-ecuador/raspberry-pi-node.git

# Install motion service
sudo cp raspberry-pi-node/motion.service /etc/systemd/system/motion.service
sudo systemctl start motion.service
sudo systemctl enable motion.service

# Inform user the installation is complete
echo Motion service installed!