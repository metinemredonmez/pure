#!/usr/bin/env bash
# 00 — Temiz Ubuntu 24.04 sunucuyu sertleştirir ve gerekli yazılımı kurar.
# Sağlayıcının verdiği ilk root girişiyle, bir kez çalıştırılır.
#
#   ADMIN_USER=emre ADMIN_PUBKEY='ssh-ed25519 AAAA... emre@mac' bash 00-bootstrap.sh
#
# Bitince root ve şifreyle SSH girişi KAPANIR; yalnızca ADMIN_USER'ın anahtarı girer.
# Script sonundaki talimatı uygulamadan root oturumunu kapatma.

source "$(dirname "$0")/lib.sh"
require_root

: "${ADMIN_USER:=emre}"
: "${ADMIN_PUBKEY:?ADMIN_PUBKEY gerekli: Mac üzerindeki ~/.ssh/id_ed25519.pub dosyasının içeriği (tek satır)}"
: "${NODE_MAJOR:=22}"
: "${SWAP_GB:=4}"
: "${INSTALL_CLAMAV:=yes}"   # yüklenen görselleri virüs taramasından geçirir (~1.5 GB RAM)
: "${TIMEZONE:=Europe/Istanbul}"

step "Ön kontroller"
# shellcheck disable=SC1091
. /etc/os-release
[[ "${ID:-}" == "ubuntu" && "${VERSION_ID:-}" == "24.04" ]] || warn "Bu script Ubuntu 24.04 için yazıldı (bulunan: ${PRETTY_NAME:-?})."

[[ "$ADMIN_PUBKEY" != *"PRIVATE KEY"* ]] || die "ADMIN_PUBKEY'e GİZLİ anahtar yapıştırmışsın. Yalnızca .pub dosyasının içeriği gerekli."
case "$ADMIN_PUBKEY" in
  ssh-ed25519\ * | ssh-rsa\ * | ecdsa-sha2-*) ;;
  *) die "ADMIN_PUBKEY geçerli bir SSH genel anahtarı gibi görünmüyor (ssh-ed25519 ... ile başlamalı)." ;;
esac
pubkey_tmp="$(mktemp)"
printf '%s\n' "$ADMIN_PUBKEY" >"$pubkey_tmp"
ssh-keygen -l -f "$pubkey_tmp" >/dev/null || die "ADMIN_PUBKEY okunamadı."
pubkey_fp="$(ssh-keygen -l -f "$pubkey_tmp")"
rm -f "$pubkey_tmp"
log "Yönetici anahtarı: $pubkey_fp"

mem_mb="$(awk '/MemTotal/ {print int($2/1024)}' /proc/meminfo)"
if ((mem_mb < 3500)); then
  warn "RAM ${mem_mb} MB: derleme zorlanır. En az 4 GB, rahat kullanım için 8 GB öneriyoruz."
fi
if [[ "$INSTALL_CLAMAV" == "yes" ]] && ((mem_mb < 7000)); then
  warn "ClamAV ~1.5 GB RAM kullanır; ${mem_mb} MB RAM'de INSTALL_CLAMAV=no düşün."
fi

step "Paketler"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get -y -o Dpkg::Options::=--force-confold upgrade
apt-get install -y --no-install-recommends \
  ca-certificates curl gnupg sudo ufw fail2ban python3-systemd nftables unattended-upgrades auditd \
  nginx postgresql redis-server certbot git build-essential openssl rsync file jq \
  gettext-base logrotate tar xz-utils

step "Node.js ${NODE_MAJOR} (NodeSource apt deposu) ve pm2"
install -d -m 0755 /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor --yes -o /etc/apt/keyrings/nodesource.gpg
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_${NODE_MAJOR}.x nodistro main" >/etc/apt/sources.list.d/nodesource.list
apt-get update -y
apt-get install -y nodejs
npm install -g pm2@5.4.3 --no-audit --no-fund
log "node $(node -v), npm $(npm -v), pm2 $(pm2 -v)"

step "Kullanıcılar"
if ! id "$ADMIN_USER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$ADMIN_USER"
fi
usermod -aG sudo "$ADMIN_USER"
install -d -m 700 -o "$ADMIN_USER" -g "$ADMIN_USER" "/home/$ADMIN_USER/.ssh"
printf '%s\n' "$ADMIN_PUBKEY" >"/home/$ADMIN_USER/.ssh/authorized_keys"
chown "$ADMIN_USER:$ADMIN_USER" "/home/$ADMIN_USER/.ssh/authorized_keys"
chmod 600 "/home/$ADMIN_USER/.ssh/authorized_keys"
# Şifresiz sudo: giriş yalnızca SSH anahtarıyla mümkün olduğu için anahtar = yetki.
echo "$ADMIN_USER ALL=(ALL) NOPASSWD:ALL" >/etc/sudoers.d/90-pure-admin
chmod 440 /etc/sudoers.d/90-pure-admin
visudo -cf /etc/sudoers.d/90-pure-admin >/dev/null

# Uygulama kullanıcısı: giriş kabuğu ve şifresi yok, sudo yetkisi yok.
# Uygulamalardan biri ele geçirilse bile saldırgan root olamaz.
if ! id "$PURE_USER" &>/dev/null; then
  adduser --system --group --home "/home/$PURE_USER" --shell /usr/sbin/nologin "$PURE_USER"
fi
passwd -l root >/dev/null
log "Kullanıcılar hazır: $ADMIN_USER (yönetici), $PURE_USER (uygulama)."

