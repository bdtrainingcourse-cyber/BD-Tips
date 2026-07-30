document.addEventListener('DOMContentLoaded', () => {
    // --- Data Bases ---
    const legalRules = [
        {
            id: "probation-salary",
            title: "Lương trong thời gian thử việc",
            article: "Điều 26 Bộ luật Lao động 2019",
            category: "Thử việc",
            content: "Tiền lương của người lao động trong thời gian thử việc do hai bên thỏa thuận nhưng **ít nhất phải bằng 85%** mức lương của công việc đó. Nghiêm cấm trả thấp hơn hạn mức tối thiểu này.",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_26"
        },
        {
            id: "probation-duration",
            title: "Thời gian thử việc tối đa",
            article: "Điều 25 Bộ luật Lao động 2019",
            category: "Thử việc",
            content: "Thời gian thử việc chỉ được thử việc **01 lần duy nhất** cho một công việc:<br>• Không quá **180 ngày** đối với công việc của người quản lý doanh nghiệp.<br>• Không quá **60 ngày** đối với công việc chuyên môn từ cao đẳng trở lên (hầu hết vị trí BD, Sales Executive).<br>• Không quá **30 ngày** đối với công việc có trình độ trung cấp.<br>• Không quá **06 ngày làm việc** đối với công việc khác.",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_25"
        },
        {
            id: "annual-leave",
            title: "Quy định số ngày nghỉ phép năm",
            article: "Điều 113 Bộ luật Lao động 2019",
            category: "Thời giờ làm việc & Nghỉ ngơi",
            content: "Người lao động làm việc đủ 12 tháng được nghỉ phép năm hưởng nguyên lương:<br>• **12 ngày làm việc** đối với công việc bình thường.<br>• Cộng thêm **1 ngày phép thâm niên** cho mỗi **đủ 5 năm làm việc liên tục**.<br>• Khi thôi việc hoặc mất việc làm mà chưa nghỉ hết số ngày phép thì công ty **bắt buộc phải thanh toán bằng tiền** cho những ngày chưa nghỉ.",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_113"
        },
        {
            id: "resignation-notice",
            title: "Thời hạn báo trước khi nghỉ việc",
            article: "Điều 35 Bộ luật Lao động 2019",
            category: "Nghỉ việc & Báo trước",
            content: "Người lao động đơn phương chấm dứt hợp đồng lao động phải báo trước:<br>• Ít nhất **45 ngày** đối với hợp đồng không xác định thời hạn.<br>• Ít nhất **30 ngày** đối với hợp đồng xác định thời hạn từ 12 đến 36 tháng.<br>• Ít nhất **03 ngày làm việc** đối với hợp đồng dưới 12 tháng.<br>• **Không cần báo trước** nếu: nợ lương liên tục; không được bố trí đúng công việc; bị ngược đãi; lao động nữ mang thai cần nghỉ việc theo chỉ định y khoa.",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_35"
        },
        {
            id: "sudden-layoff-law",
            title: "Đơn phương chấm dứt hợp đồng trái luật",
            article: "Điều 36 & Điều 41 Bộ luật Lao động 2019",
            category: "Nghỉ việc & Báo trước",
            content: "Doanh nghiệp đơn phương chấm dứt hợp đồng lao động bắt buộc phải có căn cứ luật định và báo trước. Nếu chấm dứt trái pháp luật, doanh nghiệp phải **nhận lại NLĐ làm việc** và **bồi thường ít nhất 02 tháng tiền lương** hợp đồng cộng với tiền lương trong những ngày không báo trước.",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_41"
        },
        {
            id: "severance-pay-law",
            title: "Điều kiện nhận trợ cấp thôi việc",
            article: "Điều 46 Bộ luật Lao động 2019",
            category: "Trợ cấp thôi việc",
            content: "Khi chấm dứt hợp đồng lao động hợp pháp (trừ nghỉ hưu hoặc tự ý bỏ việc 5 ngày liên tục), doanh nghiệp trả trợ cấp thôi việc cho người lao động làm việc **từ đủ 12 tháng trở lên**:<br>• Mỗi năm làm việc được trợ cấp **nửa tháng tiền lương**.<br>• Thời gian làm việc tính trợ cấp = Tổng thời gian làm việc thực tế - Thời gian đã tham gia bảo hiểm thất nghiệp - Thời gian nhận trợ cấp trước đó.",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_46"
        },
        {
            id: "wage-deduction-law",
            title: "Khấu trừ tiền lương và Phạt tiền",
            article: "Điều 102 & Điều 127 Bộ luật Lao động 2019",
            category: "Bảo hiểm xã hội",
            content: "• **Nghiêm cấm** phạt tiền, cắt lương thay cho việc xử lý kỷ luật lao động.<br>• Khấu trừ lương chỉ được thực hiện để bồi thường thiệt hại hư hỏng tài sản công ty sau khi có sự đối thoại thống nhất.<br>• Mức khấu trừ lương hàng tháng **không quá 30%** tiền lương thực nhận của người lao động sau thuế và bảo hiểm.",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_102"
        },
        {
            id: "overtime-pay-law",
            title: "Quy định tiền lương làm thêm giờ (OT)",
            article: "Điều 98 & Điều 107 Bộ luật Lao động 2019",
            category: "Thời giờ làm việc & Nghỉ ngơi",
            content: "Người lao động làm thêm giờ được chi trả lương tính theo đơn giá tiền lương hoặc tiền lương thực trả theo công việc đang làm như sau:<br>• Vào ngày thường: **Ít nhất bằng 150%**.<br>• Vào ngày nghỉ hằng tuần (Chủ nhật...): **Ít nhất bằng 200%**.<br>• Vào ngày nghỉ lễ, tết, ngày nghỉ có hưởng lương: **Ít nhất bằng 300%** (chưa kể tiền lương ngày lễ, tết, ngày nghỉ có hưởng lương đối với người lao động hưởng lương ngày).",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_98"
        }
    ];

    const caseStudies = [
        {
            id: "case-probation-salary",
            title: "Hết hạn thử việc công ty vẫn trả 85% lương",
            desc: "Công ty im lặng kéo dài thời hạn thử việc và tiếp tục trả 85% lương với lý do cần theo dõi thêm doanh số Kpi.",
            category: "Thử việc",
            article: "Điều 26 & 27 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_26",
            scenario: "Anh A làm thử việc vị trí BD Executive thời hạn 60 ngày (hết hạn ngày 30/04/2026). Sau ngày 30/04, anh A vẫn đi làm, tiếp khách hàng, ký hợp đồng bình thường nhưng công ty hoàn toàn im lặng về kết quả. Đến kỳ lương tiếp theo, công ty vẫn chỉ trả anh A mức lương thử việc (85%) với lý do 'chưa đạt chỉ tiêu doanh số cam kết nên phải theo dõi thêm 1 tháng'.",
            analysis: "Theo Luật lao động, khi hết thời gian thử việc, nếu đạt yêu cầu công ty phải ký hợp đồng ngay. Việc công ty im lặng và tiếp tục để anh A làm việc đồng nghĩa với việc hợp đồng lao động chính thức đã mặc nhiên có hiệu lực. Việc kéo dài thời gian thử việc ẩn dưới dạng trả 85% lương là hành vi trái pháp luật.",
            resolution: "1. Anh A cần gửi email chính thức cho phòng Nhân sự và Quản lý yêu cầu xác nhận kết quả thử việc và ký hợp đồng chính thức.\n2. Yêu cầu truy lĩnh đầy đủ 15% phần lương còn thiếu cho các ngày làm việc kể từ ngày 01/05.\n3. Nếu công ty đơn phương cho anh A nghỉ việc vì đòi hỏi này, anh A có quyền yêu cầu bồi thường sa thải trái luật theo Điều 41 BLLĐ."
        },
        {
            id: "case-probation-twice",
            title: "Yêu cầu ký hợp đồng thử việc lần 2",
            desc: "Công ty yêu cầu nhân viên ký tiếp hợp đồng thử việc lần 2 đối với cùng một công việc để đánh giá thêm.",
            category: "Thử việc",
            article: "Điều 25 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_25",
            scenario: "Chị B ứng tuyển vị trí BD Manager và ký hợp đồng thử việc 2 tháng. Khi hết hạn 2 tháng thử việc, Giám đốc đánh giá chị B làm việc có năng lực nhưng thái độ làm việc chưa hòa đồng với tập thể, nên yêu cầu chị ký tiếp một hợp đồng thử việc lần 2 thêm 2 tháng nữa để thử thách thêm.",
            analysis: "Điều 25 Bộ luật Lao động quy định rõ: Chỉ được thử việc **01 lần** duy nhất đối với một công việc. Việc công ty yêu cầu ký hợp đồng thử việc lần 2 cho cùng vị trí BD Manager là hoàn toàn trái luật, bất kể thời gian thử việc của lần 1 là bao lâu.",
            resolution: "1. Chị B có quyền từ chối ký hợp đồng thử việc lần 2 này.\n2. Yêu cầu công ty đưa ra quyết định chính thức: Hoặc ký hợp đồng chính thức, hoặc chấm dứt quan hệ thử việc và thông báo rõ lý do không đạt yêu cầu thử việc.\n3. Nếu công ty không cho làm việc tiếp nhưng không chứng minh được chị B không đạt yêu cầu thử việc trong lần 1, chị B có thể khiếu nại lên Phòng LĐ-TB&XH."
        },
        {
            id: "case-annual-leave-payout",
            title: "Không quy đổi phép năm chưa nghỉ thành tiền",
            desc: "Doanh nghiệp từ chối thanh toán số ngày phép năm chưa nghỉ khi nhân viên xin nghỉ việc đúng luật.",
            category: "Thời giờ làm việc & Nghỉ ngơi",
            article: "Điều 113 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_113",
            scenario: "Anh C nộp đơn xin nghỉ việc và thực hiện đúng thời hạn báo trước 30 ngày. Tính đến ngày nghỉ việc chính thức, anh còn dư 8 ngày phép năm chưa sử dụng. Anh C yêu cầu công ty thanh toán tiền lương cho 8 ngày phép chưa nghỉ này nhưng bộ phận kế toán từ chối với lý do 'công ty đã có quy định nội bộ không quy đổi phép thành tiền mặt dưới mọi hình thức'.",
            analysis: "Bộ luật Lao động quy định trường hợp do thôi việc, mất việc làm mà chưa nghỉ hằng năm hoặc chưa nghỉ hết số ngày phép hằng năm thì được người sử dụng lao động thanh toán tiền lương cho những ngày chưa nghỉ. Quy định nội bộ của công ty không được phép trái hoặc hạn chế quyền lợi tối thiểu này của luật lao động.",
            resolution: "1. Anh C yêu cầu phòng Nhân sự đối chiếu quy định của Điều 113 BLLĐ 2019 về quy đổi phép năm khi nghỉ việc.\n2. Nếu công ty vẫn từ chối, gửi đơn kiến nghị trực tiếp tới Chánh thanh tra Sở LĐ-TB&XH địa phương để giải quyết.\n3. Số tiền được nhận = (Tiền lương bình quân theo hợp đồng / Số ngày làm việc bình thường của tháng) x Số ngày phép chưa nghỉ."
        },
        {
            id: "case-sudden-resignation",
            title: "Nhân viên tự ý nghỉ việc đột ngột",
            desc: "Nhân viên gửi thư từ chức và lập tức nghỉ việc vào ngày hôm sau mà không tuân thủ thời hạn báo trước.",
            category: "Nghỉ việc & Báo trước",
            article: "Điều 35 & 40 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_35",
            scenario: "Anh D ký hợp đồng xác định thời hạn 2 năm tại công ty X. Sau khi được đối thủ mời gọi với lương cao hơn, anh D gửi email xin nghỉ việc vào tối ngày 20/06/2026 và tự ý nghỉ việc kể từ ngày 21/06/2026 mà không báo trước đủ 30 ngày, để lại nhiều hợp đồng B2B của khách hàng đang dang dở.",
            analysis: "Hành vi của anh D cấu thành tội đơn phương chấm dứt hợp đồng lao động trái pháp luật vì không thực hiện đúng nghĩa vụ báo trước 30 ngày đối với hợp đồng xác định thời hạn.",
            resolution: "Anh D phải đối mặt với các trách nhiệm tài chính nghiêm trọng theo Điều 40 BLLĐ:\n1. Không được nhận trợ cấp thôi việc.\n2. Phải bồi thường cho công ty X nửa tháng tiền lương theo hợp đồng.\n3. Phải bồi thường cho công ty X một khoản tiền tương ứng với tiền lương của những ngày không báo trước (30 ngày lương).\n4. Phải hoàn trả chi phí đào tạo (nếu có)."
        },
        {
            id: "case-sudden-layoff",
            title: "Ép nghỉ việc ngay lập tức vì không đạt Kpi",
            desc: "Giám đốc ép nhân viên BD bàn giao tài khoản và nghỉ việc ngay ngày mai vì không đạt doanh số 2 tháng liên tiếp.",
            category: "Nghỉ việc & Báo trước",
            article: "Điều 36 & 41 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_41",
            scenario: "Chị E ký hợp đồng lao động 1 năm. Do thị trường khó khăn, chị E không đạt doanh số cam kết trong 2 tháng liên tiếp. Ngày 15/06/2026, Giám đốc gọi chị vào yêu cầu dọn dẹp bàn làm việc và bàn giao tài khoản để nghỉ việc ngay từ ngày 16/06 với lý do 'không đáp ứng được yêu cầu công việc'.",
            analysis: "Việc sa thải chị E là trái luật. Công ty chỉ được đơn phương chấm dứt hợp đồng nếu NLĐ thường xuyên không hoàn thành công việc *theo quy chế đánh giá công việc đã được ban hành hợp pháp và có sự tham khảo ý kiến của công đoàn*. Đồng thời, công ty vẫn phải báo trước ít nhất 30 ngày.",
            resolution: "1. Chị E yêu cầu công ty ra văn bản Quyết định chấm dứt hợp đồng lao động ghi rõ lý do sa thải.\n2. Yêu cầu công ty bồi thường tối thiểu: Tiền lương trong những ngày không báo trước (30 ngày) + 02 tháng tiền lương hợp đồng do sa thải trái luật.\n3. Nếu công ty từ chối, chị E gửi đơn khiếu nại lên Phòng LĐ-TB&XH để tiến hành hòa giải bắt buộc."
        },
        {
            id: "case-severance-refusal",
            title: "Doanh nghiệp quỵt trợ cấp thôi việc",
            desc: "Công ty không chi trả trợ cấp thôi việc cho nhân viên đã làm việc 3 năm với lý do nhân viên tự nguyện xin nghỉ.",
            category: "Trợ cấp thôi việc",
            article: "Điều 46 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_46",
            scenario: "Anh F làm việc liên tục tại công ty từ năm 2023 đến 2026 (3 năm). Anh F nộp đơn xin nghỉ việc đúng thời hạn báo trước 45 ngày và hoàn thành bàn giao đầy đủ. Khi nhận quyết định nghỉ việc, công ty từ chối trả trợ cấp thôi việc với lý do 'anh F chủ động xin nghỉ chứ công ty không sa thải nên không có trợ cấp'.",
            analysis: "Trợ cấp thôi việc áp dụng cho tất cả các trường hợp chấm dứt hợp đồng lao động hợp pháp (bao gồm cả nhân viên chủ động nghỉ việc đúng luật) đối với nhân viên đã làm việc thường xuyên từ đủ 12 tháng trở lên. Lý do công ty đưa ra là hoàn toàn sai luật.",
            resolution: "1. Anh F cần yêu cầu Nhân sự làm rõ khoản chi trả trợ cấp thôi việc theo Điều 46 BLLĐ 2019.\n2. Tính số tiền trợ cấp: 3 năm làm việc (đã trừ đi thời gian đóng Bảo hiểm thất nghiệp thực tế). Mỗi năm đủ điều kiện được hưởng nửa tháng lương bình quân của 06 tháng liền kề trước khi nghỉ việc.\n3. Gửi văn bản yêu cầu thanh toán trong thời hạn 14 ngày làm việc kể từ ngày chấm dứt hợp đồng."
        },
        {
            id: "case-wage-deduction",
            title: "Trừ lương vì đi muộn và làm mất tài liệu",
            desc: "Công ty tự ý phạt tiền trừ trực tiếp vào lương thực nhận của nhân viên thay vì xử lý kỷ luật lao động.",
            category: "Bảo hiểm xã hội",
            article: "Điều 102 & 127 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_102",
            scenario: "Chị G đi làm muộn 3 lần trong tháng và vô tình làm thất lạc một bộ hồ sơ dự án của khách hàng. Cuối tháng, công ty gửi bảng lương thể hiện khoản phạt trừ 1.000.000đ vì đi muộn và khấu trừ tiếp 3.000.000đ tiền đền bù làm mất hồ sơ mà không hề có cuộc họp kỷ luật nào.",
            analysis: "Hành vi của công ty vi phạm nghiêm trọng luật lao động: Nghiêm cấm dùng hình thức phạt tiền, cắt lương thay cho việc xử lý kỷ luật lao động. Việc khấu trừ 3.000.000đ bồi thường tài sản cũng chỉ được thực hiện tối đa 30% lương ròng tháng đó của chị G sau khi có biên bản đồng ý thương lượng.",
            resolution: "1. Chị G yêu cầu công ty hủy bỏ quyết định phạt tiền 1.000.000đ đi muộn và hoàn trả lại tiền lương.\n2. Đối với khoản đền bù hồ sơ, yêu cầu công ty tổ chức buổi họp làm rõ mức độ thiệt hại thực tế và ký biên bản thỏa thuận lộ trình đền bù (mỗi tháng không khấu trừ quá 30% lương thực nhận).\n3. Gửi khiếu nại tới hòa giải viên lao động nếu công ty cố tình không thực hiện đối thoại."
        },
        {
            id: "case-overtime-refusal",
            title: "Bắt tăng ca cuối tuần không trả lương OT",
            desc: "Quản lý bắt nhân viên tăng ca 2 ngày cuối tuần liên tục nhưng từ chối trả lương làm thêm giờ mà bắt nghỉ bù.",
            category: "Thời giờ làm việc & Nghỉ ngơi",
            article: "Điều 98 & 107 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_98",
            scenario: "Anh H được sếp yêu cầu trực sự kiện B2B và hỗ trợ khách hàng suốt 2 ngày Thứ bảy và Chủ nhật liên tục. Sau sự kiện, anh H đề xuất thanh toán lương làm thêm giờ (OT) nhưng quản lý từ chối và nói rằng 'công ty chỉ duyệt nghỉ bù 2 ngày thường tiếp theo chứ không chi trả bằng tiền mặt'.",
            analysis: "Theo quy định, tiền lương làm thêm giờ vào ngày nghỉ hàng tuần (như Chủ nhật) phải được tính **ít nhất bằng 200%** đơn giá ngày thường. Việc công ty chỉ cho nghỉ bù mà không thanh toán tiền lương OT 200% là vi phạm pháp luật lao động (luật hiện hành không còn quy định nghỉ bù thay thế hoàn toàn cho việc trả tiền lương OT).",
            resolution: "1. Anh H lập văn bản thống kê số giờ làm việc thực tế cuối tuần kèm các bằng chứng xác nhận (email giao việc của sếp, lịch trình sự kiện, chấm công vân tay).\n2. Yêu cầu công ty thanh toán lương làm thêm giờ tối thiểu bằng 200% lương ngày thường cho 2 ngày cuối tuần đó.\n3. Nếu được báo trí nghỉ bù ngày thường, anh H vẫn phải được nhận phần chênh lệch lương OT chưa thanh toán."
        },
        // --- 7 New Real-World Situations (Total 15 Cases) ---
        {
            id: "case-probation-quit-instantly",
            title: "Nghỉ việc trong thử việc không cần báo trước",
            desc: "Công ty đòi phạt tiền người lao động vì xin nghỉ ngay lập tức trong thời gian thử việc.",
            category: "Thử việc",
            article: "Điều 29 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_29",
            scenario: "Bạn làm thử việc BD được 15 ngày, phát hiện sản phẩm công ty không đúng quảng cáo và quản lý làm việc thiếu chuẩn mực. Bạn gửi email thông báo hủy thỏa thuận thử việc và xin nghỉ ngay từ hôm sau. Công ty giữ lương 15 ngày của bạn và đe dọa phạt tiền vì nghỉ không báo trước đủ 3 ngày.",
            analysis: "Căn cứ theo Điều 29 BLLĐ 2019, trong thời gian thử việc, mỗi bên có quyền hủy bỏ thỏa thuận thử việc mà không cần báo trước và không phải bồi thường nếu việc thử việc không đạt yêu cầu hoặc thỏa thuận không phù hợp. Công ty giữ lương và đòi phạt là vi phạm pháp luật.",
            resolution: "1. Trả lời email của phòng Nhân sự, dẫn chứng chính xác Điều 29 Bộ luật Lao động 2019 để bác bỏ yêu cầu bồi thường vô lý của công ty.\n2. Yêu cầu công ty thanh toán đầy đủ tiền lương cho 15 ngày làm việc thực tế trong thời hạn 14 ngày làm việc.\n3. Nếu công ty tiếp tục dây dưa, báo cáo hành vi này lên Thanh tra Sở LĐ-TB&XH."
        },
        {
            id: "case-no-social-insurance",
            title: "Công ty không đóng bảo hiểm bắt buộc",
            desc: "Doanh nghiệp thỏa thuận cộng tiền bảo hiểm vào lương Gross thay vì đóng trực tiếp lên BHXH nhà nước.",
            category: "Bảo hiểm xã hội",
            article: "Điều 21 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_21",
            scenario: "Công ty thỏa thuận miệng với anh K (vị trí Senior Sales) rằng công ty sẽ không đóng BHXH, BHYT, BHTN mà cộng gộp tiền bảo hiểm 10.5% vào lương Gross để anh tự lo liệu. Sau 1 năm, anh K bị ốm đau nặng và thất nghiệp nhưng không được hưởng bất kỳ chế độ bảo hiểm hay trợ cấp thất nghiệp nào.",
            analysis: "Đóng BHXH bắt buộc là nghĩa vụ pháp lý tối thượng của doanh nghiệp cho hợp đồng từ đủ 1 tháng trở lên (Điều 21 BLLĐ và Luật BHXH). Mọi thỏa thuận bằng lời nói hoặc văn bản nhằm trốn đóng bảo hiểm đều bị tuyên vô hiệu. Công ty bắt buộc phải đóng thay và sẽ bị phạt hành chính.",
            resolution: "1. Yêu cầu công ty đối thoại và làm thủ tục truy đóng đầy đủ sổ BHXH cho 1 năm làm việc vừa qua.\n2. Tính toán các khoản thiệt hại về ốm đau hoặc thai sản do công ty chậm đóng để yêu cầu bồi thường trực tiếp.\n3. Nếu công ty từ chối, gửi đơn tố cáo trốn đóng BHXH đến Bảo hiểm xã hội quận/huyện sở tại để thanh tra vào cuộc xử lý."
        },
        {
            id: "case-ot-online-holiday",
            title: "Làm việc ngày lễ online không tính lương OT 300%",
            desc: "Công ty chỉ trả lương ngày thường cho nhân viên trực fanpage và chăm sóc đối tác B2B trong dịp Tết Nguyên Đán với lý do làm việc online tại nhà.",
            category: "Thời giờ làm việc & Nghỉ ngơi",
            article: "Điều 98 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_98",
            scenario: "Trong 3 ngày Tết Nguyên Đán, sếp yêu cầu bạn trực kênh phân phối B2B online để chăm sóc đối tác nước ngoài. Cuối tháng, công ty từ chối thanh toán lương OT ngày lễ với mức 300% mà chỉ trả lương 100% bình thường vì cho rằng bạn chỉ 'làm việc online tại nhà, không lên công ty'.",
            analysis: "Dù làm việc trực tiếp tại văn phòng hay làm từ xa (online tại nhà), nếu thời giờ làm việc rơi đúng vào các ngày Lễ, Tết theo quy định, người lao động vẫn hoàn toàn được hưởng mức lương làm thêm giờ ít nhất bằng 300% theo quy định tại Điều 98 BLLĐ.",
            resolution: "1. Thu thập toàn bộ log chat, email chỉ đạo trực tiếp của sếp và lịch sử phân công trực ca Tết online làm bằng chứng.\n2. Gửi email yêu cầu bộ phận kế toán tính toán lại tiền lương làm thêm giờ ngày lễ (300% đơn giá lương ngày thường).\n3. Dẫn chứng Điều 98 BLLĐ 2019 để khẳng định quyền lợi làm việc từ xa vẫn được bảo hộ bình đẳng."
        },
        {
            id: "case-unpaid-salary-quit",
            title: "Nghỉ việc ngay lập tức do bị nợ lương",
            desc: "Nhân viên đơn phương xin nghỉ việc và nghỉ ngay do bị nợ lương 2 tháng liên tục, bị công ty dọa phạt vì nghỉ sai quy trình báo trước.",
            category: "Nghỉ việc & Báo trước",
            article: "Điều 35 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_35",
            scenario: "Công ty Y gặp khó khăn và nợ lương chị M liên tiếp 2 tháng. Chị M nộp đơn xin nghỉ ngay lập tức vào ngày hôm sau. Công ty lập tức từ chối chốt sổ bảo hiểm xã hội, giữ lại lương cũ và đòi phạt chị 30 ngày lương vì nghỉ việc đột ngột trái quy trình báo trước.",
            analysis: "Theo Điểm b Khoản 2 Điều 35 BLLĐ 2019, người lao động có quyền đơn phương chấm dứt hợp đồng lao động mà **không cần báo trước** nếu không được trả đủ lương hoặc trả lương không đúng thời hạn. Chị M nghỉ việc ngay lập tức là hoàn toàn đúng luật.",
            resolution: "1. Gửi văn bản chính thức yêu cầu công ty tất toán toàn bộ tiền lương đang nợ và bàn giao sổ BHXH chốt đúng hạn trong vòng 14 ngày làm việc.\n2. Viện dẫn rõ Điểm b Khoản 2 Điều 35 BLLĐ 2019 về quyền đơn phương chấm dứt hợp đồng lập tức khi bị nợ lương.\n3. Nếu công ty cản trở, làm đơn khiếu nại khẩn cấp gửi Thanh tra Sở LĐ-TB&XH."
        },
        {
            id: "case-pregnancy-termination",
            title: "Sa thải nhân viên BD nữ mang thai",
            desc: "Công ty tìm lý do chấm dứt hợp đồng lao động ngay khi nhân viên nữ thông báo mang thai tháng thứ 3 vì lo ngại không đi thị trường được.",
            category: "Nghỉ việc & Báo trước",
            article: "Điều 137 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_137",
            scenario: "Chị N làm BD đi thị trường rất tốt. Khi chị thông báo có thai tháng thứ 3, Quản lý lo ngại chị không đáp ứng được tần suất di chuyển gặp đối tác nên đã đề xuất Ban giám đốc ra quyết định chấm dứt hợp đồng lao động với lý do 'tái cấu trúc mảng kinh doanh'.",
            analysis: "Hành vi sa thải hoặc đơn phương chấm dứt hợp đồng với lao động nữ vì lý do mang thai là bị nghiêm cấm tuyệt đối (Điều 137 BLLĐ 2019). Đây là hành vi sa thải trái luật nghiêm trọng, doanh nghiệp có thể bị xử lý hình sự.",
            resolution: "1. Chị N cần từ chối ký vào bất kỳ thỏa thuận chấm dứt hợp đồng tự nguyện nào từ phía công ty.\n2. Gửi văn bản phản hồi kèm giấy khám thai chính thức, yêu cầu công ty rút lại quyết định chấm dứt hợp đồng trái luật.\n3. Yêu cầu công ty bố trí công việc văn phòng nhẹ nhàng hơn (nếu sức khỏe yếu) và bồi thường thiệt hại đầy đủ nếu cố tình ép thôi việc."
        },
        {
            id: "case-original-document-withholding",
            title: "Công ty tạm giữ bằng đại học gốc",
            desc: "Doanh nghiệp yêu cầu nộp bằng tốt nghiệp đại học gốc và căn cước công dân gốc để 'tạm giữ' đề phòng nhân viên nghỉ ngang cướp khách hàng.",
            category: "Thử việc",
            article: "Điều 20 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_20",
            scenario: "Khi trúng tuyển vị trí BD Executive, HR yêu cầu anh P phải nộp Bằng Đại học gốc và bản gốc Căn cước công dân để công ty 'lưu giữ bảo quản' trong suốt thời gian thực hiện hợp đồng lao động nhằm 'đảm bảo tính cam kết bảo mật tệp khách hàng'.",
            analysis: "Điều 20 BLLĐ 2019 nghiêm cấm người sử dụng lao động giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ của người lao động. Hành vi tạm giữ bằng gốc này sẽ bị xử phạt vi phạm hành chính từ 20 triệu đến 25 triệu đồng.",
            resolution: "1. Anh P có quyền từ chối nộp giấy tờ bản gốc và đề xuất cung cấp bản sao y công chứng để thay thế.\n2. Dẫn chứng Điều 20 BLLĐ 2019 cho bộ phận tuyển dụng để giải thích rõ quy định pháp luật cấm giữ hồ sơ gốc.\n3. Nếu công ty ép buộc và đe dọa không nhận việc, anh P có thể cân nhắc khiếu nại lên Phòng LĐ-TB&XH hoặc từ bỏ môi trường làm việc vi phạm luật ngay từ đầu."
        },
        {
            id: "case-commission-cut",
            title: "Tự ý giảm cơ chế tính hoa hồng doanh số B2B",
            desc: "Công ty đơn phương giảm tỷ lệ hoa hồng doanh số từ 5% xuống 2% mà không bàn bạc hay ký phụ lục hợp đồng lao động.",
            category: "Bảo hiểm xã hội",
            article: "Điều 33 Bộ luật Lao động 2019",
            citationUrl: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-luat-lao-dong-2019-426863.aspx#dieu_33",
            scenario: "Chị Q ký hợp đồng có điều khoản hưởng lương cứng kèm 5% hoa hồng doanh thu mang lại từ đối tác B2B. Nhận thấy tháng này chị mang về hợp đồng lớn trị giá 1 tỷ, công ty tự ý đổi cơ chế tính hoa hồng xuống còn 2% để giảm quỹ lương thưởng mà không ký phụ lục hợp đồng.",
            analysis: "Cơ chế hoa hồng/doanh số là một phần của thỏa thuận tiền lương trong HĐLĐ. Mọi thay đổi về nội dung tiền lương, phụ cấp, tiền thưởng bắt buộc phải thông qua thỏa thuận đối thoại và được ký kết bằng Phụ lục hợp đồng lao động (Điều 33 BLLĐ). Đơn phương cắt giảm là vi phạm thỏa thuận cam kết.",
            resolution: "1. Gửi thư kiến nghị chính thức lên Ban Giám Đốc và Công đoàn yêu cầu thanh toán đúng 5% hoa hồng như hợp đồng gốc đã ký kết.\n2. Yêu cầu công ty tổ chức cuộc họp đối thoại chính thức để thảo luận nếu muốn sửa đổi cơ chế tính thưởng hoa hồng cho các tháng tiếp theo.\n3. Lưu trữ hợp đồng lao động gốc và bảng tính doanh thu thực tế làm cơ sở pháp lý đối chiếu."
        }
    ];

    // --- DOM Elements ---
    const rulesContainer = document.getElementById('rules-container');
    const casesContainer = document.getElementById('cases-container');
    const searchInput = document.getElementById('labor-search');
    const filtersContainer = document.getElementById('labor-filters');

    // Modal Elements
    const caseModal = document.getElementById('case-modal');
    const caseCloseBtn = document.getElementById('case-close-btn');
    const btnCaseClose = document.getElementById('btn-case-close');
    const modalCaseTitle = document.getElementById('case-title');
    const modalCaseCategory = document.getElementById('case-category');
    const modalCaseArticle = document.getElementById('case-article');
    const modalCaseCitationLink = document.getElementById('case-citation-link');
    const modalCaseScenario = document.getElementById('case-scenario');
    const modalCaseAnalysis = document.getElementById('case-analysis');
    const modalCaseResolution = document.getElementById('case-resolution');

    // State
    let activeCategory = 'All';
    let searchQuery = '';

    // Render Legal Rules
    function renderRules() {
        rulesContainer.innerHTML = '';
        
        const filtered = legalRules.filter(r => {
            const matchesCategory = activeCategory === 'All' || activeCategory === 'Case Study' || r.category === activeCategory;
            const matchesSearch = r.title.toLowerCase().includes(searchQuery) || 
                                  r.article.toLowerCase().includes(searchQuery) ||
                                  r.content.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            rulesContainer.innerHTML = `<div class="glass-panel text-center" style="color: var(--text-muted);">Không tìm thấy quy định pháp lý nào.</div>`;
            return;
        }

        filtered.forEach(rule => {
            const card = document.createElement('div');
            card.className = 'glass-panel law-card';
            card.innerHTML = `
                <div class="law-header">
                    <div class="law-title-box">
                        <h3>${rule.title}</h3>
                        <span class="law-article-code">${rule.article}</span>
                    </div>
                    <span class="status-badge scraped" style="font-size: 0.7rem;">${rule.category}</span>
                </div>
                <div class="law-body">
                    <p>${rule.content}</p>
                </div>
            `;
            rulesContainer.appendChild(card);
        });
    }

    // Open Case Study Modal
    function openCaseModal(caseStudy) {
        modalCaseTitle.textContent = caseStudy.title;
        modalCaseCategory.textContent = caseStudy.category;
        modalCaseArticle.textContent = caseStudy.article || "Bộ luật Lao động 2019";
        
        if (caseStudy.citationUrl) {
            modalCaseCitationLink.href = caseStudy.citationUrl;
            modalCaseCitationLink.style.display = 'inline-flex';
        } else {
            modalCaseCitationLink.style.display = 'none';
        }

        modalCaseScenario.innerHTML = caseStudy.scenario.replace(/\n/g, '<br>');
        modalCaseAnalysis.innerHTML = caseStudy.analysis.replace(/\n/g, '<br>');
        modalCaseResolution.innerHTML = caseStudy.resolution.replace(/\n/g, '<br>');
        caseModal.classList.remove('hidden');

        // Trigger action-based streak increase
        if (window.registerUserAction) {
            window.registerUserAction();
        }
    }

    function closeCaseModal() {
        caseModal.classList.add('hidden');
    }

    // Render Case Studies
    function renderCases() {
        casesContainer.innerHTML = '';
        
        const filtered = caseStudies.filter(c => {
            const matchesCategory = activeCategory === 'All' || activeCategory === 'Case Study' || c.category === activeCategory;
            const matchesSearch = c.title.toLowerCase().includes(searchQuery) || 
                                  c.desc.toLowerCase().includes(searchQuery) || 
                                  c.scenario.toLowerCase().includes(searchQuery);
            return matchesCategory && matchesSearch;
        });

        if (filtered.length === 0) {
            casesContainer.innerHTML = `<div class="glass-panel text-center" style="color: var(--text-muted);">Không có tình huống thực tế nào phù hợp.</div>`;
            return;
        }

        filtered.forEach(cs => {
            const card = document.createElement('div');
            card.className = 'glass-panel case-card';
            card.innerHTML = `
                <div class="case-header">
                    <h3>${cs.title}</h3>
                    <span class="status-badge guessed" style="font-size: 0.7rem;">${cs.category}</span>
                </div>
                <p class="case-card-desc">${cs.desc}</p>
                <div class="case-card-footer">
                    <span class="resolve-badge">💡 Xem hướng dẫn giải quyết &rarr;</span>
                </div>
            `;
            card.addEventListener('click', () => openCaseModal(cs));
            casesContainer.appendChild(card);
        });
    }

    // Update both sections
    function renderDashboard() {
        renderRules();
        renderCases();
    }

    // --- Event Listeners ---

    // Filter pills click
    filtersContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-pill');
        if (!btn) return;

        filtersContainer.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');

        activeCategory = btn.getAttribute('data-category');
        renderDashboard();
    });

    // Search bar input
    searchInput.addEventListener('input', () => {
        searchQuery = searchInput.value.toLowerCase().trim();
        renderDashboard();
    });

    // Modal close events
    caseCloseBtn.addEventListener('click', closeCaseModal);
    btnCaseClose.addEventListener('click', closeCaseModal);
    caseModal.addEventListener('click', (e) => {
        if (e.target === caseModal) closeCaseModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !caseModal.classList.contains('hidden')) {
            closeCaseModal();
        }
    });

    // Initialize Dashboard
    renderDashboard();
});
