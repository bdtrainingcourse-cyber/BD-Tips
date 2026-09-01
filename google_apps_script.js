/**
 * B2B BD TIPS PORTAL - GOOGLE APPS SCRIPT WEBHOOK BACKEND (v2.3.5)
 * Place this code in Extensions -> Apps Script on your Google Sheet.
 * 
 * Make sure to deploy this as a Web App:
 * 1. Click "Deploy" -> "New deployment"
 * 2. Select "Web app"
 * 3. Set "Execute as" to "Me"
 * 4. Set "Who has access" to "Anyone"
 * 5. Copy the Web App URL and set it as GOOGLE_SHEET_LEADS_WEBHOOK in Vercel Environment Variables.
 */

// CONFIGURATION: Set this key to match the B2B_SECRET_KEY in Vercel environment variables to secure your API.
const B2B_SECRET_KEY = "peters_secret_key_change_me_to_match_vercel"; 

function doPost(e) {
  try {
    const postData = JSON.parse(e.postData.contents);
    
    // Security check
    if (B2B_SECRET_KEY && B2B_SECRET_KEY !== "peters_secret_key_change_me_to_match_vercel") {
      if (postData.secretKey !== B2B_SECRET_KEY) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: "Unauthorized: Invalid secretKey."
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    const action = postData.action;
    const email = postData.email ? postData.email.toLowerCase().trim() : "";
    const name = postData.name || "Học viên";
    
    // Route actions
    if (action === "checkEmail") {
      return checkEmail(email, name);
    } else if (action === "syncUser" || postData.tool === "daily-reminder" || postData.tool === "exit-intent-ebook") {
      return syncUser(postData);
    } else if (action === "sendEbookVerificationEmail" || postData.tool === "ebook-download") {
      syncUser(postData);
      return sendEbookVerificationEmail(email, name, postData.ebookTitle, postData.fileUrl || postData.downloadLink);
    } else if (action === "verifyUser" || postData.tool === "email-verification") {
      return verifyUser(email, postData.points);
    } else if (action === "updatePoints") {
      return updatePoints(email, postData.points);
    } else if (action === "sendForgotPasswordEmail") {
      return sendForgotPasswordEmail(email, name, postData.resetToken);
    } else if (action === "sendDailyEmails") {
      return sendDailyEmailsSynchronously(postData);
    } else if (action === "sendSingleEmail") {
      return sendSingleEmail(postData);
    } else if (action === "sendVerificationReminder") {
      return sendVerificationReminder(email, name);
    } else if (action === "updateProfile") {
      return updateProfile(email, postData.field, postData.value, postData.points);
    } else if (postData.tool === "course-registration") {
      return handleCourseRegistration(postData);
    } else {
      // Default fallback log
      return logGeneralLead(postData);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ------------------------------------------------------------------
// 1. ACTION: checkEmail (Checks if user exists, returns profile)
// ------------------------------------------------------------------
function checkEmail(email, name) {
  const sheet = getOrCreateSheet("Học Viên Đăng Ký");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idx = getHeaderIndices(headers);

  if (idx.email === -1) {
    return createJsonResponse({ exists: false, error: "Email column not found." });
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][idx.email].toString().toLowerCase().trim() === email) {
      // User exists!
      const userProfile = {
        id: idx.id !== -1 ? data[i][idx.id] : "UID_" + i,
        email: email,
        name: idx.name !== -1 ? data[i][idx.name] : name,
        points: idx.points !== -1 ? Number(data[i][idx.points]) : 25,
        verified: idx.verified !== -1 ? (data[i][idx.verified] === true || data[i][idx.verified].toString().toUpperCase() === "TRUE" || data[i][idx.verified].toString().trim() === "Đã xác thực") : false,
        password: idx.password !== -1 ? data[i][idx.password] : "",
        experience: idx.experience !== -1 ? data[i][idx.experience] : "",
        industry: idx.industry !== -1 ? data[i][idx.industry] : "",
        skill: idx.skill !== -1 ? data[i][idx.skill] : ""
      };
      
      return createJsonResponse({ exists: true, user: userProfile });
    }
  }
  
  return createJsonResponse({ exists: false });
}

// ------------------------------------------------------------------
// 2. ACTION: syncUser (Registers a new user, sends verification link)
// ------------------------------------------------------------------
function syncUser(data) {
  const sheet = getOrCreateSheet("Học Viên Đăng Ký");
  const email = data.email.toLowerCase().trim();
  const name = data.name || "Học viên";
  const points = data.points !== undefined ? Number(data.points) : 25;
  const password = data.password || "";
  const userId = data.userId || "UID_" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const device = data.device || "Desktop";
  const date = data.date || new Date().toISOString();
  
  const experience = data.experience || "";
  const industry = data.industry || "";
  const skill = data.skill || "";
  
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0];
  const idx = getHeaderIndices(headers);
  
  if (idx.email === -1) {
    return createJsonResponse({ success: false, error: "Email column not found." });
  }
  
  let userRowIndex = -1;
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][idx.email].toString().toLowerCase().trim() === email) {
      userRowIndex = i + 1;
      break;
    }
  }
  
  if (userRowIndex === -1) {
    // New User: Construct a row matching the sheet's current headers!
    const newRow = new Array(headers.length).fill("");
    if (idx.id !== -1) newRow[idx.id] = userId;
    if (idx.name !== -1) newRow[idx.name] = name;
    if (idx.email !== -1) newRow[idx.email] = email;
    if (idx.points !== -1) newRow[idx.points] = points;
    if (idx.verified !== -1) newRow[idx.verified] = "Chưa xác thực";
    if (idx.password !== -1) newRow[idx.password] = password;
    if (idx.date !== -1) newRow[idx.date] = formatTimestamp(date);
    if (idx.lastActivity !== -1) newRow[idx.lastActivity] = formatTimestamp(date);
    
    sheet.appendRow(newRow);
    const rowIndex = sheet.getLastRow();
    
    // Write profile fields if present
    if (experience) writeProfileFieldToRow(sheet, rowIndex, "experience", experience, idx);
    if (industry) writeProfileFieldToRow(sheet, rowIndex, "industry", industry, idx);
    if (skill) writeProfileFieldToRow(sheet, rowIndex, "skill", skill, idx);
    
    // SEND VERIFICATION EMAIL IMMEDIATELY
    sendVerificationEmail(email, name);
    
    return createJsonResponse({ success: true, exists: false, userId: userId, message: "Registered. Verification email sent." });
  } else {
    // Existing user: update details
    if (idx.points !== -1) sheet.getRange(userRowIndex, idx.points + 1).setValue(points);
    if (idx.password !== -1 && password) sheet.getRange(userRowIndex, idx.password + 1).setValue(password);
    if (idx.lastActivity !== -1) sheet.getRange(userRowIndex, idx.lastActivity + 1).setValue(formatTimestamp(date));
    
    if (experience) writeProfileFieldToRow(sheet, userRowIndex, "experience", experience, idx);
    if (industry) writeProfileFieldToRow(sheet, userRowIndex, "industry", industry, idx);
    if (skill) writeProfileFieldToRow(sheet, userRowIndex, "skill", skill, idx);
    
    return createJsonResponse({ success: true, exists: true, userId: userId, message: "User profile updated." });
  }
}

