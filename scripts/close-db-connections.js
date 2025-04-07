/**
 * Veritabanı bağlantılarını temizleyen script
 * 
 * Bu script, özellikle testlerden önce manuel olarak çalıştırılabilir.
 * PostgreSQL'de açık kalan tüm kullanılmayan bağlantıları kapatır.
 * 
 * Çalıştırmak için:
 * node scripts/close-db-connections.js
 */

const { Client } = require('pg');
require('dotenv').config(); // .env dosyasını yükle

async function closeConnections() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Veritabanına bağlanıldı, açık bağlantılar kontrol ediliyor...');

    // Aktif bağlantıları kontrol et
    const { rows } = await client.query(`
      SELECT pid, usename, application_name, state, query_start, NOW() - query_start AS runtime 
      FROM pg_stat_activity 
      WHERE datname = current_database()
      AND pid <> pg_backend_pid()
    `);

    console.log(`Toplam ${rows.length} aktif bağlantı bulundu.`);

    if (rows.length > 0) {
      console.log('Aktif bağlantılar:');
      rows.forEach(conn => {
        console.log(`PID: ${conn.pid}, Kullanıcı: ${conn.usename}, Süre: ${conn.runtime}, Durum: ${conn.state}`);
      });

      // Tüm idle bağlantıları kapat
      const idleRows = rows.filter(row => row.state === 'idle');
      if (idleRows.length > 0) {
        console.log(`${idleRows.length} boşta (idle) bağlantı bulundu, sonlandırılıyor...`);
        
        await client.query(`
          SELECT pg_terminate_backend(pid) 
          FROM pg_stat_activity 
          WHERE datname = current_database() 
          AND pid <> pg_backend_pid()
          AND state = 'idle'
        `);
        
        console.log('Tüm boşta bağlantılar sonlandırıldı.');
      }

      // Takılmış uzun süreli çalışan sorguları kontrol et (5 dakikadan uzunsa)
      const stuckQueries = rows.filter(row => row.state === 'active' && row.runtime > '00:05:00');
      if (stuckQueries.length > 0) {
        console.log(`${stuckQueries.length} takılmış sorgu bulundu, sonlandırılıyor...`);
        
        for (const query of stuckQueries) {
          console.log(`Takılmış sorgu (PID: ${query.pid}): ${query.state} - ${query.runtime}`);
          await client.query(`SELECT pg_terminate_backend($1)`, [query.pid]);
        }
        
        console.log('Takılmış sorgular sonlandırıldı.');
      }
    } else {
      console.log('Açık veritabanı bağlantısı bulunmadı.');
    }

  } catch (error) {
    console.error('Veritabanı işlemi sırasında bir hata oluştu:', error);
  } finally {
    await client.end();
    console.log('İşlem tamamlandı, script bağlantısı kapatıldı.');
  }
}

// Script doğrudan çalıştırıldığında
if (require.main === module) {
  closeConnections().catch(console.error);
}

module.exports = { closeConnections };