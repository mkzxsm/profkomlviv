# diia-sign-service

Окремий сервіс, який підписує PDF-заяви через Дія.Підпис (сценарій «Підписання хеша файлу», `hashedFilesSigning`).
Він ізолює від основного бекенду секрети Дії (acquirer-токен) і криптографію.

```
Браузер ──► основний Backend ──(X-Api-Key)──► diia-sign-service ──► api2(s).diia.gov.ua
                                                    ▲
             Застосунок Дія ──(HTTPS :443, callback)┘
```

Браузер **ніколи** не звертається до цього сервісу напряму. Назовні через nginx відкритий лише `POST /api/diia/callback`.

## Флоу

1. Backend генерує PDF-заяву (FR-DIIA-4) і викликає `POST /internal/sign-requests`.
2. Сервіс рахує хеш PDF (SHA-256 для ECDSA; також Купина-256 для БД, NFR-SEC-3), створює запит у Дії
   з унікальним `requestId` і повертає `deeplink`. Діплінк **одноразовий і діє 3 хв**.
3. Frontend показує QR з `deeplink` (на телефоні відкриває його напряму) і опитує backend, а backend опитує сервіс:
   `GET /internal/sign-requests/{requestId}`.
4. Застосунок Дія надсилає підпис на `/api/diia/callback`. Сервіс:
   - приймає лише `requestId`, які створив сам, і лише в межах `CallbackWindowMinutes`;
   - перевіряє підпис (див. нижче) **і** що РНОКПП підписанта збігається з `expectedRnokpp` із форми;
   - відповідає `{"success": true}` лише після успішної перевірки, інакше `4xx {"success": false}`
     (тоді Дія покаже користувачу помилку).
5. Коли статус `Signed`, backend забирає `.p7s` через `GET /internal/sign-requests/{id}/signature`
   і зберігає його поруч із PDF у `/storage/signed_statements/{year}/{faculty_code}/` (FR-STORE-2).
   Сесії видаляються через `RetentionDays` (типово 7 днів).

## Внутрішнє API (для основного бекенду)

Усі запити йдуть із заголовком `X-Api-Key: <Security:InternalApiKey>`.

### `POST /internal/sign-requests` (multipart/form-data)

| поле | обов'язкове | опис |
|---|---|---|
| `file` | так | PDF, до `MaxPdfBytes` (10 МБ) |
| `externalRef` | так | ID заяви в основній БД, `[A-Za-z0-9_.:-]{1,100}` |
| `expectedRnokpp` | рекомендовано | 10 цифр із форми. Якщо підписав хтось інший, результат буде `Rejected / SignerMismatch` |
| `fileName` | ні | назва, яку користувач побачить у Дії |
| `returnLink` | ні | лише з префіксом `Diia:AllowedReturnLinkPrefix` |

Відповідь (`200`):
```json
{
  "requestId": "1b9d6bcd-…", "externalRef": "application-42", "status": "Pending",
  "deeplink": "https://diia.app/acquirers/branch/offer/offer-request/…",
  "deeplinkExpiresAtUtc": "…", "sha256": "base64", "kupyna256": "base64", "signAlgorithm": "ECDSA", …
}
```

### `GET /internal/sign-requests/{requestId}`

`status`: `Pending` → `Processing` (користувач відкрив діплінк) → один із кінцевих:

| status | що показати користувачу (FR-DIIA-5) |
|---|---|
| `Signed` | «Заяву успішно підписано». `signer` = `{fullName, rnokpp, certificateSerial, certificateIssuer, signingTimeUtc}` |
| `Refused` | «Ви скасували підписання в Дії» |
| `Expired` | «Час на підписання минув, спробуйте ще раз» |
| `Rejected` | «Не вдалося перевірити підпис». Причина в `failureReason` (`SignerMismatch`, `UntrustedCertificateChain`, …) |

Опитувати раз на 2–3 с. Статус у Дії сервіс запитує не частіше ніж раз на `StatusPollIntervalSeconds`.

> Для ECDSA Дія віддає ПІБ у сертифікаті **латиницею**. Тому заяву з особою зіставляйте за **РНОКПП**, а не за ПІБ.

### `GET /internal/sign-requests/{requestId}/signature`
Повертає `application/pkcs7-signature`: detached CAdES-підпис PDF. Разом із PDF його можна перевірити
на czo.gov.ua/verify.

### Налаштування бранча/офера (одноразово)
Працює лише якщо задано `Security:AdminApiKey`, із заголовком `X-Api-Key: <AdminApiKey>`:
```bash
curl -X POST http://localhost:8080/internal/setup/branches -H "X-Api-Key: $ADMIN" -H "Content-Type: application/json" -d '{
  "name":"Профком студентів ЛНУ","email":"…","region":"Львівська обл.","district":"Львівський р-н",
  "location":"м. Львів","street":"вул. Університетська","house":"1",
  "customFullName":"ППОС ЛНУ ім. І. Франка"}'
curl -X POST http://localhost:8080/internal/setup/branches/<branchId>/offers -H "X-Api-Key: $ADMIN" \
  -H "Content-Type: application/json" -d '{"name":"Заява про вступ до профспілки"}'
```
Отримані `branchId`/`offerId` запишіть у `Diia:BranchId`/`Diia:OfferId`, а `AdminApiKey` після цього приберіть.
Бранчі та офери використовуються повторно, і для кожного середовища (sandbox/prod) вони окремі.

