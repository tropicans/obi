# Obi Reminder 🐠

Aplikasi pengingat perawatan ikan cupang **Obi** via WhatsApp menggunakan Fonnte API.

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start development server
npm run start:dev
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET | List users |
| `/api/pets` | GET | List pets |
| `/api/templates` | GET | List message templates |
| `/api/schedules` | GET | List schedules |
| `/api/logs` | GET | List message logs |
| `/api/emergency/:petId` | POST | Trigger emergency reminder |
| `/api/test/send` | POST | Test send message |
| `/webhook/fonnte` | POST | Fonnte webhook handler |

## Environment Variables

```env
PORT=3007
DATABASE_URL="file:./dev.db"
FONNTE_API_KEY=your_fonnte_api_key
DEFAULT_PHONE=6281234567890
```

## Documentation

See [docs/](./docs/) for detailed documentation.
