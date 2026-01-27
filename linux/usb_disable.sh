#!/bin/bash
# disable-usb-gadget.sh
# Сохранить как: /usr/local/bin/disable-usb-gadget.sh

echo "=== Отключение USB Mass Storage ==="

if [ -d /sys/kernel/config/usb_gadget/flash ]; then
    echo "Отключаем USB гаджет..."
    # Размонтируем
    umount /mnt/usb_shared 2>/dev/null || true
    
    # Отключаем
    echo "" > /sys/kernel/config/usb_gadget/flash/UDC 2>/dev/null || true
    sleep 1
    
    # Удаляем
    rm -rf /sys/kernel/config/usb_gadget/flash
    echo "USB гаджет отключен"
else
    echo "USB гаджет не активен"
fi