// ------------------------------------------------------------------
// 3. ACTION: verifyUser (Verifies email, awards 15 extra points)
// ------------------------------------------------------------------
function verifyUser(email, points) {
  const sheet = getOrCreateSheet("Học Viên Đăng Ký");
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0];
  const idx = getHeaderIndices(headers);
  
  if (idx.email === -1) return createJsonResponse({ success: false, error: "Email column not found." });
  
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][idx.email].toString().toLowerCase().trim() === email) {
      const rowIndex = i + 1;
      if (idx.verified !== -1) sheet.getRange(rowIndex, idx.verified + 1).setValue("Đã xác thực");
      if (idx.points !== -1) {
        const currentPoints = Number(sheetData[i][idx.points]) || 25;
        const newPoints = points !== undefined ? Number(points) : (currentPoints + 15);
        sheet.getRange(rowIndex, idx.points + 1).setValue(newPoints);
      }
      if (idx.lastActivity !== -1) {
        sheet.getRange(rowIndex, idx.lastActivity + 1).setValue(formatTimestamp(new Date().toISOString()));
      }
      return createJsonResponse({ success: true, message: "User verified successfully." });
    }
  }
  return createJsonResponse({ success: false, error: "User not found." });
}

// ------------------------------------------------------------------
// 4. ACTION: updatePoints (Syncs active points balance)
// ------------------------------------------------------------------
function updatePoints(email, points) {
  const sheet = getOrCreateSheet("Học Viên Đăng Ký");
  const sheetData = sheet.getDataRange().getValues();
  const headers = sheetData[0];
  const idx = getHeaderIndices(headers);
  
  if (idx.email === -1 || idx.points === -1) return createJsonResponse({ success: false, error: "Columns not found." });
  
  for (let i = 1; i < sheetData.length; i++) {
    if (sheetData[i][idx.email].toString().toLowerCase().trim() === email) {
      sheet.getRange(i + 1, idx.points + 1).setValue(Number(points));
      if (idx.lastActivity !== -1) {
        sheet.getRange(i + 1, idx.lastActivity + 1).setValue(formatTimestamp(new Date().toISOString()));
      }
      return createJsonResponse({ success: true });
    }
  }
  return createJsonResponse({ success: false, error: "User not found." });
}

