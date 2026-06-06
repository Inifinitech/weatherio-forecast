//  In-memory store
//  In production, replace these arrays with database calls.
//  The shape and the function signatures stay the same — only the
//  storage layer changes.
export const farms = [
    {
        id: 'farm-001',
        name: 'Kapkimolwa Farm',
        farmer: 'John Kiprotich',
        phone: '+254712345678',
        county: 'Bomet',
        lat: -0.7764,
        lon: 35.3466,
        landAcres: 2.5,
        cropType: 'Tea',
        notes: 'Tea plantation, Block A and B active. Northern section recently pruned.',
        createdAt: '2026-01-15T08:00:00.000Z',
        bomRegistered: true,
    },
    {
        id: 'farm-002',
        name: 'Nyahururu Dairy Plot',
        farmer: 'Grace Wanjiku',
        phone: '+254723456789',
        county: 'Laikipia',
        lat: 0.0281,
        lon: 36.3599,
        landAcres: 5.0,
        cropType: 'Pasture / Napier Grass',
        notes: 'Mixed dairy farm. Feeds 12 Friesian cows. Water source from stream on western boundary.',
        createdAt: '2026-02-03T09:30:00.000Z',
        bomRegistered: false,
    },
    {
        id: 'farm-003',
        name: 'Nakuru Maize Block',
        farmer: 'Samuel Mutua',
        phone: '+254734567890',
        county: 'Nakuru',
        lat: -0.3031,
        lon: 36.0800,
        landAcres: 8.0,
        cropType: 'Maize',
        notes: 'Two seasons per year. Currently in long-rain planting window. Sandy loam soil.',
        createdAt: '2026-03-20T07:00:00.000Z',
        bomRegistered: false,
    },
];
export const alerts = [
    {
        id: 'alert-001',
        farmId: 'farm-001',
        metric: 'rainfall',
        operator: 'gt',
        threshold: 20,
        message: 'Heavy rain at {farm}. Avoid fertilizer application and check drainage channels.',
        active: true,
        createdAt: '2026-04-01T00:00:00.000Z',
    },
    {
        id: 'alert-002',
        farmId: 'farm-003',
        metric: 'temp_max',
        operator: 'gt',
        threshold: 32,
        message: 'High temperature alert for {farm}. Ensure crops are adequately irrigated.',
        active: true,
        createdAt: '2026-04-15T00:00:00.000Z',
    },
];
export const treeScans = [];
