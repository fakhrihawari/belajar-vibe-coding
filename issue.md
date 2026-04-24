# Fitur: API Login User

## Deskripsi
Tugas ini adalah untuk mengimplementasikan fitur login user. Fitur ini meliputi pembuatan tabel `sessions` di database, pembuatan business logic (service) untuk memverifikasi kredensial dan men-generate session, serta pembuatan endpoint API menggunakan framework ElysiaJS. Panduan ini disusun secara rinci (step-by-step) agar mudah diimplementasikan.

---

## Spesifikasi

### 1. Database (Tabel `sessions`)
Buat skema tabel baru bernama `sessions` dengan struktur berikut:
- `id`: integer, auto increment (Primary Key)
- `token`: varchar(255), not null (akan diisi dengan UUID sebagai token login)
- `user_id`: integer, not null (Foreign Key yang merujuk ke tabel `users`)
- `created_at`: timestamp, default `current_timestamp`

### 2. API Endpoint
- **Endpoint**: `POST /api/users/login`
- **Request Body (JSON)**:
  ```json
  {
      "email": "fakhri@localhost",
      "password": "rahasia"
  }
  ```

- **Response Sukses (HTTP 200)**:
  ```json
  {
      "data": "token_uuid_berada_disini"
  }
  ```

- **Response Gagal - Kredensial Salah (HTTP 401)**:
  ```json
  {
      "error": "Email atau password salah"
  }
  ```

### 3. Struktur Folder & File
Implementasi harus mengikuti struktur folder berikut di dalam direktori `src/`:
- `src/routes/users-route.ts`: Tempat mendefinisikan routing/endpoint API ElysiaJS.
- `src/services/user-service.ts` (atau `users-service.ts`): Tempat menyimpan logika bisnis aplikasi.

---

## Tahapan Implementasi (Step-by-Step)
*Ikuti instruksi di bawah ini secara berurutan untuk menyelesaikan tugas.*

### Step 1: Update Skema Database
1. Buka file `src/db/schema.ts`.
2. Tambahkan definisi tabel baru `sessions` menggunakan Drizzle ORM.
3. Pastikan kolom `user_id` direferensikan dengan benar sebagai *foreign key* ke tabel `users`.
4. Jalankan perintah migrasi database menggunakan Drizzle (misalnya: `bunx drizzle-kit generate` lalu `bunx drizzle-kit push` atau sesuai command yang dikonfigurasi).

### Step 2: Buat Business Logic (Service)
1. Buka file service terkait user (misalnya `src/services/user-service.ts`).
2. Import koneksi database, skema `users`, dan skema `sessions` yang baru dibuat.
3. Buat fungsi asynchronous bernama `loginUser(payload)`.
4. **Alur Logika `loginUser`**:
   - Cari user di tabel `users` berdasarkan `email` dari payload.
   - Jika user **tidak ditemukan**, berikan error "Email atau password salah".
   - Jika user **ditemukan**, verifikasi kecocokan `password` (gunakan fungsi verifikasi bcrypt atau `Bun.password.verify` sesuai standar proyek).
   - Jika password **tidak cocok**, berikan error "Email atau password salah". *(Catatan Keamanan: jangan bedakan pesan error antara email tidak ditemukan dan password salah).*
   - Jika password **cocok**, *generate* sebuah UUID unik untuk token session (bisa menggunakan `crypto.randomUUID()`).
   - Lakukan operasi `INSERT` ke tabel `sessions` dengan memasukkan nilai `token` (UUID) dan `user_id` (id dari user yang berhasil login).
   - Kembalikan response sukses berbentuk `{"data": token}`.

### Step 3: Buat Routing API (Routes)
1. Buka file `src/routes/users-route.ts`.
2. Tambahkan endpoint baru `.post('/api/users/login', ... )` ke instance Elysia.
3. **Logika Endpoint**:
   - Gunakan validasi skema body (menggunakan `t.Object` dari `@elysiajs/typebox`) agar request dipastikan memiliki format `email` dan `password` berupa string.
   - Di dalam handler, panggil fungsi `loginUser` dari service.
   - Bungkus pemanggilan fungsi tersebut dengan blok `try...catch`.
   - Jika `try` berhasil, langsung return data dari service.
   - Jika `catch` menangkap error dengan pesan "Email atau password salah", ubah HTTP status menjadi `401 Unauthorized` dan kembalikan JSON `{"error": "Email atau password salah"}`.

### Step 4: Daftarkan Route ke Aplikasi Utama (Jika Belum)
1. Jika router `users-route.ts` belum didaftarkan di aplikasi utama, buka `src/index.ts`.
2. Import route tersebut dan pasangkan ke instance utama aplikasi (misal: `app.use(usersRoute)`).

### Step 5: Testing dan Verifikasi
Lakukan pengujian API untuk memastikan semua skenario berjalan dengan baik:
1. **Test Kasus Gagal (Email Tidak Terdaftar)**: Kirim request dengan email palsu, pastikan response adalah 401 dan error sesuai.
2. **Test Kasus Gagal (Password Salah)**: Kirim request dengan email valid tapi password salah, pastikan response adalah 401 dan error sesuai.
3. **Test Kasus Sukses**: Kirim request dengan email dan password yang valid. Pastikan HTTP Status 200, mendapatkan kembalian `{"data": "<token-uuid>"}`, dan cek tabel `sessions` di database untuk memastikan record session telah dibuat dan terhubung ke `user_id` yang benar.
