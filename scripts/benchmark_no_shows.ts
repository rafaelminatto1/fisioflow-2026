
import { subDays } from 'date-fns';

const NUM_APPOINTMENTS = 10000;

// Mock Appointment type matching the DB schema subset used
type MockAppointment = {
  id: string;
  status: string;
  startTime: Date;
  patientId: string;
};

function generateData(count: number): MockAppointment[] {
  const data: MockAppointment[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const status = i % 10 < 5 ? 'scheduled' :
                   i % 10 < 7 ? 'completed' :
                   i % 10 < 9 ? 'no_show' : 'cancelled';

    data.push({
      id: `apt-${i}`,
      status,
      startTime: subDays(today, i % 30),
      patientId: `patient-${i % 100}`, // 100 patients
    });
  }
  return data;
}

function measureOldWay(allAppointments: MockAppointment[]) {
    const t0 = performance.now();

    // The "Old Way" logic extracted from route.ts
    const total = allAppointments.length;
    const noShows = allAppointments.filter(a => a.status === 'no_show').length;
    const completed = allAppointments.filter(a => a.status === 'completed').length;
    const cancelled = allAppointments.filter(a => a.status === 'cancelled').length;

    // Get repeat no-show patients
    const noShowPatients = allAppointments
      .filter(a => a.status === 'no_show')
      .reduce((acc: any, a) => {
        acc[a.patientId!] = (acc[a.patientId!] || 0) + 1;
        return acc;
      }, {});

    const repeatNoShowPatients = Object.entries(noShowPatients)
      .filter(([_, count]) => (count as number) > 1)
      .map(([patientId, count]) => ({ patientId, noShowCount: count }));

    const t1 = performance.now();
    return {
        time: t1 - t0,
        result: { total, noShows, completed, cancelled, repeatCount: repeatNoShowPatients.length }
    };
}

async function run() {
    console.log(`Generating ${NUM_APPOINTMENTS} mock appointments...`);
    const allAppointments = generateData(NUM_APPOINTMENTS);

    // Estimate payload size
    const payloadSize = JSON.stringify(allAppointments).length;
    console.log(`Estimated Payload Size (JSON): ${(payloadSize / 1024).toFixed(2)} KB`);

    console.log('Running Old Way (In-Memory Processing)...');
    const oldRes = measureOldWay(allAppointments);
    console.log(`Old Way Processing Time: ${oldRes.time.toFixed(4)}ms`);
    console.log('Results:', oldRes.result);

    console.log('\n--- Analysis ---');
    console.log(`Current approach fetches ${(payloadSize / 1024 / 1024).toFixed(2)} MB of data for ${NUM_APPOINTMENTS} records.`);
    console.log(`It then processes them in the Node.js event loop for ${oldRes.time.toFixed(4)}ms.`);
    console.log(`\nProposed approach:`);
    console.log(`1. Database performs aggregation (highly optimized C code).`);
    console.log(`2. Network transfers ~200 bytes (counts + small list of repeat offenders).`);
    console.log(`3. Node.js processing time is near 0ms (just JSON parsing).`);
    console.log(`\nEstimated Improvement:`);
    console.log(`- Network Bandwidth: >99% reduction`);
    console.log(`- Memory Usage: >99% reduction`);
    console.log(`- Latency: Significantly reduced (avoiding serializing/deserializing large JSON).`);
}

run();
