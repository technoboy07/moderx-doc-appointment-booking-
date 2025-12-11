import dotenv from 'dotenv';
import { pool } from '../config/database.js';
import * as DoctorModel from '../models/Doctor.js';

dotenv.config();

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('✅ Connected to PostgreSQL');

    // Create sample doctors
    const doctorsToCreate = [
      { name: 'Dr. John Smith', specialization: 'General Medicine' },
      { name: 'Dr. Sarah Johnson', specialization: 'Cardiology' },
      { name: 'Dr. Michael Chen', specialization: 'Pediatrics' },
      { name: 'Dr. Emily Davis', specialization: 'Dermatology' },
      { name: 'Dr. Robert Wilson', specialization: 'Orthopedics' },
      { name: 'Dr. Lisa Anderson', specialization: 'Neurology' },
      { name: 'Dr. James Brown', specialization: 'Oncology' },
      { name: 'Dr. Maria Garcia', specialization: 'Gynecology' },
      { name: 'Dr. David Martinez', specialization: 'Psychiatry' },
      { name: 'Dr. Jennifer Lee', specialization: 'Endocrinology' },
      { name: 'Dr. Christopher Taylor', specialization: 'Urology' }
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const doctorData of doctorsToCreate) {
      let doctor = await DoctorModel.findDoctorByName(doctorData.name);
      if (!doctor) {
        doctor = await DoctorModel.createDoctor(doctorData.name, doctorData.specialization);
        console.log(`✅ Created doctor: ${doctor.name} (${doctor.specialization})`);
        createdCount++;
      } else {
        console.log(`ℹ️  Doctor already exists: ${doctor.name}`);
        existingCount++;
      }
    }

    console.log(`\n📊 Summary: ${createdCount} created, ${existingCount} already existed`);

    console.log('✅ Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

seed();
