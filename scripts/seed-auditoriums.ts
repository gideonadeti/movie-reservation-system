import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type AuditoriumConfig = {
  name: string;
  capacity: number;
};

/**
 * Generate 28 auditoriums with varied capacities
 * - Small: 50-100 seats (8 auditoriums)
 * - Medium: 100-200 seats (12 auditoriums)
 * - Large: 200-300 seats (8 auditoriums)
 */
function generateAuditoriumConfigs(): AuditoriumConfig[] {
  const configs: AuditoriumConfig[] = [];

  // Small auditoriums (50-100 seats) - 8 auditoriums
  const smallCapacities = [65, 72, 58, 85, 90, 55, 78, 95];

  for (let i = 0; i < 8; i++) {
    configs.push({
      name: `Auditorium ${i + 1}`,
      capacity: smallCapacities[i],
    });
  }

  // Medium auditoriums (100-200 seats) - 12 auditoriums
  const mediumCapacities = [
    125, 150, 110, 175, 140, 165, 130, 190, 115, 160, 145, 180,
  ];

  for (let i = 0; i < 12; i++) {
    configs.push({
      name: `Auditorium ${i + 9}`,
      capacity: mediumCapacities[i],
    });
  }

  // Large auditoriums (200-300 seats) - 8 auditoriums
  const largeCapacities = [220, 250, 210, 280, 240, 270, 230, 260];

  for (let i = 0; i < 8; i++) {
    configs.push({
      name: `Auditorium ${i + 21}`,
      capacity: largeCapacities[i],
    });
  }

  return configs;
}

/**
 * Generate row letters (A-Z, skipping I to avoid confusion)
 * If more than 25 rows needed, continues with AA, AB, etc.
 */
function getRowLetters(count: number): string[] {
  const letters: string[] = [];
  const alphabet = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'; // 25 letters (skipping I)
  const baseCount = alphabet.length;

  for (let i = 0; i < count; i++) {
    if (i < baseCount) {
      letters.push(alphabet[i]);
    } else {
      // After Z, use AA, AB, AC, etc.
      const prefixIndex = Math.floor((i - baseCount) / baseCount);
      const suffixIndex = (i - baseCount) % baseCount;
      const prefix = alphabet[prefixIndex];
      const suffix = alphabet[suffixIndex];

      letters.push(prefix + suffix);
    }
  }

  return letters;
}

/**
 * Generate realistic seat layout for an auditorium
 * - Middle rows are wider, edge rows are narrower
 * - Total seats match capacity exactly
 */
function generateSeatLabels(capacity: number): string[] {
  const seats: string[] = [];
  const avgSeatsPerRow = Math.floor(capacity / 12); // Aim for ~12 rows
  const minSeatsPerRow = Math.max(6, avgSeatsPerRow - 3);
  const maxSeatsPerRow = avgSeatsPerRow + 4;

  // Calculate number of rows needed
  let estimatedRows = Math.ceil(capacity / avgSeatsPerRow);
  estimatedRows = Math.max(8, Math.min(25, estimatedRows)); // Between 8-25 rows

  const rowLetters = getRowLetters(estimatedRows);
  const rowSeatCounts: number[] = [];

  // Generate seat counts per row (wider in middle, narrower at edges)
  for (let i = 0; i < estimatedRows; i++) {
    const position = i / (estimatedRows - 1); // 0 to 1
    const widthFactor = 1 - Math.abs(position - 0.5) * 2; // Wider in middle
    const seatsInRow = Math.round(
      minSeatsPerRow + (maxSeatsPerRow - minSeatsPerRow) * widthFactor,
    );

    rowSeatCounts.push(seatsInRow);
  }

  // Adjust to match exact capacity
  const totalSeats = rowSeatCounts.reduce((sum, count) => sum + count, 0);
  const difference = capacity - totalSeats;

  if (difference !== 0) {
    // Distribute the difference across rows, prioritizing middle rows
    const sortedIndices = rowSeatCounts
      .map((count, index) => ({ count, index }))
      .sort((a, b) => {
        const aPos = Math.abs(a.index / (estimatedRows - 1) - 0.5);
        const bPos = Math.abs(b.index / (estimatedRows - 1) - 0.5);
        return aPos - bPos; // Middle rows first
      });

    const adjustment = difference > 0 ? 1 : -1;
    const absDiff = Math.abs(difference);

    for (let i = 0; i < absDiff; i++) {
      const targetIndex = sortedIndices[i % sortedIndices.length].index;
      rowSeatCounts[targetIndex] += adjustment;
    }
  }

  // Generate seat labels
  for (let rowIndex = 0; rowIndex < rowLetters.length; rowIndex++) {
    const rowLetter = rowLetters[rowIndex];
    const seatsInRow = rowSeatCounts[rowIndex];

    for (let seatNum = 1; seatNum <= seatsInRow; seatNum++) {
      seats.push(`${rowLetter}${seatNum}`);
    }
  }

  // Final adjustment if there's still a mismatch (shouldn't happen, but safety check)
  if (seats.length !== capacity) {
    const finalDiff = capacity - seats.length;

    if (finalDiff > 0) {
      // Add seats to the last row
      const lastRow = rowLetters[rowLetters.length - 1];

      for (let i = 1; i <= finalDiff; i++) {
        seats.push(`${lastRow}${rowSeatCounts[rowSeatCounts.length - 1] + i}`);
      }
    } else if (finalDiff < 0) {
      // Remove seats from the end
      seats.splice(capacity);
    }
  }

  return seats;
}

async function seedAuditoriums(): Promise<void> {
  try {
    console.log('Starting auditorium and seat seeding...');

    const configs = generateAuditoriumConfigs();

    console.log(`Generated ${configs.length} auditorium configurations.`);

    // Check existing auditoriums
    const existingAuditoriums = await prisma.auditorium.findMany({
      select: { name: true },
    });

    const existingNames = new Set(existingAuditoriums.map((a) => a.name));
    const auditoriumsToCreate = configs.filter(
      (config) => !existingNames.has(config.name),
    );

    if (auditoriumsToCreate.length === 0) {
      console.log('All auditoriums already exist. Skipping seed operation.');

      return;
    }

    console.log(
      `Found ${existingAuditoriums.length} existing auditoriums. Creating ${auditoriumsToCreate.length} new auditoriums...`,
    );

    // Create auditoriums and seats
    for (const config of auditoriumsToCreate) {
      console.log(
        `Creating ${config.name} with capacity ${config.capacity}...`,
      );

      const seatLabels = generateSeatLabels(config.capacity);

      console.log(
        `  Generating ${seatLabels.length} seats for ${config.name}...`,
      );

      await prisma.auditorium.create({
        data: {
          name: config.name,
          capacity: config.capacity,
          seats: {
            createMany: {
              data: seatLabels.map((label) => ({
                label,
              })),
            },
          },
        },
      });

      console.log(`  ✓ Created ${config.name} with ${seatLabels.length} seats`);
    }

    console.log(
      `\n✓ Successfully seeded ${auditoriumsToCreate.length} auditoriums with their seats.`,
    );
  } catch (error) {
    console.error('Error seeding auditoriums:', error);
    throw error;
  }
}

async function run(): Promise<void> {
  try {
    await seedAuditoriums();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void run();
