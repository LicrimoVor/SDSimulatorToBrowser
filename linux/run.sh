sudo chmod +x /home/browser/wpa_init.sh
sudo chmod +x /home/browser/apt_install.sh
sudo chmod +x /home/browser/usb_setup.sh
sudo chmod +x /home/browser/usb_disable.sh
sudo chmod +x /home/browser/wifi.sh

/home/browser/wpa_init.sh
/home/browser/apt_install.sh

sudo systemctl daemon-reload
sudo systemctl enable usb-mass-storage.service
sudo systemctl start usb-mass-storage.service
sudo systemctl status usb-mass-storage.service