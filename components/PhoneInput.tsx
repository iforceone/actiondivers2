import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CountryCode, getCountries, getCountryCallingCode, getExampleNumber, parsePhoneNumberFromString } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';

const PRIORITY: CountryCode[] = ['US', 'CA', 'BZ', 'GB', 'MX'];

function countryOptions(): Array<{ code: CountryCode; label: string }> {
  let names: Intl.DisplayNames | null = null;
  try { names = new Intl.DisplayNames(['en'], { type: 'region' }); } catch { names = null; }
  const name = (code: CountryCode) => names?.of(code) ?? code;
  const label = (code: CountryCode) => `+${getCountryCallingCode(code)} ${name(code)}`;
  const rest = getCountries()
    .filter((code) => !PRIORITY.includes(code))
    .sort((a, b) => name(a).localeCompare(name(b)))
    .map((code) => ({ code, label: label(code) }));
  return [...PRIORITY.map((code) => ({ code, label: label(code) })), ...rest];
}

interface PhoneInputProps {
  label: string;
  /** Receives the number in E.164 form (e.g. +15551234567) when valid, otherwise the raw text, plus whether it is valid. */
  onChange: (phone: string, valid: boolean) => void;
  labelClassName?: string;
  fieldClassName?: string;
}

const INVALID_MESSAGE = 'Enter a valid phone number for the selected country, including the area code.';

const PhoneInput: React.FC<PhoneInputProps> = ({ label, onChange, labelClassName = '', fieldClassName = '' }) => {
  const options = useMemo(countryOptions, []);
  const [country, setCountry] = useState<CountryCode>('US');
  const [national, setNational] = useState('');
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsed = national.trim() ? parsePhoneNumberFromString(national, country) : undefined;
  const valid = Boolean(parsed?.isValid());

  useEffect(() => {
    // A number typed with its own "+country code" picks the matching country.
    if (national.trim().startsWith('+') && parsed?.country && parsed.country !== country) setCountry(parsed.country);
  }, [national, parsed?.country, country]);

  useEffect(() => {
    onChange(valid && parsed ? parsed.number : national.trim(), valid);
    inputRef.current?.setCustomValidity(national.trim() && !valid ? INVALID_MESSAGE : '');
    // onChange is intentionally excluded: parents pass inline callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [national, country, valid]);

  const example = getExampleNumber(country, examples)?.formatNational();
  const showError = touched && national.trim() !== '' && !valid;

  return (
    <div className={labelClassName}>
      <label htmlFor="phone-number">{label}</label>
      <div className="mt-2 flex gap-2">
        <select
          aria-label="Country code"
          value={country}
          onChange={(event) => setCountry(event.target.value as CountryCode)}
          className={`${fieldClassName} !mt-0 !w-[7.5rem] shrink-0 sm:!w-40`}
        >
          {options.map((option) => <option key={option.code} value={option.code}>{option.label}</option>)}
        </select>
        <input
          ref={inputRef}
          id="phone-number"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={example ? `e.g. ${example}` : undefined}
          value={national}
          onChange={(event) => setNational(event.target.value)}
          onBlur={() => setTouched(true)}
          aria-invalid={showError}
          aria-describedby={showError ? 'phone-number-error' : undefined}
          className={`${fieldClassName} !mt-0 !w-auto min-w-0 flex-1`}
        />
      </div>
      {showError && <p id="phone-number-error" className="mt-2 text-xs font-normal text-red-200">{INVALID_MESSAGE}</p>}
    </div>
  );
};

export default PhoneInput;
