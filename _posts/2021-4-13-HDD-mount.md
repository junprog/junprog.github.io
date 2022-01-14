---
layout: post
permalink: /blog/:title
title: HDD,SSDをマウントする (Ubuntu 18.04)
category: ブログ
tags: Linux セットアップ
---
研究する中でよくUbuntuをインストールして環境構築する事があるため、その際の追加HDD,SSDのマウントの仕方をメモとして残す。

<!--more-->
## 環境

* OS : Ubuntu 18.04
* ディスク
    * HDD : 4TB
    * SSD : 1TB

## 1. OSがHDD,SSDを認識しているかどうか確認

以下のコマンドで認識しているディスクを確認する。

```bash
$ sudo fdisk -l

...
## これはOSの乗ってるディスク ##
Disk /dev/nvme0n1: 232.9 GiB, 250059350016 bytes, 488397168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: 2EEB5D34-7DAB-4485-9CD2-9D4EDB4A1580

Device           Start       End   Sectors   Size Type
/dev/nvme0n1p1    2048   1050623   1048576   512M EFI System
/dev/nvme0n1p2 1050624 488396799 487346176 232.4G Linux filesystem

## これが1つ目のディスク(HDD) ##
Disk /dev/sdb: 3.7 TiB, 4000787030016 bytes, 7814037168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes

## これが2つ目のディスク(SSD) ##
Disk /dev/sda: 931.5 GiB, 1000204886016 bytes, 1953525168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
...
```

私の場合、1つ目のディスク`/dev/sdb`に約4TBのHDDと2つ目のディスク`/dev/sda`に約1TBのSSDが搭載されているので、上記のような結果となった。
ただ最低限の情報を確認したかったら`$ lsblk -l`コマンドでも良いかもしれない。

## 2. HDD,SSDにパーティションを作成

まずは`/dev/sdb`(4TB HDD)からやっていく。
以下のコマンドでパーティションを作成する。

```bash
$ sudo parted /dev/sdb
GNU Parted 3.2
Using /dev/sdb
Welcome to GNU Parted! Type 'help' to view a list of commands.

(parted) print ## まずは選択したディスクを確認 ##
Error: /dev/sdb: unrecognised disk label
Model: ATA WDC WD40EFRX-68W (scsi)
Disk /dev/sdb: 4001GB
Sector size (logical/physical): 512B/4096B
Partition Table: unknown
Disk Flags:

(parted) mklabel gpt　## パーティション形式をGPTに指定 ##

(parted) print ## 形式指定したディスクを確認 ##
Model: ATA WDC WD40EFRX-68W (scsi)
Disk /dev/sdb: 4001GB
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags:

Number  Start  End  Size  File system  Name  Flags

(parted) mkpart primary 0% 100%  ## パーティションを作成 ##

(parted) print　## パーティション作成後のディスクの確認 ##
Model: ATA WDC WD40EFRX-68W (scsi)
Disk /dev/sdb: 4001GB
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name     Flags
 1      1049kB  4001GB  4001GB               primary

(parted) q ## partedからexit ##
Information: You may need to update /etc/fstab.
```

次は`/dev/sda`(1TB SSD)を同様にやっていく。

```bash
$ sudo parted /dev/sda
GNU Parted 3.2
Using /dev/sda
Welcome to GNU Parted! Type 'help' to view a list of commands.

... ## hddと同様に対話操作する ##

```

## 3. パーティションのフォーマット

まず、フォーマットするためのデバイスのディレクトリの確認を行う。`/dev/sdb`(4TB HDD)からやっていく。以下のコマンドで確認できる。

```bash
$ sudo fdisk -l /dev/sdb

Disk /dev/sdb: 3.7 TiB, 4000787030016 bytes, 7814037168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 4096 bytes
Disklabel type: gpt
Disk identifier: 338D9FED-4E1C-4E2E-8B38-9C925F829C5C

Device     Start        End    Sectors  Size Type ## これが追加されてる ##
/dev/sdb1   2048 7814035455 7814033408  3.7T Linux filesystem
```

