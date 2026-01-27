#!/bin/bash

# Проверка прав
if [ "$EUID" -ne 0 ]; then 
    echo "ОШИБКА: Скрипт должен запускаться с правами root"
    echo "Используйте: sudo $0 <filesystem>"
    echo "Доступные файловые системы: fat32, ntfs, exfat, ext4"
    exit 1
fi

# Параметры
IMG="/opt/usb/flash.img"
NEW_FS="${1:-ntfs}"  # По умолчанию NTFS
MOUNT_POINT="/mnt/usb_shared"
TEMP_MOUNT="/mnt/temp_fs"
SIZE_MB=1024  # Размер 1GB

# Проверяем доступные файловые системы
VALID_FS=("fat32" "ntfs" "exfat" "ext4")
if [[ ! " ${VALID_FS[@]} " =~ " ${NEW_FS} " ]]; then
    echo "❌ Неизвестная файловая система: $NEW_FS"
    echo "Доступные: ${VALID_FS[*]}"
    exit 1
fi

echo "=== Универсальный скрипт смены файловой системы ==="
echo "Целевая ФС: $NEW_FS"
echo "Файл образа: $IMG"
echo "=================================================="

# Функция для проверки установленных пакетов
check_packages() {
    case "$NEW_FS" in
        ntfs)
            if ! command -v mkfs.ntfs &> /dev/null; then
                echo "Установка ntfs-3g для поддержки NTFS..."
                apt-get update && apt-get install -y ntfs-3g
            fi
            ;;
        exfat)
            if ! command -v mkfs.exfat &> /dev/null; then
                echo "Установка exfat-utils для поддержки exFAT..."
                apt-get update && apt-get install -y exfat-utils
            fi
            ;;
    esac
}

