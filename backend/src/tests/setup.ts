import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load test env with override BEFORE importing pool
dotenv.config({
    path: path.resolve(__dirname, '../../.env.test'),
    override: true
});

// ============================================
// SAFETY GUARD: Prevent tests from touching remote DB
// ============================================
function verifyLocalDatabase() {
    const dbUrl = process.env.DATABASE_URL;
    const dbHost = process.env.DB_HOST;
    const dbPort = process.env.DB_PORT;
    const dbName = process.env.DB_NAME;

    // Check 1: DATABASE_URL should be empty or undefined
    if (dbUrl && dbUrl.trim() !== '') {
        console.error('\n🚨 SAFETY GUARD TRIGGERED 🚨');
        console.error('DATABASE_URL is set:', dbUrl.substring(0, 30) + '...');
        console.error('Tests must run against local database only!');
        console.error('Check your .env.test file has: DATABASE_URL=');
        process.exit(1);
    }

    // Check 2: DB_HOST should be localhost
    if (!dbHost || !['localhost', '127.0.0.1'].includes(dbHost)) {
        console.error('\n🚨 SAFETY GUARD TRIGGERED 🚨');
        console.error('DB_HOST is not localhost:', dbHost);
        console.error('Tests must run against local database only!');
        process.exit(1);
    }

    // Check 3: DB_PORT should be test port (5433)
    if (dbPort !== '5433') {
        console.error('\n🚨 SAFETY GUARD TRIGGERED 🚨');
        console.error('DB_PORT is not 5433:', dbPort);
        console.error('Tests must use test database port 5433!');
        process.exit(1);
    }

    // Check 4: DB_NAME should be test database
    if (dbName !== 'artist_map_test') {
        console.error('\n🚨 SAFETY GUARD TRIGGERED 🚨');
        console.error('DB_NAME is not artist_map_test:', dbName);
        console.error('Tests must use test database name!');
        process.exit(1);
    }

    console.log('✓ Safety check passed: Using local test database on port', dbPort);
}

verifyLocalDatabase();

// Dynamic import to ensure env is loaded before pool is created
let pool: Awaited<typeof import('../config/database')>['default'];
let poolVerified = false;

// ============================================
// RUNTIME CHECK: Verify we're NOT connected to Supabase
// ============================================
async function verifyNotSupabase(p: typeof pool) {
    // Check 1: Supabase has 'auth' schema - local test DB doesn't
    const authSchemaCheck = await p.query(`
        SELECT EXISTS (
            SELECT 1 FROM information_schema.schemata WHERE schema_name = 'auth'
        ) as has_auth_schema
    `);
    if (authSchemaCheck.rows[0].has_auth_schema) {
        console.error('\n🚨 RUNTIME SAFETY CHECK FAILED 🚨');
        console.error('Connected database has "auth" schema - this looks like Supabase!');
        console.error('Terminating to prevent data loss.');
        await p.end();
        process.exit(1);
    }

    // Check 2: Check database name at runtime
    const dbNameCheck = await p.query(`SELECT current_database() as db_name`);
    const actualDbName = dbNameCheck.rows[0].db_name;
    if (actualDbName !== 'artist_map_test') {
        console.error('\n🚨 RUNTIME SAFETY CHECK FAILED 🚨');
        console.error('Connected to database:', actualDbName);
        console.error('Expected: artist_map_test');
        console.error('Terminating to prevent data loss.');
        await p.end();
        process.exit(1);
    }

    // Check 3: Verify no Supabase connection string patterns in pg_settings
    const connCheck = await p.query(`
        SELECT COUNT(*) as supabase_indicators FROM pg_settings
        WHERE setting LIKE '%supabase%' OR setting LIKE '%pooler.supabase%'
    `);
    if (parseInt(connCheck.rows[0].supabase_indicators) > 0) {
        console.error('\n🚨 RUNTIME SAFETY CHECK FAILED 🚨');
        console.error('Supabase indicators found in pg_settings!');
        console.error('Terminating to prevent data loss.');
        await p.end();
        process.exit(1);
    }

    console.log('✓ Runtime check passed: Confirmed NOT connected to Supabase');
}

async function getPool() {
    if (!pool) {
        const db = await import('../config/database');
        pool = db.default;
    }

    // Run Supabase check once after first connection
    if (!poolVerified) {
        await verifyNotSupabase(pool);
        poolVerified = true;
    }

    return pool;
}

// Export pool getter for test files
export { getPool };

export async function initTestDb() {
    const p = await getPool();

    // Use test schema (has local users table instead of Supabase auth.users)
    const schema = fs.readFileSync(
        path.resolve(__dirname, '../db/schema.test.sql'),
        'utf-8'
    );
    await p.query(schema);
}

export async function cleanupTestDb() {
    const p = await getPool();
    await p.query('TRUNCATE artists RESTART IDENTITY CASCADE');
}

export async function closeTestDb() {
    const p = await getPool();
    await p.end();
}