step "SSH sertleştirme"
cat >/etc/ssh/sshd_config.d/10-pure-hardening.conf <<EOF
# 10- öneki: cloud-init'in 50-cloud-init.conf dosyasından (PasswordAuthentication yes) önce okunur, o kazanır.
PermitRootLogin no
PasswordAuthentication no
KbdInteractiveAuthentication no
PubkeyAuthentication yes
AuthenticationMethods publickey
AllowUsers ${ADMIN_USER}
MaxAuthTries 3
LoginGraceTime 20
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding local
ClientAliveInterval 300
ClientAliveCountMax 2
EOF
sshd -t
eff="$(sshd -T)"
grep -qi '^passwordauthentication no' <<<"$eff" || die "sshd hâlâ şifreyle girişe izin veriyor; /etc/ssh/sshd_config.d içindeki dosyalara bak."
grep -qi '^permitrootlogin no' <<<"$eff" || die "sshd hâlâ root girişine izin veriyor."
[[ -s "/home/$ADMIN_USER/.ssh/authorized_keys" ]] || die "Yönetici anahtarı yazılamadı; kilitlenme riski, devam edilmedi."
# Çalışan bu oturum etkilenmez; yeni bağlantılar yeni kurala tabi olur.
systemctl reload ssh || systemctl restart ssh

step "Güvenlik duvarı (ufw)"
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
# SSH portu: 22 + sshd'nin yapılandırmasındaki portlar + şu anki oturumun bağlandığı port.
# (Sağlayıcı imajı farklı bir port kullanıyorsa güvenlik duvarı seni dışarıda bırakmasın.)
ssh_ports="22 $(sshd -T | awk '/^port / {print $2}')"
[[ -n "${SSH_CONNECTION:-}" ]] && ssh_ports="$ssh_ports ${SSH_CONNECTION##* }"
for port in $(tr ' ' '\n' <<<"$ssh_ports" | sort -un); do
  ufw limit "${port}/tcp" comment 'ssh' >/dev/null
done
ufw allow 80/tcp comment 'http' >/dev/null
ufw allow 443/tcp comment 'https' >/dev/null
ufw --force enable >/dev/null
log "Açık portlar: SSH (${ssh_ports//$'\n'/ }; hız sınırlı), 80, 443. Diğer her şey kapalı."

step "fail2ban, otomatik güvenlik güncellemeleri, saat dilimi"
cat >/etc/fail2ban/jail.local <<'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 4
backend  = systemd

[sshd]
enabled = true
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban || warn "fail2ban başlamadı (systemctl status fail2ban); kurulum devam ediyor, sonra düzelt."

cat >/etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
EOF
timedatectl set-timezone "$TIMEZONE"

step "Swap (derleme sırasında bellek güvenliği)"
if [[ -z "$(swapon --show --noheadings)" ]]; then
  fallocate -l "${SWAP_GB}G" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile >/dev/null
  swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >>/etc/fstab
fi
echo 'vm.swappiness=10' >/etc/sysctl.d/90-pure.conf
sysctl -p /etc/sysctl.d/90-pure.conf >/dev/null

step "auditd: kritik dosya değişikliklerini kaydet"
# Kalıcılık için /etc/systemd/system ve /usr/local/bin'e dosya bırakılması klasik bir yöntemdir.
# Bu kurallar böyle bir değişiklikte iz bırakır: sudo ausearch -k systemd_units -i
cat >/etc/audit/rules.d/pure.rules <<EOF
-w /etc/ssh/sshd_config -p wa -k sshd
-w /etc/ssh/sshd_config.d/ -p wa -k sshd
-w /root/.ssh/ -p wa -k ssh_keys
-w /home/${ADMIN_USER}/.ssh/ -p wa -k ssh_keys
-w /etc/systemd/system/ -p wa -k systemd_units
-w /etc/cron.d/ -p wa -k cron
-w /etc/crontab -p wa -k cron
-w /var/spool/cron/ -p wa -k cron
-w /usr/local/bin/ -p wa -k local_bin
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k sudoers
-w /etc/sudoers.d/ -p wa -k sudoers
EOF
systemctl enable --now auditd
augenrules --load >/dev/null || warn "auditd kuralları yüklenemedi; 'sudo augenrules --load' çıktısına bak."

if [[ "$INSTALL_CLAMAV" == "yes" ]]; then
  step "ClamAV (yüklenen dosyaları tarar)"
  apt-get install -y clamav clamav-daemon
  # Uygulama clamd'ye TCP 127.0.0.1:3310 üzerinden bağlanır (upload.service.ts).
  grep -q '^TCPSocket' /etc/clamav/clamd.conf || printf 'TCPSocket 3310\nTCPAddr 127.0.0.1\n' >>/etc/clamav/clamd.conf
  systemctl stop clamav-freshclam || true
  freshclam || warn "Virüs veritabanı indirilemedi; birkaç dakika sonra 'sudo freshclam' dene."
  systemctl enable --now clamav-freshclam
  systemctl enable clamav-daemon
  systemctl restart clamav-daemon || warn "clamav-daemon başlamadı: 'systemctl status clamav-daemon'."
fi

step "Dizinler"
install -d -m 0755 /var/www
install -d -m 0755 /var/www/certbot
install -d -m 0755 -o "$PURE_USER" -g "$PURE_USER" "$LOG_DIR"

cat <<EOF

${c_bold}Bootstrap tamam.${c_off}

ÖNEMLİ — kilitlenmemek için SIRAYLA:
  1) Bu root oturumunu KAPATMA.
  2) Mac'inde yeni bir terminal aç ve dene:
         ssh ${ADMIN_USER}@$(hostname -I | awk '{print $1}')
     Giriş olursa devam et. Olmazsa root oturumundan düzelt (anahtar: /home/${ADMIN_USER}/.ssh/authorized_keys).
  3) Sonraki script'leri ${ADMIN_USER} olarak, sudo ile çalıştır:
         sudo bash 10-database.sh
EOF
