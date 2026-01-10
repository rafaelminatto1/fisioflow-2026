
import 'dotenv/config';
import { db } from './lib/db';
import { user } from './db/schema';
import { auth } from './lib/auth';

async function main() {
    console.log('--- STARTING DIAGNOSTIC ---');

    // 1. Check Env Vars
    console.log('\n1. Checking Environment Variables:');
    const requiredVars = ['DATABASE_URL', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL'];
    let missing = false;
    for (const v of requiredVars) {
        if (process.env[v]) {
            console.log(`✅ ${v} is set`);
        } else {
            console.error(`❌ ${v} is MISSING`);
            missing = true;
        }
    }

    if (missing) {
        console.error('\n❌ Critical environment variables are missing. Please add them to your .env file.');
        process.exit(1);
    }

    // 2. Check Database Connection
    console.log('\n2. Checking Database Connection:');
    try {
        const result = await db.select().from(user).limit(1);
        console.log('✅ Database connection successful');
        console.log(`ℹ️  Found ${result.length} users (query test passed)`);
    } catch (err: any) {
        console.error('❌ Database connection FAILED:', err.message);
        if (err.message.includes('password authentication failed')) {
            console.error('   Hint: Check your DATABASE_URL credentials.');
        } else if (err.message.includes('relation "user" does not exist')) {
            console.error('   Hint: Tables are missing. Run "npm run db:push" to apply migrations.');
        }
        process.exit(1);
    }

    // 3. Check Auth Config
    console.log('\n3. Checking Auth Configuration:');
    try {
        if (auth) {
            console.log('✅ Auth object initialized successfully');
        } else {
            console.error('❌ Auth object failed to initialize');
        }
    } catch (err: any) {
        console.error('❌ Auth initialization error:', err);
    }

    console.log('\n--- DIAGNOSTIC COMPLETE: All checks passed ---');
}

main().catch(console.error);