今回の場合`/dev/sdb1`がパーティションが作成されたディレクトリなので、以下のコマンドで`ext4`でパーティションをフォーマットする。

```bash
$ sudo mke2fs -t ext4 /dev/sdb1

mke2fs 1.44.1 (24-Mar-2018)
Creating filesystem with 976754176 4k blocks and 244195328 inodes
Filesystem UUID: a32667e6-26ba-4994-87b4-b808796765f1
Superblock backups stored on blocks:
	32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208,
	4096000, 7962624, 11239424, 20480000, 23887872, 71663616, 78675968,
	102400000, 214990848, 512000000, 550731776, 644972544

Allocating group tables: done
Writing inode tables: done
Creating journal (262144 blocks): done
Writing superblocks and filesystem accounting information: done
```

次に`/dev/sda`(1TB SSD)を同様にやっていく。

```bash
$ sudo fdisk -l /dev/sda

Disk /dev/sda: 931.5 GiB, 1000204886016 bytes, 1953525168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: gpt
Disk identifier: CC5A905D-7E09-4596-BD76-C88985A5892D

Device     Start        End    Sectors   Size Type
/dev/sda1   2048 1953523711 1953521664 931.5G Linux filesystem
```

今回の場合`/dev/sda1`がパーティションが作成されたディレクトリなので、以下のコマンドで`ext4`でパーティションをフォーマットする。

```bash
$ sudo mke2fs -t ext4 /dev/sda1

Creating filesystem with 244190208 4k blocks and 61054976 inodes
Filesystem UUID: e8b77e38-81f9-4cda-a9e0-26693ee520ce
Superblock backups stored on blocks:
	32768, 98304, 163840, 229376, 294912, 819200, 884736, 1605632, 2654208,
	4096000, 7962624, 11239424, 20480000, 23887872, 71663616, 78675968,
	102400000, 214990848

Allocating group tables: done
Writing inode tables: done
Creating journal (262144 blocks): done
Writing superblocks and filesystem accounting information: done
```

## 4. HDD,SSDのマウント

まず、マウントさせるディレクトリを作成。私の場合は`/mnt/hdd`と`/dev/ssd`にマウントさせたいので以下のコマンドでディレクトリを作成。

```bash
$ sudo mkdir /mnt/hdd
$ sudo mkdir /mnt/ssd
```

次にこれらのディレクトリに、以下のコマンドでマウントさせる。

```bash
$ sudo mount /dev/sdb1 /mnt/hdd
$ sudo mount /dev/sda1 /mnt/ssd
```

以下のコマンドでマウント出来たかどうかを確認。

```bash
$ df -h

Filesystem      Size  Used Avail Use% Mounted on
...
/dev/sdb1       3.6T   89M  3.4T   1% /mnt/hdd
/dev/sda1       916G   77M  870G   1% /mnt/ssd
```

## 5. 自動マウント設定

起動した時に自動的にマウントできるように`/etc/fstab`にHDD,SSD情報を追加。

まず、以下のコマンドでHDD,SSDのUUIDを確認する。

```bash
$ sudo blkid -o list

device         fs_type      label         mount point         UUID
--------------------------------------------------------------------------------------------------

...

/dev/sda1      ext4                       /mnt/ssd            e8b77e38-81f9-4cda-a9e0-26693ee520ce
/dev/sdb1      ext4                       /mnt/hdd            a32667e6-26ba-4994-87b4-b808796765f1

...
```

次に、`/etc/fstab`にHDD,SSD情報を追加。

```bash
$ sudo vim /etc/fstab 
```

下段に以下を追加。UUID=のところは臨機応変に変更。
```
...

UUID=e8b77e38-81f9-4cda-a9e0-26693ee520ce /mnt/ssd ext4 defaults 0 0
UUID=a32667e6-26ba-4994-87b4-b808796765f1 /mnt/hdd ext4 defaults 0 0
```

## Reference
* [[ubuntu] ハードディスクを追加・マウントする](https://blog.hippohack.me/web/133)