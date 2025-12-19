const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required in .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simplified verification - just checking if we can get the client config or make a simple request
supabase.verifyConnection = async () => {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error && error.code !== 'PGRST116') { // Ignore 'no rows' type errors if table is empty but reachable
            // However, head: true on empty table should return count 0, not error. 
            // If table doesn't exist, it might throw.
            throw error;
        }
        console.log('✅ Supabase Connection Verified');
    } catch (err) {
        console.error('❌ Supabase Connection Failed:', err.message);
        // We don't exit process here effectively to allow debug, but in prod you might want to.
    }
};

module.exports = supabase;
