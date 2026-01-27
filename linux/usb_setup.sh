#!/bin/bash
# setup-usb-mass-storage.sh
# Сохранить как: /usr/local/bin/setup-usb-mass-storage.sh

set -e  # Выход при ошибке

echo "=== Настройка USB Mass Storage на Raspberry Pi Zero ==="

# 0. Проверяем, запущены ли мы с правами root
if [ "$EUID" -ne 0 ]; then 
    echo "ОШИБКА: Скрипт должен запускаться с правами root"
    echo "Используйте: sudo $0"
    exit 1
fi

# 1. Подготавливаем файл образа
echo "1. Подготовка файла образа..."
FLASH_IMG="/opt/usb/flash.img"
FLASH_MOUNT="/mnt/usb_shared"

# Создаем директории если их нет
mkdir -p /opt/usb
mkdir -p "$FLASH_MOUNT"

# Создаем файл образа только если его нет
if [ ! -f "$FLASH_IMG" ]; then
    echo "  Создаем новый файл образа (1GB)..."
    # Создаем файл 1GB (можно изменить count для другого размера)
    # 1024 * 1M = 1GB
    dd if=/dev/zero of="$FLASH_IMG" bs=1M count=1024 status=progress
    
    echo "  Форматируем в FAT32..."
    # Форматируем в FAT32 для максимальной совместимости
    mkfs.vfat -F 32 -n "PIZEROFLASH" "$FLASH_IMG"
    echo "  Файл образа создан: $FLASH_IMG"
else
    echo "  Используем существующий файл образа: $FLASH_IMG"
fi

# 2. Загружаем необходимые модули ядра
echo "2. Загрузка модулей ядра..."
modprobe libcomposite
modprobe usb_f_mass_storage

# Проверяем что модули загрузились
if ! lsmod | grep -q "libcomposite"; then
    echo "  ОШИБКА: Не удалось загрузить модуль libcomposite"
    exit 1
fi

# 3. Останавливаем текущий гаджет если он запущен
echo "3. Очистка предыдущей конфигурации..."
if [ -d /sys/kernel/config/usb_gadget/flash ]; then
    echo "  Отключаем существующий гаджет..."
    echo "" > /sys/kernel/config/usb_gadget/flash/UDC 2>/dev/null || true
    sleep 1
    rm -rf /sys/kernel/config/usb_gadget/flash
    echo "  Старый гаджет удален"
fi

# 4. Создаем новый USB гаджет
echo "4. Создание нового USB гаджета..."
cd /sys/kernel/config/usb_gadget/
mkdir flash
cd flash

# 5. Настраиваем USB дескрипторы
echo "5. Настройка USB дескрипторов..."
# VID/PID для имитации стандартной флешки
echo 0x1d6b > idVendor          # Linux Foundation
echo 0x0104 > idProduct         # Multifunction Composite Gadget
echo 0x0200 > bcdUSB            # USB 2.0
echo 0x0100 > bcdDevice         # Device version

# 6. Строковые дескрипторы (отображаются в системе)
echo "6. Настройка строковых дескрипторов..."
mkdir -p strings/0x409
echo "1234567890ABCDEF" > strings/0x409/serialnumber
echo "Raspberry Pi" > strings/0x409/manufacturer
echo "Pi Zero Flash Drive" > strings/0x409/product

# 7. Создаем конфигурацию
echo "7. Создание конфигурации..."
mkdir -p configs/c.1/strings/0x409
echo "Mass Storage Configuration" > configs/c.1/strings/0x409/configuration
echo 250 > configs/c.1/MaxPower  # 500mA

# 8. Настраиваем функцию Mass Storage
echo "8. Настройка функции Mass Storage..."
mkdir -p functions/mass_storage.0

# Критически важные настройки:
echo 0 > functions/mass_storage.0/stall           # ДОЛЖНО БЫТЬ 0!
echo 1 > functions/mass_storage.0/lun.0/removable # 1 = съемное устройство
echo 0 > functions/mass_storage.0/lun.0/ro        # 0 = доступно для записи
echo "$FLASH_IMG" > functions/mass_storage.0/lun.0/file

# Дополнительные настройки для лучшей совместимости
echo 0 > functions/mass_storage.0/lun.0/cdrom
echo 0 > functions/mass_storage.0/lun.0/nofua

# 9. Привязываем функцию к конфигурации
echo "9. Привязка функции к конфигурации..."
ln -s functions/mass_storage.0 configs/c.1/

# 10. Активируем гаджет
echo "10. Активация USB гаджета..."
# Получаем имя USB контроллера
UDC_NAME=$(ls /sys/class/udc/)
if [ -z "$UDC_NAME" ]; then
    echo "  ОШИБКА: Не найден USB контроллер (UDC)"
    echo "  Проверьте: ls /sys/class/udc/"
    exit 1
fi

echo "  Используем контроллер: $UDC_NAME"
echo "$UDC_NAME" > UDC

# 11. Проверяем активацию
echo "11. Проверка активации..."
sleep 2
if grep -q "$UDC_NAME" UDC; then
    echo "  ✓ USB гаджет успешно активирован"
else
    echo "  ✗ Ошибка активации USB гаджета"
    exit 1
fi

# 12. Монтируем образ для доступа с Pi
echo "12. Монтирование образа для локального доступа..."
umount "$FLASH_MOUNT" 2>/dev/null || true
mount -o loop,rw,uid=1000,gid=1000 "$FLASH_IMG" "$FLASH_MOUNT"
if mountpoint -q "$FLASH_MOUNT"; then
    echo "  ✓ Образ смонтирован в $FLASH_MOUNT"
else
    echo "  ✗ Ошибка монтирования образа"
fi

echo ""
echo "=== Готово! ==="
echo "Raspberry Pi Zero теперь эмулирует USB флешку"
echo "Файл образа: $FLASH_IMG"
echo "Локальная точка монтирования: $FLASH_MOUNT"
echo ""
echo "Подключите Pi Zero к компьютеру через microUSB порт (не power!)"