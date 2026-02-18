#!/usr/bin/env node
/**
 * Readiness check script
 * Verifies required env vars, Prisma (Neon) connectivity, Upstash Vector client, and Groq key presence.
 */

function ok(msg) {
  console.log('  ✓', msg);
}

function fail(msg) {
  console.error('  ✖', msg);
}

async function checkEnv() {
  const required = [
    'DATABASE_URL',
    'GROQ_API_KEY',
    'UPSTASH_VECTOR_REST_URL',
    'UPSTASH_VECTOR_REST_TOKEN',
  ];

  let okAll = true;
  console.log('\nChecking environment variables...');
  for (const k of required) {
    if (!process.env[k]) {
      fail(`${k} (missing)`);
      okAll = false;
    } else {
      ok(`${k}`);
    }
  }
  return okAll;
}

async function checkPrisma() {
  console.log('\nChecking Prisma / Neon connectivity...');
  try {
    const { prisma } = require('../lib/prisma');
    await prisma.$connect();
    ok('Prisma connected');
    await prisma.$disconnect();
    return true;
  } catch (err) {
    fail('Prisma connection failed: ' + (err.message || err));
    return false;
  }
}

async function checkUpstash() {
  console.log('\nChecking Upstash Vector client...');
  try {
    const { vectorClient } = require('../lib/vector/client');
    // Lightweight query to validate creds/connectivity
    const res = await vectorClient.query({ data: 'ping', topK: 1 });
    ok('Upstash Vector query OK');
    if (Array.isArray(res)) console.log('    results:', res.length);
    return true;
  } catch (err) {
    fail('Upstash Vector query failed: ' + (err.message || err));
    return false;
  }
}

async function checkGroqKey() {
  console.log('\nChecking Groq API key presence...');
  if (!process.env.GROQ_API_KEY) {
    fail('GROQ_API_KEY missing');
    return false;
  }
  ok('GROQ_API_KEY present');
  return true;
}

async function main() {
  console.log('\nReadiness Check — Digital Twin');

  const envOk = await checkEnv();
  const prismaOk = await checkPrisma();
  const upstashOk = await checkUpstash();
  const groqOk = await checkGroqKey();

  const allOk = envOk && prismaOk && upstashOk && groqOk;

  console.log('\n');
  if (allOk) {
    console.log('All checks passed — system appears ready.');
    process.exit(0);
  } else {
    console.error('One or more checks failed. Review the output above.');
    process.exit(2);
  }
}

main();