// ------------------------------------------------------------------
// 4b. ACTION: updateProfile (Updates user experience, industry or skill and awards points)
// ------------------------------------------------------------------
function updateProfile(email, field, value, points) {
  const sheet = getOrCreateSheet("Học Viên Đăng Ký");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idx = getHeaderIndices(headers);
  const rowIndex = findUserRowIndex(data, email, idx.email);
  if (rowIndex === -1) return createJsonResponse({ success: false, error: "User not found." });

  writeProfileFieldToRow(sheet, rowIndex, field, value, idx);

  // Update points
  if (idx.points !== -1 && points !== undefined) {
    sheet.getRange(rowIndex, idx.points + 1).setValue(Number(points));
  }
  
  // Update last activity!
  if (idx.lastActivity !== -1) {
    sheet.getRange(rowIndex, idx.lastActivity + 1).setValue(formatTimestamp(new Date().toISOString()));
  }

  return createJsonResponse({ success: true, message: "Profile field " + field + " updated." });
}

function findUserRowIndex(data, email, emailIdx) {
  if (emailIdx === -1) return -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][emailIdx].toString().toLowerCase().trim() === email) {
      return i + 1;
    }
  }
  return -1;
}

function writeProfileFieldToRow(sheet, rowIndex, field, value, idx) {
  let targetColIdx = -1;
  let colName = "";
  
  if (field === "experience") {
    targetColIdx = idx.experience;
    colName = "Kinh nghiệm";
  } else if (field === "industry") {
    targetColIdx = idx.industry;
    colName = "Lĩnh vực";
  } else if (field === "skill") {
    targetColIdx = idx.skill;
    colName = "Kỹ năng mong muốn";
  } else if (field === "phone") {
    targetColIdx = idx.phone;
    colName = "Số điện thoại";
  } else if (field === "company") {
    targetColIdx = idx.company;
    colName = "Công ty";
  } else {
    return;
  }

  if (targetColIdx === -1) {
    const lastCol = sheet.getLastColumn();
    sheet.getRange(1, lastCol + 1).setValue(colName);
    targetColIdx = lastCol;
  }
  sheet.getRange(rowIndex, targetColIdx + 1).setValue(value);
}

