"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.testSupabaseTable = testSupabaseTable;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || 'https://epxxnsixehxoggsjsckn.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';
exports.supabase = null;
if (supabaseUrl && supabaseKey) {
    try {
        exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        console.log('✅ Supabase client initialized for URL:', supabaseUrl);
    }
    catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
    }
}
else {
    console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_KEY in environment');
}
/**
 * Verifies if Supabase remote table is accessible
 */
async function testSupabaseTable(tableName) {
    if (!exports.supabase)
        return false;
    try {
        const { error } = await exports.supabase.from(tableName).select('count', { count: 'exact', head: true });
        if (error) {
            // 42P01 is relation does not exist in Postgres
            return false;
        }
        return true;
    }
    catch {
        return false;
    }
}
