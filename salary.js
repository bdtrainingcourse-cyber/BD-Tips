document.addEventListener('DOMContentLoaded', () => {
    // --- Constant Configurations ---
    const STATUTORY_BASIC_SALARY = 2340000; // Mức lương cơ sở: 2.340.000đ (từ 01/07/2024 đến nay)
    const INS_CAP_MULTIPLIER = 20;
    const BHXH_CAP = STATUTORY_BASIC_SALARY * INS_CAP_MULTIPLIER; // 46.800.000đ
    const BHYT_CAP = STATUTORY_BASIC_SALARY * INS_CAP_MULTIPLIER; // 46.800.000đ

    // Lương tối thiểu vùng năm 2026
    const REGIONAL_MINIMUMS = {
        1: 4960000,
        2: 4410000,
        3: 3860000,
        4: 3450000
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

    // Giảm trừ gia cảnh
    const DEDUCT_SELF = 11000000;
    const DEDUCT_DEPENDENT = 4400000;

    // Biểu thuế lũy tiến từng phần năm 2026
    const PIT_BRACKETS = [
        { limit: 5000000, rate: 0.05, subtract: 0 },
        { limit: 10000000, rate: 0.10, subtract: 250000 },
        { limit: 18000000, rate: 0.15, subtract: 750000 },
        { limit: 32000000, rate: 0.20, subtract: 1650000 },
        { limit: 52000000, rate: 0.25, subtract: 3250000 },
        { limit: 80000000, rate: 0.30, subtract: 5850000 },
        { limit: Infinity, rate: 0.35, subtract: 9850000 }
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

    // Calculates PIT details
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
        document.getElementById('nl-deduct-dep-detail').textContent = `4.400.000đ \u00D7 ${parseInt(dependentsInput.value)} người`;
        document.getElementById('nl-tntt-tax').textContent = formatNumber(res.taxableIncome);
        document.getElementById('nl-pit').textContent = formatNumber(res.pit);
        document.getElementById('nl-net').textContent = formatNumber(res.net);

        // Update NSDLĐ Tab
        document.getElementById('nsd-gross').textContent = formatNumber(res.gross);
        document.getElementById('nsd-bhxh').textContent = formatNumber(res.insuranceEmployer.bhxh);
        document.getElementById('nsd-bhyt').textContent = formatNumber(res.insuranceEmployer.bhyt);
        document.getElementById('nsd-bhtn').textContent = formatNumber(res.insuranceEmployer.bhtn);
        document.getElementById('nsd-total-cost').textContent = formatNumber(res.employerCost);

        // Render PIT brackets details
        renderPITBracketsUI(res.pitBrackets);

        // Render Chart
        renderDonutChart(res);
    }

    function renderPITBracketsUI(brackets) {
        const container = document.getElementById('pit-brackets-list');
        container.innerHTML = '';

        const labelMap = [
            'Bậc 1: Đến 5 triệuđ (5%)',
            'Bậc 2: Trên 5 đến 10 triệuđ (10%)',
            'Bậc 3: Trên 10 đến 18 triệuđ (15%)',
            'Bậc 4: Trên 18 đến 32 triệuđ (20%)',
            'Bậc 5: Trên 32 đến 52 triệuđ (25%)',
            'Bậc 6: Trên 52 đến 80 triệuđ (30%)',
            'Bậc 7: Trên 80 triệuđ (35%)'
        ];

        brackets.forEach((b, idx) => {
            const div = document.createElement('div');
            div.className = 'bracket-item';
            if (b.amountInBracket > 0) {
                div.className += ' active-bracket';
            }

            div.innerHTML = `
                <span class="bracket-label">${labelMap[idx]}</span>
                <div style="text-align: right;">
                    <div class="bracket-val">${formatNumber(b.taxInBracket)}đ</div>
                    ${b.amountInBracket > 0 ? `<small style="font-size:0.75rem; color:var(--text-muted);">Thu nhập tính thuế: ${formatNumber(b.amountInBracket)}đ</small>` : ''}
                </div>
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
        // Total circumference is 100.
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

        const direction = document.querySelector('input[name="calc-direction"]:checked').value;
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
    });
});
