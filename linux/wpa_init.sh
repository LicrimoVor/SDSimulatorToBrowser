sudo rfkill unblock all
sleep 1
sudo wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf
ip addr show