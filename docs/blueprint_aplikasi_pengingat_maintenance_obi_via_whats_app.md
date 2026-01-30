# Blueprint Aplikasi Pengingat Maintenance & Perawatan Obi via WhatsApp

Dokumen ini adalah rancangan (blueprint) untuk membuat aplikasi pengingat yang mengirim reminder perawatan cupang **Obi** ke **WhatsApp** secara otomatis.

---

## 1) Tujuan & Ruang Lingkup

### Tujuan
- Mengirim pengingat terjadwal ke WhatsApp: **harian, setiap 2 hari, mingguan, 2-mingguan, dan kondisi darurat** (opsional).
- Menyediakan checklist singkat di pesan agar mudah dieksekusi.
- Menyimpan log sederhana: kapan reminder dikirim, apakah pengguna menandai selesai, catatan singkat.

### Di luar ruang lingkup (opsional nanti)
- Deteksi kualitas air otomatis dari sensor.
- AI diagnosis penyakit dari foto.

---

## 2) Fitur Inti (MVP)

### A. Reminder Terjadwal
Mengirim pesan WhatsApp sesuai jadwal:
- **Harian**: observasi + pakan
- **Setiap 2 hari**: ganti air 30–40%
- **Mingguan**: sedot dasar ringan + cek tanaman + evaluasi ketapang
- **2 minggu**: ganti air 50% + reset mikro
- **Event berbasis kondisi** (opsional): tombol “DARURAT” untuk mengirim prosedur darurat

### B. Checklist Interaktif
Dalam pesan WhatsApp:
- Tampilkan checklist ringkas
- Tombol/quick reply:
  - ✅ Selesai
  - ⏰ Tunda 1 jam
  - 📝 Catat

> Catatan: interaktivitas tombol tergantung kemampuan channel WhatsApp API yang dipakai.

### C. Logging
- Simpan status reminder: `sent`, `delivered`, `read` (jika tersedia), `completed`, `snoozed`
- Catatan pengguna (opsional): “air agak keruh”, “Obi aktif”, dll.

---

## 3) Jadwal Konten (berbasis jadwal Obi)

### Template Harian (contoh)
**Judul:** HARIAN – Obi
- Observasi: aktif/patroli? diam tapi responsif?
- Cek air: bau? keruh? lapisan minyak?
- Pakan: 1–2 butir pelet (1×)

Quick reply: ✅ Selesai | ⏰ Tunda | 📝 Catat

### Template 2-Harian
**Judul:** GANTI AIR – Obi
- Ganti air 30–40%
- Air baru suhu sama & diendapkan
- Jangan aduk dasar agresif

### Template Mingguan
**Judul:** MINGGUAN – Obi
- Sedot kotoran sela kerikil
- Pangkas daun tanaman rusak
- Evaluasi ketapang (angkat jika lembek/berlendir)

### Template 2-Mingguan
**Judul:** 2 MINGGU – Obi
- Ganti air ±50%
- Tata ulang ringan tanaman/dekor
- Reset mikro

### Template Darurat (manual trigger)
**Judul:** DARURAT – Obi
- Ganti air 40% segera
- Angkat ketapang jika ragu
- Pantau: sering ke permukaan / diam lama / air bau

---

## 4) Arsitektur Sistem (High Level)

### Komponen
1. **Client (Admin UI / Mobile Web)**
   - Atur jadwal
   - Lihat log
   - Edit template pesan

2. **Backend API**
   - CRUD jadwal, template, user/ikan
   - Endpoint webhook WhatsApp

3. **Scheduler / Job Runner**
   - Menjalankan pengiriman pesan sesuai RRULE/jadwal
   - Retry jika gagal

4. **Database**
   - Menyimpan user, jadwal, template, log

5. **WhatsApp Provider**
   - WhatsApp Business Platform (Cloud API) / BSP
   - Mengirim pesan dan menerima webhook

---

## 5) Opsi Integrasi WhatsApp

### Opsi A (disarankan): WhatsApp Business Platform – Cloud API
- Perlu:
  - Nomor bisnis
  - Setup WhatsApp Business Account
  - Token akses
  - Webhook URL untuk status pesan & balasan
- Kelebihan: resmi, stabil

### Opsi B: BSP (Business Solution Provider)
- Cocok jika ingin setup lebih mudah (biaya tergantung provider)

> Catatan penting: WhatsApp **bukan** SMS; ada aturan template pesan untuk pesan proaktif.

---

## 6) Data Model (Skema Minimal)

### Tabel `users`
- `id`
- `name`
- `phone_e164` (format +62…)
- `timezone` (default Asia/Jakarta)
- `created_at`

