// KPI Estimation Tool Logic

document.addEventListener('DOMContentLoaded', () => {
    let activeFunnel = 'outbound'; // 'outbound' or 'inbound'

    // DOM Elements
    const tabOutbound = document.getElementById('tab-outbound');
    const tabInbound = document.getElementById('tab-inbound');
    const outboundControls = document.getElementById('outbound-controls');
    const inboundControls = document.getElementById('inbound-controls');
    
    const inputRevenue = document.getElementById('kpi-revenue');
    const inputAverage = document.getElementById('kpi-average');
    const labelOrderCount = document.getElementById('calc-order-count');

    const funnelTrack = document.getElementById('testimonial-slider-track'); // We will use 'funnel-track' in html
    const downloadBtn = document.getElementById('download-template-btn');
    const downloadModal = document.getElementById('download-modal');
    const emailForm = document.getElementById('downloadEmailForm');
    const successModal = document.getElementById('kpiSuccessModal');

    // Funnel Definitions
    const outboundStages = [
        { name: 'LEAD', desc: 'Lead mới chưa tiếp cận', defaultCr: 70, next: 'APPROACHING' },
        { name: 'APPROACHING', desc: 'Đã tiếp cận (Email/Phone)', defaultCr: 30, next: 'QUALIFIED' },
        { name: 'QUALIFIED LEADS', desc: 'Khách hàng quan tâm thực sự', defaultCr: 40, next: 'PROPOSAL' },
        { name: 'PROPOSAL', desc: 'Đã gửi Proposal/Báo giá', defaultCr: 30, next: 'CONVERT' },
        { name: 'CONVERT', desc: 'Đang thương lượng đàm phán', defaultCr: 80, next: 'CLOSE WIN' },
        { name: 'CLOSE WIN', desc: 'Ký kết hợp đồng thành công', defaultCr: 100 }
    ];

    const inboundStages = [
        { name: 'MQL', desc: 'Marketing Qualified Lead', defaultCr: 15, next: 'SAL' },
        { name: 'SAL', desc: 'Sales Accepted Lead', defaultCr: 40, next: 'SQL' },
        { name: 'SQL', desc: 'Sales Qualified Lead', defaultCr: 25, next: 'CLOSE WIN' },
        { name: 'CLOSE WIN', desc: 'Ký kết hợp đồng thành công', defaultCr: 100 }
    ];

    // Outbound Sliders
    const outboundSls = {
        lead_approaching: document.getElementById('sl-lead-approaching'),
        approaching_qualified: document.getElementById('sl-approaching-qualified'),
        qualified_proposal: document.getElementById('sl-qualified-proposal'),
        proposal_convert: document.getElementById('sl-proposal-convert'),
        convert_close: document.getElementById('sl-convert-close')
    };

    // Inbound Sliders
    const inboundSls = {
        mql_sal: document.getElementById('sl-mql-sal'),
        sal_sql: document.getElementById('sl-sal-sql'),
        sql_close: document.getElementById('sl-sql-close')
    };

    // Helper to display slider value changes
    function initSliders() {
        const allSliders = document.querySelectorAll('.slider-input');
        allSliders.forEach(slider => {
            const valLabel = document.getElementById(slider.id + '-val');
            slider.addEventListener('input', () => {
                if (valLabel) valLabel.textContent = slider.value + '%';
                calculateFunnel();
            });
        });
    }

    // Tab Switching
    if (tabOutbound && tabInbound) {
        tabOutbound.addEventListener('click', () => {
            activeFunnel = 'outbound';
            tabOutbound.classList.add('active');
            tabInbound.classList.remove('active');
            outboundControls.classList.remove('hidden');
            inboundControls.classList.add('hidden');
            calculateFunnel();
        });

        tabInbound.addEventListener('click', () => {
            activeFunnel = 'inbound';
            tabInbound.classList.add('active');
            tabOutbound.classList.remove('active');
            inboundControls.classList.remove('hidden');
            outboundControls.classList.add('hidden');
            calculateFunnel();
        });
    }

    // Input Listeners
    [inputRevenue, inputAverage].forEach(input => {
        if (input) {
            input.addEventListener('input', calculateFunnel);
        }
    });

    // Funnel color generator (Crimson to Amber Gold gradient)
    const funnelColors = [
        'linear-gradient(135deg, #a20a0a 0%, #bd1c1c 100%)', // Red
        'linear-gradient(135deg, #b81414 0%, #db3333 100%)', // Light Red
        'linear-gradient(135deg, #cc4911 0%, #ec672c 100%)', // Red-Orange
        'linear-gradient(135deg, #dd7818 0%, #f69433 100%)', // Orange
        'linear-gradient(135deg, #e59a18 0%, #f7b43b 100%)', // Gold
        'linear-gradient(135deg, #f3a83b 0%, #fcd68a 100%)'  // Yellow Gold
    ];

    function calculateFunnel() {
        const revenue = parseFloat(inputRevenue.value) || 0;
        const average = parseFloat(inputAverage.value) || 1;
        const orders = Math.ceil(revenue / average);
        
        if (labelOrderCount) {
            labelOrderCount.textContent = orders.toLocaleString('en-US');
        }

        const trackElement = document.getElementById('funnel-track');
        if (!trackElement) return;
        trackElement.innerHTML = '';

        if (activeFunnel === 'outbound') {
            // Get slider values
            const crConvert = parseFloat(outboundSls.convert_close.value) / 100;
            const crProposal = parseFloat(outboundSls.proposal_convert.value) / 100;
            const crQualified = parseFloat(outboundSls.qualified_proposal.value) / 100;
            const crApproaching = parseFloat(outboundSls.approaching_qualified.value) / 100;
            const crLead = parseFloat(outboundSls.lead_approaching.value) / 100;

            // Back-calculation
            const qtyClose = orders;
            const qtyConvert = Math.ceil(qtyClose / crConvert);
            const qtyProposal = Math.ceil(qtyConvert / crProposal);
            const qtyQualified = Math.ceil(qtyProposal / crQualified);
            const qtyApproaching = Math.ceil(qtyQualified / crApproaching);
            const qtyLead = Math.ceil(qtyApproaching / crLead);

            const qtys = [qtyLead, qtyApproaching, qtyQualified, qtyProposal, qtyConvert, qtyClose];
            const rates = [crLead, crApproaching, crQualified, crProposal, crConvert];

            outboundStages.forEach((stage, idx) => {
                const qty = qtys[idx];
                const cr = rates[idx] ? Math.round(rates[idx] * 100) : null;
                
                // Width scales down but keeps a nice funnel shape (e.g. min 30% to max 100%)
                const percentageWidth = 100 - (idx * 12);
                
                const stageDiv = document.createElement('div');
                stageDiv.className = 'funnel-stage-wrapper';
                
                stageDiv.innerHTML = `
                    <div class="funnel-stage" style="width: ${percentageWidth}%; background: ${funnelColors[idx]};" title="${stage.desc}">
                        <span class="funnel-stage-name">${stage.name}</span>
                        <span class="funnel-stage-qty">${qty.toLocaleString('en-US')}</span>
                    </div>
                `;

                trackElement.appendChild(stageDiv);

                // Add arrow showing transition rate to next stage
                if (idx < outboundStages.length - 1) {
                    const arrowDiv = document.createElement('div');
                    arrowDiv.className = 'funnel-arrow';
                    arrowDiv.innerHTML = `↓ Chuyển đổi: <span>${cr}%</span>`;
                    trackElement.appendChild(arrowDiv);
                }
            });

        } else {
            // Inbound Funnel
            const crSql = parseFloat(inboundSls.sql_close.value) / 100;
            const crSal = parseFloat(inboundSls.sal_sql.value) / 100;
            const crMql = parseFloat(inboundSls.mql_sal.value) / 100;

            const qtyClose = orders;
            const qtySql = Math.ceil(qtyClose / crSql);
            const qtySal = Math.ceil(qtySql / crSal);
            const qtyMql = Math.ceil(qtySal / crMql);

            const qtys = [qtyMql, qtySal, qtySql, qtyClose];
            const rates = [crMql, crSal, crSql];

            inboundStages.forEach((stage, idx) => {
                const qty = qtys[idx];
                const cr = rates[idx] ? Math.round(rates[idx] * 100) : null;
                const percentageWidth = 100 - (idx * 20);

                const stageDiv = document.createElement('div');
                stageDiv.className = 'funnel-stage-wrapper';

                stageDiv.innerHTML = `
                    <div class="funnel-stage" style="width: ${percentageWidth}%; background: ${funnelColors[idx * 1.5]};" title="${stage.desc}">
                        <span class="funnel-stage-name">${stage.name}</span>
                        <span class="funnel-stage-qty">${qty.toLocaleString('en-US')}</span>
                    </div>
                `;

                trackElement.appendChild(stageDiv);

                if (idx < inboundStages.length - 1) {
                    const arrowDiv = document.createElement('div');
                    arrowDiv.className = 'funnel-arrow';
                    arrowDiv.innerHTML = `↓ Chuyển đổi: <span>${cr}%</span>`;
                    trackElement.appendChild(arrowDiv);
                }
            });
        }
    }

    // Modal Handling
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            // Check if already filled
            const savedEmail = localStorage.getItem('kpi_template_email');
            if (savedEmail) {
                // Instantly download
                triggerDownload(savedEmail);
            } else {
                downloadModal.classList.add('active');
            }
        });
    }

    window.closeModal = function() {
        if (downloadModal) downloadModal.classList.remove('active');
        if (successModal) successModal.classList.remove('active');
    };

    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('kpiEmail').value;
            
            // Log lead email to backend
            try {
                await fetch('/api/log-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email, source: 'kpi-estimation-tool' })
                });
            } catch (err) {
                console.error('Failed to log email:', err);
            }

            // Save in localStorage
            localStorage.setItem('kpi_template_email', email);
            closeModal();

            // Trigger success screen
            if (successModal) {
                successModal.classList.add('active');
            }
        });
    }

    window.startDownload = function() {
        closeModal();
        // Simulate template download
        const link = document.createElement('a');
        link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('BD KPI Tracking & Plan Template');
        link.download = 'BD_KPI_Tracking_Template.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    function triggerDownload(email) {
        alert(`Bản mẫu KPI Tracking đang được tải xuống và gửi trực tiếp tới email: ${email}`);
        window.startDownload();
    }

    // Initialize
    initSliders();
    calculateFunnel();
});
