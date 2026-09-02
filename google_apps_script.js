/**
 * GOOGLE APPS SCRIPT WEBHOOK BACKEND - B2B BD TIPS PORTAL
 * Production Domain: https://bdbinhdanhocvu.com
 * Email Sender: bdtraining@bdbinhdanhocvu.com
 *
 * SHEET 1: "Học Viên Đăng Ký" (Chuẩn theo format gốc Row 6):
 * Col A: User ID | Col B: Thời gian đăng ký | Col C: Họ và Tên | Col D: Email | Col E: Trạng thái xác thực | Col F: Điểm tích lũy | Col G: Hoạt động cuối | Col H: Thiết bị | Col I: Công cụ | Col J: Kinh nghiệm | Col K: Ngành nghề | Col L: Kỹ năng | Col M: Tên Ebook đã tải | Col N: SĐT | Col O: Công ty
 *
 * SHEET 2: "Nhật Ký Tương Tác" (8 Cột Chuẩn):
 * Col A: Thời gian ghi nhận
 * Col B: Email người dùng
 * Col C: Tính năng chính
 * Col D: Tiểu mục / Tên Game
 * Col E: Hành động chi tiết
 * Col F: Thông tin bổ sung
 * Col G: Thiết bị
 * Col H: User ID
 */

const B2B_SECRET_KEY = "2108330119Snail!!";