# Функция для копирования данных с текущей ФС
backup_data() {
    echo "1. Попытка резервного копирования данных..."
    
    BACKUP_DIR="/tmp/usb_backup_$(date +%s)"
    mkdir -p "$BACKUP_DIR"
    
    # Пробуем разные методы монтирования
    local mounted=false
    
    # Метод 1: Прямое монтирование образа
    for fs_type in vfat ntfs exfat ext4; do
        echo -n "  Пробуем $fs_type: "
        
        case $fs_type in
            vfat)
                if mount -o loop -t vfat "$IMG" "$TEMP_MOUNT" 2>/dev/null; then
                    echo "УСПЕХ (vfat)"
                    cp -r "$TEMP_MOUNT"/* "$BACKUP_DIR/" 2>/dev/null
                    umount "$TEMP_MOUNT"
                    mounted=true
                    break
                else
                    echo "не удалось"
                fi
                ;;
            ntfs)
                if mount -o loop -t ntfs-3g "$IMG" "$TEMP_MOUNT" 2>/dev/null || \
                   ntfs-3g -o loop "$IMG" "$TEMP_MOUNT" 2>/dev/null; then
                    echo "УСПЕХ (ntfs-3g)"
                    cp -r "$TEMP_MOUNT"/* "$BACKUP_DIR/" 2>/dev/null
                    umount "$TEMP_MOUNT"
                    mounted=true
                    break
                else
                    echo "не удалось"
                fi
                ;;
            exfat)
                if mount -o loop -t exfat "$IMG" "$TEMP_MOUNT" 2>/dev/null; then
                    echo "УСПЕХ (exfat)"
                    cp -r "$TEMP_MOUNT"/* "$BACKUP_DIR/" 2>/dev/null
                    umount "$TEMP_MOUNT"
                    mounted=true
                    break
                else
                    echo "не удалось"
                fi
                ;;
            ext4)
                if mount -o loop -t ext4 "$IMG" "$TEMP_MOUNT" 2>/dev/null; then
                    echo "УСПЕХ (ext4)"
                    cp -r "$TEMP_MOUNT"/* "$BACKUP_DIR/" 2>/dev/null
                    umount "$TEMP_MOUNT"
                    mounted=true
                    break
                else
                    echo "не удалось"
                fi
                ;;
        esac
    done
    
    # Метод 2: Используем losetup для более надежного монтирования
    if [ "$mounted" = false ]; then
        echo "  Метод 1 не сработал, пробуем losetup..."
        
        LOOP_DEV=$(losetup -f)
        if losetup "$LOOP_DEV" "$IMG" 2>/dev/null; then
            # Пробуем определить ФС через blkid
            FS_TYPE=$(blkid "$LOOP_DEV" -o value -s TYPE)
            
            if [ -n "$FS_TYPE" ]; then
                echo "  Определена ФС: $FS_TYPE"
                case "$FS_TYPE" in
                    vfat|fat*)
                        mount -t vfat "$LOOP_DEV" "$TEMP_MOUNT" 2>/dev/null
                        ;;
                    ntfs)
                        mount -t ntfs-3g "$LOOP_DEV" "$TEMP_MOUNT" 2>/dev/null
                        ;;
                    exfat)
                        mount -t exfat "$LOOP_DEV" "$TEMP_MOUNT" 2>/dev/null
                        ;;
                    ext*)
                        mount -t ext4 "$LOOP_DEV" "$TEMP_MOUNT" 2>/dev/null
                        ;;
                esac
                
                if mountpoint -q "$TEMP_MOUNT"; then
                    echo "  УСПЕХ через losetup"
                    cp -r "$TEMP_MOUNT"/* "$BACKUP_DIR/" 2>/dev/null
                    umount "$TEMP_MOUNT"
                    mounted=true
                fi
            fi
            losetup -d "$LOOP_DEV" 2>/dev/null
        fi
    fi
    
    if [ "$mounted" = true ]; then
        BACKUP_COUNT=$(find "$BACKUP_DIR" -type f 2>/dev/null | wc -l)
        echo "✓ Данные сохранены: $BACKUP_COUNT файлов в $BACKUP_DIR"
        echo "$BACKUP_DIR"  # Возвращаем путь для восстановления
    else
        echo "⚠ Не удалось смонтировать для копирования данных"
        rm -rf "$BACKUP_DIR"
        echo ""
    fi
}

# Функция для создания новой файловой системы
create_filesystem() {
    echo ""
    echo "2. Создание файловой системы $NEW_FS..."
    
    # Останавливаем USB гаджет
    if [ -d /sys/kernel/config/usb_gadget/flash ]; then
        echo "  Останавливаем USB гаджет..."
        echo "" > /sys/kernel/config/usb_gadget/flash/UDC 2>/dev/null
        sleep 2
    fi
    
    # Размонтируем все
    umount "$MOUNT_POINT" 2>/dev/null || true
    umount "$TEMP_MOUNT" 2>/dev/null || true
    
    # Создаем новый образ
    echo "  Создаем новый образ ($SIZE_MB MB)..."
    rm -f "$IMG"
    dd if=/dev/zero of="$IMG" bs=1M count="$SIZE_MB" status=progress
    
    # Создаем файловую систему в зависимости от типа
    case "$NEW_FS" in
        fat32)
            echo "  Форматируем в FAT32..."
            echo -e "o\nn\np\n1\n\n\nt\nc\nw\n" | fdisk "$IMG" >/dev/null 2>&1
            LOOP_DEV=$(losetup -f)
            losetup -P "$LOOP_DEV" "$IMG"
            mkfs.vfat -F 32 -n "PIZEROFLASH" "${LOOP_DEV}p1"
            losetup -d "$LOOP_DEV"
            ;;
            
        ntfs)
            echo "  Форматируем в NTFS..."
            # Создаем MBR и раздел
            echo -e "o\nn\np\n1\n\n\nt\n7\nw\n" | fdisk "$IMG" >/dev/null 2>&1
            LOOP_DEV=$(losetup -f)
            losetup -P "$LOOP_DEV" "$IMG"
            mkfs.ntfs -f -L "PIZEROFLASH" "${LOOP_DEV}p1"
            losetup -d "$LOOP_DEV"
            ;;
            
        exfat)
            echo "  Форматируем в exFAT..."
            echo -e "o\nn\np\n1\n\n\nt\n7\nw\n" | fdisk "$IMG" >/dev/null 2>&1
            LOOP_DEV=$(losetup -f)
            losetup -P "$LOOP_DEV" "$IMG"
            mkfs.exfat -n "PIZEROFLASH" "${LOOP_DEV}p1"
            losetup -d "$LOOP_DEV"
            ;;
            
        ext4)
            echo "  Форматируем в ext4..."
            echo -e "o\nn\np\n1\n\n\nt\n83\nw\n" | fdisk "$IMG" >/dev/null 2>&1
            LOOP_DEV=$(losetup -f)
            losetup -P "$LOOP_DEV" "$IMG"
            mkfs.ext4 -L "PIZEROFLASH" "${LOOP_DEV}p1"
            losetup -d "$LOOP_DEV"
            ;;
    esac
    
    echo "✓ Файловая система $NEW_FS создана"
}

# Функция для восстановления данных
restore_data() {
    local backup_dir="$1"
    
    if [ -z "$backup_dir" ] || [ ! -d "$backup_dir" ]; then
        echo "3. Нет данных для восстановления"
        return
    fi
    
    echo "3. Восстановление данных..."
    
    # Монтируем новый образ
    LOOP_DEV=$(losetup -f)
    losetup -P "$LOOP_DEV" "$IMG"
    
    case "$NEW_FS" in
        fat32)
            mount -t vfat "${LOOP_DEV}p1" "$TEMP_MOUNT" 2>/dev/null
            ;;
        ntfs)
            mount -t ntfs-3g "${LOOP_DEV}p1" "$TEMP_MOUNT" 2>/dev/null || \
            ntfs-3g "${LOOP_DEV}p1" "$TEMP_MOUNT" 2>/dev/null
            ;;
        exfat)
            mount -t exfat "${LOOP_DEV}p1" "$TEMP_MOUNT" 2>/dev/null
            ;;
        ext4)
            mount -t ext4 "${LOOP_DEV}p1" "$TEMP_MOUNT" 2>/dev/null
            ;;
    esac
    
    if mountpoint -q "$TEMP_MOUNT"; then
        echo "  Монтирование успешно"
        
        # Копируем данные
        if [ "$(ls -A "$backup_dir" 2>/dev/null)" ]; then
            echo "  Копируем файлы..."
            cp -r "$backup_dir"/* "$TEMP_MOUNT"/ 2>/dev/null
            sync
            echo "✓ Данные восстановлены"
        else
            echo "  Нет данных для восстановления"
        fi
        
        # Создаем информационный файл
        echo "Создано: $(date)" > "$TEMP_MOUNT/README.txt"
        echo "Файловая система: $NEW_FS" >> "$TEMP_MOUNT/README.txt"
        echo "Размер: ${SIZE_MB}MB" >> "$TEMP_MOUNT/README.txt"
        
        umount "$TEMP_MOUNT"
    else
        echo "⚠ Не удалось смонтировать для восстановления"
    fi
    
    losetup -d "$LOOP_DEV" 2>/dev/null
    
    # Удаляем backup
    rm -rf "$backup_dir"
}

# Функция для запуска USB гаджета
start_usb_gadget() {
    echo ""
    echo "4. Запуск USB гаджета..."
    
    # Обновляем путь к файлу в гаджете (на всякий случай)
    if [ -d /sys/kernel/config/usb_gadget/flash ]; then
        echo "$IMG" > /sys/kernel/config/usb_gadget/flash/functions/mass_storage.0/lun.0/file
        
        # Запускаем гаджет
        UDC_NAME=$(ls /sys/class/udc/ | head -1)
        if [ -n "$UDC_NAME" ]; then
            echo "$UDC_NAME" > /sys/kernel/config/usb_gadget/flash/UDC
            echo "✓ USB гаджет запущен (контроллер: $UDC_NAME)"
            
            # Ждем инициализации
            sleep 3
        else
            echo "⚠ Не найден USB контроллер"
        fi
    else
        echo "⚠ Структура гаджета не найдена"
        echo "Запустите: sudo /usr/local/bin/setup-usb-mass-storage.sh"
    fi
}

# Функция для локального монтирования
mount_for_local_access() {
    echo ""
    echo "5. Настройка локального доступа..."
    
    # Создаем точку монтирования если нужно
    mkdir -p "$MOUNT_POINT"
    umount "$MOUNT_POINT" 2>/dev/null || true
    
    # Монтируем с помощью losetup
    LOOP_DEV=$(losetup -f)
    if losetup -P "$LOOP_DEV" "$IMG" 2>/dev/null; then
        case "$NEW_FS" in
            fat32)
                mount -t vfat -o rw,uid=1000,gid=1000 "${LOOP_DEV}p1" "$MOUNT_POINT" 2>/dev/null
                ;;
            ntfs)
                ntfs-3g -o rw,uid=1000,gid=1000 "${LOOP_DEV}p1" "$MOUNT_POINT" 2>/dev/null || \
                mount -t ntfs-3g -o rw,uid=1000,gid=1000 "${LOOP_DEV}p1" "$MOUNT_POINT" 2>/dev/null
                ;;
            exfat)
                mount -t exfat -o rw,uid=1000,gid=1000 "${LOOP_DEV}p1" "$MOUNT_POINT" 2>/dev/null
                ;;
            ext4)
                mount -t ext4 -o rw "${LOOP_DEV}p1" "$MOUNT_POINT" 2>/dev/null
                ;;
        esac
        
        if mountpoint -q "$MOUNT_POINT"; then
            echo "✓ Локальный доступ настроен: $MOUNT_POINT"
            
            # Показываем информацию
            df -h "$MOUNT_POINT" | tail -1
        else
            echo "⚠ Не удалось настроить локальный доступ"
            losetup -d "$LOOP_DEV" 2>/dev/null
        fi
    else
        echo "⚠ Не удалось создать loop устройство"
    fi
}

# Основной процесс
main() {
    # Проверяем пакеты
    check_packages
    
    # Создаем временные точки монтирования
    mkdir -p "$TEMP_MOUNT"
    
    # Резервное копирование
    BACKUP_DIR=$(backup_data)
    
    # Создаем новую файловую систему
    create_filesystem
    
    # Восстанавливаем данные
    restore_data "$BACKUP_DIR"
    
    # Запускаем USB гаджет
    start_usb_gadget
    
    # Настраиваем локальный доступ
    mount_for_local_access
    
    # Очистка
    rm -rf "$TEMP_MOUNT" 2>/dev/null
    
    echo ""
    echo "=================================================="
    echo "✅ Готово! Файловая система успешно изменена"
    echo ""
    echo "Информация:"
    echo "  Тип ФС: $NEW_FS"
    echo "  Файл: $IMG"
    echo "  Размер: ${SIZE_MB}MB"
    echo "  Локальный доступ: $MOUNT_POINT"
    echo ""
    echo "Действия:"
    echo "  1. Переподключите Pi Zero к компьютеру"
    echo "  2. Проверьте новую файловую систему"
    echo "  3. Файлы доступны локально в $MOUNT_POINT"
    echo "=================================================="
}

# Запуск
main