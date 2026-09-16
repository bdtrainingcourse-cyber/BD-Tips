const fs = require('fs');
const path = require('path');

let memoryUsers = {};
let memoryLogs = [];

const usersPrimaryPath = path.join(__dirname, 'user_profiles.json');
const usersFilePath = path.join(__dirname, '..', 'scratch', 'user_profiles.json');
const logsFilePath = path.join(__dirname, '..', 'scratch', 'behavior_logs.json');
const tmpUsersPath = path.join('/tmp', 'user_profiles.json');
const tmpLogsPath = path.join('/tmp', 'behavior_logs.json');

// Ensure directory exists
try {
  const scratchDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(scratchDir)) {
    fs.mkdirSync(scratchDir, { recursive: true });
  }
} catch (e) {
  // Silent catch in read-only environments
}

function readUsers() {
  try {
    if (fs.existsSync(tmpUsersPath)) {
      const content = fs.readFileSync(tmpUsersPath, 'utf8');
      if (content.trim()) {
        return JSON.parse(content);
      }
    }
    if (fs.existsSync(usersFilePath)) {
      const content = fs.readFileSync(usersFilePath, 'utf8');
      if (content.trim()) {
        return JSON.parse(content);
      }
    }
    if (fs.existsSync(usersPrimaryPath)) {
      const content = fs.readFileSync(usersPrimaryPath, 'utf8');
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
    fs.writeFileSync(tmpUsersPath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {}
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (e) {}
}

function readLogs() {
  try {
    if (fs.existsSync(tmpLogsPath)) {
      const content = fs.readFileSync(tmpLogsPath, 'utf8');
      if (content.trim()) {
        return JSON.parse(content);
      }
    }
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
    fs.writeFileSync(tmpLogsPath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (e) {}
  try {
    fs.writeFileSync(logsFilePath, JSON.stringify(logs, null, 2), 'utf8');
  } catch (e) {}
}

module.exports = {
  readUsers,
  writeUsers,
  readLogs,
  writeLogs
};
