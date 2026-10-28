#!/usr/bin/env node
/*
 * Eski sunucunun şifreleme anahtarıyla saklanmış verileri yeni anahtara çevirir (ya da sıfırlar).
 *
 * Neden gerekli: backend şifreli alanlarda scrypt(ENCRYPTION_KEY || JWT_SECRET, ENCRYPTION_SALT)
 * kullanıyor (encryption.service.ts). Yeni sunucuda sırlar yeniden üretildiği için geri yüklenen
 * veriler çözülemez: MFA kullanan yöneticiler giriş yapamaz, entegrasyon token'ları ve abonelik
 * kart token'ları okunamaz.
 *
 * Ne yapar (üç alan):
 *   users.mfaSecret                  → varsayılan: SIFIRLA ve mfaEnabled=false (kullanıcı yeniden kurar).
 *                                      Eski anahtar güvenilir sayılmaz; çevirmek güvenli değil.
 *                                      --mfa=reencrypt ile yeni anahtara çevrilir.
 *   subscriptions.paymentToken       → yeni anahtara ÇEVRİLİR (yinelenen ödemeler çalışmaya devam eder).
 *   integration_settings.encryptedValue → SİLİNİR; yeni (rotasyonu yapılmış) değerleri admin panelinden gir.
 *                                      --integrations=reencrypt ile çevrilir (önerilmez).
 *
 * Kullanım (backend dizininden):
 *   cd /var/www/pureolentia/backend
 *   OLD_SECRET='<eski ENCRYPTION_KEY, yoksa eski JWT_SECRET>' OLD_SALT='<eski ENCRYPTION_SALT>' \
 *     node ../infra/server/reencrypt-secrets.js            # kuru çalıştırma: yalnızca rapor
 *   ... node ../infra/server/reencrypt-secrets.js --apply   # değişiklikleri yazar
 *
 * Yeni anahtar backend/.env'den okunur. Hiçbir düz metin değer yazdırılmaz. API'yi durdurup çalıştır.
 */
const crypto = require('crypto')
const path = require('path')
const { createRequire } = require('module')

// @prisma/client ve dotenv, script'in değil çalışma dizininin (backend) node_modules'ünden gelir
const req = createRequire(path.join(process.cwd(), 'package.json'))
req('dotenv').config({ path: path.join(process.cwd(), '.env') })
const { PrismaClient } = req('@prisma/client')

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const opt = (name, fallback) => (args.find((a) => a.startsWith(`--${name}=`)) || `--${name}=${fallback}`).split('=')[1]
const MFA_MODE = opt('mfa', 'reset') // reset | reencrypt
const INTEGRATIONS_MODE = opt('integrations', 'wipe') // wipe | reencrypt

function need(name) {
  if (!process.env[name]) {
    console.error(`HATA: ${name} gerekli.`)
    process.exit(1)
  }
  return process.env[name]
}

const oldKey = crypto.scryptSync(need('OLD_SECRET'), need('OLD_SALT'), 32)
const newSecret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET
const newSalt = process.env.ENCRYPTION_SALT
if (!newSecret || !newSalt) {
  console.error('HATA: backend/.env içinde (ENCRYPTION_KEY veya JWT_SECRET) ve ENCRYPTION_SALT olmalı.')
  process.exit(1)
}
const newKey = crypto.scryptSync(newSecret, newSalt, 32)
if (oldKey.equals(newKey)) {
  console.error('HATA: eski ve yeni anahtar aynı. Yeni sunucuda sırlar yeniden üretilmeliydi.')
  process.exit(1)
}

