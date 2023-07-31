#!/bin/bash
#Activate the Python virtual environment
source SancharVenv/bin/activate
#Activate the Node JS virtual environment
source SancharNodeVenv/bin/activate
#Navigate to the project directory
cd Desktop/Aatmanirbhar-Sanchar/Chat-application
#Start the Node JS server using PM2
pm2 start serverpm2.json
