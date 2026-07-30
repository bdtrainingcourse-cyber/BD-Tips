document.addEventListener('DOMContentLoaded', () => {
    // --- Constant Configurations (Updated for 2026 Regulations) ---
    const STATUTORY_BASIC_SALARY = 2530000; // Mức lương cơ sở mới nhất có hiệu lực từ ngày 01/07/2026
    const INS_CAP_MULTIPLIER = 20;
    const BHXH_CAP = STATUTORY_BASIC_SALARY * INS_CAP_MULTIPLIER; // 50.600.000đ
    const BHYT_CAP = STATUTORY_BASIC_SALARY * INS_CAP_MULTIPLIER; // 50.600.000đ

    // Lương tối thiểu vùng mới nhất từ 01/01/2026 (Nghị định 293/2025/NĐ-CP)
    const REGIONAL_MINIMUMS = {
        1: 5310000,
        2: 4730000,
        3: 4140000,
        4: 3700000
    };

    // Tỷ lệ đóng bảo hiểm (Người lao động)
    const RATES_EMPLOYEE = {
        BHXH: 0.08,
        BHYT: 0.015,
        BHTN: 0.01
    };

    // Tỷ lệ đóng bảo hiểm (Người sử dụng lao động)
    const RATES_EMPLOYER = {
        BHXH: 0.175,
        BHYT: 0.03,
        BHTN: 0.01
    };

    // Giảm trừ gia cảnh mới nhất từ năm 2026 (Nghị quyết 110/2025/UBTVQH15)
    const DEDUCT_SELF = 15500000; // 15.5 triệu đồng/tháng
    const DEDUCT_DEPENDENT = 6200000; // 6.2 triệu đồng/tháng

    // Biểu thuế lũy tiến từng phần mới gồm 5 bậc (Luật Thuế TNCN số 109/2025/QH15 áp dụng từ kỳ tính thuế 2026)
    const PIT_BRACKETS = [
        { limit: 10000000, rate: 0.05, subtract: 0 },
        { limit: 30000000, rate: 0.10, subtract: 500000 },
        { limit: 60000000, rate: 0.20, subtract: 3500000 },
        { limit: 100000000, rate: 0.30, subtract: 9500000 },
        { limit: Infinity, rate: 0.35, subtract: 14500000 }
    ];

    // --- DOM Elements ---
    const salaryForm = document.getElementById('salary-form');
    const salaryAmountInput = document.getElementById('salary-amount');
    const salaryTextHelper = document.getElementById('salary-text-helper');
    const insTypeRadios = document.getElementsByName('ins-type');
    const customInsGroup = document.getElementById('custom-ins-group');
    const insSalaryAmountInput = document.getElementById('ins-salary-amount');
    const insTextHelper = document.getElementById('ins-text-helper');
    const dependentsInput = document.getElementById('dependents');
    const depDecBtn = document.getElementById('dep-dec');
    const depIncBtn = document.getElementById('dep-inc');
    const regionSelect = document.getElementById('region');
    const resultsPanel = document.getElementById('results-panel');
    const resultTabs = document.querySelectorAll('.result-tab');
    const breakdownContents = document.querySelectorAll('.breakdown-content');

    // Tab pills
    const directionPills = document.querySelectorAll('#direction-tabs .tab-pill');
    const calcDirectionInput = document.getElementById('calc-direction');

    // Main view tabs
    const viewTabs = document.querySelectorAll('.view-tab');
    const viewContainers = document.querySelectorAll('.view-container');

    // Accordion elements
    const explanationToggle = document.getElementById('explanation-toggle');
    const explanationContainer = document.getElementById('explanation-container');
    const explanationBody = document.getElementById('explanation-body');
    const copyExplanationBtn = document.getElementById('copy-explanation-btn');

    // Chart elements
    const chartNet = document.getElementById('chart-net');
    const chartIns = document.getElementById('chart-ins');
    const chartTax = document.getElementById('chart-tax');
    const donutNetPercent = document.getElementById('donut-net-percent');
    const legendNetVal = document.getElementById('legend-net-val');
    const legendInsVal = document.getElementById('legend-ins-val');
    const legendTaxVal = document.getElementById('legend-tax-val');

    // --- Formatting and Helper functions ---
    function parseNumber(str) {
        return parseFloat(str.replace(/,/g, '')) || 0;
    }

    function formatNumber(num) {
        return Math.round(num).toLocaleString('vi-VN');
    }

    function formatNumberInput(input, helperElement) {
        let value = input.value.replace(/\D/g, '');
        if (value) {
            let num = parseFloat(value);
            input.value = num.toLocaleString('vi-VN');
            if (helperElement) {
                helperElement.textContent = spellVietnameseNumber(num) + ' đồng';
            }
        } else {
            input.value = '';
            if (helperElement) {
                helperElement.textContent = '0 đồng';
            }
        }
    }

    // Spells out numbers in Vietnamese (e.g. 15,000,000 -> 15 triệu)
    function spellVietnameseNumber(num) {
        if (num === 0) return 'Không';
        if (num >= 1000000000) {
            const bill = Math.floor(num / 1000000000);
            const remain = num % 1000000000;
            return `${bill} tỷ` + (remain >= 1000000 ? ` ${spellVietnameseNumber(remain)}` : '');
        }
        if (num >= 1000000) {
            const mil = Math.floor(num / 1000000);
            const remain = num % 1000000;
            return `${mil} triệu` + (remain >= 1000 ? ` ${spellVietnameseNumber(remain)}` : '');
        }
        if (num >= 1000) {
            const thou = Math.floor(num / 1000);
            const remain = num % 1000;
            return `${thou} nghìn` + (remain > 0 ? ` ${remain}` : '');
        }
        return num.toString();
    }

    // --- Input Event Listeners ---
    salaryAmountInput.addEventListener('input', () => {
        formatNumberInput(salaryAmountInput, salaryTextHelper);
    });

    insSalaryAmountInput.addEventListener('input', () => {
        formatNumberInput(insSalaryAmountInput, insTextHelper);
    });

    // Direction Tab Toggle
    directionPills.forEach(pill => {
        pill.addEventListener('click', () => {
            directionPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            calcDirectionInput.value = pill.dataset.value;
        });
    });

    // Insurance type toggle
    insTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customInsGroup.classList.remove('hidden');
                insSalaryAmountInput.setAttribute('required', 'true');
            } else {
                customInsGroup.classList.add('hidden');
                insSalaryAmountInput.removeAttribute('required');
                insSalaryAmountInput.value = '';
                insTextHelper.textContent = '0 đồng';
            }
        });
    });

    // Dependents counter
    depDecBtn.addEventListener('click', () => {
        let val = parseInt(dependentsInput.value) || 0;
        if (val > 0) {
            dependentsInput.value = val - 1;
        }
    });

    depIncBtn.addEventListener('click', () => {
        let val = parseInt(dependentsInput.value) || 0;
        if (val < 20) {
            dependentsInput.value = val + 1;
        }
    });

    // --- Tab switcher ---
    resultTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            resultTabs.forEach(t => t.classList.remove('active'));
            breakdownContents.forEach(c => c.classList.remove('active-content'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active-content');
        });
    });

    // Accordion Toggle
    explanationToggle.addEventListener('click', (e) => {
        if (e.target.closest('#copy-explanation-btn')) return;
        explanationContainer.classList.toggle('expanded');
        explanationBody.classList.toggle('hidden');
    });

    // Copy to Clipboard
    copyExplanationBtn.addEventListener('click', () => {
        const textToCopy = explanationBody.innerText || explanationBody.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = copyExplanationBtn.textContent;
            copyExplanationBtn.textContent = '✅ Đã sao chép!';
            copyExplanationBtn.style.background = 'var(--primary-glow)';
            copyExplanationBtn.style.color = '#ffffff';
            setTimeout(() => {
                copyExplanationBtn.textContent = originalText;
                copyExplanationBtn.style.background = '';
                copyExplanationBtn.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });

    // FAQ Toggle Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const icon = item.querySelector('.faq-icon');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq-icon').textContent = '+';
            });
            
            if (!isActive) {
                item.classList.add('active');
                icon.textContent = '−';
            }
        });
    });

    // Main View Tab Switcher
    viewTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            viewTabs.forEach(t => t.classList.remove('active'));
            viewContainers.forEach(c => c.classList.add('hidden'));
            
            tab.classList.add('active');
            const target = document.getElementById(tab.dataset.tab);
            target.classList.remove('hidden');
        });
    });

    // --- Core Salary Calculation Functions ---

    // Social, Health, and Unemployment insurances for Employee
    function calculateInsurancesEmployee(grossSalary, insSalaryInput, region) {
        const insSalary = insSalaryInput > 0 ? insSalaryInput : grossSalary;
        
        // Capped insurance bases
        const bhxhBase = Math.min(insSalary, BHXH_CAP);
        const bhytBase = Math.min(insSalary, BHYT_CAP);
        
        const regionalMin = REGIONAL_MINIMUMS[region];
        const bhtnBase = Math.min(insSalary, regionalMin * 20); // Trần BHTN = 20 lần lương tối thiểu vùng

        const bhxh = bhxhBase * RATES_EMPLOYEE.BHXH;
        const bhyt = bhytBase * RATES_EMPLOYEE.BHYT;
        const bhtn = bhtnBase * RATES_EMPLOYEE.BHTN;
        const total = bhxh + bhyt + bhtn;

        return { bhxh, bhyt, bhtn, total };
    }

    // Social, Health, and Unemployment insurances for Employer
    function calculateInsurancesEmployer(grossSalary, insSalaryInput, region) {
        const insSalary = insSalaryInput > 0 ? insSalaryInput : grossSalary;
        
        const bhxhBase = Math.min(insSalary, BHXH_CAP);
        const bhytBase = Math.min(insSalary, BHYT_CAP);
        
        const regionalMin = REGIONAL_MINIMUMS[region];
        const bhtnBase = Math.min(insSalary, regionalMin * 20);

        const bhxh = bhxhBase * RATES_EMPLOYER.BHXH;
        const bhyt = bhytBase * RATES_EMPLOYER.BHYT;
        const bhtn = bhtnBase * RATES_EMPLOYER.BHTN;
        const total = bhxh + bhyt + bhtn;

        return { bhxh, bhyt, bhtn, total };
    }

    // Calculates PIT details (Updated for new 5-bracket structure)
    function calculatePIT(taxableIncome) {
        if (taxableIncome <= 0) {
            return { totalTax: 0, bracketBreakdown: PIT_BRACKETS.map(b => ({ ...b, amountInBracket: 0, taxInBracket: 0 })) };
        }

        let remaining = taxableIncome;
        let totalTax = 0;
        const bracketBreakdown = [];
        let previousLimit = 0;

        for (let i = 0; i < PIT_BRACKETS.length; i++) {
            const b = PIT_BRACKETS[i];
            const currentLimit = b.limit;
            const range = currentLimit - previousLimit;

            let amountInBracket = 0;
            if (remaining > 0) {
                if (remaining > range) {
                    amountInBracket = range;
                    remaining -= range;
                } else {
                    amountInBracket = remaining;
                    remaining = 0;
                }
            }

            const taxInBracket = amountInBracket * b.rate;
            totalTax += taxInBracket;

            bracketBreakdown.push({
                rate: b.rate,
                limit: b.limit,
                range: range,
                amountInBracket,
                taxInBracket
            });

            previousLimit = currentLimit;
        }

        return { totalTax, bracketBreakdown };
    }

    // Forward calculation: Gross to Net
    function calculateGrossToNet(grossSalary, insSalaryInput, dependentsCount, region) {
        const insurance = calculateInsurancesEmployee(grossSalary, insSalaryInput, region);
        const incomeBeforeTax = grossSalary - insurance.total;
        
        const dependentsDeduction = dependentsCount * DEDUCT_DEPENDENT;
        const totalDeductions = DEDUCT_SELF + dependentsDeduction;
        
        const taxableIncome = Math.max(0, incomeBeforeTax - totalDeductions);
        const pitResult = calculatePIT(taxableIncome);
        const netSalary = incomeBeforeTax - pitResult.totalTax;

        // Employer side
        const employerInsurance = calculateInsurancesEmployer(grossSalary, insSalaryInput, region);
        const totalEmployerCost = grossSalary + employerInsurance.total;

        return {
            gross: grossSalary,
            insuranceEmployee: insurance,
            incomeBeforeTax,
            deductSelf: DEDUCT_SELF,
            deductDependents: dependentsDeduction,
            taxableIncome,
            pit: pitResult.totalTax,
            pitBrackets: pitResult.bracketBreakdown,
            net: netSalary,
            insuranceEmployer: employerInsurance,
            employerCost: totalEmployerCost
        };
    }

    // Reverse calculation: Net to Gross using Binary Search
    function calculateNetToGross(targetNet, insSalaryInput, dependentsCount, region) {
        // Binary search to find the matching Gross salary
        let low = targetNet;
        let high = targetNet * 3; // Safe upper bound
        if (high < 500000000) high = 500000000; // Ensure high enough cap for tiny Net values
        
        let gross = targetNet;
        let iter = 0;
        const maxIter = 100;
        
        while (low <= high && iter < maxIter) {
            let mid = (low + high) / 2;
            let result = calculateGrossToNet(mid, insSalaryInput, dependentsCount, region);
            
            if (Math.abs(result.net - targetNet) < 0.1) {
                gross = mid;
                break;
            }
            
            if (result.net < targetNet) {
                low = mid;
            } else {
                high = mid;
            }
            iter++;
        }
        
        return calculateGrossToNet(gross, insSalaryInput, dependentsCount, region);
    }

    // Mathematical Explanation Builder (Updated for new 2026 regulations)
    function generateStepByStepExplanation(res, direction) {
        let html = '';
        
        if (direction === 'gross-to-net') {
            // STEP 1: Insurances
            html += `
                <div class="explanation-step">
                    <h4>Bước 1: Tính các khoản bảo hiểm bắt buộc (Người lao động đóng)</h4>
                    <p>Mức lương đóng bảo hiểm cơ sở: <code>${formatNumber(res.gross)}đ</code></p>
                    <p>Mức trần tính BHXH/BHYT (20 lần lương cơ sở mới 2.53M): <code>${formatNumber(BHXH_CAP)}đ</code>.</p>
                    <ul>
                         <li>Bảo hiểm xã hội (BHXH): <code>${formatNumber(res.insuranceEmployee.bhxh)}đ</code> (8% mức đóng)</li>
                         <li>Bảo hiểm y tế (BHYT): <code>${formatNumber(res.insuranceEmployee.bhyt)}đ</code> (1.5% mức đóng)</li>
                         <li>Bảo hiểm thất nghiệp (BHTN): <code>${formatNumber(res.insuranceEmployee.bhtn)}đ</code> (1% mức đóng, giới hạn trần tối đa theo Vùng)</li>
                    </ul>
                    <p><strong>&rArr; Tổng bảo hiểm đóng: <code>${formatNumber(res.insuranceEmployee.total)}đ</code></strong></p>
                </div>
            `;
            
            // STEP 2: Income before tax
            html += `
                <div class="explanation-step">
                    <h4>Bước 2: Xác định Thu nhập trước thuế</h4>
                    <p>TNTT = Lương Gross &minus; Bảo hiểm đóng</p>
                    <p><code>${formatNumber(res.gross)}đ &minus; ${formatNumber(res.insuranceEmployee.total)}đ = ${formatNumber(res.incomeBeforeTax)}đ</code></p>
                </div>
            `;
            
            // STEP 3: Deductions
            html += `
                <div class="explanation-step">
                    <h4>Bước 3: Xác định Các khoản giảm trừ gia cảnh (Mới 2026)</h4>
                    <ul>
                         <li>Giảm trừ bản thân: <code>${formatNumber(res.deductSelf)}đ</code> (Định mức mới 15.5 triệu đồng)</li>
                         <li>Giảm trừ người phụ thuộc: <code>${formatNumber(res.deductDependents)}đ</code> (${formatNumber(DEDUCT_DEPENDENT)}đ &times; ${parseInt(dependentsInput.value)} người)</li>
                    </ul>
                    <p><strong>&rArr; Tổng giảm trừ gia cảnh: <code>${formatNumber(res.deductSelf + res.deductDependents)}đ</code></strong></p>
                </div>
            `;
            
            // STEP 4: Taxable Income
            html += `
                <div class="explanation-step">
                    <h4>Bước 4: Tính Thu nhập tính thuế (TNTT)</h4>
                    <p>Thu nhập tính thuế = Thu nhập trước thuế &minus; Tổng giảm trừ gia cảnh (nếu âm mặc định = 0)</p>
                    <p><code>${formatNumber(res.incomeBeforeTax)}đ &minus; ${formatNumber(res.deductSelf + res.deductDependents)}đ = ${formatNumber(res.taxableIncome)}đ</code></p>
                </div>
            `;
            
            // STEP 5: PIT Brackets
            html += `
                <div class="explanation-step">
                    <h4>Bước 5: Tính Thuế thu nhập cá nhân (TNCN) (Mới 5 bậc)</h4>
            `;
            if (res.pit === 0) {
                html += `<p>Thu nhập tính thuế bằng 0đ, do đó <strong>Thuế TNCN phải nộp là: <code>0đ</code></strong></p>`;
            } else {
                html += `<p>Áp dụng biểu thuế lũy tiến từng phần 5 bậc mới trên mức thu nhập tính thuế <code>${formatNumber(res.taxableIncome)}đ</code>:</p><ul>`;
                res.pitBrackets.forEach((b, idx) => {
                    if (b.amountInBracket > 0) {
                        html += `<li>Bậc ${idx + 1} (${b.rate * 100}%): <code>${formatNumber(b.amountInBracket)}đ &times; ${b.rate * 100}% = ${formatNumber(b.taxInBracket)}đ</code></li>`;
                    }
                });
                html += `</ul>`;
                html += `<p><strong>&rArr; Tổng thuế TNCN phải đóng: <code>${formatNumber(res.pit)}đ</code></strong></p>`;
            }
            html += `</div>`;
            
            // STEP 6: Net salary
            html += `
                <div class="explanation-step">
                    <h4>Bước 6: Xác định lương Net nhận về tài khoản</h4>
                    <p>Lương Net = Thu nhập trước thuế &minus; Thuế TNCN</p>
                    <p><code>${formatNumber(res.incomeBeforeTax)}đ &minus; ${formatNumber(res.pit)}đ = ${formatNumber(res.net)}đ</code></p>
                    <p>Quy đổi thành công: <strong>Thực nhận Net: ${formatNumber(res.net)}đ</strong></p>
                </div>
            `;
        } else {
            html += `
                <div class="explanation-step">
                    <h4>Quy đổi ngược Net &rarr; Gross (Quy định 2026)</h4>
                    <p>Từ mức lương Net mong muốn nhận về: <code>${formatNumber(res.net)}đ</code></p>
                    <p>Hệ thống tự động sử dụng thuật toán tìm kiếm nhị phân tối ưu để quy đổi ra mức Gross trước thuế và bảo hiểm theo luật 2026:</p>
                    <ul>
                         <li>Mức Gross tương ứng: <code>${formatNumber(res.gross)}đ</code></li>
                         <li>Bảo hiểm xã hội (NLĐ đóng 8%): <code>${formatNumber(res.insuranceEmployee.bhxh)}đ</code></li>
                         <li>Bảo hiểm y tế (NLĐ đóng 1.5%): <code>${formatNumber(res.insuranceEmployee.bhyt)}đ</code></li>
                         <li>Bảo hiểm thất nghiệp (NLĐ đóng 1%): <code>${formatNumber(res.insuranceEmployee.bhtn)}đ</code></li>
                         <li>Thuế TNCN lũy tiến phải đóng: <code>${formatNumber(res.pit)}đ</code></li>
                    </ul>
                    <p>Kiểm chứng tính toán xuôi: <code>Gross (${formatNumber(res.gross)}đ) &minus; Bảo hiểm (${formatNumber(res.insuranceEmployee.total)}đ) &minus; Thuế TNCN (${formatNumber(res.pit)}đ) = Net (${formatNumber(res.net)}đ)</code> (Chính xác 100%).</p>
                </div>
            `;
        }
        
        return html;
    }

    // --- UI Update Functions ---
    function updateUI(res) {
        // Unhide the panel
        resultsPanel.classList.remove('hidden');

        // Scroll to results panel smoothly
        resultsPanel.scrollIntoView({ behavior: 'smooth' });

        // Update NLĐ Tab
        document.getElementById('nl-gross').textContent = formatNumber(res.gross);
        document.getElementById('nl-bhxh').textContent = formatNumber(res.insuranceEmployee.bhxh);
        document.getElementById('nl-bhyt').textContent = formatNumber(res.insuranceEmployee.bhyt);
        document.getElementById('nl-bhtn').textContent = formatNumber(res.insuranceEmployee.bhtn);
        
        const regionVal = regionSelect.value;
        const regionalMin = REGIONAL_MINIMUMS[regionVal];
        document.getElementById('nl-bhtn-detail').textContent = `1% (Trần tối đa Vùng ${regionVal}: ${formatNumber(regionalMin * 20)}đ)`;
        
        document.getElementById('nl-tntt').textContent = formatNumber(res.incomeBeforeTax);
        document.getElementById('nl-deduct-self').textContent = formatNumber(res.deductSelf);
        document.getElementById('nl-deduct-dep').textContent = formatNumber(res.deductDependents);
        document.getElementById('nl-deduct-dep-detail').textContent = `6.200.000đ \u00D7 ${parseInt(dependentsInput.value)} người`;
        document.getElementById('nl-tntt-tax').textContent = formatNumber(res.taxableIncome);
        document.getElementById('nl-pit').textContent = formatNumber(res.pit);
        document.getElementById('nl-net').textContent = formatNumber(res.net);

        // Update NSDLĐ Tab
        document.getElementById('nsd-gross').textContent = formatNumber(res.gross);
        document.getElementById('nsd-bhxh').textContent = formatNumber(res.insuranceEmployer.bhxh);
        document.getElementById('nsd-bhyt').textContent = formatNumber(res.insuranceEmployer.bhyt);
        document.getElementById('nsd-bhtn').textContent = formatNumber(res.insuranceEmployer.bhtn);
        document.getElementById('nsd-total-cost').textContent = formatNumber(res.employerCost);

        // Update Step-by-Step Explanation Accordion
        const direction = calcDirectionInput.value;
        explanationBody.innerHTML = generateStepByStepExplanation(res, direction);

        // Render PIT brackets details
        renderPITBracketsUI(res.pitBrackets);

        // Render Chart
        renderDonutChart(res);
    }

    function renderPITBracketsUI(brackets) {
        const container = document.getElementById('pit-brackets-list');
        container.innerHTML = '';

        const labelMap = [
            'Bậc 1: Đến 10 triệuđ (5%)',
            'Bậc 2: Trên 10 đến 30 triệuđ (10%)',
            'Bậc 3: Trên 30 đến 60 triệuđ (20%)',
            'Bậc 4: Trên 60 đến 100 triệuđ (30%)',
            'Bậc 5: Trên 100 triệuđ (35%)'
        ];

        brackets.forEach((b, idx) => {
            const div = document.createElement('div');
            div.className = 'bracket-item';
            
            let progressPercent = 0;
            if (b.amountInBracket > 0) {
                div.className += ' active-bracket';
                progressPercent = (b.amountInBracket / b.range) * 100;
                if (b.limit === Infinity) {
                    progressPercent = 100;
                }
            }

            div.innerHTML = `
                <span class="bracket-label">${labelMap[idx]}</span>
                <div style="text-align: right; z-index: 2; position: relative;">
                    <div class="bracket-val">${formatNumber(b.taxInBracket)}đ</div>
                    ${b.amountInBracket > 0 ? `<small style="font-size:0.75rem; color:var(--text-muted);">Thu nhập tính thuế: ${formatNumber(b.amountInBracket)}đ</small>` : ''}
                </div>
                <div class="bracket-progress-bar" style="width: ${progressPercent.toFixed(1)}%"></div>
            `;
            container.appendChild(div);
        });
    }

    function renderDonutChart(res) {
        const net = res.net;
        const ins = res.insuranceEmployee.total;
        const tax = res.pit;
        const total = res.gross;

        const netPercent = total > 0 ? (net / total) * 100 : 0;
        const insPercent = total > 0 ? (ins / total) * 100 : 0;
        const taxPercent = total > 0 ? (tax / total) * 100 : 0;

        // Circular dash arrays calculation
        chartNet.setAttribute('stroke-dasharray', `${netPercent.toFixed(2)}, 100`);
        
        chartIns.setAttribute('stroke-dasharray', `${insPercent.toFixed(2)}, 100`);
        chartIns.setAttribute('stroke-dashoffset', `-${netPercent.toFixed(2)}`);
        
        chartTax.setAttribute('stroke-dasharray', `${taxPercent.toFixed(2)}, 100`);
        chartTax.setAttribute('stroke-dashoffset', `-${(netPercent + insPercent).toFixed(2)}`);

        // Text display
        donutNetPercent.textContent = `${netPercent.toFixed(1)}%`;
        legendNetVal.textContent = `${formatNumber(net)} VND`;
        legendInsVal.textContent = `${formatNumber(ins)} VND`;
        legendTaxVal.textContent = `${formatNumber(tax)} VND`;
    }

    // --- Form Submit Handler ---
    salaryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const direction = calcDirectionInput.value;
        const amount = parseNumber(salaryAmountInput.value);
        if (amount <= 0) return;

        const insType = document.querySelector('input[name="ins-type"]:checked').value;
        let insSalaryInput = 0;
        if (insType === 'custom') {
            insSalaryInput = parseNumber(insSalaryAmountInput.value);
        }

        const dependentsCount = parseInt(dependentsInput.value) || 0;
        const region = parseInt(regionSelect.value) || 1;

        let result;
        if (direction === 'gross-to-net') {
            result = calculateGrossToNet(amount, insSalaryInput, dependentsCount, region);
        } else {
            result = calculateNetToGross(amount, insSalaryInput, dependentsCount, region);
        }

        updateUI(result);
        if (window.registerUserAction) {
            window.registerUserAction('salary_calc');
        }
    });

    // ==========================================
    // --- B2B Salary Lookup Intelligence Section ---
    // ==========================================

    function querySalaryDatabase(role, exp, sector) {
        const baseRoles = {
            'account-executive': {
                title: 'Account Executive (AE)',
                base_median: 25000000,
                base_min: 18000000,
                base_max: 40000000,
                ratio: '60/40',
                commission: '4-6% giá trị hợp đồng (ACV)',
                quota: '300.000.000đ / tháng'
            },
            'business-development': {
                title: 'Business Development Exec/Manager (BDM)',
                base_median: 28000000,
                base_min: 20000000,
                base_max: 45000000,
                ratio: '60/40',
                commission: '3-5% doanh thu hợp đồng mới',
                quota: '350.000.000đ / tháng'
            },
            'sdr-bdr': {
                title: 'Sales/Business Development Representative (SDR/BDR)',
                base_median: 15000000,
                base_min: 10000000,
                base_max: 22000000,
                ratio: '70/30',
                commission: '200.000đ - 500.000đ / mỗi cuộc hẹn thành công',
                quota: '15 SQLs (Lịch hẹn chất lượng) / tháng'
            },
            'customer-success': {
                title: 'Customer Success Manager (CSM)',
                base_median: 22000000,
                base_min: 16000000,
                base_max: 32000000,
                ratio: '80/20',
                commission: '2-4% giá trị gia hạn hợp đồng (Renewal)',
                quota: '90% tỷ lệ giữ chân khách hàng (Net Retention Rate)'
            },
            'pre-sales': {
                title: 'Pre-sales / Solution Consultant',
                base_median: 30000000,
                base_min: 22000000,
                base_max: 50000000,
                ratio: '80/20',
                commission: '0.5% - 1% giá trị hợp đồng hỗ trợ kỹ thuật',
                quota: 'Hỗ trợ kỹ thuật chốt thắng 5 deals lớn / quý'
            },
            'partnerships': {
                title: 'Strategic Alliance / Partnerships Manager',
                base_median: 32000000,
                base_min: 24000000,
                base_max: 55000000,
                ratio: '70/30',
                commission: '5% - 8% doanh thu từ kênh đối tác liên kết',
                quota: 'Phát triển mới 5 đối tác tích hợp sản phẩm / quý'
            }
        };

        const expMultipliers = {
            'junior': { base: 0.65 },
            'mid': { base: 1.0 },
            'senior': { base: 1.45 },
            'director': { base: 2.1 }
        };

        const sectorMultipliers = {
            'saas-tech': 1.1,
            'logistics': 0.9,
            'agency': 0.85,
            'finance': 1.05,
            'manufacturing': 0.95
        };

        const baseData = baseRoles[role];
        const expMult = expMultipliers[exp];
        const sectorMult = sectorMultipliers[sector];

        const finalBaseMedian = baseData.base_median * expMult.base * sectorMult;
        const finalBaseMin = baseData.base_min * expMult.base * sectorMult;
        const finalBaseMax = baseData.base_max * expMult.base * sectorMult;

        const parts = baseData.ratio.split('/');
        const baseRatio = parseInt(parts[0]) / 100;
        const finalOte = finalBaseMedian / baseRatio;

        return {
            title: baseData.title,
            baseMedian: finalBaseMedian,
            baseMin: finalBaseMin,
            baseMax: finalBaseMax,
            ratio: baseData.ratio,
            commission: baseData.commission,
            quota: exp === 'junior' ? 'Thỏa thuận / Không áp quota cứng' : baseData.quota,
            ote: finalOte
        };
    }

    const lookupForm = document.getElementById('lookup-form');
    const lookupResultsPanel = document.getElementById('lookup-results-panel');
    const btnSyncToCalc = document.getElementById('btn-sync-to-calc');

    let lastSearchedSalary = 0;

    if (lookupForm) {
        lookupForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const role = document.getElementById('lookup-role').value;
            const exp = document.getElementById('lookup-exp').value;
            const sector = document.getElementById('lookup-sector').value;

            const data = querySalaryDatabase(role, exp, sector);
            lastSearchedSalary = data.baseMedian;

            // Unhide details panel
            lookupResultsPanel.classList.remove('hidden');

            // Update UI Elements
            document.getElementById('lookup-median-val').textContent = formatNumber(data.baseMedian) + ' VND';
            document.getElementById('lookup-split-val').textContent = data.ratio + ' (Cố định/Biến động)';

            // Percentiles labels
            document.getElementById('p-min').textContent = spellVietnameseNumber(data.baseMin);
            document.getElementById('p-median').textContent = spellVietnameseNumber(data.baseMedian);
            document.getElementById('p-max').textContent = spellVietnameseNumber(data.baseMax);

            // Adjust percentile progress bar fill width
            const fillElement = document.getElementById('percentile-bar-fill');
            fillElement.style.width = '50%';

            // Quota table
            document.getElementById('det-quota').textContent = data.quota;
            document.getElementById('det-comm-rate').textContent = data.commission;
            document.getElementById('det-ratio').textContent = data.ratio + ' (Cố định/Biến động)';
            document.getElementById('det-ote').textContent = formatNumber(data.ote) + ' VND / tháng';

            // Custom Advice Card based on exp level
            const adviceContainer = document.getElementById('det-advice');
            let adviceHtml = '';
            const expMap = {'junior': 1, 'mid': 3, 'senior': 5, 'director': 6};
            const expVal = expMap[exp] || 0;
            if (expVal <= 2) {
                adviceHtml = `💡 <strong>Khuyến nghị:</strong> Bạn nên tập trung đàm phán cơ hội đào tạo thực chiến và lộ trình thăng tiến rõ ràng. Tham khảo <a href="library.html">Thư viện Ebook & Thuật ngữ BD</a> để rút ngắn 2 năm thử sai, trang bị tư duy đàm phán hợp đồng lớn và bứt phá nhanh lên cấp bậc Mid-level với mức lương nhân đôi.`;
            } else if (expVal <= 4) {
                adviceHtml = `💡 <strong>Khuyến nghị:</strong> Hãy đàm phán nâng tỷ lệ hoa hồng (Commission rate) thay vì chỉ nhìn vào lương cứng cơ bản. Sở hữu kỹ năng phân tích chân dung khách hàng tổ chức và dùng <a href="email-assistant.html">AI Email Assistant</a> để tiếp cận PIC doanh nghiệp hiệu quả.`;
            } else {
                adviceHtml = `💡 <strong>Khuyến nghị:</strong> Đảm bảo cấu trúc gói thù lao có thưởng theo quý/năm và các điều khoản thưởng vượt chỉ tiêu (Accelerators) hấp dẫn. Kết nối trực tiếp với <a href="https://www.linkedin.com/in/vp-tan/" target="_blank">Founder Peter Vo (Zalo: 0931100569)</a> để tư vấn chiến lược B2B BD & Partnership cấp cao.`;
            }
            adviceContainer.innerHTML = adviceHtml;

            // Scroll to results panel smoothly
            lookupResultsPanel.scrollIntoView({ behavior: 'smooth' });

            if (window.registerUserAction) {
                window.registerUserAction('salary_calc');
            }
        });
    }

    if (btnSyncToCalc) {
        btnSyncToCalc.addEventListener('click', () => {
            if (lastSearchedSalary <= 0) return;
            
            // 1. Populate salary input in calculator
            salaryAmountInput.value = lastSearchedSalary.toLocaleString('vi-VN');
            formatNumberInput(salaryAmountInput, salaryTextHelper);

            // 2. Switch Tab to Calculator
            viewTabs.forEach(t => t.classList.remove('active'));
            viewContainers.forEach(c => c.classList.add('hidden'));
            
            document.getElementById('view-tab-calc').classList.add('active');
            document.getElementById('calc-view').classList.remove('hidden');

            // 3. Trigger submit event on calculator form
            salaryForm.dispatchEvent(new Event('submit'));
        });
    }
});