// encryption.service.ts ile aynı biçim: iv:authTag:veri (hepsi hex), AES-256-GCM
function decrypt(text, key) {
  const [ivHex, tagHex, data] = text.split(':')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return decipher.update(data, 'hex', 'utf8') + decipher.final('utf8')
}
function encrypt(text, key) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = cipher.update(text, 'utf8', 'hex') + cipher.final('hex')
  return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${enc}`
}
const tryDecrypt = (text, key) => {
  try {
    return decrypt(text, key)
  } catch {
    return null
  }
}

// Eski anahtarla çöz → yeniyle şifrele. Çözülemezse nedenini sınıflandır.
function convert(text) {
  const plain = tryDecrypt(text, oldKey)
  if (plain !== null) return { status: 'ok', value: encrypt(plain, newKey) }
  if (tryDecrypt(text, newKey) !== null) return { status: 'already' }
  return { status: 'fail' }
}

async function main() {
  const prisma = new PrismaClient()
  const plan = [] // { label, run }
  console.log(APPLY ? '=== UYGULAMA MODU ===' : '=== KURU ÇALIŞTIRMA (hiçbir şey yazılmaz; yazmak için --apply) ===')

  // 1) Abonelik kart token'ları → yeni anahtara çevir
  const subs = await prisma.subscription.findMany({ where: { paymentToken: { not: null } }, select: { id: true, paymentToken: true } })
  const subConv = subs.map((s) => ({ id: s.id, ...convert(s.paymentToken) }))
  const c = (arr, st) => arr.filter((x) => x.status === st).length
  console.log(`\nabonelik kart token'ı: ${subs.length} kayıt → çevrilebilir ${c(subConv, 'ok')}, zaten yeni anahtarla ${c(subConv, 'already')}, ÇÖZÜLEMEYEN ${c(subConv, 'fail')}`)
  plan.push({
    label: 'subscriptions.paymentToken çevir',
    run: (tx) => Promise.all(subConv.filter((x) => x.status === 'ok').map((x) => tx.subscription.update({ where: { id: x.id }, data: { paymentToken: x.value } }))),
  })

  // 2) MFA gizli anahtarları
  const mfaUsers = await prisma.user.findMany({ where: { mfaSecret: { not: null } }, select: { id: true, email: true, role: true, mfaSecret: true } })
  console.log(`\nMFA (iki aşamalı doğrulama) kullanan hesap: ${mfaUsers.length}  [mod: ${MFA_MODE}]`)
  for (const u of mfaUsers) console.log(`  - ${u.email} (${u.role})`)
  if (MFA_MODE === 'reencrypt') {
    const conv = mfaUsers.map((u) => ({ id: u.id, ...convert(u.mfaSecret) }))
    console.log(`  çevrilebilir ${c(conv, 'ok')}, zaten yeni ${c(conv, 'already')}, ÇÖZÜLEMEYEN ${c(conv, 'fail')}`)
    plan.push({
      label: 'users.mfaSecret çevir',
      run: (tx) => Promise.all(conv.filter((x) => x.status === 'ok').map((x) => tx.user.update({ where: { id: x.id }, data: { mfaSecret: x.value } }))),
    })
  } else {
    plan.push({
      label: 'users.mfaSecret sıfırla, mfaEnabled=false',
      run: (tx) => tx.user.updateMany({ where: { mfaSecret: { not: null } }, data: { mfaSecret: null, mfaEnabled: false } }),
    })
  }

  // 3) Entegrasyon ayarları
  const settings = await prisma.integrationSetting.findMany({ where: { isEncrypted: true, encryptedValue: { not: null } }, select: { id: true, key: true, group: true, encryptedValue: true } })
  console.log(`\nşifreli entegrasyon ayarı: ${settings.length}  [mod: ${INTEGRATIONS_MODE}]`)
  for (const s of settings) console.log(`  - ${s.group} / ${s.key}`)
  if (INTEGRATIONS_MODE === 'reencrypt') {
    const conv = settings.map((s) => ({ id: s.id, ...convert(s.encryptedValue) }))
    console.log(`  çevrilebilir ${c(conv, 'ok')}, zaten yeni ${c(conv, 'already')}, ÇÖZÜLEMEYEN ${c(conv, 'fail')}`)
    plan.push({
      label: 'integration_settings çevir',
      run: (tx) => Promise.all(conv.filter((x) => x.status === 'ok').map((x) => tx.integrationSetting.update({ where: { id: x.id }, data: { encryptedValue: x.value } }))),
    })
  } else {
    plan.push({
      label: 'integration_settings.encryptedValue sil (admin panelinden yeniden gir)',
      run: (tx) => tx.integrationSetting.updateMany({ where: { isEncrypted: true }, data: { encryptedValue: null } }),
    })
  }

  const failed = c(subConv, 'fail')
  if (subs.length > 0 && c(subConv, 'ok') === 0 && c(subConv, 'already') === 0) {
    console.error("\nUYARI: hiçbir abonelik token'ı eski anahtarla çözülemedi. OLD_SECRET / OLD_SALT yanlış olabilir.")
  }
  if (failed > 0) console.error(`UYARI: ${failed} abonelik token'ı çözülemedi; bu abonelikler yeniden ödeme yöntemi eklemeli.`)

  if (!APPLY) {
    console.log('\nPlan (--apply ile uygulanır):')
    for (const p of plan) console.log(`  • ${p.label}`)
    await prisma.$disconnect()
    return
  }

  await prisma.$transaction(async (tx) => {
    for (const p of plan) {
      await p.run(tx)
      console.log(`✔ ${p.label}`)
    }
  })
  console.log('\nTamam. API\'yi başlat: pm2 start pureolentia-api. Sıfırlanan MFA hesapları ve entegrasyonlar için yukarıdaki listeyi kullan.')
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('HATA:', e.message)
  process.exit(1)
})
