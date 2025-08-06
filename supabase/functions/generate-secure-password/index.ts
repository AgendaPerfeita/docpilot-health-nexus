
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { length = 12, includeSymbols = true } = await req.json();

    // Character sets for password generation
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = includeSymbols ? '!@#$%&*()_+-=[]{}|;:,.<>?' : '';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    // Generate cryptographically secure random password
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    let password = '';
    
    // Ensure at least one character from each required set
    password += lowercase[Math.floor(crypto.getRandomValues(new Uint8Array(1))[0] / 256 * lowercase.length)];
    password += uppercase[Math.floor(crypto.getRandomValues(new Uint8Array(1))[0] / 256 * uppercase.length)];
    password += numbers[Math.floor(crypto.getRandomValues(new Uint8Array(1))[0] / 256 * numbers.length)];
    
    if (includeSymbols) {
      password += symbols[Math.floor(crypto.getRandomValues(new Uint8Array(1))[0] / 256 * symbols.length)];
    }
    
    // Fill remaining length with random characters
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(array[i] / 256 * allChars.length)];
    }
    
    // Shuffle the password to randomize the order
    password = password.split('').sort(() => crypto.getRandomValues(new Uint8Array(1))[0] - 128).join('');

    return new Response(JSON.stringify({ 
      password,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating secure password:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