## Перевірка підпису

Типовий алгоритм: `Diia:SignAlgorithm = ECDSA`. Сервіс сам перевіряє все, що потрібно:
1. CMS має рівно одного підписувача, алгоритми SHA-256 і ECDSA;
2. `messageDigest` у підписі дорівнює нашому хешу PDF, тобто підписано саме цей файл;
3. криптографічну коректність підпису;
4. що `signingTime` не раніший за створення запиту і не з майбутнього;
5. чинність сертифіката на момент підпису та keyUsage (nonRepudiation або digitalSignature);
6. ланцюжок до кореневого ЦЗО з `CACertificates(.Test.All).p7b` від ІІТ (`scripts/fetch-ca-certs.sh`).

### Обмеження / TODO
- **Відкликання сертифіката (OCSP/CRL) не перевіряється.** Для повної відповідності кваліфікованому підпису
  потрібно або додати OCSP-запит до КНЕДП «ДІЯ», або перевіряти через бібліотеку ІІТ.
- **`DSTU4145-DSTU7564` (підпис ДСТУ 4145 + Купина) ще не підтримується.** Для нього потрібна бібліотека ІІТ
  EUSignCP для C# (https://iit.com.ua → «Бібліотека підпису користувача ЦСК з C#-інтерфейсом»).
  Посилання з інструкції Дії вже застаріли. Щоб підключити:
  реалізуйте `ISignatureVerifier` на базі EUSignCP, зареєструйте його в `Program.cs` замість `IitNotIntegratedVerifier`
  і приберіть заборону DSTU у Production. До того сервіс у цьому режимі відхиляє всі підписи і не стартує в Production.
- Хеш «Купина-256» (ДСТУ 7564) рахується завжди і повертається як `kupyna256`, щоб зберігати його в основній БД
  для контролю цілісності PDF (NFR-SEC-3), незалежно від алгоритму підпису.
- Перед продом перевірте в sandbox, що для `ECDSA` Дія очікує в `fileHash` саме SHA-256 файлу.
  Розділ 3.5 інструкції в цьому місці суперечить розділу 2.1.2.

## Конфігурація

Секрети задаються **лише** через змінні оточення або user-secrets, а не в `appsettings.json`:

| змінна | опис |
|---|---|
| `Diia__Environment` | `Sandbox` / `Production` |
| `Diia__BaseUrl` | `https://api2s.diia.gov.ua` / `https://api2.diia.gov.ua` |
| `Diia__AcquirerToken` | acquirer-токен |
| `Diia__AuthAcquirerToken` | Basic-токен (лише sandbox) |
| `Diia__BranchId`, `Diia__OfferId` | див. «Налаштування бранча/офера» |
| `Diia__AllowedReturnLinkPrefix` | напр. `https://ppos.lnu.edu.ua/` (необов'язково) |
| `Security__InternalApiKey` | ≥ 32 символи, напр. `openssl rand -base64 48` |
| `Security__AdminApiKey` | лише на час налаштування |
| `Security__KnownProxies__0` | IP nginx, щоб rate limit рахувався за реальним IP клієнта |
| `Verification__CaCertificatesPath` | `certs/CACertificates.p7b` для prod |

Локально:
```bash
scripts/fetch-ca-certs.sh test
cd DiiaSign.Api
dotnet user-secrets set Diia:AcquirerToken "…"
dotnet user-secrets set Diia:AuthAcquirerToken "…"
dotnet user-secrets set Security:InternalApiKey "$(openssl rand -base64 48)"
dotnet run
```
Для callback у sandbox потрібен публічний HTTPS на порту 443 (ngrok, cloudflared тощо). Адресу ендпоінта
(`https://<домен>/api/diia/callback`) налаштовують співробітники Дії, тож повідомте її їм.

Docker:
```bash
docker build --build-arg DIIA_CA_ENV=prod -t diia-sign-service .
docker run -d -p 127.0.0.1:8080:8080 -v diia-sign-data:/app/data --env-file diia.env diia-sign-service
```

### nginx (TLS тут, порт 443, keepalive)
```nginx
location = /api/diia/callback {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
    client_max_body_size 1m;
}
# /internal/* назовні НЕ публікувати
```

`CACertificates*.p7b` оновлюйте періодично (наприклад, щотижня через cron перезапускати `fetch-ca-certs.sh` і сервіс).

## Тести
```bash
dotnet test
```
Тести генерують тестову ECDSA-PKI (корінь → КНЕДП → підписант) і проганяють увесь флоу через HTTP:
коректний підпис, чужий РНОКПП, недовірений ЦСК, протермінований сертифікат, повтор і конфлікт callback,
невідомий `requestId`, відмова в Дії, не-PDF. Якщо бандли ІІТ завантажено, окремий тест перевіряє,
що ланцюжок КНЕДП «ДІЯ» (ECDSA) будується до реального кореня ЦЗО.
