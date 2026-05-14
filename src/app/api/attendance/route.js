import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Attendance from '../../../models/Attendance';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const nic = searchParams.get('nic');
    const todayOnly = searchParams.get('today');
    
    let query = {};
    if (nic) query.nic = nic;
    if (todayOnly === 'true') {
      query.date = new Date().toISOString().split('T')[0];
    }
    
    const records = await Attendance.find(query).sort({ timestamp: -1 });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { nic, type } = await request.json();
    await dbConnect();
    
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    let todayRecord = await Attendance.findOne({ nic, date: today });

    if (todayRecord) {
      if (type === 'in' && !todayRecord.inTime) {
        todayRecord.inTime = currentTime;
        todayRecord.lastUpdated = new Date().toISOString();
      } else if (type === 'out' && !todayRecord.outTime && todayRecord.inTime) {
        todayRecord.outTime = currentTime;
        todayRecord.lastUpdated = new Date().toISOString();
      } else {
        return NextResponse.json({ error: 'Invalid attendance action or already marked' }, { status: 400 });
      }
      await todayRecord.save();
      return NextResponse.json({ success: true, record: todayRecord });
    } else {
      if (type === 'in') {
        const newRecord = new Attendance({
          nic,
          date: today,
          inTime: currentTime,
          outTime: null,
          timestamp: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
        await newRecord.save();
        return NextResponse.json({ success: true, record: newRecord });
      } else {
        return NextResponse.json({ error: 'Cannot mark OUT without marking IN first' }, { status: 400 });
      }
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
