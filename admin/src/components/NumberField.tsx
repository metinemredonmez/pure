'use client';

import { TextField, TextFieldProps } from '@mui/material';
import { useEffect, useState } from 'react';

type Props = Omit<TextFieldProps, 'value' | 'onChange' | 'type'> & {
  value: number | null | undefined;
  onValueChange: (value: number) => void;
  /** Alan boş bırakıldığında üst state'e gönderilecek değer (varsayılan 0). */
  emptyValue?: number;
};

/**
 * Sayı girişi için MUI TextField sarmalayıcısı.
 *
 * Sorun: `<TextField type="number" value={x} onChange={e => set(Number(e.target.value))} />`
 * kalıbında alanı boşaltınca `Number('')` => 0 oluyor ve "0" bir türlü silinemiyor,
 * yeni değer yazmak zorlaşıyordu. Bu bileşen düzenleme sırasında metni kendi içinde
 * string olarak tutar (boş kalabilir), üst state'e sayıyı gönderir; alandan çıkınca
 * boşsa emptyValue'ya döner.
 */
export function NumberField({ value, onValueChange, emptyValue = 0, ...rest }: Props) {
  const toText = (v: number | null | undefined) =>
    v === null || v === undefined || Number.isNaN(v) ? '' : String(v);

  const [text, setText] = useState<string>(toText(value));

  // Dış value değişince (ör. sunucudan yüklenince) senkronla; kullanıcı aynı sayıyı
  // yazarken imleci/gösterimi ezmemek için sayısal olarak eşitse dokunma.
  useEffect(() => {
    const external = toText(value);
    setText((prev) => (Number(prev) === Number(external) && prev !== '' ? prev : external));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <TextField
      {...rest}
      type="number"
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        if (raw === '' || raw === '-' || raw === '.') {
          onValueChange(emptyValue);
        } else {
          const n = Number(raw);
          if (!Number.isNaN(n)) onValueChange(n);
        }
      }}
      onBlur={(e) => {
        if (text === '' || text === '-' || text === '.') setText(String(emptyValue));
        rest.onBlur?.(e);
      }}
    />
  );
}

export default NumberField;
