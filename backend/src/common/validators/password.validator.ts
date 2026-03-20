import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

/**
 * Şifre politikası kuralları:
 * - En az 8 karakter
 * - En az 1 büyük harf
 * - En az 1 küçük harf
 * - En az 1 rakam
 * - En az 1 özel karakter (!@#$%^&*(),.?":{}|<>)
 * - Yaygın şifreler değil (password123, 12345678, vb.)
 */
@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  private failureReason = '';

  // Yaygın/zayıf şifreler listesi
  private readonly commonPasswords = [
    'password',
    'password123',
    '12345678',
    '123456789',
    'qwerty123',
    'qwertyui',
    'admin123',
    'letmein',
    'welcome',
    'monkey123',
    'dragon123',
    'master123',
    'sunshine',
    'princess',
    'football',
    'iloveyou',
    'trustno1',
    'abc12345',
    'password1',
    'parola123',
    'sifre123',
    'turkiye1',
  ];

  validate(password: string, _args: ValidationArguments): boolean {
    if (!password) {
      this.failureReason = 'Şifre gerekli';
      return false;
    }

    // Minimum uzunluk
    if (password.length < 8) {
      this.failureReason = 'Şifre en az 8 karakter olmalı';
      return false;
    }

    // Maksimum uzunluk
    if (password.length > 128) {
      this.failureReason = 'Şifre en fazla 128 karakter olabilir';
      return false;
    }

    // Büyük harf kontrolü
    if (!/[A-Z]/.test(password)) {
      this.failureReason = 'Şifre en az 1 büyük harf içermeli';
      return false;
    }

    // Küçük harf kontrolü
    if (!/[a-z]/.test(password)) {
      this.failureReason = 'Şifre en az 1 küçük harf içermeli';
      return false;
    }

    // Rakam kontrolü
    if (!/[0-9]/.test(password)) {
      this.failureReason = 'Şifre en az 1 rakam içermeli';
      return false;
    }

    // Özel karakter kontrolü
    if (!/[!@#$%^&*(),.?":{}|<>\-_=+[\]\\;'/`~]/.test(password)) {
      this.failureReason =
        'Şifre en az 1 özel karakter içermeli (!@#$%^&* vb.)';
      return false;
    }

    // Yaygın şifre kontrolü
    if (this.commonPasswords.includes(password.toLowerCase())) {
      this.failureReason =
        'Bu şifre çok yaygın. Lütfen daha güçlü bir şifre seçin';
      return false;
    }

    // Ardışık karakter kontrolü (aaa, 111, abc, 123 vb.)
    if (this.hasSequentialChars(password, 4)) {
      this.failureReason =
        'Şifre ardışık karakterler içermemeli (aaaa, 1234, abcd vb.)';
      return false;
    }

    return true;
  }

  defaultMessage(_args: ValidationArguments): string {
    return this.failureReason || 'Şifre güvenlik gereksinimlerini karşılamıyor';
  }

  private hasSequentialChars(password: string, minLength: number): boolean {
    const lower = password.toLowerCase();

    // Aynı karakter tekrarı (aaaa, 1111)
    for (let i = 0; i <= lower.length - minLength; i++) {
      const char = lower[i];
      let count = 1;
      for (let j = i + 1; j < lower.length && lower[j] === char; j++) {
        count++;
      }
      if (count >= minLength) return true;
    }

    // Ardışık karakterler (abcd, 1234)
    for (let i = 0; i <= lower.length - minLength; i++) {
      let isSequential = true;
      for (let j = 0; j < minLength - 1; j++) {
        if (lower.charCodeAt(i + j + 1) - lower.charCodeAt(i + j) !== 1) {
          isSequential = false;
          break;
        }
      }
      if (isSequential) return true;

      // Ters ardışık (dcba, 4321)
      isSequential = true;
      for (let j = 0; j < minLength - 1; j++) {
        if (lower.charCodeAt(i + j) - lower.charCodeAt(i + j + 1) !== 1) {
          isSequential = false;
          break;
        }
      }
      if (isSequential) return true;
    }

    return false;
  }
}

/**
 * Güçlü şifre doğrulama decorator'ı
 *
 * @example
 * @IsStrongPassword({ message: 'Şifre güvenlik gereksinimlerini karşılamıyor' })
 * password: string;
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsStrongPasswordConstraint,
    });
  };
}

/**
 * Şifre gücü hesaplama (0-100)
 */
export function calculatePasswordStrength(password: string): {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  suggestions: string[];
} {
  let score = 0;
  const suggestions: string[] = [];

  if (!password) {
    return { score: 0, level: 'weak', suggestions: ['Şifre gerekli'] };
  }

  // Uzunluk puanı
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 10;
  if (password.length < 8) suggestions.push('En az 8 karakter kullanın');

  // Karakter çeşitliliği
  if (/[a-z]/.test(password)) score += 10;
  else suggestions.push('Küçük harf ekleyin');

  if (/[A-Z]/.test(password)) score += 15;
  else suggestions.push('Büyük harf ekleyin');

  if (/[0-9]/.test(password)) score += 15;
  else suggestions.push('Rakam ekleyin');

  if (/[!@#$%^&*(),.?":{}|<>\-_=+[\]\\;'/`~]/.test(password)) score += 20;
  else suggestions.push('Özel karakter ekleyin');

  // Benzersizlik bonusu
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 5;

  // Level belirleme
  let level: 'weak' | 'fair' | 'good' | 'strong';
  if (score < 30) level = 'weak';
  else if (score < 50) level = 'fair';
  else if (score < 75) level = 'good';
  else level = 'strong';

  return { score: Math.min(score, 100), level, suggestions };
}