### Tabel `pets`
- `id`
- `user_id`
- `name` (Obi)
- `species` (Betta)
- `tank_volume_liters` (2.6)

### Tabel `message_templates`
- `id`
- `key` (daily / bi_daily / weekly / bi_weekly / emergency)
- `title`
- `body`
- `language`

### Tabel `schedules`
- `id`
- `user_id`
- `pet_id`
- `template_id`
- `rrule` (atau cron)
- `enabled`
- `quiet_hours_start` / `quiet_hours_end` (opsional)

### Tabel `message_logs`
- `id`
- `schedule_id`
- `user_id`
- `pet_id`
- `template_id`
- `status` (sent/delivered/read/completed/snoozed/failed)
- `provider_message_id`
- `sent_at`
- `completed_at`
- `note` (opsional)

---

## 7) Scheduler: Aturan & Logika

### Aturan inti
- Jangan kirim di jam tidur (quiet hours)
- Jika user klik “Tunda 1 jam” → buat job baru + update log
- Jika “Selesai” → set `completed_at`

### Retry
- Jika gagal kirim → retry 3x (mis. 1m, 5m, 15m)
- Jika tetap gagal → status `failed` + notifikasi di dashboard

---

## 8) Endpoint Backend (contoh)

### Admin/API
- `POST /users`
- `POST /pets`
- `GET /templates`
- `PUT /templates/:id`
- `POST /schedules`
- `PUT /schedules/:id`
- `GET /logs?pet_id=...&from=...&to=...`

### Webhook WhatsApp
- `GET /webhook/whatsapp` (verify)
- `POST /webhook/whatsapp` (incoming events)
  - delivery status
  - user replies / button clicks

---

## 9) Keamanan & Kepatuhan
- Simpan token WhatsApp di secret manager (.env + vault)
- Validasi signature webhook
- Rate limiting pada webhook
- Enkripsi minimal untuk data sensitif (phone)
- Audit log untuk perubahan jadwal

---

## 10) Stack Rekomendasi (praktis)

### Pilihan 1: Node.js (ringkas)
- Backend: Express/NestJS
- Scheduler: BullMQ + Redis (atau node-cron untuk sederhana)
- DB: Postgres
- Deploy: Render/Fly.io/VPS

### Pilihan 2: Python
- Backend: FastAPI
- Scheduler: Celery + Redis / APScheduler
- DB: Postgres

---

## 11) Rencana Implementasi (Tahap)

### Tahap 1 — MVP (1 ikan, 1 user)
- Setup WhatsApp Cloud API
- Buat template pesan 4 jenis
- Scheduler kirim otomatis
- Webhook terima “Selesai/Tunda/Catat”
- Log sederhana

### Tahap 2 — Multi ikan & kustom jadwal
- Banyak ikan per user
- Kustom jadwal per ikan
- Quiet hours

### Tahap 3 — Analitik & kualitas
- Statistik kepatuhan (completion rate)
- Ringkasan mingguan via WA

---

## 12) Contoh Isi Template Pesan (siap pakai)

### DAILY
**HARIAN – Obi**
1) Cek perilaku (aktif? responsif?)
2) Cek air (bau/keruh/lapisan?)
3) Pakan: 1–2 butir pelet (1×)

Balas: `SELESAI` / `TUNDA 1JAM` / `CATAT: ...`

### BI-DAILY
**GANTI AIR – Obi (30–40%)**
- Air baru suhu sama & diendapkan
- Jangan aduk dasar agresif

Balas: `SELESAI` / `TUNDA 1JAM`

### WEEKLY
**MINGGUAN – Obi**
- Sedot kotoran sela kerikil
- Cek tanaman (pangkas daun rusak)
- Evaluasi ketapang

### BI-WEEKLY
**2 MINGGU – Obi (±50%)**
- Ganti air ±50%
- Reset mikro

---

## 13) Parameter Kustom yang Perlu Diputuskan
- Jam kirim harian (mis. 09:00 atau 19:00)
- Quiet hours (mis. 22:00–07:00)
- Bahasa pesan (ID)
- Apakah pakai tombol interaktif atau keyword teks

---

## 14) Definisi Sukses
- Reminder terkirim tepat waktu ≥ 99%
- Completion rate mingguan meningkat
- Tidak ada spam (user bisa pause/stop)

---

## Lampiran: Checklist Produk yang Aman di Tank Kecil (opsional)
- Porsi pakan kecil, hindari overload
- Ketapang olahan: ¼ daun, 3–5 hari
- Sedot dasar: mingguan

---

*Dokumen ini siap diunduh sebagai file Markdown (.md) dan dapat dijadikan acuan pengembangan aplikasi.*