// ------------------------------------------------------------------
// 5. SYNCHRONOUS DAILY EMAIL DISPATCHER (Resolves Google Apps Script programmatic trigger permissions)
// ------------------------------------------------------------------
function sendDailyEmailsSynchronously(data) {
  try {
    const subject = data.subject;
    const message = data.message;
    const buttonText = data.buttonText;
    const buttonUrl = data.buttonUrl;
    const mascot = data.mascot;
    
    if (!subject || !message) return createJsonResponse({ success: false, error: "Subject or message missing" });
    
    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const sheetData = sheet.getDataRange().getValues();
    const headers = sheetData[0];
    const idx = getHeaderIndices(headers);
    
    if (idx.email === -1) return createJsonResponse({ success: false, error: "Email column not found." });
    
    let sentCount = 0;
    for (let i = 1; i < sheetData.length; i++) {
      const email = sheetData[i][idx.email].toString().toLowerCase().trim();
      if (!email || !email.includes("@")) continue;
      
      const name = idx.name !== -1 ? sheetData[i][idx.name] : "Học viên";
      const verified = idx.verified !== -1 ? (sheetData[i][idx.verified] === true || sheetData[i][idx.verified].toString().toUpperCase() === "TRUE" || sheetData[i][idx.verified].toString().trim() === "Đã xác thực") : false;
      
      if (verified) {
        // Flow for Verified Users: Send normal daily reminder
        try {
          const bodyHtml = getHtmlEmailTemplate(message, buttonText, buttonUrl, mascot, name);
          MailApp.sendEmail({
            to: email,
            subject: subject,
            htmlBody: bodyHtml
          });
          sentCount++;
          // Jitter delay between 1.5s - 3.5s to prevent Google burst spam detection
          const jitterDelay = Math.floor(Math.random() * 2000) + 1500;
          Utilities.sleep(jitterDelay); 
        } catch (err) {
          Logger.log("Failed to send daily email to " + email + ": " + err.message);
        }
      } else {
        // Flow for Unverified Users: Send verification reminder email
        try {
          const verificationUrl = "https://bd-tips.vercel.app/?verify_email=" + encodeURIComponent(email);
          const unverifiedSubject = "🦉 Nhắc nhở: Xác thực tài khoản B2B BD & Nhận ngay 15đ tích lũy";
          const unverifiedMessage = "Chào bác <b>" + name + "</b>,<br><br>Cú BeeDee thấy tài khoản của bác vẫn chưa được kích hoạt. Hãy nhấn vào nút bên dưới để xác thực địa chỉ email. Tài khoản kích hoạt thành công sẽ được tặng thêm ngay <b>15đ ⚡</b> và mở khóa toàn bộ kho tài liệu thực chiến nhé!";
          
          const bodyHtml = getHtmlEmailTemplate(unverifiedMessage, "Kích hoạt & Nhận 15đ", verificationUrl, "https://bd-tips.vercel.app/mascot_quests.jpg", name);
          MailApp.sendEmail({
            to: email,
            subject: unverifiedSubject,
            htmlBody: bodyHtml
          });
          sentCount++;
          // Jitter delay between 1.5s - 3.5s to prevent Google burst spam detection
          const jitterDelay = Math.floor(Math.random() * 2000) + 1500;
          Utilities.sleep(jitterDelay); 
        } catch (err) {
          Logger.log("Failed to send verification reminder to " + email + ": " + err.message);
        }
      }
    }
    return createJsonResponse({ success: true, message: "Campaign sent to " + sentCount + " users successfully." });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 6. ACTION: sendSingleEmail (Used for developer preview and tests)
// ------------------------------------------------------------------
function sendSingleEmail(data) {
  try {
    const email = data.to;
    const name = data.name || "Chiến thần B2B";
    const bodyHtml = getHtmlEmailTemplate(data.message, data.buttonText, data.buttonUrl, data.mascot, name);
    
    MailApp.sendEmail({
      to: email,
      subject: data.subject,
      htmlBody: bodyHtml
    });
    
    return createJsonResponse({ success: true, message: "Test email dispatched successfully to " + email });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function sendVerificationReminder(email, name) {
  try {
    const verificationUrl = "https://bd-tips.vercel.app/?verify_email=" + encodeURIComponent(email);
    const unverifiedSubject = "🦉 Nhắc nhở: Xác thực tài khoản B2B BD & Nhận ngay 15đ tích lũy";
    const unverifiedMessage = "Chào bác <b>" + name + "</b>,<br><br>Cú BeeDee thấy tài khoản của bác vẫn chưa được kích hoạt. Hãy nhấn vào nút bên dưới để xác thực địa chỉ email. Tài khoản kích hoạt thành công sẽ được tặng thêm ngay <b>15đ ⚡</b> và mở khóa toàn bộ kho tài liệu thực chiến nhé!";
    
    const bodyHtml = getHtmlEmailTemplate(unverifiedMessage, "Kích hoạt & Nhận 15đ", verificationUrl, "https://bd-tips.vercel.app/mascot_quests.jpg", name);
    MailApp.sendEmail({
      to: email,
      subject: unverifiedSubject,
      htmlBody: bodyHtml
    });
    return createJsonResponse({ success: true, message: "Verification reminder email sent." });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 7. SYSTEM EMAILS: sendVerificationEmail & sendForgotPasswordEmail
// ------------------------------------------------------------------
function sendVerificationEmail(email, name) {
  try {
    const verificationUrl = "https://bd-tips.vercel.app/?verify_email=" + encodeURIComponent(email);
    const subject = "🦉 Kích hoạt tài khoản & Nhận 15đ tích lũy - Cú BeeDee";
    const message = "Chào mừng bác <b>" + name + "</b> đã tham gia rèn luyện cùng Cú BeeDee!<br><br>Vui lòng nhấp vào nút bên dưới để xác thực địa chỉ email của bác. Cú BeeDee sẽ tặng thêm ngay <b>15đ ⚡</b> vào tài khoản tích lũy của bác sau khi xác thực thành công.";
    
    const bodyHtml = getHtmlEmailTemplate(message, "Kích hoạt & Nhận 15đ", verificationUrl, "https://bd-tips.vercel.app/mascot_quests.jpg", name);
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: bodyHtml
    });
  } catch (err) {
    Logger.log("Failed to send verification email: " + err.message);
  }
}

function sendForgotPasswordEmail(email, name, resetToken) {
  try {
    const resetUrl = "https://bd-tips.vercel.app/quests.html?reset_token=" + encodeURIComponent(resetToken) + "&email=" + encodeURIComponent(email);
    const subject = "🔑 Khôi phục mật khẩu tài khoản Cú BeeDee";
    const message = "Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản <b>" + email + "</b> của bác.<br><br>Vui lòng click vào nút bên dưới để thiết lập mật khẩu mới (liên kết có giá trị trong vòng 1 giờ).";
    
    const bodyHtml = getHtmlEmailTemplate(message, "Đặt lại mật khẩu", resetUrl, "https://bd-tips.vercel.app/mascot_law.jpg", name);
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: bodyHtml
    });
    return createJsonResponse({ success: true });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function sendEbookVerificationEmail(email, name, ebookTitle, fileUrl) {
  try {
    const title = ebookTitle || "Cẩm nang B2B BD Thực Chiến";
    const downloadPath = fileUrl || "ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf";
    const verificationUrl = "https://bd-tips.vercel.app/library.html?verify_email=" + encodeURIComponent(email) + "&download_file=" + encodeURIComponent(downloadPath) + "&ebook_title=" + encodeURIComponent(title);
    const subject = "📚 [Ebook BD] " + title + " & Kích hoạt nhận 15đ tích lũy";
    const message = "Chào bác <b>" + name + "</b>,<br><br>Cú BeeDee gửi bác cuốn tài liệu/Ebook thực chiến: <b>" + title + "</b>.<br><br>Vui lòng nhấp vào nút bên dưới để <b>Xác thực tài khoản (+15đ ⚡)</b> và <b>Tự động tải Ebook về máy</b> của bác ngay nhé:";
    
    const bodyHtml = getHtmlEmailTemplate(message, "Xác Thực & Tải Ebook Ngay", verificationUrl, "https://bd-tips.vercel.app/mascot_quests.jpg", name);
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: bodyHtml
    });
    return createJsonResponse({ success: true, message: "Ebook verification email sent to " + email });
  } catch (err) {
    Logger.log("Failed to send ebook verification email: " + err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 8. OTHER ACTIONS: course-registration & logGeneralLead
// ------------------------------------------------------------------
function handleCourseRegistration(data) {
  const sheet = getOrCreateSheet("Học Viên Đăng Ký");
  const email = data.email ? data.email.toLowerCase().trim() : "";
  const name = data.name || "Học viên";
  const userId = data.userId || "UID_COURSE";
  const device = data.device || "Desktop";
  const date = data.date || new Date().toISOString();
  
  const sheetData = sheet.getDataRange().getValues();
  let rowIndex = findUserRowIndex(sheetData, email);
  
  if (rowIndex === -1) {
    sheet.appendRow([
      userId,
      name,
      email,
      25, // default points
      false, // verified
      "", // password
      date,
      device,
      "course-registration"
    ]);
    rowIndex = sheet.getLastRow();
  }
  
  if (data.phone) writeProfileFieldToRow(sheet, rowIndex, "phone", data.phone);
  if (data.company) writeProfileFieldToRow(sheet, rowIndex, "company", data.company);
  
  return createJsonResponse({ success: true, message: "Course registration logged." });
}

function logGeneralLead(data) {
  const sheet = getOrCreateSheet("Nhật Ký Tương Tác");
  
  let dateVal = data.date ? formatTimestamp(data.date) : formatTimestamp(new Date().toISOString());
  let emailVal = data.email || "";
  let mainFeature = "Tương tác";
  let subFeature = data.tool || "General Log";
  let detailAction = "Xem trang";
  let additionalInfo = data.detail || "";
  let deviceVal = data.device || "Desktop";
  let userIdVal = data.userId || "UID_LEAD";
  
  // 1. Cross-reference against "Học Viên Đăng Ký"
  const regSheet = getOrCreateSheet("Học Viên Đăng Ký");
  const regData = regSheet.getDataRange().getValues();
  const regHeaders = regData[0];
  const regIdx = getHeaderIndices(regHeaders);
  
  let matchedRowIndex = -1;
  let registeredUserId = "";
  let registeredEmail = "";

  const cleanEmail = emailVal.toLowerCase().trim();
  if (cleanEmail && cleanEmail !== "guest@petervo.vn" && !cleanEmail.startsWith("guest@")) {
    for (let i = 1; i < regData.length; i++) {
      if (regIdx.email !== -1 && regData[i] && regData[i][regIdx.email] !== undefined && regData[i][regIdx.email] !== null && regData[i][regIdx.email].toString().toLowerCase().trim() === cleanEmail) {
        matchedRowIndex = i + 1;
        registeredUserId = regIdx.id !== -1 && regData[i][regIdx.id] ? regData[i][regIdx.id].toString().trim() : "";
        registeredEmail = cleanEmail;
        break;
      }
    }
  }

  if (matchedRowIndex === -1 && userIdVal && !userIdVal.startsWith("GK_") && userIdVal !== "UID_LEAD" && userIdVal !== "") {
    for (let i = 1; i < regData.length; i++) {
      if (regIdx.id !== -1 && regData[i] && regData[i][regIdx.id] !== undefined && regData[i][regIdx.id] !== null && regData[i][regIdx.id].toString().trim() === userIdVal) {
        matchedRowIndex = i + 1;
        registeredUserId = userIdVal;
        registeredEmail = regIdx.email !== -1 && regData[i][regIdx.email] ? regData[i][regIdx.email].toString().toLowerCase().trim() : "";
        break;
      }
    }
  }

  // 2. Handle values based on whether user is registered or guest
  let finalEmailColumn = "";
  let finalUserIdColumn = "";

  if (matchedRowIndex !== -1) {
    // Registered user: map to registered values
    finalEmailColumn = registeredEmail;
    finalUserIdColumn = registeredUserId;
    
    // Record last activity timestamp in "Học Viên Đăng Ký"
    if (regIdx.lastActivity !== -1) {
      regSheet.getRange(matchedRowIndex, regIdx.lastActivity + 1).setValue(dateVal);
    }
  } else {
    // Unregistered guest: assign/retrieve guestxxxx ID and leave User ID blank
    let guestId = "";
    if (userIdVal && userIdVal.startsWith("GK_")) {
      guestId = getOrCreateGuestId(userIdVal);
    } else {
      // Fallback for missing keys
      const tempKey = "GK_TEMP_" + Math.random().toString(36).substr(2, 9).toUpperCase();
      guestId = getOrCreateGuestId(tempKey);
    }
    finalEmailColumn = guestId;
    finalUserIdColumn = ""; // No User ID for guest
  }

  // Translate tool events into natural Vietnamese text
  const tool = data.tool;
  if (tool === "page_view") {
    mainFeature = "Duyệt trang";
    subFeature = "Đọc bài / Di chuyển";
    detailAction = "Xem trang";
  } else if (tool === "ebook_download") {
    mainFeature = "Thư viện";
    subFeature = "Tải tài liệu";
    detailAction = "Tải Ebook";
  } else if (tool === "minigame_start" || tool === "arcade_start") {
    mainFeature = "Arcade Game";
    subFeature = "Bắt đầu chơi";
    detailAction = "Khởi chạy ải";
  } else if (tool === "minigame_play" || tool === "arcade_play") {
    mainFeature = "Arcade Game";
    subFeature = "Chơi game";
    detailAction = "Hoàn thành ải";
  } else if (tool === "email_generate") {
    mainFeature = "Trợ lý Email";
    subFeature = "Viết email AI";
    detailAction = "Soạn thảo";
  } else if (tool === "labor_case_view" || tool === "labor_search") {
    mainFeature = "Tra cứu Luật";
    subFeature = "Xem tình huống";
    detailAction = "Tra cứu";
  } else if (tool === "salary_calculate") {
    mainFeature = "Tính lương";
    subFeature = "Ước tính";
    detailAction = "Tính toán";
  } else if (tool === "pic_search") {
    mainFeature = "PIC Finder";
    subFeature = "Tìm kiếm sếp mua hàng";
    detailAction = "Tra cứu";
  } else if (tool === "community_post") {
    mainFeature = "Cộng đồng";
    subFeature = "Đăng bài viết mới";
    detailAction = "Đăng thảo luận";
  } else if (tool === "community_comment") {
    mainFeature = "Cộng đồng";
    subFeature = "Bình luận đóng góp";
    detailAction = "Viết phản hồi";
  } else if (tool === "article_read") {
    mainFeature = "Thư viện";
    subFeature = "Đọc cẩm nang";
    detailAction = "Đọc bài viết";
  } else if (tool === "search_query") {
    mainFeature = "Tìm kiếm";
    subFeature = "Tra cứu chung";
    detailAction = "Gửi truy vấn";
  } else if (tool === "pitching_scenario_select") {
    mainFeature = "Pitching AI";
    subFeature = "Luyện thuyết trình";
    detailAction = "Chọn kịch bản";
  } else if (tool === "pitching_complete") {
    mainFeature = "Pitching AI";
    subFeature = "Hoàn thành bài pitch";
    detailAction = "Nhận đánh giá";
  } else if (tool === "claim_reward" || tool === "claim-reward") {
    mainFeature = "Đổi quà";
    subFeature = "Cửa hàng quà tặng";
    detailAction = "Nhận phần thưởng";
  }
  
  sheet.appendRow([
    dateVal,
    finalEmailColumn,
    mainFeature,
    subFeature,
    detailAction,
    additionalInfo,
    deviceVal,
    finalUserIdColumn
  ]);
  
  return createJsonResponse({ success: true });
}

function formatTimestamp(isoString) {
  try {
    const d = new Date(isoString);
    const yr = d.getFullYear();
    const mo = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const hr = ('0' + d.getHours()).slice(-2);
    const min = ('0' + d.getMinutes()).slice(-2);
    const sec = ('0' + d.getSeconds()).slice(-2);
    return yr + '-' + mo + '-' + day + ' ' + hr + ':' + min + ':' + sec;
  } catch (e) {
    return isoString;
  }
}

// ------------------------------------------------------------------
// UTILITY FUNCTIONS: Helpers for Sheets and HTML
// ------------------------------------------------------------------
function getHeaderIndices(headers) {
  if (!headers || !Array.isArray(headers)) {
    return { email: -1, name: -1, points: -1, verified: -1, password: -1, id: -1, date: -1, lastActivity: -1, experience: -1, industry: -1, skill: -1, phone: -1, company: -1 };
  }
  const h = headers.map(val => val !== undefined && val !== null ? val.toString().toLowerCase().trim() : "");
  
  function findIdx(names) {
    for (let name of names) {
      const idx = h.indexOf(name.toLowerCase().trim());
      if (idx !== -1) return idx;
    }
    return -1;
  }
  
  return {
    email: findIdx(["email người dùng", "email", "email_address", "email address"]),
    name: findIdx(["họ và tên", "name", "full name", "tên", "họ tên"]),
    points: findIdx(["điểm bd-points", "points", "điểm", "bd-points"]),
    verified: findIdx(["trạng thái xác thực", "verified", "xác thực", "trạng thái"]),
    password: findIdx(["password", "mật khẩu"]),
    id: findIdx(["id", "userid", "user id", "mã học viên"]),
    date: findIdx(["thời gian đăng ký", "date", "ngày đăng ký", "thời gian"]),
    lastActivity: findIdx(["hoạt động cuối cùng", "hoạt động cuối", "last activity", "last_activity"]),
    experience: findIdx(["kinh nghiệm", "experience", "experience_years"]),
    industry: findIdx(["lĩnh vực", "industry", "lĩnh vực hoạt động"]),
    skill: findIdx(["kỹ năng mong muốn", "skill", "kỹ năng"]),
    phone: findIdx(["số điện thoại", "phone", "sđt", "điện thoại"]),
    company: findIdx(["công ty", "company", "doanh nghiệp"])
  };
}

function getOrCreateGuestId(guestKey) {
  const sheet = getOrCreateSheet("Guest Mapping");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] && data[i][0] === guestKey) {
      return data[i][1];
    }
  }
  
  // Not found: generate new guest ID
  let maxNum = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i] && data[i][1] !== undefined && data[i][1] !== null) {
      const val = data[i][1].toString(); // e.g. "guest0015"
      if (val.startsWith("guest")) {
        const num = parseInt(val.substring(5), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }
  
  const newNum = maxNum + 1;
  const newGuestId = "guest" + String(newNum).padStart(4, '0');
  
  sheet.appendRow([guestKey, newGuestId, new Date().toISOString()]);
  return newGuestId;
}

function getOrCreateSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Redirect old/alternative sheet names to keep only standard sheets!
  let targetSheetName = sheetName;
  if (sheetName === "Leads" || sheetName === "CourseReg" || sheetName === "Học Viên Đăng Ký") {
    targetSheetName = "Học Viên Đăng Ký";
  } else if (sheetName === "Guest Mapping") {
    targetSheetName = "Guest Mapping";
  } else {
    targetSheetName = "Nhật Ký Tương Tác";
  }
  
  let sheet = ss.getSheetByName(targetSheetName);
  if (!sheet) {
    sheet = ss.insertSheet(targetSheetName);
    
    // Create standard headers
    if (targetSheetName === "Học Viên Đăng Ký") {
      sheet.appendRow(["UserID", "Name", "Email", "Points", "Verified", "Password", "Date", "Last Activity", "Device", "Tool"]);
    } else if (targetSheetName === "Guest Mapping") {
      sheet.appendRow(["Guest Key", "Guest ID", "Date Created"]);
    } else {
      // "Nhật Ký Tương Tác"
      sheet.appendRow(["Thời gian ghi nhận", "Email người dùng", "Tính năng chính", "Tiểu mục / Tên Game", "Hành động chi tiết", "Thông tin bổ sung", "Thiết bị", "User ID"]);
    }
  }
  return sheet;
}

function deleteTriggerByName(functionName) {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === functionName) {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
                       .setMimeType(ContentService.MimeType.JSON);
}

// Full premium HTML email template with matching styles
function getHtmlEmailTemplate(message, buttonText, buttonUrl, mascotUrl, name) {
  const finalMascotUrl = mascotUrl || 'https://bd-tips.vercel.app/mascot_mascot.jpg';
  const greeting = name ? "Chào " + name + " cùng Cú BeeDee! 🦉☀️" : "Chào ngày mới cùng Cú BeeDee! 🦉☀️";
  
  return '<!DOCTYPE html>' +
'<html>' +
'<head>' +
'  <meta charset="utf-8">' +
'  <meta name="viewport" content="width=device-width, initial-scale=1.0">' +
'  <title>BD Bình Dân Học Vụ - Lời khuyên hàng ngày</title>' +
'  <style>' +
'    @import url(\'https://fonts.googleapis.com/css2?family=Lexend:wght@400;700;800&family=Plus+Jakarta+Sans:wght@400;700;800&display=swap\');' +
'    body, table, td, div, p, a, span {' +
'      font-family: \'Plus Jakarta Sans\', \'Lexend\', Arial, Helvetica, sans-serif !important;' +
'    }' +
'    body {' +
'      margin: 0;' +
'      padding: 0;' +
'      background-color: #fcf9f4;' +
'      color: #334155;' +
'    }' +
'    .email-container {' +
'      max-width: 500px;' +
'      margin: 30px auto;' +
'      background-color: #ffffff;' +
'      border: 1.5px solid #f3a83b;' +
'      border-radius: 24px;' +
'      padding: 35px 28px;' +
'      text-align: center;' +
'      box-shadow: 0 10px 25px rgba(243, 168, 59, 0.08);' +
'    }' +
'    .mascot-container {' +
'      margin-bottom: 20px;' +
'      display: inline-block;' +
'      padding: 10px;' +
'      background: rgba(243, 168, 59, 0.08);' +
'      border-radius: 50%;' +
'    }' +
'    .mascot-img {' +
'      width: 90px;' +
'      height: 90px;' +
'      object-fit: contain;' +
'      display: block;' +
'      border-radius: 50%;' +
'    }' +
'    .headline {' +
'      font-size: 1.35rem;' +
'      font-weight: 800;' +
'      color: #1e293b;' +
'      margin: 0 0 18px 0;' +
'      line-height: 1.3;' +
'    }' +
'    .content-text {' +
'      font-size: 0.95rem;' +
'      line-height: 1.65;' +
'      color: #475569;' +
'      margin: 0 0 25px 0;' +
'      text-align: left;' +
'    }' +
'    .cta-container {' +
'      margin: 25px 0;' +
'    }' +
'    .cta-btn {' +
'      display: inline-block;' +
'      padding: 14px 32px;' +
'      background: linear-gradient(135deg, #f3a83b 0%, #f59e0b 100%);' +
'      color: #ffffff !important;' +
'      text-decoration: none !important;' +
'      font-weight: 800;' +
'      font-size: 0.88rem;' +
'      border-radius: 12px;' +
'      box-shadow: 0 5px 18px rgba(243, 168, 59, 0.35);' +
'      text-transform: uppercase;' +
'      letter-spacing: 0.8px;' +
'    }' +
'    .footer-text {' +
'      font-size: 0.76rem;' +
'      color: #94a3b8;' +
'      border-top: 1px solid rgba(243, 168, 59, 0.15);' +
'      padding-top: 22px;' +
'      margin-top: 22px;' +
'      line-height: 1.45;' +
'      text-align: center;' +
'    }' +
'    .accent-link {' +
'      color: #d97706;' +
'      text-decoration: none;' +
'      font-weight: bold;' +
'    }' +
'  </style>' +
'</head>' +
'<body>' +
'  <div class="email-container">' +
'    <div class="mascot-container">' +
'      <img src="' + finalMascotUrl + '" class="mascot-img" alt="Cú BeeDee">' +
'    </div>' +
'    <div class="headline">' + greeting + '</div>' +
'    <div class="content-text">' +
'      ' + message +
'    </div>' +
'    <div class="cta-container">' +
'      <a href="' + buttonUrl + '" target="_blank" class="cta-btn">' + buttonText + '</a>' +
'    </div>' +
'    <div class="footer-text">' +
'      Bạn nhận được email này vì đã kích hoạt chế độ tự động nhắc nhở rèn luyện hàng ngày tại <a href="https://bd-tips.vercel.app" class="accent-link">BD Bình Dân Học Vụ</a>.<br>' +
'      © 2026 BD Bình Dân Học Vụ. All rights reserved.' +
'    </div>' +
'  </div>' +
'</body>' +
'</html>';
}
