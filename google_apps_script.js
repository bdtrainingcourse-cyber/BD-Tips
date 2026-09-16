/**
 * ==================================================================
 * GOOGLE APPS SCRIPT WEBHOOK BACKEND - B2B BD TIPS PORTAL
 * Production Domain: https://www.bdbinhdanhocvu.com
 * Email Sender: bdtraining@bdbinhdanhocvu.com
 *
 * 1. SHEET "Học Viên Đăng Ký":
 * Col A: User ID | Col B: Thời gian đăng ký | Col C: Họ và Tên | Col D: Email 
 * Col E: Trạng thái xác thực | Col F: Điểm tích lũy | Col G: Hoạt Động Cuối 
 * Col H: Email Daily Gần Nhất | Col I: Thiết Bị | Col J: Công Cụ Đăng Ký 
 * Col K: Kinh Nghiệm | Col L: Ngành Nghề | Col M: Kỹ Năng | Col N: Tên Ebook Đã Tải 
 * Col O: Số Điện Thoại | Col P: Công Ty
 *
 * 2. SHEET "Nhật Ký Tương Tác":
 * Col A: Thời gian ghi nhận | Col B: Email người dùng | Col C: Tính năng chính 
 * Col D: Tiểu mục / Tên Game | Col E: Hành động chi tiết | Col F: Thông tin bổ sung 
 * Col G: Thiết bị | Col H: User ID
 * ==================================================================
 */

const B2B_SECRET_KEY = "2108330119Snail!!";

// ------------------------------------------------------------------
// 0. GOOGLE SHEETS UI MENU & ONEDIT TRIGGERS (TỰ ĐỘNG HÓA HỌC VIÊN CŨ)
// ------------------------------------------------------------------
function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu("Quản Lý Học Viên BD")
      .addItem("Khởi Tạo Tab 'Học Viên Đã Học' & 'Yêu Cầu Tìm PIC'", "menuInitAlumniSheets")
      .addItem("Xử Lý Nickname & Mã VIP Tự Động Cho Toàn Bộ Học Viên", "menuAutoProcessAlumni")
      .addSeparator()
      .addItem("Cài Đặt Tự Động Gửi Email Khi Tích Checkbox (1 Lần)", "setupPicEditTrigger")
      .addItem("Gửi Thông Tin PIC Cho Dòng Đang Chọn (Tab Yêu Cầu Tìm PIC)", "menuSendPicSelectedRow")
      .addSeparator()
      .addItem("Gửi Thử VIP Đến: vptanaia@gmail.com", "menuTestSendVipToTan")
      .addItem("Gửi Thử VIP Đến: ocsen.fashion@gmail.com", "menuTestSendVipToOcsen")
      .addItem("Gửi Thử VIP (Nhập Email Bất Kỳ)", "menuTestSendVipLaunchingEmail")
      .addSeparator()
      .addItem("Gửi Toàn Bộ VIP (Giãn cách 2 phút/thư chống spam)", "menuSendBulkAlumniWithPacing")
      .addSeparator()
      .addItem("🧹 Dọn Dẹp Dữ Liệu 3 Email Test (bdtrainingcourse, bdmastery, ocsen)", "menuCleanTestingEmails")
      .addItem("🔧 Sửa Lỗi Record Line 17 & 18 (Chuẩn Hóa Học Viên Đăng Ký)", "menuFixRegistrationTemplateMismatch")
      .addItem("⚡ Sửa Họ Tên 'Alumni VIP' Về Tên Thật (Tab Học Viên Đăng Ký)", "menuFixAlumniNamesInRegistrationSheet")
      .addToUi();
  } catch (e) {
    Logger.log("onOpen error: " + e.message);
  }

  try {
    ensurePicSheetReady();
  } catch (e) {}
}

function ensurePicSheetReady() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets();
  for (let i = 0; i < allSheets.length; i++) {
    const s = allSheets[i];
    const clean = s.getName().toLowerCase().replace(/[^a-z0-9]/g, '');
    if (clean.includes("yeucautimpic") || clean.includes("picrequest") || clean.includes("timpic")) {
      if (s.getMaxColumns() < 16) {
        initPicRequestsSheet();
      }
      break;
    }
  }
}