// ------------------------------------------------------------------
// 1. DOPOST & DOGET ROUTER
// ------------------------------------------------------------------
function doPost(e) {
  try {
    const rawData = e.postData ? e.postData.contents : "{}";
    const postData = JSON.parse(rawData);
    
    // Validate Secret Key
    if (B2B_SECRET_KEY) {
      if (!postData.secretKey || postData.secretKey !== B2B_SECRET_KEY) {
        return createJsonResponse({ success: false, error: "Unauthorized: Invalid secretKey." });
      }
    }
    
    const action = postData.action;
    const email = postData.email ? postData.email.toLowerCase().trim() : "";
    const name = postData.name || "Học viên";
    
    // Route actions
    if (action === "checkEmail") {
      return checkEmail(email, name);
    } else if (action === "sendEbookVerificationEmail" || (action === "syncUser" && (postData.tool === "ebook-download" || postData.ebookTitle)) || postData.tool === "ebook-download") {
      // 1. Ghi nhận/cập nhật thông tin học viên vào "Học Viên Đăng Ký"
      syncUser(postData, true);
      // 2. Gửi email đúng Ebook & ghi nhận vào "Nhật Ký Tương Tác"
      return sendEbookVerificationEmail(email, name, postData.ebookTitle, postData.fileUrl || postData.downloadLink, postData.userId || "");
    } else if (action === "syncUser" || postData.tool === "daily-reminder" || postData.tool === "exit-intent-ebook") {
      return syncUser(postData);
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
      return logGeneralLead(postData);
    }
  } catch (err) {
    Logger.log("doPost Error: " + err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    const email = e.parameter.email ? e.parameter.email.toLowerCase().trim() : "";
    const name = e.parameter.name || "Học viên";
    
    if (action === "checkEmail") {
      return checkEmail(email, name);
    } else if (action === "verifyUser") {
      const points = e.parameter.points ? parseInt(e.parameter.points, 10) : 15;
      return verifyUser(email, points);
    } else {
      return createJsonResponse({ success: true, message: "Webhook Active for BD Binh Dan Hoc Vu" });
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 2. CHECK EMAIL & USER EXISTENCE
// ------------------------------------------------------------------
function checkEmail(email, name) {
  try {
    if (!email) return createJsonResponse({ exists: false });
    
    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return createJsonResponse({ exists: false });
    
    const headers = data[0];
    const idx = getHeaderIndices(headers);
    const rowIndex = findUserRowIndex(data, email, idx.email);
    
    if (rowIndex !== -1) {
      const row = data[rowIndex];
      const verifiedVal = idx.verified !== -1 ? row[idx.verified] : false;
      const isVerified = (verifiedVal === true || verifiedVal.toString().toUpperCase() === "TRUE" || verifiedVal.toString().trim() === "Đã xác thực");
      
      const userData = {
        id: idx.id !== -1 && row[idx.id] ? row[idx.id] : "UID_LEGACY",
        name: idx.name !== -1 && row[idx.name] ? row[idx.name] : name,
        email: email,
        points: idx.points !== -1 && !isNaN(parseInt(row[idx.points], 10)) ? parseInt(row[idx.points], 10) : 25,
        avatar: "",
        verified: isVerified
      };
      
      return createJsonResponse({ exists: true, user: userData });
    }
    return createJsonResponse({ exists: false });
  } catch (err) {
    return createJsonResponse({ exists: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 3. SYNC USER (Registers or updates user details in "Học Viên Đăng Ký")
// ------------------------------------------------------------------
function syncUser(data, skipEmail) {
  try {
    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const email = data.email ? data.email.toLowerCase().trim() : "";
    const name = data.name || "Học viên";
    const points = data.points !== undefined ? Number(data.points) : 25;
    const password = data.password || "";
    const userId = data.userId || ("UID_" + Utilities.getUuid().substr(0, 8).toUpperCase());
    const device = data.device || "Desktop";
    const date = data.date ? formatTimestamp(data.date) : formatTimestamp(new Date().toISOString());
    const tool = data.tool || (data.ebookTitle ? "ebook-download" : "General Sync");
    
    if (!email) return createJsonResponse({ success: false, error: "Missing email" });
    
    const sheetData = sheet.getDataRange().getValues();
    const headers = sheetData[0];
    const idx = getHeaderIndices(headers);
    let userRowIndex = -1;
    
    if (idx.email !== -1) {
      for (let i = 1; i < sheetData.length; i++) {
        if (sheetData[i][idx.email] && sheetData[i][idx.email].toString().toLowerCase().trim() === email) {
          userRowIndex = i + 1;
          break;
        }
      }
    }
    
    if (userRowIndex === -1) {
      // Dòng mới: gán chính xác từng cột theo header
      const newRow = new Array(headers.length).fill("");
      if (idx.id !== -1) newRow[idx.id] = userId;
      if (idx.date !== -1) newRow[idx.date] = date;
      if (idx.name !== -1) newRow[idx.name] = name;
      if (idx.email !== -1) newRow[idx.email] = email;
      if (idx.verified !== -1) newRow[idx.verified] = "Chưa xác thực";
      if (idx.points !== -1) newRow[idx.points] = points;
      if (idx.lastActivity !== -1) newRow[idx.lastActivity] = date;
      if (idx.device !== -1) newRow[idx.device] = device;
      if (idx.tool !== -1) newRow[idx.tool] = tool;
      if (idx.experience !== -1) newRow[idx.experience] = data.experience || "";
      if (idx.industry !== -1) newRow[idx.industry] = data.industry || "";
      if (idx.skill !== -1) newRow[idx.skill] = data.skill || "";
      if (idx.ebook !== -1) newRow[idx.ebook] = data.ebookTitle || "";
      if (idx.phone !== -1) newRow[idx.phone] = data.phone || "";
      if (idx.company !== -1) newRow[idx.company] = data.company || "";
      if (idx.password !== -1) newRow[idx.password] = password;
      
      sheet.appendRow(newRow);
      const rowIndex = sheet.getLastRow();
      
      if (data.experience) writeProfileFieldToRow(sheet, rowIndex, "experience", data.experience, idx);
      if (data.industry) writeProfileFieldToRow(sheet, rowIndex, "industry", data.industry, idx);
      if (data.skill) writeProfileFieldToRow(sheet, rowIndex, "skill", data.skill, idx);
      if (data.ebookTitle) writeProfileFieldToRow(sheet, rowIndex, "ebook", data.ebookTitle, idx);
      if (data.phone) writeProfileFieldToRow(sheet, rowIndex, "phone", data.phone, idx);
      if (data.company) writeProfileFieldToRow(sheet, rowIndex, "company", data.company, idx);
      
      if (!skipEmail) {
        if (data.action === "sendEbookVerificationEmail" || data.tool === "ebook-download" || data.ebookTitle) {
          sendEbookVerificationEmail(email, name, data.ebookTitle, data.fileUrl || data.downloadLink, userId);
        } else {
          sendVerificationEmail(email, name);
        }
      }
      
      return createJsonResponse({ success: true, isNew: true, points: points, userId: userId });
    } else {
      // Người dùng cũ: cập nhật Hoạt Động Cuối và các trường bổ sung
      if (idx.points !== -1 && data.points !== undefined) sheet.getRange(userRowIndex, idx.points + 1).setValue(points);
      if (idx.password !== -1 && password) sheet.getRange(userRowIndex, idx.password + 1).setValue(password);
      if (idx.name !== -1 && name && name !== "Học viên") sheet.getRange(userRowIndex, idx.name + 1).setValue(name);
      if (idx.lastActivity !== -1) sheet.getRange(userRowIndex, idx.lastActivity + 1).setValue(date);
      if (idx.device !== -1 && device) sheet.getRange(userRowIndex, idx.device + 1).setValue(device);
      
      if (data.experience) writeProfileFieldToRow(sheet, userRowIndex, "experience", data.experience, idx);
      if (data.industry) writeProfileFieldToRow(sheet, userRowIndex, "industry", data.industry, idx);
      if (data.skill) writeProfileFieldToRow(sheet, userRowIndex, "skill", data.skill, idx);
      if (data.ebookTitle) writeProfileFieldToRow(sheet, userRowIndex, "ebook", data.ebookTitle, idx);
      if (data.phone) writeProfileFieldToRow(sheet, userRowIndex, "phone", data.phone, idx);
      if (data.company) writeProfileFieldToRow(sheet, userRowIndex, "company", data.company, idx);
      
      if (!skipEmail && (data.action === "sendEbookVerificationEmail" || data.tool === "ebook-download" || data.ebookTitle)) {
        sendEbookVerificationEmail(email, name, data.ebookTitle, data.fileUrl || data.downloadLink, userId);
      }
      
      return createJsonResponse({ success: true, isNew: false, points: points, userId: userId });
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 4. VERIFY USER & UPDATE POINTS
// ------------------------------------------------------------------
function verifyUser(email, bonusPoints) {
  try {
    if (!email) return createJsonResponse({ success: false, error: "Missing email" });
    const cleanEmail = email.toLowerCase().trim();
    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const sheetData = sheet.getDataRange().getValues();
    const headers = sheetData[0];
    const idx = getHeaderIndices(headers);
    const rowIndex = findUserRowIndex(sheetData, cleanEmail, idx.email);
    
    if (rowIndex !== -1) {
      const actualRow = rowIndex + 1;
      if (idx.verified !== -1) {
        sheet.getRange(actualRow, idx.verified + 1).setValue("Đã xác thực");
      }
      
      let curPoints = 25;
      if (idx.points !== -1) {
        const val = parseInt(sheetData[rowIndex][idx.points], 10);
        curPoints = isNaN(val) ? 25 : val;
        const addPts = bonusPoints !== undefined ? parseInt(bonusPoints, 10) : 15;
        const newPoints = curPoints + addPts;
        sheet.getRange(actualRow, idx.points + 1).setValue(newPoints);
        curPoints = newPoints;
      }
      if (idx.lastActivity !== -1) {
        sheet.getRange(actualRow, idx.lastActivity + 1).setValue(formatTimestamp(new Date().toISOString()));
      }
      
      return createJsonResponse({ success: true, points: curPoints, message: "User verified." });
    }
    return createJsonResponse({ success: false, error: "User not found" });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function updatePoints(email, points) {
  try {
    if (!email) return createJsonResponse({ success: false, error: "Missing email" });
    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const sheetData = sheet.getDataRange().getValues();
    const headers = sheetData[0];
    const idx = getHeaderIndices(headers);
    const rowIndex = findUserRowIndex(sheetData, email.toLowerCase().trim(), idx.email);
    
    if (rowIndex !== -1) {
      const actualRow = rowIndex + 1;
      if (idx.points !== -1) {
        sheet.getRange(actualRow, idx.points + 1).setValue(parseInt(points, 10));
      }
      if (idx.lastActivity !== -1) {
        sheet.getRange(actualRow, idx.lastActivity + 1).setValue(formatTimestamp(new Date().toISOString()));
      }
      return createJsonResponse({ success: true, points: points });
    }
    return createJsonResponse({ success: false, error: "User not found" });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function updateProfile(email, field, value, points) {
  try {
    if (!email) return createJsonResponse({ success: false, error: "Missing email" });
    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const sheetData = sheet.getDataRange().getValues();
    const headers = sheetData[0];
    const idx = getHeaderIndices(headers);
    const rowIndex = findUserRowIndex(sheetData, email.toLowerCase().trim(), idx.email);
    
    if (rowIndex !== -1) {
      const actualRow = rowIndex + 1;
      writeProfileFieldToRow(sheet, actualRow, field, value, idx);
      if (points !== undefined && idx.points !== -1) {
        sheet.getRange(actualRow, idx.points + 1).setValue(parseInt(points, 10));
      }
      if (idx.lastActivity !== -1) {
        sheet.getRange(actualRow, idx.lastActivity + 1).setValue(formatTimestamp(new Date().toISOString()));
      }
      return createJsonResponse({ success: true, message: "Profile updated" });
    }
    return createJsonResponse({ success: false, error: "User not found" });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function findUserRowIndex(data, email, emailIdx) {
  if (emailIdx === -1 || !email) return -1;
  const cleanEmail = email.toLowerCase().trim();
  for (let i = 1; i < data.length; i++) {
    if (data[i] && data[i][emailIdx] !== undefined && data[i][emailIdx] !== null && data[i][emailIdx].toString().toLowerCase().trim() === cleanEmail) {
      return i;
    }
  }
  return -1;
}

function writeProfileFieldToRow(sheet, rowIndex, field, value, idx) {
  if (!value) return;
  let targetColIdx = -1;
  let colName = "";
  
  if (field === "experience" || field === "exp") {
    targetColIdx = idx.experience;
    colName = "Kinh Nghiệm";
  } else if (field === "industry") {
    targetColIdx = idx.industry;
    colName = "Ngành Nghề";
  } else if (field === "skill") {
    targetColIdx = idx.skill;
    colName = "Kỹ Năng";
  } else if (field === "ebook" || field === "ebookTitle") {
    targetColIdx = idx.ebook;
    colName = "Tên Ebook Đã Tải";
  } else if (field === "phone") {
    targetColIdx = idx.phone;
    colName = "Số Điện Thoại";
  } else if (field === "company") {
    targetColIdx = idx.company;
    colName = "Công Ty";
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
// 5. SYNCHRONOUS DAILY EMAIL DISPATCHER
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
        try {
          const bodyHtml = getHtmlEmailTemplate(message, buttonText, buttonUrl, mascot, name);
          MailApp.sendEmail({
            to: email,
            name: "BD Bình Dân Học Vụ - Cú BeeDee",
            subject: subject,
            htmlBody: bodyHtml
          });
          sentCount++;
          const jitterDelay = Math.floor(Math.random() * 2000) + 1500;
          Utilities.sleep(jitterDelay); 
        } catch (err) {
          Logger.log("Failed to send daily email to " + email + ": " + err.message);
        }
      } else {
        try {
          const verificationUrl = "https://bdbinhdanhocvu.com/?verify_email=" + encodeURIComponent(email);
          const unverifiedSubject = "🦉 Nhắc nhở: Xác thực tài khoản B2B BD & Nhận ngay 15đ tích lũy";
          const unverifiedMessage = "Chào bạn <b>" + name + "</b>,<br><br>Cú BeeDee thấy tài khoản của bạn vẫn chưa được kích hoạt. Hãy nhấn vào nút bên dưới để xác thực địa chỉ email. Tài khoản kích hoạt thành công sẽ được tặng thêm ngay <b>15đ ⚡</b> và mở khóa toàn bộ kho tài liệu thực chiến nhé!";
          
          const bodyHtml = getHtmlEmailTemplate(unverifiedMessage, "Kích hoạt & Nhận 15đ", verificationUrl, "https://bdbinhdanhocvu.com/mascot_quests.jpg", name);
          MailApp.sendEmail({
            to: email,
            name: "BD Bình Dân Học Vụ - Cú BeeDee",
            subject: unverifiedSubject,
            htmlBody: bodyHtml
          });
          sentCount++;
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

function sendSingleEmail(data) {
  try {
    const email = data.to;
    const name = data.name || "Chiến thần B2B";
    const bodyHtml = getHtmlEmailTemplate(data.message, data.buttonText, data.buttonUrl, data.mascot, name);
    
    MailApp.sendEmail({
      to: email,
      name: "BD Bình Dân Học Vụ - Cú BeeDee",
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
    const verificationUrl = "https://bdbinhdanhocvu.com/?verify_email=" + encodeURIComponent(email);
    const unverifiedSubject = "🦉 Nhắc nhở: Xác thực tài khoản B2B BD & Nhận ngay 15đ tích lũy";
    const unverifiedMessage = "Chào bạn <b>" + name + "</b>,<br><br>Cú BeeDee thấy tài khoản của bạn vẫn chưa được kích hoạt. Hãy nhấn vào nút bên dưới để xác thực địa chỉ email. Tài khoản kích hoạt thành công sẽ được tặng thêm ngay <b>15đ ⚡</b> và mở khóa toàn bộ kho tài liệu thực chiến nhé!";
    
    const bodyHtml = getHtmlEmailTemplate(unverifiedMessage, "Kích hoạt & Nhận 15đ", verificationUrl, "https://bdbinhdanhocvu.com/mascot_quests.jpg", name);
    MailApp.sendEmail({
      to: email,
      name: "BD Bình Dân Học Vụ - Cú BeeDee",
      subject: unverifiedSubject,
      htmlBody: bodyHtml
    });
    return createJsonResponse({ success: true, message: "Verification reminder email sent." });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function sendVerificationEmail(email, name) {
  try {
    const verificationUrl = "https://bdbinhdanhocvu.com/?verify_email=" + encodeURIComponent(email);
    const subject = "🦉 Kích hoạt tài khoản & Nhận 15đ tích lũy - Cú BeeDee";
    const message = "Chào mừng bạn <b>" + name + "</b> đã tham gia rèn luyện cùng Cú BeeDee!<br><br>Vui lòng nhấp vào nút bên dưới để xác thực địa chỉ email của bạn. Cú BeeDee sẽ tặng thêm ngay <b>15đ ⚡</b> vào tài khoản tích lũy của bạn sau khi xác thực thành công.";
    
    const bodyHtml = getHtmlEmailTemplate(message, "Kích hoạt & Nhận 15đ", verificationUrl, "https://bdbinhdanhocvu.com/mascot_quests.jpg", name);
    
    MailApp.sendEmail({
      to: email,
      name: "BD Bình Dân Học Vụ - Cú BeeDee",
      subject: subject,
      htmlBody: bodyHtml
    });
  } catch (err) {
    Logger.log("Failed to send verification email: " + err.message);
  }
}

function sendForgotPasswordEmail(email, name, resetToken) {
  try {
    const resetUrl = "https://bdbinhdanhocvu.com/quests.html?reset_token=" + encodeURIComponent(resetToken) + "&email=" + encodeURIComponent(email);
    const subject = "🔑 Khôi phục mật khẩu tài khoản Cú BeeDee";
    const message = "Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản <b>" + email + "</b> của bạn.<br><br>Vui lòng click vào nút bên dưới để thiết lập mật khẩu mới (liên kết có giá trị trong vòng 1 giờ).";
    
    const bodyHtml = getHtmlEmailTemplate(message, "Đặt lại mật khẩu", resetUrl, "https://bdbinhdanhocvu.com/mascot_law.jpg", name);
    
    MailApp.sendEmail({
      to: email,
      name: "BD Bình Dân Học Vụ - Cú BeeDee",
      subject: subject,
      htmlBody: bodyHtml
    });
    return createJsonResponse({ success: true });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 6. EBOOK VERIFICATION DISPATCHER (Dynamic Catalog & Exact UTM Tracking)
// ------------------------------------------------------------------
const EBOOK_CATALOG = {
  "quy trình hưởng trợ cấp thất nghiệp (tctn)": "ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf",
  "quy trình hưởng trợ cấp thất nghiệp": "ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf",
  "tư duy bd \"thép\" & tâm lý học b2b mindset": "ebooks/Mindset BD Ebook.pdf",
  "tư duy bd thép & tâm lý học b2b mindset": "ebooks/Mindset BD Ebook.pdf",
  "tư duy bd thép": "ebooks/Mindset BD Ebook.pdf",
  "mindset": "ebooks/Mindset BD Ebook.pdf",
  "chiến lược social selling & linkedin bd 2026": "ebooks/LinkedIn_2026.pdf",
  "chiến lược social selling & linkedin bd": "ebooks/LinkedIn_2026.pdf",
  "linkedin": "ebooks/LinkedIn_2026.pdf",
  "9 nguyên tắc thực chiến b2b bd": "ebooks/9 Nguyên Tắc  BD.pdf",
  "9 nguyên tắc": "ebooks/9 Nguyên Tắc  BD.pdf",
  "bộ cẩm nang ngôn từ b2b bd (5 pha chuyển mình)": "ebooks/BD B2B Language.pdf",
  "bộ cẩm nang ngôn từ b2b bd": "ebooks/BD B2B Language.pdf",
  "ngôn từ b2b": "ebooks/BD B2B Language.pdf",
  "cẩm nang thực chiến hubspot crm cho b2b bd": "ebooks/Hubspot Basic Guideline.pdf",
  "hubspot": "ebooks/Hubspot Basic Guideline.pdf",
  "ma trận phễu kpi & quy đổi doanh thu b2b": "ebooks/KPI Inbound - Outbound funnel.pdf",
  "ma trận phễu kpi": "ebooks/KPI Inbound - Outbound funnel.pdf",
  "kpi": "ebooks/KPI Inbound - Outbound funnel.pdf",
  "cẩm nang nhận diện & loại bỏ fake lead b2b": "ebooks/PHÁT HIỆN FAKE LEAD.pdf",
  "fake lead": "ebooks/PHÁT HIỆN FAKE LEAD.pdf",
  "ebook scale up yourself - bứt phá năng lực bd b2b": "ebooks/Scale Up Yourself.pdf",
  "scale up yourself": "ebooks/Scale Up Yourself.pdf"
};

function resolveEbookFile(title, fileUrl) {
  if (fileUrl && fileUrl !== "ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf") {
    return fileUrl;
  }
  if (title) {
    const cleanTitle = title.toLowerCase().trim();
    if (EBOOK_CATALOG[cleanTitle]) {
      return EBOOK_CATALOG[cleanTitle];
    }
    for (const [k, v] of Object.entries(EBOOK_CATALOG)) {
      if (cleanTitle.includes(k) || k.includes(cleanTitle)) {
        return v;
      }
    }
  }
  return fileUrl || "ebooks/Quy trình hưởng trợ cấp thất nghiệp.pdf";
}

function sendEbookVerificationEmail(email, name, ebookTitle, fileUrl, userId) {
  try {
    const title = ebookTitle || "Cẩm nang B2B BD Thực Chiến";
    const downloadPath = resolveEbookFile(title, fileUrl);
    const directPdfUrl = downloadPath.startsWith('http') 
      ? downloadPath 
      : ("https://bdbinhdanhocvu.com/" + encodeURI(downloadPath.replace(/^\//, '')));
    
    // Dynamic UTM tracking per specific ebook
    const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const utmTracking = "utm_source=email_ebook&utm_medium=email&utm_campaign=ebook_" + cleanSlug + "&utm_content=" + encodeURIComponent(title);
    const actionButtonUrl = "https://bdbinhdanhocvu.com/library.html?verify_email=" + encodeURIComponent(email) + "&download_file=" + encodeURIComponent(downloadPath) + "&ebook_title=" + encodeURIComponent(title) + "&" + utmTracking;
    
    // 1. Ghi tên Ebook vào "Học Viên Đăng Ký"
    try {
      const sheet = getOrCreateSheet("Học Viên Đăng Ký");
      const sheetData = sheet.getDataRange().getValues();
      const headers = sheetData[0];
      const idx = getHeaderIndices(headers);
      const rowIndex = findUserRowIndex(sheetData, email, idx.email);
      if (rowIndex !== -1 && idx.ebook !== -1) {
        sheet.getRange(rowIndex + 1, idx.ebook + 1).setValue(title);
      }
    } catch (sheetErr) {
      Logger.log("Record ebook error: " + sheetErr.message);
    }
    
    // 2. Ghi đúng 8 cột vào "Nhật Ký Tương Tác"
    try {
      const logSheet = getOrCreateSheet("Nhật Ký Tương Tác");
      logSheet.appendRow([
        formatTimestamp(new Date().toISOString()), // Col A: Thời gian ghi nhận
        email,                                      // Col B: Email người dùng
        "Thư viện",                                 // Col C: Tính năng chính
        title,                                      // Col D: Tiểu mục / Tên Game
        "Đăng ký nhận Ebook",                       // Col E: Hành động chi tiết
        "File: " + downloadPath + " | " + utmTracking, // Col F: Thông tin bổ sung
        "Desktop",                                  // Col G: Thiết bị
        userId || ""                                // Col H: User ID
      ]);
    } catch (logErr) {
      Logger.log("Log ebook error: " + logErr.message);
    }

    const subject = "📚 [Tải Ebook] " + title + " - Cú BeeDee";
    const message = "Chào bạn <b>" + name + "</b>,<br><br>" +
      "Cú BeeDee gửi bạn trọn bộ tài liệu thực chiến: <b>" + title + "</b>.<br><br>" +
      "📎 <b>File PDF đầy đủ đã được đính kèm trực tiếp trong email này</b> để bạn có thể xem/tải về máy hoặc lưu trữ tiện lợi.<br><br>" +
      "Bạn cũng có thể nhấn vào nút bên dưới để <b>Tải / Mở Ebook PDF Trực Tiếp</b> (hệ thống sẽ tự động xác thực tài khoản và tặng thêm <b>15đ ⚡</b> tích lũy cho bạn nhé):";
    
    const bodyHtml = getHtmlEmailTemplate(message, "📥 Tải / Mở Ebook PDF Ngay", actionButtonUrl, "https://bdbinhdanhocvu.com/mascot_quests.jpg", name);
    
    // Đính kèm file PDF nếu < 24MB
    let attachments = [];
    try {
      const response = UrlFetchApp.fetch(directPdfUrl, { muteHttpExceptions: true });
      if (response.getResponseCode() === 200) {
        const blob = response.getBlob();
        if (blob.getBytes().length <= 24 * 1024 * 1024) {
          const fileName = decodeURIComponent(downloadPath.split('/').pop() || (title + ".pdf"));
          blob.setName(fileName);
          attachments.push(blob);
        }
      }
    } catch (fetchErr) {
      Logger.log("Attachment fetch note: " + fetchErr.message);
    }
    
    const mailOptions = {
      to: email,
      name: "BD Bình Dân Học Vụ - Cú BeeDee",
      subject: subject,
      htmlBody: bodyHtml
    };
    if (attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    MailApp.sendEmail(mailOptions);
    return createJsonResponse({ success: true, message: "Ebook email with attachment sent to " + email, ebookTitle: title, fileUrl: downloadPath });
  } catch (err) {
    Logger.log("Failed to send ebook verification email: " + err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 7. COURSE REGISTRATION & LOG GENERAL LEAD (Chuẩn 8 cột Nhật Ký)
// ------------------------------------------------------------------
function handleCourseRegistration(data) {
  const sheet = getOrCreateSheet("Học Viên Đăng Ký");
  const email = data.email ? data.email.toLowerCase().trim() : "";
  const name = data.name || "Học viên";
  const userId = data.userId || "UID_COURSE";
  const device = data.device || "Desktop";
  const date = data.date ? formatTimestamp(data.date) : formatTimestamp(new Date().toISOString());
  
  const sheetData = sheet.getDataRange().getValues();
  let rowIndex = findUserRowIndex(sheetData, email, 2);
  
  if (rowIndex === -1) {
    sheet.appendRow([
      userId,
      date,
      name,
      email,
      "Chưa xác thực",
      25,
      date,
      device,
      "course-registration"
    ]);
  }
  return createJsonResponse({ success: true, message: "Course registration logged." });
}

function logGeneralLead(data) {
  const sheet = getOrCreateSheet("Nhật Ký Tương Tác");
  let dateVal = data.date ? formatTimestamp(data.date) : formatTimestamp(new Date().toISOString());
  let emailVal = data.email ? data.email.toLowerCase().trim() : "";
  let mainFeature = "Tương tác";
  let subFeature = data.tool || data.action || "General Log";
  let detailAction = "Xem trang";
  let additionalInfo = data.detail || "";
  let deviceVal = data.device || "Desktop";
  let userIdVal = data.userId || "";

  // 1. Đối soát User ID từ "Học Viên Đăng Ký"
  const regSheet = getOrCreateSheet("Học Viên Đăng Ký");
  const regData = regSheet.getDataRange().getValues();
  const regHeaders = regData[0];
  const regIdx = getHeaderIndices(regHeaders);
  
  let matchedRowIndex = -1;
  let registeredUserId = "";
  let registeredEmail = "";

  if (emailVal && emailVal !== "guest@petervo.vn" && !emailVal.startsWith("guest@")) {
    for (let i = 1; i < regData.length; i++) {
      if (regIdx.email !== -1 && regData[i] && regData[i][regIdx.email] !== undefined && regData[i][regIdx.email] !== null && regData[i][regIdx.email].toString().toLowerCase().trim() === emailVal) {
        matchedRowIndex = i + 1;
        registeredUserId = regIdx.id !== -1 && regData[i][regIdx.id] ? regData[i][regIdx.id].toString().trim() : "";
        registeredEmail = emailVal;
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

  // 2. Gán đúng Cột B (Email) và Cột H (User ID)
  let finalEmailColumn = "";
  let finalUserIdColumn = "";

  if (matchedRowIndex !== -1) {
    // Học viên đã đăng ký
    finalEmailColumn = registeredEmail || emailVal;
    finalUserIdColumn = registeredUserId || userIdVal;
    
    // Cập nhật Hoạt Động Cuối vào "Học Viên Đăng Ký"
    if (regIdx.lastActivity !== -1) {
      regSheet.getRange(matchedRowIndex, regIdx.lastActivity + 1).setValue(dateVal);
    }
  } else {
    // Khách vãng lai
    if (emailVal && emailVal.includes("@") && emailVal !== "guest@petervo.vn") {
      finalEmailColumn = emailVal;
      finalUserIdColumn = userIdVal || "";
    } else {
      let guestKey = userIdVal && userIdVal.startsWith("GK_") ? userIdVal : ("GK_TEMP_" + Utilities.getUuid().substr(0, 8).toUpperCase());
      finalEmailColumn = getOrCreateGuestId(guestKey);
      finalUserIdColumn = "";
    }
  }

  // Dịch hành động tiếng Việt trực quan
  const tool = data.tool || data.action || "";
  if (tool === "page_view") {
    mainFeature = "Duyệt trang";
    subFeature = "Khách quan tâm";
    detailAction = "Xem trang";
  } else if (tool === "ebook_download" || tool === "ebook-download") {
    mainFeature = "Thư viện";
    subFeature = data.ebookTitle || "Tải Ebook";
    detailAction = "Tải Ebook";
  } else if (tool === "ebook_sent_to_email") {
    mainFeature = "Thư viện";
    subFeature = data.ebookTitle || "Gửi Ebook";
    detailAction = "Đăng ký nhận Ebook";
  } else if (tool === "ebook_email_button_verified") {
    mainFeature = "Thư viện";
    subFeature = data.ebookTitle || "Xác thực Ebook";
    detailAction = "Bấm nút Email mở Ebook";
  } else if (tool === "minigame_start" || tool === "arcade_start") {
    mainFeature = "Arcade Game";
    subFeature = "Mini Game B2B";
    detailAction = "Khởi chạy ải";
  } else if (tool === "minigame_play" || tool === "arcade_play") {
    mainFeature = "Arcade Game";
    subFeature = "Mini Game B2B";
    detailAction = "Hoàn thành ải";
  } else if (tool === "email_generate") {
    mainFeature = "Trợ lý Email";
    subFeature = "Tạo email B2B";
    detailAction = "Sinh nội dung email";
  } else if (tool === "course-registration") {
    mainFeature = "Đăng ký khóa học";
    subFeature = "Khóa học B2B BD";
    detailAction = "Gửi form đăng ký";
  }

  // GHI CHÍNH XÁC 8 CỘT (A: Thời gian | B: Email | C: Tính năng | D: Tiểu mục | E: Hành động | F: Bổ sung | G: Thiết bị | H: User ID)
  sheet.appendRow([
    dateVal,            // Col A: Thời gian ghi nhận
    finalEmailColumn,   // Col B: Email người dùng
    mainFeature,        // Col C: Tính năng chính
    subFeature,         // Col D: Tiểu mục / Tên Game
    detailAction,       // Col E: Hành động chi tiết
    additionalInfo,     // Col F: Thông tin bổ sung
    deviceVal,          // Col G: Thiết bị
    finalUserIdColumn   // Col H: User ID
  ]);

  return createJsonResponse({ success: true, message: "Lead logged." });
}

function formatTimestamp(isoString) {
  try {
    const d = new Date(isoString);
    return Utilities.formatDate(d, "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
  } catch (e) {
    return isoString;
  }
}

function getHeaderIndices(headers) {
  if (!headers || !Array.isArray(headers)) return {};
  
  const result = {
    id: -1,
    date: -1,
    name: -1,
    email: -1,
    verified: -1,
    points: -1,
    lastActivity: -1,
    device: -1,
    tool: -1,
    experience: -1,
    industry: -1,
    skill: -1,
    ebook: -1,
    phone: -1,
    company: -1,
    password: -1
  };

  for (let i = 0; i < headers.length; i++) {
    const raw = (headers[i] || "").toString().toLowerCase().trim();
    const h = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");

    // 1. Kiểm tra chính xác từng nhóm tiêu đề
    if (h.includes("ebook") || h.includes("tai lieu") || h.includes("sach")) {
      result.ebook = i;
    } else if (h.includes("hoat dong") || h.includes("last activity") || h.includes("lan cuoi") || h.includes("gan nhat")) {
      result.lastActivity = i;
    } else if (h.includes("ngay") || h.includes("thoi gian") || h.includes("created") || h.includes("date")) {
      result.date = i;
    } else if (h.includes("email") || h.includes("hom thu")) {
      result.email = i;
    } else if (h.includes("trang thai") || h.includes("xac thuc") || h.includes("status") || h.includes("verified")) {
      result.verified = i;
    } else if (h.includes("diem") || h.includes("point")) {
      result.points = i;
    } else if (h.includes("thiet bi") || h.includes("device")) {
      result.device = i;
    } else if (h.includes("cong cu") || h.includes("tool")) {
      result.tool = i;
    } else if (h.includes("kinh nghiem") || h.includes("exp")) {
      result.experience = i;
    } else if (h.includes("nganh") || h.includes("linh vuc") || h.includes("industry")) {
      result.industry = i;
    } else if (h.includes("ky nang") || h.includes("skill")) {
      result.skill = i;
    } else if (h.includes("dien thoai") || h.includes("sdt") || h.includes("phone")) {
      result.phone = i;
    } else if (h.includes("cong ty") || h.includes("company") || h.includes("doanh nghiep")) {
      result.company = i;
    } else if (h.includes("mat khau") || h.includes("password")) {
      result.password = i;
    } else if (h.includes("ho va ten") || h.includes("ho ten") || h.includes("ten") || h.includes("name")) {
      result.name = i;
    } else if (h.includes("id") || h.includes("ma hoc vien")) {
      result.id = i;
    }
  }

  // Fallback defaults theo vị trí nếu không tìm thấy tên
  if (result.email === -1) {
    result.id = 0;
    result.date = 1;
    result.name = 2;
    result.email = 3;
    result.verified = 4;
    result.points = 5;
    result.lastActivity = 6;
    result.device = 7;
  }

  return result;
}

function getOrCreateGuestId(guestKey) {
  const sheet = getOrCreateSheet("Guest Mapping");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i] && data[i][0] === guestKey) {
      return data[i][1];
    }
  }
  
  let maxNum = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i] && data[i][1] !== undefined && data[i][1] !== null) {
      const val = data[i][1].toString();
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
  const allSheets = ss.getSheets();
  
  const cleanTarget = sheetName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (let i = 0; i < allSheets.length; i++) {
    const s = allSheets[i];
    const sClean = s.getName().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanTarget.includes("hocvien") || cleanTarget.includes("leads") || cleanTarget.includes("coursereg")) {
      if (sClean.includes("hocvien") || sClean.includes("leads") || sClean.includes("coursereg")) {
        return s;
      }
    } else if (cleanTarget.includes("nhatky") || cleanTarget.includes("tuongtac") || cleanTarget.includes("log")) {
      if (sClean.includes("nhatky") || sClean.includes("tuongtac") || sClean.includes("log")) {
        return s;
      }
    } else if (cleanTarget.includes("guest")) {
      if (sClean.includes("guest")) {
        return s;
      }
    }
  }

  let sheet = ss.getSheetByName(sheetName);
  if (sheet) return sheet;

  if (allSheets.length === 1 && (allSheets[0].getName().startsWith("Sheet") || allSheets[0].getName().startsWith("Trang tính"))) {
    allSheets[0].setName(sheetName);
    return allSheets[0];
  }

  sheet = ss.insertSheet(sheetName);
  if (sheetName.includes("Học Viên") || sheetName === "Học Viên Đăng Ký") {
    sheet.appendRow([
      "UserID", "Thời gian đăng ký", "Họ và Tên", "Email", "Trạng Thái Xác Thực",
      "Điểm Tích Lũy", "Hoạt Động Cuối", "Thiết Bị", "Công Cụ Đăng Ký", "Kinh Nghiệm",
      "Ngành Nghề", "Kỹ Năng", "Tên Ebook Đã Tải", "Số Điện Thoại", "Công Ty"
    ]);
  } else if (sheetName.includes("Nhật Ký") || sheetName === "Nhật Ký Tương Tác") {
    sheet.appendRow([
      "Thời gian ghi nhận", "Email người dùng", "Tính năng chính", "Tiểu mục / Tên Game",
      "Hành động chi tiết", "Thông tin bổ sung", "Thiết bị", "User ID"
    ]);
  } else if (sheetName === "Guest Mapping") {
    sheet.appendRow(["Guest Key", "Guest ID", "Date Created"]);
  }
  return sheet;
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getHtmlEmailTemplate(message, buttonText, buttonUrl, mascotUrl, name) {
  const finalMascotUrl = mascotUrl || "https://bdbinhdanhocvu.com/mascot_quests.jpg";
  const lines = [
    "<!DOCTYPE html>",
    "<html>",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
    "  <style>",
    "    body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }",
    "    .email-container { max-width: 580px; margin: 25px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }",
    "    .email-header { background: linear-gradient(135deg, #a20a0a 0%, #7c0808 100%); padding: 28px 24px; text-align: center; }",
    "    .email-header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }",
    "    .email-header p { color: #fecaca; margin: 6px 0 0 0; font-size: 13px; font-weight: 500; }",
    "    .email-body { padding: 30px 25px; color: #1e293b; font-size: 14.5px; line-height: 1.65; }",
    "    .mascot-box { text-align: center; margin: 15px 0 25px 0; }",
    "    .mascot-img { width: 96px; height: 96px; border-radius: 50%; border: 3px solid #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }",
    "    .cta-box { text-align: center; margin: 30px 0 20px 0; }",
    "    .cta-btn { display: inline-block; background: linear-gradient(135deg, #a20a0a 0%, #dc2626 100%); color: #ffffff !important; text-decoration: none; padding: 13px 32px; font-size: 15px; font-weight: 800; border-radius: 30px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35); }",
    "    .email-footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }",
    "    .accent-link { color: #a20a0a; text-decoration: none; font-weight: 700; }",
    "  </style>",
    "</head>",
    "<body>",
    "  <div class=\"email-container\">",
    "    <div class=\"email-header\">",
    "      <h1>BD BÌNH DÂN HỌC VỤ</h1>",
    "      <p>Nơi Chiến Binh BD Bắt Đầu &bull; Peter Vo</p>",
    "    </div>",
    "    <div class=\"email-body\">",
    "      <div class=\"mascot-box\">",
    "        <img src=\"" + finalMascotUrl + "\" alt=\"Cú BeeDee\" class=\"mascot-img\">",
    "      </div>",
    "      <div>" + message + "</div>",
    buttonUrl ? ("      <div class=\"cta-box\"><a href=\"" + buttonUrl + "\" class=\"cta-btn\">" + (buttonText || "Khám Phá Ngay &rarr;") + "</a></div>") : "",
    "    </div>",
    "    <div class=\"email-footer\">",
    "      Bạn nhận được email này vì đã đăng ký nhận tài liệu và tham gia rèn luyện tại <a href=\"https://bdbinhdanhocvu.com\" class=\"accent-link\">BD Bình Dân Học Vụ</a>.<br>",
    "      &copy; 2026 BD Bình Dân Học Vụ. All rights reserved.",
    "    </div>",
    "  </div>",
    "</body>",
    "</html>"
  ];
  return lines.join("\n");
}
