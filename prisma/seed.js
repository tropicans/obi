"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("./generated/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var user, pet, templates, _i, templates_1, t, dailyTemplate, biDailyTemplate, weeklyTemplate, biWeeklyTemplate, schedules, _a, schedules_1, s, existing;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🌱 Seeding database...');
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { phoneE164: '+6281234567890' },
                            update: {},
                            create: {
                                name: 'Owner',
                                phoneE164: '+6281234567890',
                                timezone: 'Asia/Jakarta',
                            },
                        })];
                case 1:
                    user = _b.sent();
                    console.log('✅ User created:', user.name);
                    return [4 /*yield*/, prisma.pet.upsert({
                            where: { id: 'obi-default' },
                            update: {},
                            create: {
                                id: 'obi-default',
                                userId: user.id,
                                name: 'Obi',
                                species: 'Betta',
                                tankLiters: 2.6,
                            },
                        })];
                case 2:
                    pet = _b.sent();
                    console.log('✅ Pet created:', pet.name);
                    templates = [
                        {
                            key: 'daily',
                            title: 'HARIAN – Obi 🐠',
                            body: "1) Cek perilaku (aktif? responsif?)\n2) Cek air (bau/keruh/lapisan?)\n3) Pakan: 1\u20132 butir pelet (1\u00D7)\n\nBalas: SELESAI / TUNDA / CATAT:...",
                        },
                        {
                            key: 'bi_daily',
                            title: 'GANTI AIR – Obi (30–40%) 💧',
                            body: "\u2022 Air baru suhu sama & diendapkan\n\u2022 Jangan aduk dasar agresif\n\nBalas: SELESAI / TUNDA",
                        },
                        {
                            key: 'weekly',
                            title: 'MINGGUAN – Obi 🧹',
                            body: "\u2022 Sedot kotoran sela kerikil\n\u2022 Cek tanaman (pangkas daun rusak)\n\u2022 Evaluasi ketapang (angkat jika lembek)\n\nBalas: SELESAI / TUNDA",
                        },
                        {
                            key: 'bi_weekly',
                            title: '2 MINGGU – Obi (±50%) 🔄',
                            body: "\u2022 Ganti air \u00B150%\n\u2022 Tata ulang ringan tanaman/dekor\n\u2022 Reset mikro\n\nBalas: SELESAI / TUNDA",
                        },
                        {
                            key: 'emergency',
                            title: '⚠️ DARURAT – Obi',
                            body: "\u2022 Ganti air 40% SEGERA\n\u2022 Angkat ketapang jika ragu\n\u2022 Pantau: sering ke permukaan / diam lama / air bau\n\nBalas: SELESAI",
                        },
                    ];
                    _i = 0, templates_1 = templates;
                    _b.label = 3;
                case 3:
                    if (!(_i < templates_1.length)) return [3 /*break*/, 6];
                    t = templates_1[_i];
                    return [4 /*yield*/, prisma.messageTemplate.upsert({
                            where: { key: t.key },
                            update: { title: t.title, body: t.body },
                            create: t,
                        })];
                case 4:
                    _b.sent();
                    console.log('✅ Template created:', t.key);
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [4 /*yield*/, prisma.messageTemplate.findUnique({ where: { key: 'daily' } })];
                case 7:
                    dailyTemplate = _b.sent();
                    return [4 /*yield*/, prisma.messageTemplate.findUnique({ where: { key: 'bi_daily' } })];
                case 8:
                    biDailyTemplate = _b.sent();
                    return [4 /*yield*/, prisma.messageTemplate.findUnique({ where: { key: 'weekly' } })];
                case 9:
                    weeklyTemplate = _b.sent();
                    return [4 /*yield*/, prisma.messageTemplate.findUnique({ where: { key: 'bi_weekly' } })];
                case 10:
                    biWeeklyTemplate = _b.sent();
                    schedules = [
                        { templateId: dailyTemplate.id, cron: '0 9 * * *', key: 'daily' }, // 9 AM daily
                        { templateId: biDailyTemplate.id, cron: '0 9 */2 * *', key: 'bi_daily' }, // 9 AM every 2 days
                        { templateId: weeklyTemplate.id, cron: '0 10 * * 0', key: 'weekly' }, // 10 AM Sunday
                        { templateId: biWeeklyTemplate.id, cron: '0 10 1,15 * *', key: 'bi_weekly' }, // 10 AM 1st & 15th
                    ];
                    _a = 0, schedules_1 = schedules;
                    _b.label = 11;
                case 11:
                    if (!(_a < schedules_1.length)) return [3 /*break*/, 15];
                    s = schedules_1[_a];
                    return [4 /*yield*/, prisma.schedule.findFirst({
                            where: { userId: user.id, petId: pet.id, templateId: s.templateId },
                        })];
                case 12:
                    existing = _b.sent();
                    if (!!existing) return [3 /*break*/, 14];
                    return [4 /*yield*/, prisma.schedule.create({
                            data: {
                                userId: user.id,
                                petId: pet.id,
                                templateId: s.templateId,
                                cron: s.cron,
                                enabled: true,
                            },
                        })];
                case 13:
                    _b.sent();
                    console.log('✅ Schedule created:', s.key);
                    _b.label = 14;
                case 14:
                    _a++;
                    return [3 /*break*/, 11];
                case 15:
                    console.log('🌱 Seeding completed!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
