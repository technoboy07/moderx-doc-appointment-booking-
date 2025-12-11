import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../models/Doctor.js';
import AppointmentSlot from '../models/AppointmentSlot.js';

dotenv.config();

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/doctor_appointments'
    );
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Doctor.deleteMany({});
    // await AppointmentSlot.deleteMany({});
    // console.log('✅ Cleared existing data');

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
      let doctor = await Doctor.findOne({ name: doctorData.name });
      if (!doctor) {
        doctor = new Doctor(doctorData);
        await doctor.save();
        console.log(`✅ Created doctor: ${doctor.name} (${doctor.specialization})`);
        createdCount++;
      } else {
        console.log(`ℹ️  Doctor already exists: ${doctor.name}`);
        existingCount++;
      }
    }

    console.log(`\n📊 Summary: ${createdCount} created, ${existingCount} already existed`);

    console.log('✅ Database seeding completed');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();

