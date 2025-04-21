/* eslint-disable drizzle/enforce-delete-with-where */
"use server"

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import { faker } from '@faker-js/faker';
import { ELEMENTS } from "~/lib/static/elements";
import { type ElementsWithApproxSchema } from "~/lib/validations/forms";

const conn = postgres(process.env.DATABASE_URL ?? "postgresql://postgres:password@localhost:5433/gms-proj");

type ElementEntry = Record<ELEMENTS | `${ELEMENTS}Approx`, null>;
type ProfitabilityEntry = Record<ELEMENTS, null | number>;

async function seed() {
  try {
    const db = drizzle(conn, { schema });

    const superAdmin = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.role, "super-admin"),
    });

    const companies = await db.delete(schema.companies).then(async () => {
      return await db.insert(schema.companies).values(
        Array.from({ length: 10 }, () => ({
          name: faker.company.name(),
          createUserId: superAdmin?.id ?? null,
        }))
      ).returning();
    })

    const fields =  await db.delete(schema.fields).then(async () => {
      return await db.insert(schema.fields).values(
        Array.from({ length: 20 }, () => ({
          name: "Field " + faker.lorem.word(),
          companyId: faker.helpers.arrayElement(companies).id,
          createUserId: superAdmin?.id ?? null,
        }))
      ).returning();
    })

    const licensedAreas = await db.delete(schema.licensedAreas).then(async () => {
      return await db.insert(schema.licensedAreas).values(
        Array.from({ length: 40 }, () => ({
          name: "Area " + faker.lorem.word(),
          fieldId: faker.helpers.arrayElement(fields).id,
          createUserId: superAdmin?.id ?? null,
        }))
      ).returning();  
    })
    await db.delete(schema.areasData).then(async () => {
      await db.insert(schema.areasData).values(
        Array.from({ length: 80 }, () => {
          const occurrenceIntervalStart = faker.number.float({ min: 10, max: 200, fractionDigits: 7 })
          const occurrenceIntervalEnd = occurrenceIntervalStart + faker.number.float({ min: 10, max: 200, fractionDigits: 7 })
  
          const defaultValuesElements: ElementEntry[] = Object.values(ELEMENTS).map(element => {
            return {
              [element]: faker.number.float({ min: 100, max: 2000, fractionDigits: 7 }),
              [`${element}Approx`]: faker.helpers.arrayElement(['>', '<', null])
            } as ElementEntry;
          });
  
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const elementsObj: ElementsWithApproxSchema = Object.assign({}, ...defaultValuesElements);
  
          return ({
            areaId: faker.helpers.arrayElement(licensedAreas).id,
            createUserId: superAdmin?.id ?? null,
            bush: "Bush " + faker.number.int().toString(),
            hole: "Hole " + faker.number.int().toString(),
            plast: "Plast " + faker.number.int().toString(),
            horizon: "Horizon " + faker.number.int().toString(),
            retinue: "Retinue " + faker.number.int().toString(),
            occurrenceIntervalStart: occurrenceIntervalStart,
            occurrenceIntervalEnd: occurrenceIntervalEnd,
            samplingDate: faker.date.anytime(),
            analysisDate: faker.date.anytime(),
            protocol: "Protocol " + faker.commerce.isbn(10),
            protocolUrl: faker.internet.url(),
            sampleCode: faker.commerce.isbn(10),
            pHydrogen: faker.number.float({ min: 100, max: 2000, fractionDigits: 7 }),
            density: faker.number.float({ min: 100, max: 1000, fractionDigits: 7 }),
            mineralization: faker.number.float({ min: 100, max: 2000, fractionDigits: 7 }),
            ...elementsObj,
            rigidity: faker.number.float({ min: 10, max: 2000, fractionDigits: 7 }),
            alkalinity: faker.number.float({ min: 100, max: 2000, fractionDigits: 7 }),
            electricalConductivity: faker.number.float({ min: 100, max: 1000, fractionDigits: 7 }),
            suspendedSolids: faker.number.float({ min: 100, max: 1000, fractionDigits: 7 }),
            dryResidue: faker.number.float({ min: 10, max: 500, fractionDigits: 7 }),
            analysisPlace: faker.location.city(),
            note: faker.lorem.text(),
          })
        })
      )
    })

    await db.delete(schema.profitability).then(async () => {
      const defaultValuesElements: ProfitabilityEntry[] = Object.values(ELEMENTS).map(element => {
        return {
          [element]: faker.number.float({ min: 100, max: 2000, fractionDigits: 7 }),
        } as unknown as ProfitabilityEntry
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const elementsObj: ProfitabilityEntry = Object.assign({}, ...defaultValuesElements);

      await db.insert(schema.profitability).values({
        createUserId: superAdmin?.id ?? null,
        ...elementsObj,
      })
    })

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await conn.end();
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
seed();