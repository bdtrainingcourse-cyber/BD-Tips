const fs = require('fs');
const path = require('path');

let memoryUsers = {};
let memoryLogs = [];

const usersFilePath = path.join(__dirname, '..', 'scratch', 'user_profiles.json');
const logsFilePath = path.join(__dirname, '..', 'scratch', 'behavior_logs.json');

// Ensure directory exists
try {
  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }
} catch (e) {
  console.warn('Could not create scratch directory (possibly on serverless read-only filesystem):', e.message);
}

function readUsers() {
  try {
    if (fs.existsSync(usersFilePath)) {
      const content = fs.readFileSync(usersFilePath, 'utf8');
      if (content.trim()) {
        return JSON.parse(content);
      }
    }
  } catch (e) {
    console.error('Error reading users file:', e);
  }
  return memoryUsers;
}

function writeUsers(users) {
  memoryUsers = users;
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write users file (running on read-only serverless environment?):', e.message);
  }
}

function readLogs() {
  try {
    if (fs.existsSync(logsFilePath)) {
      const content = fs.readFileSync(logsFilePath, 'utf8');
      if (content.trim()) {
        return JSON.parse(content);
      }
    }
  } catch (e) {
    console.error('Error reading logs file:', e);
  }
  return memoryLogs;
}

function writeLogs(logs) {
  memoryLogs = logs;
  try {
    fs.writeFileSync(logsFilePath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write logs file (running on read-only serverless environment?):', e.message);
  }
}

module.exports = {
  readUsers,
  writeUsers,
  readLogs,
  writeLogs
};
