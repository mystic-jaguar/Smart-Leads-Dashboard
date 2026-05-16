import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from './models/User';
import Lead from './models/Lead';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-leads';

const users = [
  { name: 'Admin User', email: 'admin@smartleads.com', password: 'admin123', role: 'admin' as const },
  { name: 'Sarah Johnson', email: 'sarah@smartleads.com', password: 'sales123', role: 'sales' as const },
  { name: 'Mike Chen', email: 'mike@smartleads.com', password: 'sales123', role: 'sales' as const },
];

const firstNames = [
  'Rahul','Priya','James','Emily','Carlos','Aisha','Tom','Nina','David','Fatima',
  'Lucas','Yuki','Sofia','Omar','Hannah','Arjun','Chloe','Ethan','Zara','Marco',
  'Lena','Kevin','Amara','Felix','Isabel','Ravi','Mia','Hassan','Elena','Patrick',
  'Nadia','Samuel','Layla','Victor','Mei','Andre','Jasmine','Tobias','Sana','Diego',
  'Ingrid','Kwame','Valentina','Soren','Amina','Brendan','Yuna','Matteo','Leila','Finn',
  'Chiara','Tariq','Astrid','Rohan','Camille','Elias','Nour','Sebastien','Hana','Declan',
  'Miriam','Javier','Freya','Aditi','Luca','Zainab','Mikael','Serena','Kofi','Beatriz',
  'Nikolai','Fatou','Callum','Ananya','Emre','Sienna','Darius','Ines','Olaf','Preethi',
  'Bastian','Nkechi','Tristan','Yara','Cian','Malak','Sven','Divya','Remy','Aiko',
  'Thiago','Soraya','Eoin','Meera','Axel','Zara','Hamid','Lucia','Cormac','Tanvi',
];

const lastNames = [
  'Sharma','Patel','Wilson','Davis','Rivera','Khan','Bradley','Rossi','Park','Al-Hassan',
  'Müller','Tanaka','Andrade','Farooq','Lee','Mehta','Martin','Brooks','Ahmed','Bianchi',
  'Fischer','Nguyen','Osei','Weber','Santos','Kapoor','Schmidt','Hassan','Petrov','O\'Brien',
  'Ivanova','Okafor','Reyes','Zhang','Dubois','Johansson','Nakamura','Ferreira','Lindqvist','Nkosi',
  'Bergmann','Adeyemi','Moreau','Svensson','Diallo','Murphy','Kim','Romano','Khalil','Eriksson',
  'Russo','Yilmaz','Holm','Gupta','Laurent','Andersen','Farouk','Persson','Watanabe','Gallagher',
  'Conti','Ozturk','Magnusson','Iyer','Blanc','Christensen','Mansour','Larsson','Suzuki','Walsh',
  'Greco','Demir','Nilsson','Pillai','Girard','Nielsen','Saleh','Olsson','Yamamoto','Brennan',
  'Ferrari','Kaya','Gustafsson','Nair','Lefevre','Rasmussen','Qureshi','Lund','Kobayashi','Doyle',
  'Esposito','Sahin','Lindgren','Menon','Dupont','Madsen','Mirza','Strand','Ito','Fitzgerald',
];

const domains = [
  'gmail.com','outlook.com','yahoo.com','company.com','business.com','corp.com',
  'tech.io','startup.de','agency.br','solutions.pk','media.kr','fintech.in',
  'creative.fr','saas.us','retail.uk','ecom.it','ventures.ae','design.jp',
  'studio.it','email.com','enterprise.com','global.net','digital.co','cloud.io',
];

const statuses = ['New', 'Contacted', 'Qualified', 'Lost'] as const;
const sources = ['Website', 'Instagram', 'Referral'] as const;

// Weighted distributions for realistic data
const statusWeights = [0.35, 0.30, 0.25, 0.10]; // New, Contacted, Qualified, Lost
const sourceWeights = [0.45, 0.30, 0.25];        // Website, Instagram, Referral

function weightedPick<T>(items: readonly T[], weights: number[]): T {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < items.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return items[i];
  }
  return items[items.length - 1];
}

function randomEmail(first: string, last: string): string {
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const formats = [
    `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
    `${first.toLowerCase()}${last.toLowerCase().slice(0, 3)}@${domain}`,
    `${first.toLowerCase()[0]}${last.toLowerCase()}@${domain}`,
  ];
  return formats[Math.floor(Math.random() * formats.length)];
}

// Generate a date within a range of days ago (with some randomness within the window)
function daysAgo(minDays: number, maxDays: number): Date {
  const ms = (minDays + Math.random() * (maxDays - minDays)) * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms);
}

// Spread leads across time windows so date range filter shows meaningful differences:
// ~40 leads in last 7 days, ~80 in 8-30 days, ~80 in 31-90 days, ~60 in 91-365 days
const timeWindows: Array<{ min: number; max: number; count: number }> = [
  { min: 0,   max: 7,   count: 40  },
  { min: 8,   max: 30,  count: 80  },
  { min: 31,  max: 90,  count: 80  },
  { min: 91,  max: 365, count: 60  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Lead.deleteMany({});
    console.log('Cleared existing data');

    const createdUsers = await User.create(users);
    console.log(`Created ${createdUsers.length} users`);

    const adminUser = createdUsers.find((u) => u.role === 'admin')!;
    const salesUsers = createdUsers.filter((u) => u.role === 'sales');
    const allUsers = [adminUser, ...salesUsers];

    const leads: object[] = [];
    let idx = 0;

    for (const window of timeWindows) {
      for (let i = 0; i < window.count; i++) {
        const first = firstNames[idx % firstNames.length];
        const last = lastNames[idx % lastNames.length];
        // Ensure unique emails by appending index when needed
        const email = randomEmail(first, last).replace('@', `${idx}@`);
        leads.push({
          name: `${first} ${last}`,
          email,
          status: weightedPick(statuses, statusWeights),
          source: weightedPick(sources, sourceWeights),
          createdBy: allUsers[idx % allUsers.length]._id,
          createdAt: daysAgo(window.min, window.max),
        });
        idx++;
      }
    }

    await Lead.create(leads);
    console.log(`Created ${leads.length} leads`);

    console.log('\n--- Seed complete ---');
    console.log('Login credentials:');
    console.log('  Admin  → admin@smartleads.com  / admin123');
    console.log('  Sales  → sarah@smartleads.com  / sales123');
    console.log('  Sales  → mike@smartleads.com   / sales123');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
