# วิธีการนำเว็บขึ้น Server (VPS / aaPanel)

---

## 🟢 วิธีขึ้น aaPanel (ง่ายที่สุด)
หากคุณใช้ aaPanel ให้ทำตามขั้นตอนนี้ครับ:

1.  **เตรียมไฟล์**:
    *   Upload ไฟล์ทั้งหมดขึ้นไปที่ aaPanel (File Manager)
    *   **ยกเว้น** โฟลเดอร์ `node_modules` และ `.next` (ไม่ต้องเอาขึ้น)
    *   ตำแหน่งแนะนำ: `/www/wwwroot/razaan`

2.  **ติดตั้ง Node.js Project**:
    *   ไปที่เมนู **Website** -> **Node Project**
    *   กด **Add Node Project**

3.  **ตั้งค่า (สำคัญ)**:
    *   **Project Path**: เลือกโฟลเดอร์ `/www/wwwroot/razaan`
    *   **Name**: ตั้งชื่อ เช่น `razaan`
    *   **Run Opt** (หรือ Start Script): **เลือก `start`**
        *(aaPanel จะอ่านไฟล์ `package.json` แล้วให้เราเลือกคำสั่ง ให้เลือก `start` ครับ)*
    *   **Port**: ใส่ `3000` (หรือพอร์ตอื่นถ้าชน)
    *   **Run User**: `www`

4.  **ติดตั้ง Dependencies**:
    *   พอกดสร้างเสร็จ ระบบจะถามให้ install module **ให้กด Install** (หรือเข้าไปกด `NPM Install` ในหน้าจัดการโปรเจกต์)
    *   รอจนเสร็จ (จะเห็นโฟลเดอร์ `node_modules` โผล่มา)

5.  **Build Project**:
    *   ในหน้าจัดการ Node Project ไปที่แท็บ **Script** หรือ **Command**
    *   สั่งรันคำสั่ง: `npm run build`
    *   *หมายเหตุ: ถ้าหาเมนูไม่เจอ ให้เปิด Terminal แล้วพิมพ์ `cd /www/wwwroot/razaan && npm run build`*

6.  **Restart**:
    *   พอบิ้วเสร็จ กด **Restart** ตัวโปรเจกต์ 1 ครั้ง
    *   สถานะควรเป็น **Running**

7.  **ตั้ง Domain (Map Domain)**:
    *   ไปที่เมนู **Mapping** (หรือ Domain) ในหน้า Node Project
    *   ใส่ชื่อโดเมนของคุณ (เช่น `razaan.com`)
    *   กด Apply HTTPS (SSL) ตามปกติ

---

## 🟡 วิธีขึ้น Ubuntu VPS (Manual via CLI)
*(สำหรับคนที่ไม่ได้ใช้ aaPanel ใช้ SSH Command)*

1.  **เตรียม Server**:
    *   OS: Ubuntu 22.04 LTS
    *   Access: `ssh root@your_ip`

2.  **ติดตั้งโปรแกรม**:
    ```bash
    # Update & Install Node.js
    sudo apt update && sudo apt upgrade -y
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs nginx

    # Install PM2
    sudo npm install -g pm2
    ```

3.  **เตรียมไฟล์**:
    ```bash
    mkdir -p /var/www/razaan
    cd /var/www/razaan
    # Clone Git หรือ Upload file มาที่นี่
    ```

4.  **ติดตั้งและ Build**:
    ```bash
    npm install
    npm run build
    ```

5.  **รันระบบด้วย PM2**:
    ```bash
    pm2 start npm --name "razaan" -- start
    pm2 save
    ```

6.  **ตั้งค่า Nginx (Reverse Proxy)**:
    สร้างไฟล์ config: `sudo nano /etc/nginx/sites-available/razaan`
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
    Enable site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/razaan /etc/nginx/sites-enabled/
    sudo systemctl restart nginx
    ```

---

## ⚙️ ไฟล์ .env (สำคัญมาก)
ไม่ว่าจะใช้ aaPanel หรือ VPS อย่าลืมสร้างไฟล์ `.env` บน Server และใส่ค่าตามนี้:

```env
MONGODB_URI=mongodb+srv://...
NEXT_PUBLIC_APP_URL=https://your-domain.com
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_USER_ID=...
NEXT_PUBLIC_LIFF_ID=...
```
