import { internalMutation } from "./_generated/server";

const DEMO = [
  { title: "Apartament 2 camere, Floreasca", category: "imobiliare", subcategory: "apartamente-vanzare", price: 145000, county: "București", city: "Sector 1", rooms: 2, area: 58, description: "Apartament luminos, renovat complet în 2024, aproape de parc și metrou." },
  { title: "Garsonieră de închiriat lângă UMF", category: "imobiliare", subcategory: "apartamente-inchiriere", price: 1900, county: "Cluj", city: "Cluj-Napoca", rooms: 1, area: 32, description: "Mobilată și utilată, disponibilă imediat. Contract minim 12 luni." },
  { title: "Volkswagen Golf 7 1.6 TDI", category: "auto", subcategory: "autoturisme", price: 42000, county: "Timiș", city: "Timișoara", year: 2017, mileage: 168000, fuel: "Motorină", gearbox: "Manuală", condition: "used" as const, description: "Întreținut la reprezentanță, carte service, 2 seturi de roți." },
  { title: "Dacia Spring Electric", category: "auto", subcategory: "autoturisme", price: 55000, county: "Brașov", city: "Brașov", year: 2022, mileage: 24000, fuel: "Electric", gearbox: "Automată", condition: "used" as const, description: "Garanție până în 2027, încărcător inclus." },
  { title: "iPhone 15 128GB, ca nou", category: "electronice", subcategory: "telefoane", price: 3100, county: "Iași", city: "Iași", condition: "used" as const, description: "Baterie 96%, cutie și factură." },
  { title: "Laptop Lenovo ThinkPad T14", category: "electronice", subcategory: "laptopuri", price: 2600, county: "Cluj", city: "Cluj-Napoca", condition: "used" as const, description: "Ryzen 7, 16GB RAM, 512GB SSD." },
  { title: "Canapea extensibilă gri", category: "casa-gradina", subcategory: "mobila", price: 900, county: "Constanța", city: "Constanța", condition: "used" as const, description: "Stare foarte bună, se ridică din oraș." },
  { title: "Bicicletă de munte Trek Marlin 5", category: "sport-hobby", subcategory: "biciclete", price: 1800, county: "Sibiu", city: "Sibiu", condition: "used" as const, description: "Mărime M, frâne hidraulice, puțin folosită." },
  { title: "Cărucior 3 în 1 Cybex", category: "copii", subcategory: "carucioare", price: 0, county: "Prahova", city: "Ploiești", condition: "used" as const, description: "Îl dăm gratuit, copilul a crescut." },
  { title: "Instalator autorizat, intervenții rapide", category: "servicii", subcategory: "reparatii", price: 150, county: "București", city: "Sector 3", description: "Intervenții în aceeași zi, prețul este pentru deplasare." },
];

/** Inserts demo listings. Run with: bunx convex run seed:run */
export const run = internalMutation({
  args: {},
  handler: async (ctx) => {
    for (const d of DEMO) {
      await ctx.db.insert("listings", {
        ...d,
        negotiable: d.price > 0,
        images: [],
        sellerId: "demo",
        sellerName: "Ofry Demo",
        status: "active",
        views: 0,
        searchText: `${d.title} ${d.description} ${d.city}`,
      });
    }
    return DEMO.length;
  },
});