function menuInitAlumniSheets() {
  initAlumniSheet();
  initPicRequestsSheet();
  SpreadsheetApp.getUi().alert(
    "Khởi Tạo Bảng Thành Công!",
    "Đã tạo/chuẩn hóa 2 tab trên Google Sheet:\n\n" +
    "1. Tab 'Học Viên Đã Học': Chuẩn 11 cột chuyên nghiệp (Màu vàng). Cột 7 theo dõi 'Trạng Thái & Ngày Kích Hoạt', Cột 11 theo dõi 'Trạng Thái Gửi Email'.\n" +
    "2. Tab 'Yêu Cầu Tìm PIC': Chuẩn 16 cột (Màu đỏ). Cột 10-14 điền thông tin PIC, Cột 15 là Checkbox tự động gửi email cho học viên.\n\n" +
    "Bạn có thể dán danh sách học viên cũ và bắt đầu sử dụng!",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function initAlumniSheet() {
  const sheet = getOrCreateSheet("Học Viên Đã Học");
  const expectedHeaders = [
    "Họ và Tên", "Email", "Funny Nickname", "User ID (Mã VIP)",
    "Số Lượt PIC Còn Lại", "Trạng Thái Vào Web", "Trạng Thái & Ngày Kích Hoạt", "Hạn Sử Dụng (90 Ngày)",
    "Link VIP Trực Tiếp", "Lịch Sử Yêu Cầu PIC", "Trạng Thái Gửi Email"
  ];
  const currentCols = sheet.getMaxColumns();
  if (currentCols < expectedHeaders.length) {
    sheet.insertColumnsAfter(currentCols, expectedHeaders.length - currentCols);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(expectedHeaders);
  } else {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
  }
  try {
    sheet.getRange(1, 1, 1, expectedHeaders.length)
      .setFontWeight("bold")
      .setBackground("#fef3c7")
      .setFontColor("#92400e");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, expectedHeaders.length);
  } catch (e) {}
  return sheet;
}

function menuTestSendVipLaunchingEmail() {
  const ui = SpreadsheetApp.getUi();
  const prompt = ui.prompt(
    "Gửi Thử Email Launching VIP",
    "Nhập email học viên để gửi thử (mặc định: ocsen.fashion@gmail.com):",
    ui.ButtonSet.OK_CANCEL
  );
  if (prompt.getSelectedButton() !== ui.Button.OK) return;
  const targetEmail = prompt.getResponseText().trim() || "ocsen.fashion@gmail.com";
  if (!targetEmail.includes("@")) {
    ui.alert("Email không hợp lệ. Vui lòng thử lại.");
    return;
  }
  executeVipTestSendAlert(targetEmail);
}

function menuTestSendVipToOcsen() {
  executeVipTestSendAlert("ocsen.fashion@gmail.com");
}

function menuTestSendVipToTan() {
  executeVipTestSendAlert("vptanaia@gmail.com");
}

function executeVipTestSendAlert(targetEmail) {
  const res = sendVipLaunchingEmail(targetEmail);
  if (res && res.success) {
    SpreadsheetApp.getUi().alert(
      "Gửi Thử Nghiệm Thành Công!",
      "Đã gửi email Launching VIP kèm hình ảnh 9 Vũ Khí B2B tới: " + targetEmail + "\n\n" +
      "• Họ tên trong thư: " + (res.recipientName || "Chuẩn theo Sheet") + "\n" +
      "• Funny Nickname: " + (res.recipientNickname || "Chuẩn theo Sheet") + "\n\n" +
      "Bạn hãy kiểm tra hộp thư (cả Inbox và Promotions/Spam) nhé!",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    SpreadsheetApp.getUi().alert(
      "Thông Báo Gửi Thử",
      (res && res.error) ? res.error : "Không thể gửi email. Vui lòng kiểm tra lại quyền truy cập Gmail hoặc mạng internet.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  }
}

function menuSendBulkAlumniWithPacing() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Học Viên Đã Học");
  if (!sheet) {
    ui.alert("Chưa có sheet 'Học Viên Đã Học'. Vui lòng khởi tạo tab trước.");
    return;
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    ui.alert("Bảng 'Học Viên Đã Học' chưa có dữ liệu học viên.");
    return;
  }

  // Đếm số học viên chưa gửi hoặc yêu cầu gửi lại
  let pendingList = [];
  for (let r = 1; r < data.length; r++) {
    const row = data[r];
    const email = (row[1] || "").toString().trim().toLowerCase();
    const actStatus = (row[6] || "").toString().trim();
    const emailStatus = (row[10] || "").toString().trim();
    if (email && email.includes("@")) {
      const isAlreadySent = (actStatus.includes("Đã gửi") || actStatus.includes("Đã lên lịch") || actStatus.includes("Đã Kích Hoạt"))
                         && (emailStatus.includes("Đã gửi") || emailStatus.includes("Đã lên lịch"));
      const isForceResend = actStatus.toLowerCase().includes("gửi lại") || emailStatus.toLowerCase().includes("gửi lại");
      
      if (!isAlreadySent || isForceResend) {
        pendingList.push({
          email: email,
          name: (row[0] || "").toString().trim(),
          nickname: (row[2] || "").toString().trim(),
          vipCode: (row[3] || "").toString().trim(),
          magicLink: (row[8] || "").toString().trim()
        });
      }
    }
  }

  if (pendingList.length === 0) {
    ui.alert("Tất Cả Đã Được Gửi!", "Toàn bộ học viên VIP trong danh sách đều đã được gửi hoặc lên lịch trước đó.\nNếu muốn gửi lại, bạn hãy gõ 'Gửi Lại' hoặc xóa nội dung ở Cột 7 / Cột 11.", ui.ButtonSet.OK);
    return;
  }

  const estMinutes = pendingList.length * 2;
  const promptText = "Phát hiện " + pendingList.length + " học viên VIP cần gửi email.\n\n" +
    "CHỐNG SPAM VÀ BẢO VỆ TÊN MIỀN:\n" +
    "Hệ thống sẽ gửi qua Resend Enterprise API, giãn cách tự nhiên 2 phút/thư (ước tính khoảng " + estMinutes + " phút hoàn tất).\n\n" +
    "Bạn có muốn phát lệnh lên lịch gửi ngay bây giờ?";
  
  const response = ui.alert("Xác Nhận Gửi VIP Pacing", promptText, ui.ButtonSet.YES_NO);
  if (response !== ui.Button.YES) return;

  try {
    const payload = {
      action: "scheduleBulkAlumniLaunching",
      secretKey: B2B_SECRET_KEY,
      alumniList: pendingList
    };

    const res = UrlFetchApp.fetch("https://www.bdbinhdanhocvu.com/api/log-email", {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const resJson = JSON.parse(res.getContentText());
    if (resJson && resJson.success) {
      ui.alert(
        "Lên Lịch Thành Công!",
        (resJson.message || "Đã lên lịch gửi an toàn.") + "\n\n" +
        "• Bắt đầu gửi: " + (resJson.firstScheduledAtVN || "Ngay sau 1 phút") + "\n" +
        "• Dự kiến kết thúc: " + (resJson.lastScheduledAtVN || "---") + "\n\n" +
        "Cột 7 (Trạng Thái & Ngày Kích Hoạt) và Cột 11 trên sheet đã được tự động cập nhật thời gian gửi của từng bạn.",
        ui.ButtonSet.OK
      );
    } else {
      ui.alert("Lỗi Lên Lịch", (resJson && resJson.error) ? resJson.error : res.getContentText(), ui.ButtonSet.OK);
    }
  } catch (err) {
    ui.alert("Lỗi Kết Nối", "Không thể kết nối máy chủ: " + err.message, ui.ButtonSet.OK);
  }
}

function initPicRequestsSheet() {
  const sheet = getOrCreateSheet("Yêu Cầu Tìm PIC");
  const picHeaders = [
    "Thời Gian Gửi", "Email Học Viên", "Họ Tên", "Nickname",
    "Doanh Nghiệp Mục Tiêu", "Bộ Phận Tiếp Cận", "Mục Tiêu / Vai Trò",
    "Ghi Chú Học Viên", "Trạng Thái Xử Lý",
    "Tên PIC", "Chức Vụ PIC", "Link LinkedIn PIC", "Email / SĐT PIC",
    "Lời Khuyên Tiếp Cận (Peter Võ)", "Gửi Email (Tích Chọn)", "Thời Gian & Trạng Thái Gửi Email"
  ];
  const currentCols = sheet.getMaxColumns();
  if (currentCols < picHeaders.length) {
    sheet.insertColumnsAfter(currentCols, picHeaders.length - currentCols);
  }
  const currentRows = sheet.getMaxRows();
  if (currentRows < 50) {
    sheet.insertRowsAfter(currentRows, 50 - currentRows);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(picHeaders);
  } else {
    sheet.getRange(1, 1, 1, picHeaders.length).setValues([picHeaders]);
  }
  try {
    sheet.getRange(1, 1, 1, picHeaders.length)
      .setFontWeight("bold")
      .setBackground("#fee2e2")
      .setFontColor("#991b1b");
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, picHeaders.length);
    
    // Áp dụng định dạng Checkbox cho Cột 15 (Gửi Email)
    const maxRows = Math.max(sheet.getMaxRows(), 50);
    const cbRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
    sheet.getRange(2, 15, maxRows - 1, 1).setDataValidation(cbRule);

    // Đồng bộ các dòng đã gửi email trước đó hiển thị sẵn dấu tick [✓]
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const statusVals = sheet.getRange(2, 9, lastRow - 1, 8).getValues();
      for (let r = 0; r < statusVals.length; r++) {
        const col9Val = (statusVals[r][0] || "").toString().toLowerCase();
        const col16Val = (statusVals[r][7] || "").toString().toLowerCase();
        if (col9Val.includes("đã gửi") || col9Val.includes("da gui") || col16Val.includes("đã gửi") || col16Val.includes("da gui")) {
          sheet.getRange(r + 2, 15).setValue(true);
        }
      }
    }
  } catch (e) {}
  return sheet;
}

function menuAutoProcessAlumni() {
  const res = autoProcessAlumniSheet();
  SpreadsheetApp.getUi().alert("Thông Báo Tự Động Hóa", res.message || "Đã hoàn tất xử lý danh sách học viên.", SpreadsheetApp.getUi().ButtonSet.OK);
}

function setupPicEditTrigger() {
  initAlumniSheet();
  initPicRequestsSheet();
  const functionName = "installedOnEdit";
  deleteTriggerByName(functionName);
  ScriptApp.newTrigger(functionName)
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();
  SpreadsheetApp.getUi().alert(
    "Cài Đặt & Khởi Tạo Thành Công!",
    "Đã chuẩn hóa đủ 16 cột (kèm Checkbox ở Cột 15) và kích hoạt quyền tự động gửi email khi bạn tích chọn [v] trên tab 'Yêu Cầu Tìm PIC'.\n\nTừ bây giờ, bạn chỉ cần điền thông tin PIC và tích chọn [v] là email sẽ tự động gửi đi ngay lập tức.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function menuSendPicSelectedRow() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  if (sheet.getName() !== "Yêu Cầu Tìm PIC") {
    SpreadsheetApp.getUi().alert("Vui lòng mở tab 'Yêu Cầu Tìm PIC' và chọn dòng cần gửi.");
    return;
  }
  const row = sheet.getActiveCell().getRow();
  if (row <= 1) {
    SpreadsheetApp.getUi().alert("Vui lòng chọn dòng có dữ liệu học viên (từ dòng 2 trở đi).");
    return;
  }
  handlePicCheckboxSend(sheet, row);
}

function handlePicCheckboxSend(sheet, rowNum) {
  try {
    const rowVals = sheet.getRange(rowNum, 1, 1, 16).getValues()[0];
    const studentEmail = (rowVals[1] || "").toString().trim().toLowerCase();
    const studentName = (rowVals[2] || "").toString().trim();
    const nickname = (rowVals[3] || "").toString().trim();
    const targetCompany = (rowVals[4] || "").toString().trim();
    const department = (rowVals[5] || "").toString().trim();
    const targetRole = (rowVals[6] || "").toString().trim();
    const picName = (rowVals[9] || "").toString().trim();
    const picRole = (rowVals[10] || "").toString().trim();
    const picLinkedin = (rowVals[11] || "").toString().trim();
    const picContact = (rowVals[12] || "").toString().trim();
    const picAdvice = (rowVals[13] || "").toString().trim();

    if (!studentEmail || !studentEmail.includes("@")) {
      sheet.getRange(rowNum, 15).setValue(false);
      sheet.getRange(rowNum, 9).setValue("Lỗi: Email học viên không hợp lệ");
      return;
    }

    if (!picName && !picLinkedin) {
      sheet.getRange(rowNum, 15).setValue(false);
      sheet.getRange(rowNum, 9).setValue("Lỗi: Vui lòng điền Tên PIC hoặc LinkedIn");
      try {
        SpreadsheetApp.getActiveSpreadsheet().toast("Vui lòng điền Tên PIC hoặc Link LinkedIn trước khi gửi email!", "Thiếu thông tin", 5);
      } catch (e) {}
      return;
    }

    const nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM/yyyy HH:mm:ss");

    // 1. Thử gửi qua Vercel API Resend
    let sent = false;
    try {
      const res = UrlFetchApp.fetch("https://www.bdbinhdanhocvu.com/api/log-email", {
        method: "POST",
        contentType: "application/json",
        payload: JSON.stringify({
          action: "sendPicResult",
          studentEmail: studentEmail,
          email: studentEmail,
          name: studentName,
          nickname: nickname,
          company: targetCompany,
          targetCompany: targetCompany,
          targetRole: targetRole,
          department: department,
          picName: picName,
          picRole: picRole,
          picLinkedin: picLinkedin,
          picContact: picContact,
          picAdvice: picAdvice,
          secretKey: B2B_SECRET_KEY
        }),
        muteHttpExceptions: true
      });
      const json = JSON.parse(res.getContentText());
      if (json && json.success) {
        sent = true;
      }
    } catch (apiErr) {
      Logger.log("sendPicResult via API error: " + apiErr.message);
    }

    // 2. Fallback gửi qua MailApp (tiếng Việt có dấu chuẩn, không emoji)
    if (!sent) {
      const companyDisplay = targetCompany || "Doanh nghiệp mục tiêu";
      const subject = "[Kết Quả Tìm PIC] Thông tin kết nối PIC tại " + companyDisplay + " dành cho bạn";
      let cleanAdvice = (picAdvice || "").trim();
      cleanAdvice = cleanAdvice.replace(/^(gợi ý tiếp cận từ peter võ|gợi ý tiếp cận|lời khuyên tiếp cận|goi y tiep can tu peter vo|goi y tiep can)[:\s-]*/i, "").trim();

      const bodyHtml = "<div style='font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1e293b;'>"
        + "<p>Chào <strong>" + (studentName || "Bạn") + "</strong> (<em>" + (nickname || "Alumni VIP") + "</em>),</p>"
        + "<p>Anh Peter Võ đã hoàn tất rà soát mạng lưới quan hệ và thông tin nhân sự tại <strong>" + companyDisplay + "</strong> theo yêu cầu tìm PIC của bạn.</p>"
        + "<div style='background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 18px; margin: 16px 0;'>"
        + "<p style='margin: 0 0 8px 0; font-weight: bold; color: #0f172a;'>THÔNG TIN PIC PHỤ TRÁCH:</p>"
        + "<p style='margin: 4px 0;'>• Họ và tên: <strong>" + (picName || "Đang cập nhật") + "</strong></p>"
        + "<p style='margin: 4px 0;'>• Chức danh: " + (picRole || targetRole || "Phụ trách") + "</p>"
        + "<p style='margin: 4px 0;'>• Đơn vị: " + (department || "Bộ phận mục tiêu") + " - " + companyDisplay + "</p>"
        + (picLinkedin ? ("<p style='margin: 4px 0;'>• LinkedIn: <a href='" + picLinkedin + "' target='_blank' style='color: #a20a0a; font-weight: bold;'>Xem Profile &rarr;</a></p>") : "")
        + (picContact ? ("<p style='margin: 4px 0;'>• Liên hệ: " + picContact + "</p>") : "")
        + "</div>"
        + (cleanAdvice ? ("<div style='background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0;'><p style='margin: 0; font-weight: bold; color: #92400e;'>Gợi ý tiếp cận từ Peter Võ:</p><p style='margin: 6px 0 0 0; color: #78350f;'>" + cleanAdvice + "</p></div>") : "")
        + "<p style='margin-top: 20px; font-size: 14px; color: #475569; line-height: 1.6;'>Chúc bạn kết nối thành công và phát triển deal thuận lợi. Nếu cần hỗ trợ thêm về chiến lược tiếp cận hay gỡ rối sales pipeline, bạn có thể phản hồi trực tiếp email này nhé.<br><br>Thân ái,<br><strong>Peter Võ</strong><br>BD Bình Dân Học Vụ</p>"
        + "</div>";

      const mailRes = sendEmailSafe({
        to: studentEmail,
        name: "Peter Võ - BD Bình Dân Học Vụ",
        subject: subject,
        htmlBody: bodyHtml
      });
      if (mailRes && mailRes.success) {
        sent = true;
      }
    }

    if (sent) {
      sheet.getRange(rowNum, 9).setValue("Đã Gửi PIC [" + Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM HH:mm") + "]");
      sheet.getRange(rowNum, 16).setValue("Đã Gửi Email [" + nowStr + "]");
      sheet.getRange(rowNum, 15).setValue(true); // Giữ nguyên dấu tích [✓] xác nhận đã gửi thành công
      SpreadsheetApp.flush();
      try {
        SpreadsheetApp.getActiveSpreadsheet().toast("Đã gửi email thông tin PIC thành công tới " + studentEmail, "Hoàn Tất", 5);
      } catch (e) {}
    } else {
      sheet.getRange(rowNum, 15).setValue(false);
      sheet.getRange(rowNum, 9).setValue("Lỗi gửi email: Không thể kết nối dịch vụ mail");
    }
  } catch (err) {
    Logger.log("handlePicCheckboxSend error: " + err.message);
    try {
      sheet.getRange(rowNum, 15).setValue(false);
      sheet.getRange(rowNum, 9).setValue("Lỗi gửi email: " + err.message);
    } catch (e) {}
  }
}

function onEdit(e) {
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    const sheetName = sheet.getName();
    const row = e.range.getRow();
    const col = e.range.getColumn();
    
    // 1. Sheet "Học Viên Đã Học": Tự động xử lý khi paste email/tên
    if (sheetName === "Học Viên Đã Học" && row > 1 && (col === 1 || col === 2)) {
      processSingleAlumniRow(sheet, row);
      return;
    }

    // 2. Sheet "Yêu Cầu Tìm PIC": Xử lý khi tích Checkbox Gửi Email (Cột 15: O)
    if (sheetName === "Yêu Cầu Tìm PIC" && row > 1 && col === 15) {
      const val = e.value;
      if (val === "TRUE" || val === true) {
        handlePicCheckboxSend(sheet, row);
      }
    }
  } catch (err) {
    Logger.log("onEdit Error: " + err.message);
  }
}

function installedOnEdit(e) {
  onEdit(e);
}

// ------------------------------------------------------------------
// 1. DOPOST & DOGET ROUTER
// ------------------------------------------------------------------
function doPost(e) {
  try {
    const rawData = e.postData ? e.postData.contents : "{}";
    const postData = JSON.parse(rawData);
    
    // Kiểm tra Secret Key bảo mật (ngoại trừ verifyAlumni & requestPIC để web hoạt động mượt mà)
    const action = postData.action;
    if (B2B_SECRET_KEY && action !== "verifyAlumni" && action !== "requestPIC") {
      if (!postData.secretKey || postData.secretKey !== B2B_SECRET_KEY) {
        return createJsonResponse({ success: false, error: "Unauthorized: Invalid secretKey." });
      }
    }
    
    const email = postData.email ? postData.email.toLowerCase().trim() : "";
    const name = postData.name || "Học viên";
    
    // Điều hướng các tác vụ
    if (action === "verifyAlumni") {
      return verifyAlumni(postData.passcode || postData.vipPass || postData.vipCode || postData.password, email);
    } else if (action === "requestPIC") {
      return handlePICRequest(postData);
    } else if (action === "syncAlumniBatch") {
      return createJsonResponse(autoProcessAlumniSheet());
    } else if (action === "checkEmail") {
      return checkEmail(email, name);
    } else if (action === "sendEbookVerificationEmail" || (action === "syncUser" && (postData.tool === "ebook-download" || postData.ebookTitle)) || postData.tool === "ebook-download") {
      syncUser(postData, true);
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
    } else if (action === "sendVipLaunchingEmail") {
      return createJsonResponse(sendVipLaunchingEmail(email || postData.targetEmail || "vptanaia@gmail.com"));
    } else if (action === "getAlumniList") {
      return getAlumniList();
    } else if (action === "updateAlumniEmailStatus") {
      return updateAlumniEmailStatus(postData.updates || []);
    } else if (action === "getUsers") {
      return getAllUsers();
    } else if (action === "initColumn" || action === "ensureColumns") {
      const col = ensureDailyEmailColumn();
      return createJsonResponse({ success: true, message: "Daily email column initialized", columnIndex: col });
    } else if (action === "logDailyCampaign") {
      return logDailyCampaign(postData);
    } else if (action === "updateProfile") {
      return updateProfile(email, postData.field, postData.value, postData.points);
    } else if (action === "updateAlumniNickname" || action === "updateNickname") {
      return updateAlumniNickname(email, postData.nickname);
    } else if (action === "cleanTestingEmails") {
      return createJsonResponse(cleanAllTestingRecords(postData.keepEmail || "vptanaia@gmail.com"));
    } else if (action === "fixRegistrationTemplateMismatch") {
      return createJsonResponse(fixRegistrationTemplateMismatch());
    } else if (action === "fixAlumniNamesInRegistrationSheet") {
      return createJsonResponse(fixAlumniNamesInRegistrationSheet());
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
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || "";
    const email = params.email ? params.email.toLowerCase().trim() : "";
    const name = params.name || "Học viên";
    
    if (action === "verifyAlumni") {
      return verifyAlumni(params.passcode || params.vipPass || params.vipCode || params.password, email);
    } else if (action === "requestPIC") {
      return handlePICRequest(params);
    } else if (action === "syncAlumniBatch") {
      return createJsonResponse(autoProcessAlumniSheet());
    } else if (action === "checkEmail") {
      return checkEmail(email, name);
    } else if (action === "sendVipLaunchingEmail") {
      return createJsonResponse(sendVipLaunchingEmail(email || params.targetEmail || "vptanaia@gmail.com"));
    } else if (action === "getAlumniList") {
      return getAlumniList();
    } else if (action === "updateAlumniEmailStatus") {
      let updates = [];
      try {
        updates = params.updates ? JSON.parse(params.updates) : [];
      } catch(e) {}
      return updateAlumniEmailStatus(updates);
    } else if (action === "getUsers") {
      return getAllUsers();
    } else if (action === "initColumn" || action === "ensureColumns") {
      const col = ensureDailyEmailColumn();
    } else if (action === "cleanTestingEmails") {
      if (params.secretKey !== B2B_SECRET_KEY) {
        return createJsonResponse({ success: false, error: "Unauthorized: Invalid secretKey." });
      }
      return createJsonResponse(cleanAllTestingRecords(params.keepEmail || "vptanaia@gmail.com"));
    } else if (action === "fixRegistrationTemplateMismatch") {
      if (params.secretKey !== B2B_SECRET_KEY) {
        return createJsonResponse({ success: false, error: "Unauthorized: Invalid secretKey." });
      }
      return createJsonResponse(fixRegistrationTemplateMismatch());
    } else if (action === "fixAlumniNamesInRegistrationSheet") {
      if (params.secretKey !== B2B_SECRET_KEY) {
        return createJsonResponse({ success: false, error: "Unauthorized: Invalid secretKey." });
      }
      return createJsonResponse(fixAlumniNamesInRegistrationSheet());
    } else if (action === "verifyUser") {
      const points = params.points ? parseInt(params.points, 10) : 15;
      return verifyUser(email, points);
    } else if (action === "diagnostics") {
      const quota = MailApp.getRemainingDailyQuota();
      let testResult = "not_requested";
      if (email) {
        testResult = sendEmailSafe({
          to: email,
          name: "BD Bình Dân Học Vụ - Cú BeeDee",
          subject: "[Kiểm Tra Hộp Thư] Thư thử nghiệm chẩn đoán",
          htmlBody: "<p>Thư kiểm tra hệ thống gửi từ GmailApp / MailApp.</p>"
        });
      }
      return createJsonResponse({
        success: true,
        quota: quota,
        testSend: testResult
      });
    } else {
      return createJsonResponse({ success: true, message: "Webhook Active for BD Binh Dan Hoc Vu" });
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function stripHtmlToText(html) {
  if (!html) return "";
  return html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
             .replace(/<br\s*[\/]?>/gi, "\n")
             .replace(/<\/p>/gi, "\n\n")
             .replace(/<[^>]+>/gi, "")
             .replace(/&nbsp;/g, " ")
             .replace(/&bull;/g, "•")
             .replace(/&rarr;/g, "->")
             .replace(/&amp;/g, "&")
             .trim();
}

// ------------------------------------------------------------------
// 2. SAFE EMAIL DISPATCHER (Tự động kèm Plain Text chuẩn chống Spam)
// ------------------------------------------------------------------
function sendEmailSafe(mailOptions) {
  let errors = [];
  const senderDisplayName = mailOptions.name || "BDBinhDanHocVu - Peter Vo";
  const plainBody = mailOptions.body || stripHtmlToText(mailOptions.htmlBody || mailOptions.message || "") || "Xin chào, vui lòng xem nội dung email bên dưới.";
  
  // 1. Thử gửi qua GmailApp (Tự động lưu vào mục Đã Gửi / Sent của tài khoản)
  try {
    GmailApp.sendEmail(mailOptions.to, mailOptions.subject, plainBody, {
      name: senderDisplayName,
      htmlBody: mailOptions.htmlBody,
      attachments: mailOptions.attachments || []
    });
    Logger.log("Email sent via GmailApp to: " + mailOptions.to);
    return { success: true, method: "GmailApp" };
  } catch (gmailErr) {
    errors.push("GmailApp: " + gmailErr.message);
    Logger.log("GmailApp failed: " + gmailErr.message);
  }

  // 2. Dự phòng qua MailApp nếu GmailApp gặp lỗi quyền hạn
  try {
    MailApp.sendEmail({
      to: mailOptions.to,
      name: senderDisplayName,
      subject: mailOptions.subject,
      body: plainBody,
      htmlBody: mailOptions.htmlBody,
      attachments: mailOptions.attachments || []
    });
    Logger.log("Email sent via MailApp fallback to: " + mailOptions.to);
    return { success: true, method: "MailApp" };
  } catch (mailErr) {
    errors.push("MailApp: " + mailErr.message);
    Logger.log("MailApp failed: " + mailErr.message);
  }

  return { success: false, error: errors.join(" | ") };
}

// ------------------------------------------------------------------
// 3. CHECK EMAIL & USER EXISTENCE
// ------------------------------------------------------------------
function checkEmail(email, name) {
  try {
    if (!email) return createJsonResponse({ exists: false });
    const cleanEmail = email.toLowerCase().trim();
    
    // 1. Kiểm tra trong sheet "Học Viên Đăng Ký"
    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0];
      const idx = getHeaderIndices(headers);
      const rowIndex = findUserRowIndex(data, cleanEmail, idx.email);
      
      if (rowIndex !== -1) {
        const row = data[rowIndex];
        const verifiedVal = idx.verified !== -1 ? row[idx.verified] : false;
        const isVerified = (verifiedVal === true || verifiedVal.toString().toUpperCase() === "TRUE" || verifiedVal.toString().trim() === "Đã xác thực");
        
        const userData = {
          id: idx.id !== -1 && row[idx.id] ? row[idx.id] : "UID_LEGACY",
          name: idx.name !== -1 && row[idx.name] ? row[idx.name] : name,
          email: cleanEmail,
          points: idx.points !== -1 && !isNaN(parseInt(row[idx.points], 10)) ? parseInt(row[idx.points], 10) : 25,
          avatar: "",
          verified: isVerified,
          password: (idx.password !== -1 && row[idx.password]) ? String(row[idx.password]).trim() : ""
        };
        
        return createJsonResponse({ exists: true, user: userData });
      }
    }
    
    // 2. Nếu chưa có trong "Học Viên Đăng Ký", kiểm tra sheet "Học Viên Đã Học" (VIP Alumni)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetAlumni = ss.getSheetByName("Học Viên Đã Học");
    if (sheetAlumni) {
      const aData = sheetAlumni.getDataRange().getValues();
      if (aData.length > 1) {
        for (let r = 1; r < aData.length; r++) {
          const aRow = aData[r];
          const aEmail = aRow[1] ? aRow[1].toString().toLowerCase().trim() : "";
          if (aEmail === cleanEmail) {
            const aName = aRow[0] ? aRow[0].toString().trim() : (name || "Học Viên VIP");
            const aNick = aRow[2] ? aRow[2].toString().trim() : "";
            const aVipPass = aRow[3] ? aRow[3].toString().trim() : ("BD-" + Math.floor(1000 + Math.random() * 9000));
            const nowTimeStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
            
            // Tự động đồng bộ tài khoản sang "Học Viên Đăng Ký" (nếu chưa có)
            try {
              const mHeaders = sheet.getDataRange().getValues()[0];
              const mIdx = getHeaderIndices(mHeaders);
              const existingRow = findUserRowIndex(sheet.getDataRange().getValues(), cleanEmail, mIdx.email);
              if (existingRow === -1) {
                const newRow = new Array(mHeaders.length).fill("");
                const standardUid = (cleanEmail === "vptanaia@gmail.com") 
                  ? "UID_43NNTFBGK" 
                  : ("UID_" + cleanEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, ''));
                
                if (mIdx.id !== -1) newRow[mIdx.id] = standardUid;
                if (mIdx.date !== -1) newRow[mIdx.date] = nowTimeStr;
                if (mIdx.name !== -1) newRow[mIdx.name] = aName;
                if (mIdx.email !== -1) newRow[mIdx.email] = cleanEmail;
                if (mIdx.verified !== -1) newRow[mIdx.verified] = "Đã xác thực";
                if (mIdx.points !== -1) newRow[mIdx.points] = 50;
                if (mIdx.lastActivity !== -1) newRow[mIdx.lastActivity] = nowTimeStr;
                if (mIdx.device !== -1) newRow[mIdx.device] = "Desktop";
                if (mIdx.tool !== -1) newRow[mIdx.tool] = "VIP-Alumni";
                sheet.appendRow(newRow);
              }
            } catch (syncErr) {
              Logger.log("Auto sync alumni to reg sheet error: " + syncErr.message);
            }
            
            const userData = {
              id: aVipPass,
              name: aName || "Học Viên VIP",
              email: cleanEmail,
              nickname: aNick,
              vipCode: aVipPass,
              points: 50,
              avatar: "",
              verified: true,
              isVip: true
            };
            return createJsonResponse({ exists: true, user: userData, isAlumni: true });
          }
        }
      }
    }
    
    return createJsonResponse({ exists: false });
  } catch (err) {
    return createJsonResponse({ exists: false, error: err.message });
  }
}

function ensureDailyEmailColumn() {
  try {
    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const data = sheet.getDataRange().getValues();
    if (data.length === 0) return -1;

    const headers = data[0];
    const idx = getHeaderIndices(headers);
    if (idx.lastDailyEmail !== -1) {
      return idx.lastDailyEmail;
    }

    // Nếu chưa có cột, tự động chèn ngay sau cột "Hoạt Động Cuối"
    let insertColIndex = -1;
    if (idx.lastActivity !== -1) {
      sheet.insertColumnAfter(idx.lastActivity + 1);
      insertColIndex = idx.lastActivity + 1;
    } else {
      insertColIndex = headers.length;
    }

    const cell = sheet.getRange(1, insertColIndex + 1);
    cell.setValue("Email Daily Gần Nhất");
    try {
      cell.setFontWeight("bold");
    } catch (e) {}

    SpreadsheetApp.flush();
    return insertColIndex;
  } catch (err) {
    Logger.log("ensureDailyEmailColumn error: " + err.message);
    return -1;
  }
}

function getCombinedUsersList() {
  ensureDailyEmailColumn();
  const usersMap = {}; // Keyed by lowercase email for 100% deduplication
  
  // 1. Quét danh sách "Học Viên Đăng Ký"
  try {
    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const data = sheet.getDataRange().getValues();
    if (data.length > 1) {
      const headers = data[0];
      const idx = getHeaderIndices(headers);
      const emailCol = idx.email !== -1 ? idx.email : 3;
      const nameCol = idx.name !== -1 ? idx.name : 2;
      const verifiedCol = idx.verified !== -1 ? idx.verified : 4;
      const idCol = idx.id !== -1 ? idx.id : 0;
      const lastDailyCol = idx.lastDailyEmail;
      
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const email = (row[emailCol]) ? row[emailCol].toString().toLowerCase().trim() : "";
        if (!email || !email.includes("@")) continue;
        
        const name = (row[nameCol]) ? row[nameCol].toString().trim() : "Học viên";
        const verifiedVal = row[verifiedCol];
        const isVerified = (verifiedVal === true || (verifiedVal && verifiedVal.toString().toUpperCase() === "TRUE") || (verifiedVal && verifiedVal.toString().trim() === "Đã xác thực"));
        
        usersMap[email] = {
          id: (row[idCol]) ? row[idCol].toString().trim() : "",
          name: name,
          email: email,
          verified: isVerified,
          isVip: false,
          lastDailyEmail: (lastDailyCol !== -1 && row[lastDailyCol]) ? row[lastDailyCol].toString().trim() : ""
        };
      }
    }
  } catch (regErr) {
    Logger.log("Error loading Học Viên Đăng Ký in getCombinedUsersList: " + regErr.message);
  }
  
  // 2. Quét danh sách "Học Viên Đã Học" (VIP Alumni) - Đảm bảo VIP luôn nhận daily email!
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetAlumni = ss.getSheetByName("Học Viên Đã Học");
    if (sheetAlumni) {
      const aData = sheetAlumni.getDataRange().getValues();
      if (aData.length > 1) {
        for (let r = 1; r < aData.length; r++) {
          const row = aData[r];
          const aName = row[0] ? row[0].toString().trim() : "";
          const aEmail = row[1] ? row[1].toString().toLowerCase().trim() : "";
          const aNick = row[2] ? row[2].toString().trim() : "";
          const aVipPass = row[3] ? row[3].toString().trim() : "";
          
          if (!aEmail || !aEmail.includes("@")) continue;
          
          if (usersMap[aEmail]) {
            // Đã có trong danh sách đăng ký -> Đảm bảo trạng thái VIP & xác thực
            usersMap[aEmail].isVip = true;
            usersMap[aEmail].verified = true; // VIP luôn được xem là đã xác thực
            if (aVipPass) usersMap[aEmail].vipCode = aVipPass;
            if (aName && (!usersMap[aEmail].name || usersMap[aEmail].name === "Học viên" || usersMap[aEmail].name === "Khách" || usersMap[aEmail].name === "Alumni VIP")) {
              usersMap[aEmail].name = aName;
            }
          } else {
            // Học viên VIP mới dán vào sheet Alumni -> Vẫn được gửi Daily Email bình thường!
            usersMap[aEmail] = {
              id: aVipPass || ("UID_" + aEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')),
              name: aName || aNick || "Chiến Binh BD",
              email: aEmail,
              verified: true,
              isVip: true,
              vipCode: aVipPass || "BDTHUCCHIEN",
              lastDailyEmail: ""
            };
          }
        }
      }
    }
  } catch (alumniErr) {
    Logger.log("Error loading Học Viên Đã Học in getCombinedUsersList: " + alumniErr.message);
  }
  
  return Object.values(usersMap);
}

function getAllUsers() {
  try {
    const users = getCombinedUsersList();
    return createJsonResponse({ success: true, users: users, totalCount: users.length });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function updateUsersDailyEmailTimestamp(emails, timestampStr) {
  try {
    const dailyCol = ensureDailyEmailColumn();
    if (dailyCol === -1) return;

    if (!emails) return;
    const emailList = Array.isArray(emails) ? emails : [emails];
    if (emailList.length === 0) return;

    const emailTimeMap = {};
    const defaultFormattedTime = formatTimestamp(timestampStr || new Date().toISOString());

    for (var k = 0; k < emailList.length; k++) {
      var item = emailList[k];
      if (typeof item === 'string') {
        var cleanE = item.toLowerCase().trim();
        if (cleanE && cleanE.indexOf('@') !== -1) {
          emailTimeMap[cleanE] = defaultFormattedTime;
        }
      } else if (item && typeof item === 'object' && item.email) {
        var cleanObjE = item.email.toLowerCase().trim();
        if (cleanObjE && cleanObjE.indexOf('@') !== -1) {
          emailTimeMap[cleanObjE] = item.scheduledAt ? formatTimestamp(item.scheduledAt) : defaultFormattedTime;
        }
      }
    }

    const targetEmails = Object.keys(emailTimeMap);
    if (targetEmails.length === 0) return;

    const sheet = getOrCreateSheet("Học Viên Đăng Ký");
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return;

    const headers = data[0];
    const idx = getHeaderIndices(headers);
    const emailCol = idx.email !== -1 ? idx.email : 3;
    const numRows = data.length - 1;

    const updatedEmails = new Set();

    if (numRows > 0) {
      const colRange = sheet.getRange(2, dailyCol + 1, numRows, 1);
      const colValues = colRange.getValues();
      let hasChanges = false;

      for (let i = 0; i < numRows; i++) {
        const rowEmail = (data[i + 1][emailCol] || "").toString().toLowerCase().trim();
        if (emailTimeMap[rowEmail]) {
          colValues[i][0] = emailTimeMap[rowEmail];
          updatedEmails.add(rowEmail);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        colRange.setValues(colValues);
        SpreadsheetApp.flush();
      }
    }

    // Nếu có email VIP nào vừa được gửi mà chưa có dòng trong "Học Viên Đăng Ký", tự động thêm dòng!
    const regHeaders = sheet.getDataRange().getValues()[0];
    const regIdx = getHeaderIndices(regHeaders);

    // Lấy mapping tên thật từ sheet "Học Viên Đã Học"
    const ssDaily = SpreadsheetApp.getActiveSpreadsheet();
    const sheetAlumniDaily = ssDaily.getSheetByName("Học Viên Đã Học");
    const alumniNameMap = {};
    if (sheetAlumniDaily) {
      const aDailyData = sheetAlumniDaily.getDataRange().getValues();
      for (let r = 1; r < aDailyData.length; r++) {
        const aName = (aDailyData[r][0] || "").toString().trim();
        const aEmail = (aDailyData[r][1] || "").toString().toLowerCase().trim();
        if (aEmail && aName) {
          alumniNameMap[aEmail] = aName;
        }
      }
    }

    for (let j = 0; j < targetEmails.length; j++) {
      const sentEmail = targetEmails[j];
      if (!updatedEmails.has(sentEmail)) {
        const standardUid = (sentEmail.toLowerCase().trim() === "vptanaia@gmail.com")
          ? "UID_43NNTFBGK"
          : ("UID_" + sentEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, ''));
        const timeNow = emailTimeMap[sentEmail] || defaultFormattedTime;
        const realName = alumniNameMap[sentEmail.toLowerCase().trim()] || "Chiến Binh BD";
        
        const newRow = new Array(regHeaders.length).fill("");
        if (regIdx.id !== -1) newRow[regIdx.id] = standardUid;
        if (regIdx.date !== -1) newRow[regIdx.date] = timeNow;
        if (regIdx.name !== -1) newRow[regIdx.name] = realName;
        if (regIdx.email !== -1) newRow[regIdx.email] = sentEmail;
        if (regIdx.verified !== -1) newRow[regIdx.verified] = "Đã xác thực";
        if (regIdx.points !== -1) newRow[regIdx.points] = 50;
        if (regIdx.lastActivity !== -1) newRow[regIdx.lastActivity] = timeNow;
        if (regIdx.lastDailyEmail !== -1) newRow[regIdx.lastDailyEmail] = timeNow;
        if (regIdx.device !== -1) newRow[regIdx.device] = "Desktop";
        if (regIdx.tool !== -1) newRow[regIdx.tool] = "VIP-Alumni-Daily";
        sheet.appendRow(newRow);
      }
    }
    SpreadsheetApp.flush();
  } catch (err) {
    Logger.log("Error updateUsersDailyEmailTimestamp: " + err.message);
  }
}

function logDailyCampaign(data) {
  try {
    ensureDailyEmailColumn();
    const sheet = getOrCreateSheet("Nhật Ký Tương Tác");
    const timestamp = data.timestamp || new Date().toISOString();
    const subject = data.subject || "Daily Reminder";
    const total = data.totalRecipients || 0;
    const sent = data.successfulSends || 0;
    sheet.appendRow([
      formatTimestamp(timestamp),
      "SYSTEM_RESEND_CRON",
      "Daily Email Campaign",
      subject,
      "Sent via Resend",
      "Success: " + sent + " / " + total,
      "Serverless Cron",
      "SYSTEM"
    ]);

    // Cập nhật cột "Email Daily Gần Nhất" trong sheet "Học Viên Đăng Ký"
    if (data.sentEmails && Array.isArray(data.sentEmails) && data.sentEmails.length > 0) {
      updateUsersDailyEmailTimestamp(data.sentEmails, timestamp);
    }

    return createJsonResponse({ success: true, message: "Campaign logged and daily email timestamps updated" });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 4. SYNC USER (Ghi mới hoặc cập nhật trực tiếp dòng cũ)
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
      // 1. Dòng mới
      const newRow = new Array(headers.length).fill("");
      if (idx.id !== -1) newRow[idx.id] = userId;
      if (idx.date !== -1) newRow[idx.date] = date;
      if (idx.name !== -1) newRow[idx.name] = name;
      if (idx.email !== -1) newRow[idx.email] = email;
      if (idx.verified !== -1) newRow[idx.verified] = "Chưa xác thực";
      if (idx.points !== -1) newRow[idx.points] = points;
      if (idx.lastActivity !== -1) newRow[idx.lastActivity] = date; // Cột G: Hoạt Động Cuối
      if (idx.lastDailyEmail !== -1) newRow[idx.lastDailyEmail] = ""; // Cột H: Email Daily Gần Nhất
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
      
      if (data.action === "sendEbookVerificationEmail" || data.tool === "ebook-download" || data.ebookTitle) {
        sendEbookVerificationEmail(email, name, data.ebookTitle, data.fileUrl || data.downloadLink, userId);
      }
      
      return createJsonResponse({ success: true, isNew: true, points: points, userId: userId });
    } else {
      // 2. Dòng cũ: Cập nhật đè
      if (idx.points !== -1 && data.points !== undefined) sheet.getRange(userRowIndex, idx.points + 1).setValue(points);
      if (idx.password !== -1 && password) sheet.getRange(userRowIndex, idx.password + 1).setValue(password);
      if (idx.name !== -1 && name && name !== "Học viên") sheet.getRange(userRowIndex, idx.name + 1).setValue(name);
      if (idx.lastActivity !== -1) sheet.getRange(userRowIndex, idx.lastActivity + 1).setValue(date); // Cột G: Hoạt Động Cuối
      if (idx.device !== -1 && device) sheet.getRange(userRowIndex, idx.device + 1).setValue(device);
      if (idx.ebook !== -1 && data.ebookTitle) sheet.getRange(userRowIndex, idx.ebook + 1).setValue(data.ebookTitle);
      if (idx.experience !== -1 && data.experience) sheet.getRange(userRowIndex, idx.experience + 1).setValue(data.experience);
      if (idx.industry !== -1 && data.industry) sheet.getRange(userRowIndex, idx.industry + 1).setValue(data.industry);
      if (idx.skill !== -1 && data.skill) sheet.getRange(userRowIndex, idx.skill + 1).setValue(data.skill);
      if (idx.phone !== -1 && data.phone) sheet.getRange(userRowIndex, idx.phone + 1).setValue(data.phone);
      if (idx.company !== -1 && data.company) sheet.getRange(userRowIndex, idx.company + 1).setValue(data.company);
      
      if (data.action === "sendEbookVerificationEmail" || data.tool === "ebook-download" || data.ebookTitle) {
        sendEbookVerificationEmail(email, name, data.ebookTitle, data.fileUrl || data.downloadLink, userId);
      }
      
      return createJsonResponse({ success: true, isNew: false, points: points, userId: userId });
    }
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 5. VERIFY USER, UPDATE POINTS & UPDATE PROFILE
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
      if (field === "experience" && idx.experience !== -1) sheet.getRange(actualRow, idx.experience + 1).setValue(value);
      if (field === "industry" && idx.industry !== -1) sheet.getRange(actualRow, idx.industry + 1).setValue(value);
      if (field === "skill" && idx.skill !== -1) sheet.getRange(actualRow, idx.skill + 1).setValue(value);
      if (field === "phone" && idx.phone !== -1) sheet.getRange(actualRow, idx.phone + 1).setValue(value);
      if (field === "company" && idx.company !== -1) sheet.getRange(actualRow, idx.company + 1).setValue(value);

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

// ------------------------------------------------------------------
// 6. DAILY REMINDER & NATIVE TRIGGER
// ------------------------------------------------------------------
function createDailyReminderTrigger() {
  deleteTriggerByName("dailyCronTrigger");
  ScriptApp.newTrigger("dailyCronTrigger")
           .timeBased()
           .everyDays(1)
           .atHour(7) // Kích hoạt 7:00 - 8:00 AM giờ Việt Nam
           .create();
  Logger.log("Created Daily Reminder Trigger successfully at 7:00 AM VN time.");
}

function dailyCronTrigger() {
  try {
    const res = UrlFetchApp.fetch("https://www.bdbinhdanhocvu.com/api/daily-email?cron=true", { 
      muteHttpExceptions: true,
      followRedirects: true
    });
    Logger.log("Daily Cron result: " + res.getContentText());
  } catch (e) {
    Logger.log("Daily Cron trigger error: " + e.message);
  }
}

function sendDailyEmailsSynchronously(data) {
  try {
    const subject = data.subject;
    const message = data.message;
    const buttonText = data.buttonText;
    const buttonUrl = data.buttonUrl;
    const mascot = data.mascot;
    
    if (!subject || !message) return createJsonResponse({ success: false, error: "Subject or message missing" });
    
    const userList = getCombinedUsersList();
    if (userList.length === 0) return createJsonResponse({ success: true, message: "No users to send." });
    
    let sentCount = 0;
    const sentEmails = [];
    for (let i = 0; i < userList.length; i++) {
      const u = userList[i];
      const email = u.email;
      if (!email || !email.includes("@")) continue;
      
      const name = u.name || "Học viên";
      const verified = !!u.verified;
      
      if (verified) {
        try {
          const bodyHtml = getHtmlEmailTemplate(message, buttonText, buttonUrl, mascot, name);
          sendEmailSafe({
            to: email,
            name: "BD Bình Dân Học Vụ - Cú BeeDee",
            subject: subject,
            htmlBody: bodyHtml
          });
          sentCount++;
          sentEmails.push(email);
          Utilities.sleep(1500); 
        } catch (err) {
          Logger.log("Failed to send daily email to " + email + ": " + err.message);
        }
      } else {
        try {
          const verificationUrl = "https://www.bdbinhdanhocvu.com/?verify_email=" + encodeURIComponent(email);
          const unverifiedSubject = "[BD Bình Dân Học Vụ] Peter Vo gửi bạn: Quà tặng mở khóa tài liệu & Điểm tích lũy";
          const unverifiedMessage = "Chào bạn <b>" + name + "</b>,<br><br>Peter Vo và Cú BeeDee gửi bạn lời chào! Tài khoản học tập của bạn trên cổng BD Bình Dân Học Vụ đã sẵn sàng. Hãy bấm vào nút bên dưới để mở khóa toàn bộ kho tài liệu thực chiến và nhận ngay <b>15đ tích lũy</b> nhé!";
          
          const bodyHtml = getHtmlEmailTemplate(unverifiedMessage, "Mở Khóa Tài Liệu & Nhận 15đ", verificationUrl, "https://www.bdbinhdanhocvu.com/mascot_quests.jpg", name);
          sendEmailSafe({
            to: email,
            name: "BDBinhDanHocVu - Peter Vo",
            subject: unverifiedSubject,
            htmlBody: bodyHtml
          });
          sentCount++;
          sentEmails.push(email);
          Utilities.sleep(1500); 
        } catch (err) {
          Logger.log("Failed to send verification reminder to " + email + ": " + err.message);
        }
      }
    }
    if (sentEmails.length > 0) {
      updateUsersDailyEmailTimestamp(sentEmails, new Date().toISOString());
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
    
    const res = sendEmailSafe({
      to: email,
      name: data.name || "BDBinhDanHocVu - Peter Vo",
      subject: data.subject,
      htmlBody: bodyHtml
    });
    
    if (email) {
      updateUsersDailyEmailTimestamp([email], new Date().toISOString());
    }

    return createJsonResponse(res);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function sendVerificationReminder(email, name) {
  try {
    const verificationUrl = "https://www.bdbinhdanhocvu.com/?verify_email=" + encodeURIComponent(email);
    const unverifiedSubject = "[BD Bình Dân Học Vụ] Peter Vo gửi bạn: Quà tặng mở khóa tài liệu & Điểm tích lũy";
    const unverifiedMessage = "Chào bạn <b>" + name + "</b>,<br><br>Peter Vo và Cú BeeDee gửi bạn lời chào! Tài khoản học tập của bạn trên cổng BD Bình Dân Học Vụ đã sẵn sàng. Hãy bấm vào nút bên dưới để mở khóa toàn bộ kho tài liệu thực chiến và nhận ngay <b>15đ tích lũy</b> nhé!";
    
    const bodyHtml = getHtmlEmailTemplate(unverifiedMessage, "Mở Khóa Tài Liệu & Nhận 15đ", verificationUrl, "https://www.bdbinhdanhocvu.com/mascot_quests.jpg", name);
    sendEmailSafe({
      to: email,
      name: "BDBinhDanHocVu - Peter Vo",
      subject: unverifiedSubject,
      htmlBody: bodyHtml
    });

    if (email) {
      updateUsersDailyEmailTimestamp([email], new Date().toISOString());
    }

    return createJsonResponse({ success: true, message: "Verification reminder email sent." });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

function sendVerificationEmail(email, name) {
  try {
    const verificationUrl = "https://www.bdbinhdanhocvu.com/?verify_email=" + encodeURIComponent(email);
    const subject = "[BD Bình Dân Học Vụ] Chào mừng bạn tham gia & Quà tặng 15đ mở khóa tài liệu";
    const message = "Chào mừng bạn <b>" + name + "</b> đã tham gia rèn luyện cùng Peter Vo và Cú BeeDee!<br><br>Vui lòng nhấp vào nút bên dưới để mở khóa toàn bộ kho tài liệu thực chiến. Cú BeeDee sẽ tặng thêm ngay <b>15đ tích lũy</b> vào tài khoản học tập của bạn nhé.";
    
    const bodyHtml = getHtmlEmailTemplate(message, "Mở Khóa Tài Liệu & Nhận 15đ", verificationUrl, "https://www.bdbinhdanhocvu.com/mascot_quests.jpg", name);
    
    sendEmailSafe({
      to: email,
      name: "BDBinhDanHocVu - Peter Vo",
      subject: subject,
      htmlBody: bodyHtml
    });
  } catch (err) {
    Logger.log("Failed to send verification email: " + err.message);
  }
}

function sendForgotPasswordEmail(email, name, resetToken) {
  try {
    const resetUrl = "https://www.bdbinhdanhocvu.com/quests.html?reset_token=" + encodeURIComponent(resetToken) + "&email=" + encodeURIComponent(email);
    const subject = "[BD Bình Dân Học Vụ] Khôi phục mật khẩu tài khoản học tập";
    const message = "Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản <b>" + email + "</b> của bạn.<br><br>Vui lòng click vào nút bên dưới để thiết lập mật khẩu mới (liên kết có giá trị trong vòng 1 giờ).";
    
    const bodyHtml = getHtmlEmailTemplate(message, "Đặt lại mật khẩu", resetUrl, "https://www.bdbinhdanhocvu.com/mascot_law.jpg", name);
    
    const res = sendEmailSafe({
      to: email,
      name: "BD Bình Dân Học Vụ - Cú BeeDee",
      subject: subject,
      htmlBody: bodyHtml
    });
    return createJsonResponse(res);
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 7. EBOOK VERIFICATION DISPATCHER (Tốc Độ Siêu Tốc & Chuẩn 9 Cuốn)
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
    
    // Dynamic UTM tracking độc bản cho từng Ebook
    const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const utmTracking = "utm_source=email_ebook&utm_medium=email&utm_campaign=ebook_" + cleanSlug + "&utm_content=" + encodeURIComponent(title);
    const actionButtonUrl = "https://www.bdbinhdanhocvu.com/library.html?verify_email=" + encodeURIComponent(email) + "&download_file=" + encodeURIComponent(downloadPath) + "&ebook_title=" + encodeURIComponent(title) + "&" + utmTracking;
    
    // 1. Ghi đúng Tên Ebook và Hoạt Động Cuối vào "Học Viên Đăng Ký"
    try {
      const sheet = getOrCreateSheet("Học Viên Đăng Ký");
      const sheetData = sheet.getDataRange().getValues();
      const headers = sheetData[0];
      const idx = getHeaderIndices(headers);
      const rowIndex = findUserRowIndex(sheetData, email, idx.email);
      if (rowIndex !== -1 && idx.ebook !== -1) {
        sheet.getRange(rowIndex + 1, idx.ebook + 1).setValue(title);
      }
      if (rowIndex !== -1 && idx.lastActivity !== -1) {
        sheet.getRange(rowIndex + 1, idx.lastActivity + 1).setValue(formatTimestamp(new Date().toISOString()));
      }
    } catch (sheetErr) {
      Logger.log("Record ebook error: " + sheetErr.message);
    }
    
    // 2. Ghi đúng chuẩn 8 cột vào "Nhật Ký Tương Tác"
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

    // Email sending is exclusively delegated to Resend on Vercel to maintain SPF/DKIM alignment and prevent spam/duplicate emails
    return createJsonResponse({ 
      success: true, 
      method: "Delegated to Resend", 
      message: "Ebook lead logged to sheet. Email dispatch handled by Resend.", 
      ebookTitle: title, 
      fileUrl: downloadPath 
    });
  } catch (err) {
    Logger.log("Failed to send ebook verification email: " + err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

// ------------------------------------------------------------------
// 8. COURSE REGISTRATION & LOG GENERAL LEAD (Chuẩn 8 cột Nhật Ký)
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

  // GHI CHÍNH XÁC 8 CỘT
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
    pointHistory: -1,
    lastActivity: -1,
    lastDailyEmail: -1,
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

    if (h.includes("lich su") || h.includes("history")) {
      result.pointHistory = i;
    } else if (h.includes("ebook") || h.includes("tai lieu") || h.includes("sach")) {
      result.ebook = i;
    } else if (h.includes("daily") || ((h.includes("email") || h.includes("thu")) && (h.includes("gan nhat") || h.includes("cuoi") || h.includes("last")))) {
      result.lastDailyEmail = i;
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

  if (result.email === -1) {
    result.id = 0;
    result.date = 1;
    result.name = 2;
    result.email = 3;
    result.verified = 4;
    result.points = 5;
    result.lastActivity = 6;
    result.lastDailyEmail = 7;
    result.device = 8;
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
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) return sheet;

  const allSheets = ss.getSheets();
  const cleanTarget = sheetName.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Đặc biệt: Phân biệt rõ "Học Viên Đã Học" với "Học Viên Đăng Ký"
  if (cleanTarget.includes("dahoc") || cleanTarget.includes("alumni")) {
    for (let i = 0; i < allSheets.length; i++) {
      const sClean = allSheets[i].getName().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sClean.includes("dahoc") || sClean.includes("alumni")) return allSheets[i];
    }
  } else if (cleanTarget.includes("yeucautimpic") || cleanTarget.includes("picrequest")) {
    for (let i = 0; i < allSheets.length; i++) {
      const sClean = allSheets[i].getName().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (sClean.includes("yeucautimpic") || sClean.includes("picrequest")) return allSheets[i];
    }
  } else {
    for (let i = 0; i < allSheets.length; i++) {
      const s = allSheets[i];
      const sClean = s.getName().toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanTarget.includes("dangky") || cleanTarget.includes("leads") || cleanTarget.includes("coursereg")) {
        if (sClean.includes("dangky") || sClean.includes("leads") || sClean.includes("coursereg")) {
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
  }

  if (allSheets.length === 1 && (allSheets[0].getName().startsWith("Sheet") || allSheets[0].getName().startsWith("Trang tính"))) {
    allSheets[0].setName(sheetName);
    return allSheets[0];
  }

  sheet = ss.insertSheet(sheetName);
  if (sheetName === "Học Viên Đã Học" || cleanTarget.includes("dahoc") || cleanTarget.includes("alumni")) {
    const alumniHeaders = [
      "Họ và Tên", "Email", "Funny Nickname", "User ID (Mã VIP)",
      "Số Lượt PIC Còn Lại", "Trạng Thái Vào Web", "Trạng Thái & Ngày Kích Hoạt", "Hạn Sử Dụng (90 Ngày)",
      "Link VIP Trực Tiếp", "Lịch Sử Yêu Cầu PIC", "Trạng Thái Gửi Email"
    ];
    if (sheet.getMaxColumns() < alumniHeaders.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), alumniHeaders.length - sheet.getMaxColumns());
    }
    sheet.appendRow(alumniHeaders);
    try {
      sheet.getRange(1, 1, 1, alumniHeaders.length).setFontWeight("bold").setBackground("#fef3c7").setFontColor("#92400e");
      sheet.setFrozenRows(1);
    } catch (e) {}
  } else if (sheetName === "Yêu Cầu Tìm PIC" || cleanTarget.includes("yeucautimpic") || cleanTarget.includes("picrequest") || cleanTarget.includes("timpic")) {
    const picHeaders = [
      "Thời Gian Gửi", "Email Học Viên", "Họ Tên", "Nickname",
      "Doanh Nghiệp Mục Tiêu", "Bộ Phận Tiếp Cận", "Mục Tiêu / Vai Trò",
      "Ghi Chú Học Viên", "Trạng Thái Xử Lý",
      "Tên PIC", "Chức Vụ PIC", "Link LinkedIn PIC", "Email / SĐT PIC",
      "Lời Khuyên Tiếp Cận (Peter Võ)", "Gửi Email (Tích Chọn)", "Thời Gian & Trạng Thái Gửi Email"
    ];
    if (sheet.getMaxColumns() < picHeaders.length) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), picHeaders.length - sheet.getMaxColumns());
    }
    sheet.appendRow(picHeaders);
    try {
      sheet.getRange(1, 1, 1, picHeaders.length).setFontWeight("bold").setBackground("#fee2e2").setFontColor("#991b1b");
      sheet.setFrozenRows(1);
      const cbRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
      sheet.getRange(2, 15, Math.max(sheet.getMaxRows() - 1, 50), 1).setDataValidation(cbRule);
    } catch (e) {}
  } else if (sheetName.includes("Học Viên") || sheetName === "Học Viên Đăng Ký") {
    sheet.appendRow([
      "UserID", "Thời gian đăng ký", "Họ và Tên", "Email", "Trạng Thái Xác Thực",
      "Điểm Tích Lũy", "Hoạt Động Cuối", "Email Daily Gần Nhất", "Thiết Bị", "Công Cụ Đăng Ký", "Kinh Nghiệm",
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

// ------------------------------------------------------------------
// 12. ALUMNI VIP & PIC REQUEST AUTOMATION ENGINE (HỌC VIÊN ĐÃ HỌC)
// ------------------------------------------------------------------
const BD_FUNNY_TITLES = [
  "Chiến Thần BD",
  "Sát Thủ Săn Deal",
  "Vua Chốt Sale",
  "Trùm Đàm Phán",
  "Thợ Săn Pipeline",
  "Bậc Thầy B2B",
  "Cá Mập Chốt Deal",
  "Bách Phát Bách Trúng",
  "Vua Hẹn Gặp",
  "Thợ Rèn Cơ Hội",
  "Trùm Đọc Vị",
  "Chiến Hạm B2B",
  "Thần Tốc Cold Call",
  "Chúa Tể Network",
  "Phù Thủy Pitching",
  "Chuyên Gia Lead",
  "Thần Giao Kèo",
  "Thánh Bào Deal",
  "Thủ Lĩnh B2B",
  "Bậc Thầy Upsell"
];

function generateFunnyNickname(fullName, email) {
  // Tính hash nhất quán từ email hoặc họ tên để nickname cố định
  const seed = ((email || fullName || "BD_ALUMNI") + "BD_VIP_SALT").toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % BD_FUNNY_TITLES.length;
  return BD_FUNNY_TITLES[index];
}

function autoProcessAlumniSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Học Viên Đã Học");
  if (!sheet) {
    sheet = getOrCreateSheet("Học Viên Đã Học");
  }
  
  const expectedHeaders = [
    "Họ và Tên", "Email", "Funny Nickname", "User ID (Mã VIP)",
    "Số Lượt PIC Còn Lại", "Trạng Thái Vào Web", "Trạng Thái & Ngày Kích Hoạt", "Hạn Sử Dụng (90 Ngày)",
    "Link VIP Trực Tiếp", "Lịch Sử Yêu Cầu PIC", "Trạng Thái Gửi Email"
  ];
  
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length === 0 || values[0].length < 2 || !values[0][0]) {
    sheet.getRange(1, 1, 1, expectedHeaders.length).setValues([expectedHeaders]);
    sheet.getRange(1, 1, 1, expectedHeaders.length).setFontWeight("bold").setBackground("#fef3c7");
    SpreadsheetApp.flush();
    return { success: true, message: "Đã khởi tạo bảng 'Học Viên Đã Học'. Bạn hãy dán Họ Tên (Cột A) và Email (Cột B)." };
  }
  
  let processedCount = 0;
  for (let r = 2; r <= values.length; r++) {
    const updated = processSingleAlumniRow(sheet, r);
    if (updated) processedCount++;
  }
  
  SpreadsheetApp.flush();
  return { success: true, message: "Đã tự động tạo Nickname và Mã VIP cho " + processedCount + " học viên cũ." };
}

function processSingleAlumniRow(sheet, rowNum) {
  const rowVals = sheet.getRange(rowNum, 1, 1, 11).getValues()[0];
  const fullName = rowVals[0] ? rowVals[0].toString().trim() : "";
  const email = rowVals[1] ? rowVals[1].toString().trim().toLowerCase() : "";
  
  if (!fullName && !email) return false;
  
  let changed = false;
  let nickname = rowVals[2] ? rowVals[2].toString().trim() : "";
  let vipPass = rowVals[3] ? rowVals[3].toString().trim() : "";
  let remaining = rowVals[4];
  let webStatus = rowVals[5] ? rowVals[5].toString().trim() : "";
  let activated = rowVals[6] ? rowVals[6].toString().trim() : "";
  let expiry = rowVals[7];
  let link = rowVals[8] ? rowVals[8].toString().trim() : "";
  let emailStatus = rowVals[10] ? rowVals[10].toString().trim() : "";
  
  // 1. Sinh Funny Nickname
  if (!nickname) {
    nickname = generateFunnyNickname(fullName, email);
    sheet.getRange(rowNum, 3).setValue(nickname);
    changed = true;
  }
  
  // 2. VIP Password / Code (Mã VIP cá nhân ngắn gọn, độc nhất)
  if (!vipPass) {
    let seedStr = (email || fullName).toLowerCase();
    let numCode = 0;
    for (let c = 0; c < seedStr.length; c++) {
      numCode = ((numCode << 5) - numCode) + seedStr.charCodeAt(c);
      numCode |= 0;
    }
    const shortCode = "BD-" + (Math.abs(numCode) % 9000 + 1000);
    vipPass = shortCode;
    sheet.getRange(rowNum, 4).setValue(vipPass);
    changed = true;
  }
  
  // 3. Số Lượt PIC Còn Lại (mặc định: 3)
  if (remaining === "" || remaining === null || isNaN(parseInt(remaining, 10))) {
    sheet.getRange(rowNum, 5).setValue(3);
    changed = true;
  }

  // 4. Trạng Thái Vào Web (mặc định: Chưa Mở Link)
  if (!webStatus) {
    sheet.getRange(rowNum, 6).setValue("Chưa Mở Link");
    changed = true;
  }
  
  // 5. Trạng Thái & Ngày Kích Hoạt (mặc định: Chưa Gửi Email)
  if (!activated) {
    sheet.getRange(rowNum, 7).setValue("Chưa Gửi Email");
    changed = true;
  }
  
  // 6. Hạn Sử Dụng (90 ngày)
  if (!expiry) {
    const now = new Date();
    const expDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    sheet.getRange(rowNum, 8).setValue(Utilities.formatDate(expDate, "Asia/Ho_Chi_Minh", "dd/MM/yyyy"));
    changed = true;
  }
  
  // 7. Link VIP 1-Click Trực Tiếp kèm Mật Khẩu Riêng
  if (!link && email) {
    const magicUrl = "https://www.bdbinhdanhocvu.com/finder.html?email=" + encodeURIComponent(email) + "&vip_pass=" + encodeURIComponent(vipPass || "BDTHUCCHIEN");
    sheet.getRange(rowNum, 9).setValue(magicUrl);
    changed = true;
  }

  // 8. Trạng Thái Gửi Email (mặc định: Chưa Gửi Email)
  if (!emailStatus) {
    sheet.getRange(rowNum, 11).setValue("Chưa Gửi Email");
    changed = true;
  }
  
  return changed;
}

function verifyAlumni(identifier, emailParam) {
  try {
    const cleanId = (identifier || "").toString().trim();
    const cleanEmail = (emailParam || "").toString().trim().toLowerCase();
    
    // Master Admin đặc quyền cao nhất
    if (cleanEmail === "bdtraining@bdbinhdanhocvu.com" || cleanId.toLowerCase() === "bdtraining@bdbinhdanhocvu.com") {
      return createJsonResponse({
        success: true,
        isAlumni: true,
        isAdmin: true,
        isMasterAdmin: true,
        userId: "UID_MASTER_ADMIN",
        name: "Peter Võ (Master Admin)",
        nickname: "Master Admin",
        email: "bdtraining@bdbinhdanhocvu.com",
        remainingCredits: 999,
        expiry: "Trọn Đời (Vô Hạn)",
        vipCode: "BD-MASTER-ADMIN"
      });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Học Viên Đã Học");
    
    if (!sheet) {
      return createJsonResponse({ success: false, isAlumni: false, error: "Bảng 'Học Viên Đã Học' chưa được khởi tạo." });
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ success: false, isAlumni: false, error: "Chưa có thông tin học viên trong danh sách." });
    }
    
    // Quét tìm học viên theo Email, VIP Code, hoặc Master Pass
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const rName = row[0] ? row[0].toString().trim() : "";
      const rEmail = row[1] ? row[1].toString().trim().toLowerCase() : "";
      const rNick = row[2] ? row[2].toString().trim() : "";
      const rPass = row[3] ? row[3].toString().trim() : "";
      const rRem = !isNaN(parseInt(row[4], 10)) ? parseInt(row[4], 10) : 3;
      const rExp = row[7] ? row[7].toString().trim() : "90 Ngày";
      
      const matchEmail = cleanEmail && rEmail === cleanEmail;
      const matchPass = cleanId && (rPass.toUpperCase() === cleanId.toUpperCase() || cleanId.toUpperCase() === "BDTHUCCHIEN");
      const matchIdAsEmail = cleanId.includes("@") && rEmail === cleanId.toLowerCase();
      
      if (matchEmail || (matchPass && (cleanEmail === "" || matchEmail)) || matchIdAsEmail) {
        const uid = rPass || (rEmail ? ("UID_" + rEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')) : "UID_VIP");
        const nowTimeStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM HH:mm");

        // 1. Cập nhật Trạng Thái Vào Web và Trạng Thái Kích Hoạt trong sheet Học Viên Đã Học
        try {
          sheet.getRange(r + 1, 6).setValue("Đã Vào Web [" + nowTimeStr + "]");
          sheet.getRange(r + 1, 7).setValue("Đã Kích Hoạt [" + nowTimeStr + "]");
          sheet.getRange(r + 1, 11).setValue("Đã Kích Hoạt [" + nowTimeStr + "]");
        } catch (e) {}

        // 2. Tự động đồng bộ tài khoản sang sheet Học Viên Đăng Ký (nếu chưa có)
        try {
          const sheetMain = getOrCreateSheet("Học Viên Đăng Ký");
          const mData = sheetMain.getDataRange().getValues();
          const mHeaders = mData[0];
          const mIdx = getHeaderIndices(mHeaders);
          const userRow = findUserRowIndex(mData, rEmail, mIdx.email);
          const fullTimeStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
          const standardUid = (rEmail.toLowerCase().trim() === "vptanaia@gmail.com")
            ? "UID_43NNTFBGK"
            : (uid && uid.startsWith("UID_") ? uid : ("UID_" + rEmail.split('@')[0].toUpperCase().replace(/[^A-Z0-9]/g, '')));

          if (userRow === -1) {
            const newRow = new Array(mHeaders.length).fill("");
            if (mIdx.id !== -1) newRow[mIdx.id] = standardUid;
            if (mIdx.date !== -1) newRow[mIdx.date] = fullTimeStr;
            if (mIdx.name !== -1) newRow[mIdx.name] = rName || "Học Viên VIP";
            if (mIdx.email !== -1) newRow[mIdx.email] = rEmail;
            if (mIdx.verified !== -1) newRow[mIdx.verified] = "Đã xác thực";
            if (mIdx.points !== -1) newRow[mIdx.points] = 50;
            if (mIdx.lastActivity !== -1) newRow[mIdx.lastActivity] = fullTimeStr;
            if (mIdx.lastDailyEmail !== -1) newRow[mIdx.lastDailyEmail] = "";
            if (mIdx.device !== -1) newRow[mIdx.device] = "Desktop";
            if (mIdx.tool !== -1) newRow[mIdx.tool] = "VIP-Alumni-Lounge";
            sheetMain.appendRow(newRow);
          } else {
            if (mIdx.lastActivity !== -1) {
              sheetMain.getRange(userRow + 1, mIdx.lastActivity + 1).setValue(fullTimeStr);
            }
          }
        } catch (syncErr) {
          Logger.log("Auto-sync VIP to main users error: " + syncErr.message);
        }

        // 3. Ghi nhận nhật ký tương tác
        try {
          const logSheet = getOrCreateSheet("Nhật Ký Tương Tác");
          logSheet.appendRow([
            Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss"),
            rEmail,
            "VIP Launching",
            "vip_magic_link_accessed",
            "Click CTA Email Launching",
            "Đã kích hoạt VIP Lounge",
            "Desktop",
            uid
          ]);
        } catch (logErr) {}

        return createJsonResponse({
          success: true,
          isAlumni: true,
          userId: uid,
          name: rName || "Học Viên VIP",
          nickname: rNick || generateFunnyNickname(rName, rEmail),
          email: rEmail,
          remainingCredits: rRem,
          expiry: rExp,
          vipCode: rPass || "BDTHUCCHIEN"
        });
      }
    }
    
    return createJsonResponse({
      success: false,
      isAlumni: false,
      error: "Email hoặc Mật khẩu VIP không có trong danh sách Học Viên Đã Học. Vui lòng liên hệ Peter Võ để được kích hoạt!"
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
}



function buildVipLaunchingEmailHtml(name, nickname, email, vipCode, magicLink) {
  const messageHtml = [
    "<p>Chào <strong>" + name + "</strong> (<em>" + nickname + "</em>),</p>",
    "<p>Cảm ơn bạn vì đã luôn là một phần thân thiết trong cộng đồng <strong>BD Bình Dân Học Vụ</strong>. Peter rất trân quý tinh thần thực chiến và sự đồng hành của bạn trong suốt thời gian qua.</p>",
    "<p>Hôm nay, Peter chính thức ra mắt <strong>Hệ Sinh Thái 9 Vũ Khí B2B Toàn Diện</strong> — trạm tiếp sức chiến đấu được thiết kế để bạn không còn phải \"đơn độc\" trên hành trình săn deal và xây dựng quan hệ B2B:</p>",
    "<div style=\"text-align: center; margin: 24px 0;\">",
    "  <a href=\"" + magicLink + "\" target=\"_blank\">",
    "    <img src=\"https://www.bdbinhdanhocvu.com/b2b_ecosystem_9_weapons.png\" alt=\"Vũ Trụ 9 Vũ Khí B2B Bình Dân Học Vụ\" style=\"width: 100%; max-width: 540px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 18px rgba(0,0,0,0.08); display: block; margin: 0 auto;\">",
    "  </a>",
    "</div>",
    "<div style=\"background: #fef3c7; border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 8px; margin: 20px 0; text-align: left;\">",
    "  <strong style=\"color: #92400e; font-size: 15px; display: block; margin-bottom: 6px;\">3 ĐẶC QUYỀN ALUMNI VIP DÀNH RIÊNG CHO BẠN:</strong>",
    "  <ul style=\"margin: 0; padding-left: 18px; color: #78350f; font-size: 13.5px; line-height: 1.6;\">",
    "    <li><strong>1. Hạn Mức Tìm PIC Đặc Quyền (3 Contacts / Tháng):</strong> Peter Võ trực tiếp kết nối Person-in-Charge khối HR &amp; Marketing qua 30.000+ kết nối LinkedIn, áp dụng liên tục trong 3 tháng đầu tiên (tổng 9 contacts).</li>",
    "    <li><strong>2. Vé Mời VIP Đồng Đội (Giver Mentality):</strong> Tặng bạn bè đồng nghiệp nhận +50 BD-Points và tải Ebook thực chiến đầu tiên. Bạn nhận +50đ/bạn và tự động mở khóa các Mốc Quà (<em>Mốc 5 bạn: 1 Ly Trà Sữa Size L</em>, <em>Mốc 10 bạn: 30 Phút Online 1-1</em>, <em>Mốc 15 bạn: Buổi Lunch trực tiếp cùng Peter Võ</em>).</li>",
    "    <li><strong>3. Mở Khóa Trọn Đời 9 Công Cụ &amp; Thư Viện Ebook:</strong> Trọn quyền sử dụng toàn bộ tính năng hỗ trợ nghề BD.</li>",
    "  </ul>",
    "</div>",
    "<div style=\"background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #475569; margin-bottom: 22px; text-align: left;\">",
    "  <strong>Thông Tin Mở Khóa Tài Khoản:</strong><br>",
    "  • Email học viên: <code>" + email + "</code><br>",
    "  • User ID / Mã VIP riêng: <strong style=\"color: #b45309;\">" + vipCode + "</strong><br>",
    "  • Đăng nhập tự động: Chỉ cần bấm nút bên dưới, hệ thống sẽ tự động đăng nhập không cần gõ pass.",
    "</div>"
  ].join("\n");

  return getHtmlEmailTemplate(
    messageHtml,
    "Mở Khóa Đặc Quyền VIP Của Bạn Ngay &rarr;",
    magicLink,
    "https://www.bdbinhdanhocvu.com/mascot_quests.jpg",
    name
  );
}

// Hàm gửi Email Launching đính kèm hình ảnh Hệ Sinh Thái 9 Vũ Khí B2B
function sendVipLaunchingEmail(targetEmail) {
  try {
    const cleanTarget = (targetEmail || "").toString().trim().toLowerCase();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Học Viên Đã Học");

    let sentCount = 0;
    let lastResult = null;

    if (sheet) {
      const data = sheet.getDataRange().getValues();
      for (let r = 1; r < data.length; r++) {
        const row = data[r];
        const email = row[1] ? row[1].toString().trim().toLowerCase() : "";

        if (email && (email === cleanTarget || cleanTarget === "all")) {
          const name = row[0] ? row[0].toString().trim() : "Bạn";
          let nickname = row[2] ? row[2].toString().trim() : "";
          if (!nickname) nickname = generateFunnyNickname(name, email);
          const vipCode = row[3] ? row[3].toString().trim() : "BDTHUCCHIEN";
          const magicLink = row[8] ? row[8].toString().trim() : ("https://www.bdbinhdanhocvu.com/finder.html?email=" + encodeURIComponent(email) + "&vip_pass=" + encodeURIComponent(vipCode));

          const subject = "[Đặc Quyền Alumni VIP] Ra Mắt Hệ Sinh Thái 9 Vũ Khí B2B & 3 Contacts/Tháng Tìm PIC";
          const fullHtml = buildVipLaunchingEmailHtml(name, nickname, email, vipCode, magicLink);

          // Thử gửi qua Resend Endpoint trước (đảm bảo SPF/DKIM chuẩn tên miền)
          let sentViaApi = false;
          try {
            const apiRes = UrlFetchApp.fetch("https://www.bdbinhdanhocvu.com/api/log-email?action=sendVipLaunchingEmail", {
              method: "POST",
              contentType: "application/json",
              payload: JSON.stringify({
                action: "sendVipLaunchingEmail",
                email: email,
                name: name,
                nickname: nickname,
                vipCode: vipCode,
                secretKey: B2B_SECRET_KEY
              }),
              muteHttpExceptions: true
            });
            const apiJson = JSON.parse(apiRes.getContentText());
            if (apiJson && apiJson.success) {
              sentViaApi = true;
              lastResult = { success: true, method: "Resend", resendId: apiJson.resendId, recipientName: name, recipientNickname: nickname };
            }
          } catch (apiErr) {
            Logger.log("Send via API fallback: " + apiErr.message);
          }

          if (!sentViaApi) {
            lastResult = sendEmailSafe({
              to: email,
              name: "Peter Võ - BD Bình Dân Học Vụ",
              subject: subject,
              htmlBody: fullHtml
            });
            if (lastResult) {
              lastResult.recipientName = name;
              lastResult.recipientNickname = nickname;
            }
          }

          sentCount++;
          if (cleanTarget !== "all") {
            return lastResult;
          }
        }
      }
    }

    // Nếu gửi thử nghiệm 1 email cụ thể mà email đó chưa có trong sheet: Tra cứu thông tin thực tế!
    if (sentCount === 0 && cleanTarget && cleanTarget !== "all") {
      let testName = "";
      let testVipCode = "BDTHUCCHIEN";

      // 1. Kiểm tra trong sheet "Học Viên Đăng Ký"
      const regSheet = ss.getSheetByName("Học Viên Đăng Ký");
      if (regSheet) {
        const regData = regSheet.getDataRange().getValues();
        const regIdx = getHeaderIndices(regData[0]);
        for (let i = 1; i < regData.length; i++) {
          if ((regData[i][regIdx.email] || "").toString().toLowerCase().trim() === cleanTarget) {
            testName = (regData[i][regIdx.name] || "").toString().trim();
            testVipCode = (regData[i][regIdx.id] || "BDTHUCCHIEN").toString().trim();
            break;
          }
        }
      }

      // 2. Nếu chưa có tên, format từ email prefix (VD: ocsen.fashion -> Ocsen Fashion)
      if (!testName) {
        const handle = cleanTarget.split('@')[0].replace(/[._-]/g, ' ');
        testName = handle.split(' ').map(function(word) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
      }
      const testNick = generateFunnyNickname(testName, cleanTarget);
      const testMagicLink = "https://www.bdbinhdanhocvu.com/finder.html?email=" + encodeURIComponent(cleanTarget) + "&vip_pass=" + encodeURIComponent(testVipCode);
      const subject = "[Đặc Quyền Alumni VIP] Ra Mắt Hệ Sinh Thái 9 Vũ Khí B2B & 3 Contacts/Tháng Tìm PIC";
      const fullHtml = buildVipLaunchingEmailHtml(testName, testNick, cleanTarget, testVipCode, testMagicLink);

      // Thử gửi qua Resend Endpoint trước
      try {
        const apiRes = UrlFetchApp.fetch("https://www.bdbinhdanhocvu.com/api/log-email?action=sendVipLaunchingEmail", {
          method: "POST",
          contentType: "application/json",
          payload: JSON.stringify({
            action: "sendVipLaunchingEmail",
            email: cleanTarget,
            name: testName,
            nickname: testNick,
            vipCode: testVipCode,
            secretKey: B2B_SECRET_KEY
          }),
          muteHttpExceptions: true
        });
        const apiJson = JSON.parse(apiRes.getContentText());
        if (apiJson && apiJson.success) {
          return { success: true, method: "Resend", resendId: apiJson.resendId, recipientName: testName, recipientNickname: testNick };
        }
      } catch (err) {}

      const safeRes = sendEmailSafe({
        to: cleanTarget,
        name: "Peter Võ - BD Bình Dân Học Vụ",
        subject: subject,
        htmlBody: fullHtml
      });
      if (safeRes) {
        safeRes.recipientName = testName;
        safeRes.recipientNickname = testNick;
      }
      return safeRes;
    }

    return { success: true, sentCount: sentCount, message: "Hoàn tất xử lý gửi email. Đã gửi: " + sentCount };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

function handlePICRequest(postData) {
  try {
    const email = (postData.email || "").toString().trim().toLowerCase();
    const name = (postData.name || "Học Viên VIP").toString().trim();
    const nickname = (postData.nickname || "").toString().trim();
    const targetCompany = (postData.targetCompany || postData.company || "").toString().trim();
    const department = (postData.department || "Nhân Sự (HR)").toString().trim();
    const targetRole = (postData.targetRole || postData.objective || "").toString().trim();
    const notes = (postData.notes || "").toString().trim();
    
    if (!targetCompany || !targetRole) {
      return createJsonResponse({ success: false, error: "Vui lòng điền Doanh nghiệp mục tiêu và Vị trí / Mục tiêu kết nối." });
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Kiểm tra và trừ lượt trong sheet "Học Viên Đã Học"
    let sheetAlumni = ss.getSheetByName("Học Viên Đã Học");
    let remaining = 3;
    let foundRow = -1;
    
    if (sheetAlumni) {
      const aData = sheetAlumni.getDataRange().getValues();
      for (let r = 1; r < aData.length; r++) {
        const row = aData[r];
        const rEmail = row[1] ? row[1].toString().trim().toLowerCase() : "";
        if (email && rEmail === email) {
          foundRow = r + 1;
          const currentRem = !isNaN(parseInt(row[4], 10)) ? parseInt(row[4], 10) : 3;
          if (currentRem <= 0) {
            return createJsonResponse({ success: false, error: "Bạn đã dùng hết 3 lượt tìm PIC của tháng này (hạn mức 3 contacts/tháng trong 3 tháng đầu). Vui lòng liên hệ trực tiếp Peter Võ nếu có nhu cầu phát sinh." });
          }
          remaining = currentRem - 1;
          sheetAlumni.getRange(foundRow, 5).setValue(remaining);
          
          // Ghi thêm vào lịch sử
          const currentHist = row[8] ? row[8].toString() : "";
          const newHistEntry = "[" + Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd/MM") + "] " + targetCompany + " (" + department + ")";
          sheetAlumni.getRange(foundRow, 9).setValue(currentHist ? currentHist + " | " + newHistEntry : newHistEntry);
          break;
        }
      }
    }
    
    // 2. Ghi nhận vào sheet "Yêu Cầu Tìm PIC" (Cột 1 đến 9, Cột 15 tạo Checkbox)
    let sheetRequests = getOrCreateSheet("Yêu Cầu Tìm PIC");
    const nowStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
    sheetRequests.appendRow([
      nowStr, email, name, nickname, targetCompany, department, targetRole, notes, "Đang Xử Lý"
    ]);
    const lastR = sheetRequests.getLastRow();
    try {
      const cbRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
      sheetRequests.getRange(lastR, 15).setDataValidation(cbRule);
      sheetRequests.getRange(lastR, 15).setValue(false);
    } catch (cbErr) {}
    
    // 3. Gửi email thông báo cho Peter Võ (bdtraining@bdbinhdanhocvu.com)
    sendEmailSafe({
      to: "bdtraining@bdbinhdanhocvu.com",
      name: "Cú BeeDee - Hệ Thống VIP",
      subject: "[Yêu Cầu Tìm PIC] " + (nickname || name) + " cần tìm PIC tại " + targetCompany,
      htmlBody: "<div style='font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;'>"
        + "<h2 style='color: #a20a0a;'>Yêu Cầu Tìm PIC Mới Từ Alumni VIP</h2>"
        + "<p><strong>Học viên:</strong> " + name + " (<em>" + nickname + "</em>)</p>"
        + "<p><strong>Email:</strong> " + email + "</p>"
        + "<p><strong>Doanh nghiệp mục tiêu:</strong> " + targetCompany + "</p>"
        + "<p><strong>Bộ phận:</strong> " + department + "</p>"
        + "<p><strong>Chức danh / Mục tiêu:</strong> " + targetRole + "</p>"
        + "<p><strong>Ghi chú:</strong> " + (notes || "Không có") + "</p>"
        + "<p><strong>Số lượt còn lại:</strong> " + remaining + " / 3 lượt</p>"
        + "</div>"
    });
    
    return createJsonResponse({
      success: true,
      remainingCredits: remaining,
      message: "Yêu cầu đã được gửi tới Peter Võ thành công! Peter sẽ tìm kiếm qua mạng lưới LinkedIn và phản hồi cho bạn trong 24h - 48h."
    });
  } catch (err) {
    Logger.log("handlePICRequest error: " + err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

function getAlumniList() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Học Viên Đã Học");
    if (!sheet) {
      return createJsonResponse({ success: true, alumni: [], total: 0 });
    }
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse({ success: true, alumni: [], total: 0 });
    }
    const alumni = [];
    for (let r = 1; r < data.length; r++) {
      const row = data[r];
      const email = (row[1] || "").toString().trim().toLowerCase();
      if (email && email.includes("@")) {
        alumni.push({
          name: (row[0] || "").toString().trim(),
          email: email,
          nickname: (row[2] || "").toString().trim(),
          vipCode: (row[3] || "").toString().trim(),
          remainingCredits: !isNaN(parseInt(row[4], 10)) ? parseInt(row[4], 10) : 3,
          webStatus: (row[5] || "").toString().trim(),
          activationDate: (row[6] || "").toString().trim(),
          expirationDate: (row[7] || "").toString().trim(),
          magicLink: (row[8] || "").toString().trim(),
          picHistory: (row[9] || "").toString().trim(),
          emailStatus: (row[10] || "").toString().trim()
        });
      }
    }
    return createJsonResponse({ success: true, alumni: alumni, total: alumni.length });
  } catch (err) {
    Logger.log("getAlumniList error: " + err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

function updateAlumniEmailStatus(updates) {
  try {
    if (!Array.isArray(updates) || updates.length === 0) {
      return createJsonResponse({ success: true, updatedCount: 0 });
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Học Viên Đã Học");
    if (!sheet) {
      return createJsonResponse({ success: false, error: "Sheet 'Học Viên Đã Học' không tồn tại." });
    }
    const data = sheet.getDataRange().getValues();
    let updatedCount = 0;
    
    // Map email -> status
    const updateMap = {};
    for (let i = 0; i < updates.length; i++) {
      const u = updates[i];
      if (u && u.email) {
        updateMap[u.email.toLowerCase().trim()] = u.status;
      }
    }

    for (let r = 1; r < data.length; r++) {
      const email = (data[r][1] || "").toString().trim().toLowerCase();
      if (email && updateMap[email] !== undefined) {
        const newStatus = updateMap[email];
        // Cột 11: Trạng Thái Gửi Email
        sheet.getRange(r + 1, 11).setValue(newStatus);
        
        // Cột 7: Trạng Thái & Ngày Kích Hoạt (nếu chưa kích hoạt thì đồng bộ theo email status)
        const currentAct = (data[r][6] || "").toString();
        if (!currentAct.includes("Đã Kích Hoạt")) {
          if (newStatus.includes("Đã lên lịch")) {
            sheet.getRange(r + 1, 7).setValue(newStatus);
          } else if (newStatus.includes("Đã gửi")) {
            sheet.getRange(r + 1, 7).setValue(newStatus + " - Chờ Mở Link");
          } else {
            sheet.getRange(r + 1, 7).setValue(newStatus);
          }
        }
        updatedCount++;
      }
    }
    
    return createJsonResponse({ success: true, updatedCount: updatedCount });
  } catch (err) {
    Logger.log("updateAlumniEmailStatus error: " + err.message);
    return createJsonResponse({ success: false, error: err.message });
  }
}

function updateAlumniNickname(email, newNickname) {
  try {
    const cleanEmail = (email || "").toString().trim().toLowerCase();
    const cleanNick = (newNickname || "").toString().trim();
    if (!cleanEmail || !cleanNick) {
      return createJsonResponse({ success: false, error: "Missing email or nickname" });
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let updatedInAlumni = false;
    const sheetAlumni = ss.getSheetByName("Học Viên Đã Học");
    if (sheetAlumni) {
      const data = sheetAlumni.getDataRange().getValues();
      for (let r = 1; r < data.length; r++) {
        if ((data[r][1] || "").toString().trim().toLowerCase() === cleanEmail) {
          sheetAlumni.getRange(r + 1, 3).setValue(cleanNick);
          updatedInAlumni = true;
          break;
        }
      }
    }
    return createJsonResponse({ success: true, email: cleanEmail, nickname: cleanNick, updatedInAlumni: updatedInAlumni });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.message });
  }
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
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function getHtmlEmailTemplate(message, buttonText, buttonUrl, mascotUrl, name) {
  const finalMascotUrl = mascotUrl || "https://www.bdbinhdanhocvu.com/mascot_quests.jpg";
  const safeFontStack = "'Plus Jakarta Sans', 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
  const lines = [
    "<!DOCTYPE html>",
    "<html>",
    "<head>",
    "  <meta charset=\"utf-8\">",
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
    "  <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">",
    "  <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>",
    "  <link href=\"https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Be+Vietnam+Pro:wght@500;600;700&display=swap\" rel=\"stylesheet\">",
    "  <style>",
    "    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700&family=Be+Vietnam+Pro:wght@500;600;700&display=swap');",
    "    body, table, td, p, a, h1, h2, h3, span, div { font-family: " + safeFontStack + " !important; -webkit-font-smoothing: antialiased; }",
    "    body { font-family: " + safeFontStack + "; background-color: #f8fafc; margin: 0; padding: 0; }",
    "    .email-container { max-width: 580px; margin: 25px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }",
    "    .email-header { background: linear-gradient(135deg, #a20a0a 0%, #7c0808 100%); background-color: #a20a0a; padding: 26px 20px; text-align: center; }",
    "    .email-header h1 { color: #ffffff; margin: 0; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; font-family: " + safeFontStack + "; line-height: 1.35; text-transform: uppercase; }",
    "    .email-header p { color: #fecaca; margin: 6px 0 0 0; font-size: 13.5px; font-weight: 500; font-family: " + safeFontStack + "; line-height: 1.4; }",
    "    .email-body { padding: 30px 24px; color: #1e293b; font-size: 15px; line-height: 1.65; font-family: " + safeFontStack + "; }",
    "    .mascot-box { text-align: center; margin: 15px 0 25px 0; }",
    "    .mascot-img { width: 96px; height: 96px; border-radius: 50%; border: 3px solid #f59e0b; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }",
    "    .cta-box { text-align: center; margin: 30px 0 20px 0; }",
    "    .cta-btn { display: inline-block; background: linear-gradient(135deg, #a20a0a 0%, #dc2626 100%); background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 14px 34px; font-size: 15px; font-weight: 700; font-family: " + safeFontStack + "; border-radius: 30px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35); text-align: center; line-height: 1.4; }",
    "    .email-footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; font-family: " + safeFontStack + "; line-height: 1.5; }",
    "    .accent-link { color: #a20a0a; text-decoration: none; font-weight: 700; }",
    "  </style>",
    "</head>",
    "<body style=\"margin: 0; padding: 0; background-color: #f8fafc; font-family: " + safeFontStack + ";\">",
    "  <div class=\"email-container\" style=\"max-width: 580px; margin: 25px auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);\">",
    "    <div class=\"email-header\" style=\"background: linear-gradient(135deg, #a20a0a 0%, #7c0808 100%); background-color: #a20a0a; padding: 26px 20px; text-align: center;\">",
    "      <h1 style=\"color: #ffffff; margin: 0; font-size: 21px; font-weight: 700; letter-spacing: 0.5px; font-family: " + safeFontStack + "; line-height: 1.35; text-transform: uppercase;\">BD BÌNH DÂN HỌC VỤ</h1>",
    "      <p style=\"color: #fecaca; margin: 6px 0 0 0; font-size: 13.5px; font-weight: 500; font-family: " + safeFontStack + "; line-height: 1.4;\">Nơi Chiến Binh BD Bắt Đầu &bull; Peter Vo</p>",
    "    </div>",
    "    <div class=\"email-body\" style=\"padding: 30px 24px; color: #1e293b; font-size: 15px; line-height: 1.65; font-family: " + safeFontStack + ";\">",
    "      <div class=\"mascot-box\">",
    "        <img src=\"" + finalMascotUrl + "\" alt=\"Cú BeeDee\" class=\"mascot-img\">",
    "      </div>",
    "      <div style=\"font-family: " + safeFontStack + "; font-size: 15px; line-height: 1.65; color: #1e293b;\">" + message + "</div>",
    buttonUrl ? ("      <div class=\"cta-box\" style=\"text-align: center; margin: 30px 0 20px 0;\"><a href=\"" + buttonUrl + "\" class=\"cta-btn\" style=\"display: inline-block; background: linear-gradient(135deg, #a20a0a 0%, #dc2626 100%); background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 14px 34px; font-size: 15px; font-weight: 700; font-family: " + safeFontStack + "; border-radius: 30px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.35); text-align: center; line-height: 1.4;\">" + (buttonText || "Khám Phá Ngay &rarr;") + "</a></div>") : "",
    "    </div>",
    "    <div class=\"email-footer\" style=\"background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; font-family: " + safeFontStack + "; line-height: 1.5;\">",
    "      Bạn nhận được email này vì đã đăng ký nhận tài liệu và tham gia rèn luyện tại <a href=\"https://www.bdbinhdanhocvu.com\" class=\"accent-link\" style=\"color: #a20a0a; text-decoration: none; font-weight: 700; font-family: " + safeFontStack + ";\">BD Bình Dân Học Vụ</a>.<br>",
    "      &copy; 2026 BD Bình Dân Học Vụ &bull; Stay Hungry, Stay Foolish!",
    "    </div>",
    "  </div>",
    "</body>",
    "</html>"
  ];
  return lines.join("\n");
}

/**
 * ==================================================================
 * DỌN DẸP TOÀN BỘ DỮ LIỆU EMAIL THỬ NGHIỆM TRÊN CÁC TAB GOOGLE SHEETS
 * Xóa sạch các email test, chỉ bảo lưu duy nhất vptanaia@gmail.com và người dùng thật.
 * ==================================================================
 */
function cleanAllTestingRecords(keepEmail) {
  const protectedEmail = (keepEmail || "vptanaia@gmail.com").toLowerCase().trim();
  // CHỈ XÓA ĐÚNG 3 EMAIL TESTING ĐƯỢC CHỈ ĐỊNH:
  const testEmailsToDelete = [
    "bdtrainingcourse@gmail.com",
    "bdmastery.ai@petervo.vn",
    "ocsen.fashion@gmail.com"
  ];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const results = {
    success: true,
    deletedBySheet: {},
    totalDeleted: 0,
    deletedEmails: testEmailsToDelete,
    preservedEmail: protectedEmail
  };

  const sheetsToClean = [
    { name: "Học Viên Đăng Ký", emailCol: 4 }, // Cột D: Email
    { name: "Nhật Ký Tương Tác", emailCol: 2 }, // Cột B: Email
    { name: "Yêu Cầu Tìm PIC", emailCol: 4 },   // Cột D: Email
    { name: "Học Viên Đã Học", emailCol: 2 }    // Cột B: Email
  ];

  sheetsToClean.forEach(function(target) {
    const sheet = ss.getSheetByName(target.name);
    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;

    let deletedInThisSheet = 0;
    const values = sheet.getRange(1, target.emailCol, lastRow, 1).getValues();

    // Lặp ngược từ dưới lên trên để không bị lệch chỉ số dòng khi xóa
    for (let r = lastRow; r >= 2; r--) {
      const rowEmail = String(values[r - 1][0] || "").toLowerCase().trim();
      if (!rowEmail) continue;

      if (testEmailsToDelete.indexOf(rowEmail) !== -1 && rowEmail !== protectedEmail) {
        sheet.deleteRow(r);
        deletedInThisSheet++;
      }
    }

    results.deletedBySheet[target.name] = deletedInThisSheet;
    results.totalDeleted += deletedInThisSheet;
  });

  return results;
}

function menuCleanTestingEmails() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    "Xác Nhận Dọn Dẹp Dữ Liệu 3 Email Test",
    "Thao tác này sẽ tự động quét qua 4 tab:\n- Học Viên Đăng Ký\n- Nhật Ký Tương Tác\n- Yêu Cầu Tìm PIC\n- Học Viên Đã Học\n\nvà xóa sạch toàn bộ các dòng thuộc về ĐÚNG 3 email testing:\n1. bdtrainingcourse@gmail.com\n2. bdmastery.ai@petervo.vn\n3. ocsen.fashion@gmail.com\n\nTài khoản vptanaia@gmail.com và tất cả học viên/người dùng khác sẽ được BẢO LƯU NGUYÊN VẸN 100%.\n\nBạn có muốn tiếp tục?",
    ui.ButtonSet.YES_NO
  );

  if (resp === ui.Button.YES) {
    const res = cleanAllTestingRecords("vptanaia@gmail.com");
    let detailMsg = "";
    for (let sheetName in res.deletedBySheet) {
      detailMsg += "- Tab '" + sheetName + "': " + res.deletedBySheet[sheetName] + " dòng\n";
    }
    ui.alert(
      "Dọn Dẹp Hoàn Tất!",
      "Tổng số dòng của 3 email test đã xóa: " + res.totalDeleted + " dòng.\n\nChi tiết:\n" + detailMsg + "\nToàn bộ học viên khác và email " + res.preservedEmail + " được bảo lưu an toàn 100%.",
      ui.ButtonSet.OK
    );
  }
}

/**
 * ==================================================================
 * SỬA LỖI RECORD LINE 17 & 18 - CHUẨN HÓA TEMPLATE HỌC VIÊN ĐĂNG KÝ
 * 1. Xóa dòng trùng lặp (Line 18) của vptanaia@gmail.com
 * 2. Chuẩn hóa User ID thành chuẩn 'UID_43NNTFBGK' thay vì 'BD-1272'
 * 3. Chuyển 'Desktop' bị điền sai ở cột 'Lịch sử điểm' sang đúng cột 'Thiết Bị'
 * 4. Đồng bộ Trạng thái xác thực thành 'Đã xác thực' và cập nhật điểm 50
 * ==================================================================
 */
function fixRegistrationTemplateMismatch() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Học Viên Đăng Ký");
  if (!sheet) return { success: false, error: "Không tìm thấy sheet 'Học Viên Đăng Ký'" };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: false, message: "Sheet rỗng hoặc chỉ có dòng tiêu đề." };

  const headers = data[0];
  const idx = getHeaderIndices(headers);

  const targetEmail = "vptanaia@gmail.com";
  const rowsFound = [];

  for (let r = 1; r < data.length; r++) {
    const rowEmail = (idx.email !== -1 && data[r][idx.email]) 
      ? data[r][idx.email].toString().toLowerCase().trim() 
      : (data[r][3] ? data[r][3].toString().toLowerCase().trim() : "");
    
    if (rowEmail === targetEmail) {
      rowsFound.push(r + 1); // 1-indexed row number
    }
  }

  let deletedDuplicateCount = 0;
  // Nếu có từ 2 dòng trở lên: Xóa các dòng trùng lặp phía sau (xóa từ dưới lên)
  if (rowsFound.length > 1) {
    for (let i = rowsFound.length - 1; i >= 1; i--) {
      sheet.deleteRow(rowsFound[i]);
      deletedDuplicateCount++;
    }
  }

  // Chuẩn hóa dòng duy nhất còn lại
  if (rowsFound.length >= 1) {
    const primaryRow = rowsFound[0];
    const rowVals = sheet.getRange(primaryRow, 1, 1, headers.length).getValues()[0];

    // 1. Cột User ID (Cột A): Sửa BD-1272 thành UID_43NNTFBGK
    const targetUid = "UID_43NNTFBGK";
    if (idx.id !== -1) {
      sheet.getRange(primaryRow, idx.id + 1).setValue(targetUid);
    } else {
      sheet.getRange(primaryRow, 1).setValue(targetUid);
    }

    // 2. Cột Họ và tên (Cột C): Đảm bảo là Võ Phước Tân hoặc Vo Tan
    if (idx.name !== -1 && (!rowVals[idx.name] || rowVals[idx.name] === "Học viên")) {
      sheet.getRange(primaryRow, idx.name + 1).setValue("Võ Phước Tân");
    }

    // 3. Cột Trạng thái xác thực (Cột E): Chuẩn hóa thành "Đã xác thực"
    if (idx.verified !== -1) {
      sheet.getRange(primaryRow, idx.verified + 1).setValue("Đã xác thực");
    }

    // 4. Cột Điểm BD-Points (Cột F): 50
    if (idx.points !== -1) {
      sheet.getRange(primaryRow, idx.points + 1).setValue(50);
    }

    // 5. Cột Hoạt động cuối (Cột G): Chuẩn hóa ngày giờ format
    const nowTimeStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "yyyy-MM-dd HH:mm:ss");
    if (idx.lastActivity !== -1) {
      const currentAct = String(rowVals[idx.lastActivity] || "").trim();
      if (!currentAct || currentAct.length < 15) {
        sheet.getRange(primaryRow, idx.lastActivity + 1).setValue(nowTimeStr);
      }
    }

    // 6. Xử lý cột 'Lịch sử điểm' và 'Thiết Bị'
    for (let c = 0; c < headers.length; c++) {
      const hRaw = String(headers[c] || "").toLowerCase().trim();
      const hName = hRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
      const val = String(rowVals[c] || "").trim();

      // Cột Lịch sử điểm (thường là Cột 9 / Cột I): Nếu đang chứa chữ "Desktop", làm sạch nó!
      if ((hName.includes("lich su") || c === 8) && val === "Desktop") {
        sheet.getRange(primaryRow, c + 1).setValue("+50đ (Kích hoạt VIP)");
      }

      // Cột Thiết Bị: Điền "Desktop"
      if (hName.includes("thiet bi") || hName.includes("device")) {
        sheet.getRange(primaryRow, c + 1).setValue("Desktop");
      }
    }
  }

  SpreadsheetApp.flush();
  return {
    success: true,
    deletedDuplicates: deletedDuplicateCount,
    message: "Đã chuẩn hóa thành công! Đã xóa " + deletedDuplicateCount + " dòng trùng lặp, chuyển User ID thành UID_43NNTFBGK, sửa lỗi cột 'Lịch sử điểm' và đồng bộ chuẩn xác với template."
  };
}

function menuFixRegistrationTemplateMismatch() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    "Xác Nhận Sửa Lỗi Record Line 17 & 18",
    "Thao tác này sẽ tự động chuẩn hóa bảng 'Học Viên Đăng Ký':\n" +
    "1. Xóa dòng trùng lặp (Line 18)\n" +
    "2. Sửa User ID từ 'BD-1272' thành chuẩn 'UID_43NNTFBGK'\n" +
    "3. Xóa giá trị 'Desktop' bị nhảy nhầm ở cột 'Lịch sử điểm' và chuyển về đúng cột 'Thiết Bị'\n" +
    "4. Đồng bộ Trạng thái xác thực thành 'Đã xác thực'\n\n" +
    "Bạn có muốn thực hiện ngay?",
    ui.ButtonSet.YES_NO
  );

  if (resp === ui.Button.YES) {
    const res = fixRegistrationTemplateMismatch();
    ui.alert("Hoàn Tất Chuẩn Hóa!", res.message, ui.ButtonSet.OK);
  }
}

/**
 * Tự động sửa cột "Họ và tên" trong tab "Học Viên Đăng Ký":
 * Tìm các dòng đang có tên "Alumni VIP" (hoặc rỗng, "Học viên", "Khách") và đối chiếu Email
 * với tab "Học Viên Đã Học" để điền lại Họ và Tên thật chính xác!
 */
function fixAlumniNamesInRegistrationSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetReg = ss.getSheetByName("Học Viên Đăng Ký") || ss.getSheetByName("Học Viên Đã Đăng Ký");
    if (!sheetReg) return { success: false, error: "Không tìm thấy sheet 'Học Viên Đăng Ký'" };

    const sheetAlumni = ss.getSheetByName("Học Viên Đã Học");
    if (!sheetAlumni) return { success: false, error: "Không tìm thấy sheet 'Học Viên Đã Học'" };

    // 1. Quét map email -> tên thật từ "Học Viên Đã Học"
    const aData = sheetAlumni.getDataRange().getValues();
    const alumniNameMap = {};
    for (let r = 1; r < aData.length; r++) {
      const aName = (aData[r][0] || "").toString().trim();
      const aEmail = (aData[r][1] || "").toString().toLowerCase().trim();
      if (aEmail && aName) {
        alumniNameMap[aEmail] = aName;
      }
    }

    // 2. Quét "Học Viên Đăng Ký"
    const regData = sheetReg.getDataRange().getValues();
    if (regData.length <= 1) return { success: false, message: "Sheet đăng ký rỗng hoặc chỉ có tiêu đề." };

    const headers = regData[0];
    const idx = getHeaderIndices(headers);
    const emailCol = idx.email !== -1 ? idx.email : 3;
    const nameCol = idx.name !== -1 ? idx.name : 2;

    const updatedList = [];
    const numRows = regData.length - 1;
    const nameRange = sheetReg.getRange(2, nameCol + 1, numRows, 1);
    const nameValues = nameRange.getValues();
    let hasChanges = false;

    for (let i = 0; i < numRows; i++) {
      const row = regData[i + 1];
      const rowEmail = (row[emailCol] || "").toString().toLowerCase().trim();
      const currentName = (row[nameCol] || "").toString().trim();

      if (alumniNameMap[rowEmail]) {
        const correctName = alumniNameMap[rowEmail];
        // Nếu tên đang là "Alumni VIP", "Học viên", "Khách" hoặc rỗng
        if (currentName === "Alumni VIP" || !currentName || currentName === "Học viên" || currentName === "Khách") {
          nameValues[i][0] = correctName;
          updatedList.push({
            row: i + 2,
            email: rowEmail,
            oldName: currentName,
            newName: correctName
          });
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      nameRange.setValues(nameValues);
      SpreadsheetApp.flush();
    }

    return {
      success: true,
      updatedCount: updatedList.length,
      updatedList: updatedList,
      message: "Đã sửa thành công " + updatedList.length + " dòng từ 'Alumni VIP' về Họ Tên thật."
    };
  } catch (err) {
    Logger.log("fixAlumniNamesInRegistrationSheet error: " + err.message);
    return { success: false, error: err.message };
  }
}

function menuFixAlumniNamesInRegistrationSheet() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    "Xác Nhận Sửa Họ Tên Alumni VIP",
    "Thao tác này sẽ quét toàn bộ sheet 'Học Viên Đăng Ký', tìm các dòng có tên 'Alumni VIP' và tự động đối chiếu với tab 'Học Viên Đã Học' để điền lại Họ và Tên thật chính xác.\n\nBạn có muốn thực hiện ngay?",
    ui.ButtonSet.YES_NO
  );

  if (resp === ui.Button.YES) {
    const res = fixAlumniNamesInRegistrationSheet();
    if (res.success) {
      ui.alert("Hoàn Tất Sửa Tên!", res.message, ui.ButtonSet.OK);
    } else {
      ui.alert("Lỗi Sửa Tên", res.error || "Không xác định", ui.ButtonSet.OK);
    }
  }
}

