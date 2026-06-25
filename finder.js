document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchForm = document.getElementById('search-form');
    const companyNameInput = document.getElementById('company-name');
    const companyDomainInput = document.getElementById('company-domain');
    const locationInput = document.getElementById('location');
    const searchPagesSelect = document.getElementById('search-pages');
    const apolloApiKeyInput = document.getElementById('apollo-api-key');

    const tagInput = document.getElementById('tag-input');
    const tagsWrapper = document.getElementById('tags-wrapper');
    const searchBtn = document.getElementById('search-btn');
    const btnText = searchBtn.querySelector('.btn-text');
    const btnLoader = searchBtn.querySelector('.btn-loader');
    
    const consoleLogs = document.getElementById('console-logs');
    const terminalStatus = document.getElementById('terminal-status');
    const progressContainer = document.getElementById('progress-container');
    const progressStepName = document.getElementById('progress-step-name');
    const progressPercent = document.getElementById('progress-percent');
    const progressFill = document.getElementById('progress-fill');
    
    const resultsPanel = document.getElementById('results-panel');
    const resultsCount = document.getElementById('results-count');
    const tableSearch = document.getElementById('table-search');
    const resultsTbody = document.getElementById('results-tbody');
    
    const btnCopyEmails = document.getElementById('btn-copy-emails');
    const btnExportCsv = document.getElementById('btn-export-csv');
    const btnExportJson = document.getElementById('btn-export-json');
    
    // Modal Elements
    const detailModal = document.getElementById('detail-modal');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalPersonName = document.getElementById('modal-person-name');
    const modalPersonTitle = document.getElementById('modal-person-title');
    const modalPersonCompany = document.getElementById('modal-person-company');
    const modalPersonLinkedin = document.getElementById('modal-person-linkedin');
    const modalEmailList = document.getElementById('modal-email-list');
    const modalPhoneList = document.getElementById('modal-phone-list');
    const modalEnrichNotes = document.getElementById('modal-enrich-notes');
    const btnModalCopyAll = document.getElementById('btn-modal-copy-all');

    // State
    let manualTags = ['Business Development', 'B2B', 'Sales', 'Partnerships'];
    let generatedTags = [];
    let excludedGeneratedTags = [];
    let activeTags = [...manualTags];
    let searchResults = [];

    if (localStorage.getItem('apollo_api_key')) apolloApiKeyInput.value = localStorage.getItem('apollo_api_key');

    // --- Search Provider Selection Handling ---
    const searchMethodSelect = document.getElementById('search-method');
    const apolloKeyGroup = document.getElementById('apollo-key-group');

    searchMethodSelect.addEventListener('change', () => {
        if (searchMethodSelect.value === 'scraper') {
            apolloKeyGroup.style.display = 'none';
        } else {
            apolloKeyGroup.style.display = 'flex';
        }
    });

    // --- Tag Input System ---
    function renderTags() {
        tagsWrapper.innerHTML = '';
        activeTags.forEach(tag => {
            const span = document.createElement('span');
            const isGenerated = generatedTags.includes(tag);
            span.className = isGenerated ? 'tag generated-tag' : 'tag';
            span.setAttribute('data-val', tag);
            
            // Safe text content (no innerHTML)
            const textNode = document.createTextNode(tag + ' ');
            span.appendChild(textNode);
            
            // Dynamic close element
            const closeSpan = document.createElement('span');
            closeSpan.className = 'tag-close';
            closeSpan.textContent = '×';
            closeSpan.addEventListener('click', () => {
                removeTag(tag);
            });
            span.appendChild(closeSpan);
            tagsWrapper.appendChild(span);
        });
    }

    function addTag(tag) {
        const cleanTag = tag.trim();
        if (cleanTag) {
            // Remove from exclusion if manually added
            excludedGeneratedTags = excludedGeneratedTags.filter(t => t !== cleanTag);
            if (!manualTags.includes(cleanTag) && !generatedTags.includes(cleanTag)) {
                manualTags.push(cleanTag);
            }
            activeTags = [...new Set([...manualTags, ...generatedTags])];
            renderTags();
        }
    }

    function removeTag(tag) {
        if (manualTags.includes(tag)) {
            manualTags = manualTags.filter(t => t !== tag);
        }
        if (generatedTags.includes(tag)) {
            generatedTags = generatedTags.filter(t => t !== tag);
            if (!excludedGeneratedTags.includes(tag)) {
                excludedGeneratedTags.push(tag);
            }
        }
        activeTags = [...new Set([...manualTags, ...generatedTags])];
        renderTags();
    }

    tagInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput.value);
            tagInput.value = '';
        }
    });

    tagInput.addEventListener('blur', () => {
        if (tagInput.value) {
            addTag(tagInput.value);
            tagInput.value = '';
        }
    });

    // --- Matrix Title Generator & Selection Logic ---
    const seniorityCheckboxes = document.querySelectorAll('input[name="seniority"]');
    const departmentCheckboxes = document.querySelectorAll('input[name="department"]');

    function getMatrixTitles(seniority, department) {
        const titles = [];
        if (seniority === 'C-Level') {
            if (department === 'Enterprise B2B') {
                titles.push('Chief Revenue Officer', 'Head of Enterprise B2B');
            } else if (department === 'Channel Sales') {
                titles.push('Chief Commercial Officer', 'Head of Channel Sales');
            } else if (department === 'Partnerships') {
                titles.push('Chief Partnerships Officer', 'Head of Partnerships');
            } else if (department === 'Growth') {
                titles.push('Chief Growth Officer', 'Head of Growth');
            }
        } else if (seniority === 'VP') {
            titles.push(`VP of ${department}`, `Vice President of ${department}`);
        } else if (seniority === 'Director') {
            titles.push(`Director of ${department}`, `${department} Director`);
        } else if (seniority === 'Manager') {
            titles.push(`${department} Manager`, `Manager of ${department}`);
        } else if (seniority === 'Lead') {
            titles.push(`Lead ${department}`, `Head of ${department}`);
        }
        return titles;
    }

    function getSeniorityFallbacks(seniority) {
        if (seniority === 'C-Level') {
            return ['CEO', 'CTO', 'CFO', 'COO', 'Chief Executive Officer'];
        } else if (seniority === 'VP') {
            return ['Vice President', 'VP'];
        } else if (seniority === 'Director') {
            return ['Director'];
        } else if (seniority === 'Manager') {
            return ['Manager'];
        } else if (seniority === 'Lead') {
            return ['Team Lead', 'Lead'];
        }
        return [];
    }

    function getDepartmentFallbacks(department) {
        if (department === 'Enterprise B2B') {
            return ['Enterprise B2B', 'Enterprise Sales', 'B2B Sales'];
        } else if (department === 'Channel Sales') {
            return ['Channel Sales', 'Channel Manager', 'Channel Partner'];
        } else if (department === 'Partnerships') {
            return ['Partnerships', 'Partner Manager', 'Alliances'];
        } else if (department === 'Growth') {
            return ['Growth', 'Growth Hacker', 'Growth Marketing'];
        }
        return [];
    }

    function handleCheckboxChange() {
        const selectedSeniorities = Array.from(seniorityCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
        const selectedDepartments = Array.from(departmentCheckboxes).filter(cb => cb.checked).map(cb => cb.value);

        const newGenerated = [];

        if (selectedSeniorities.length > 0 && selectedDepartments.length > 0) {
            selectedSeniorities.forEach(sen => {
                selectedDepartments.forEach(dept => {
                    const titles = getMatrixTitles(sen, dept);
                    titles.forEach(t => {
                        if (!newGenerated.includes(t)) {
                            newGenerated.push(t);
                        }
                    });
                });
            });
        } else if (selectedSeniorities.length > 0) {
            selectedSeniorities.forEach(sen => {
                const titles = getSeniorityFallbacks(sen);
                titles.forEach(t => {
                    if (!newGenerated.includes(t)) {
                        newGenerated.push(t);
                    }
                });
            });
        } else if (selectedDepartments.length > 0) {
            selectedDepartments.forEach(dept => {
                const titles = getDepartmentFallbacks(dept);
                titles.forEach(t => {
                    if (!newGenerated.includes(t)) {
                        newGenerated.push(t);
                    }
                });
            });
        }

        generatedTags = newGenerated.filter(t => !excludedGeneratedTags.includes(t));
        activeTags = [...new Set([...manualTags, ...generatedTags])];
        renderTags();
    }

    [...seniorityCheckboxes, ...departmentCheckboxes].forEach(cb => {
        cb.addEventListener('change', handleCheckboxChange);
    });

    // --- Location Preset Dropdown Logic ---
    const locationPresetSelect = document.getElementById('location-preset');
    
    locationPresetSelect.addEventListener('change', () => {
        const val = locationPresetSelect.value;
        if (val === 'APAC') {
            locationInput.value = 'Vietnam, Singapore, Australia, Japan, APAC';
        } else if (val === 'Global') {
            locationInput.value = '';
        } else if (val === 'Vietnam') {
            locationInput.value = 'Vietnam';
        } else if (val === 'Singapore') {
            locationInput.value = 'Singapore';
        }
    });

    locationInput.addEventListener('input', () => {
        const val = locationInput.value.trim();
        if (val === 'Vietnam, Singapore, Australia, Japan, APAC') {
            locationPresetSelect.value = 'APAC';
        } else if (val === '') {
            locationPresetSelect.value = 'Global';
        } else if (val === 'Vietnam') {
            locationPresetSelect.value = 'Vietnam';
        } else if (val === 'Singapore') {
            locationPresetSelect.value = 'Singapore';
        } else {
            locationPresetSelect.value = 'Custom';
        }
    });

    // Render initial tags
    renderTags();

    // --- Logger functions ---
    function log(text, type = 'system') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        line.textContent = `[${timestamp}] ${text}`;
        
        consoleLogs.appendChild(line);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }

    function clearLogs() {
        consoleLogs.innerHTML = '';
    }

    // --- UI Control Helpers ---
    function setSearchingState(isSearching, statusText = 'Searching') {
        if (isSearching) {
            searchBtn.disabled = true;
            btnText.textContent = 'Processing...';
            btnLoader.classList.remove('hidden');
            terminalStatus.textContent = statusText;
            terminalStatus.className = 'status-indicator searching';
            progressContainer.classList.remove('hidden');
        } else {
            searchBtn.disabled = false;
            btnText.textContent = 'Find Company PICs';
            btnLoader.classList.add('hidden');
            terminalStatus.textContent = 'Done';
            terminalStatus.className = 'status-indicator done';
        }
    }

    function updateProgressBar(percent, stepName) {
        progressFill.style.width = `${percent}%`;
        progressPercent.textContent = `${percent}%`;
        progressStepName.textContent = stepName;
    }

    // --- Table Rendering ---
    function renderResultsTable(contacts) {
        resultsTbody.innerHTML = '';
        if (contacts.length === 0) {
            resultsTbody.innerHTML = `<tr><td colspan="7" class="text-center">No profiles found matching search filters.</td></tr>`;
            return;
        }

        contacts.forEach((contact, index) => {
            const tr = document.createElement('tr');
            tr.setAttribute('data-index', index);
            
            // Format emails badge
            let emailHtml = '<span class="text-light">Searching...</span>';
            if (contact.enriched) {
                if (contact.emails && contact.emails.length > 0) {
                    const primary = contact.emails[0];
                    let badgeClass = 'scraped';
                    if (contact.verification && contact.verification.status === 'Deliverable') {
                        badgeClass = 'verified';
                    } else if (contact.isGuessed) {
                        badgeClass = 'guessed';
                    }
                    emailHtml = `<span class="status-badge ${badgeClass}">${primary}</span>`;
                    if (contact.emails.length > 1) {
                        emailHtml += ` <span class="confidence-inline">+${contact.emails.length - 1} more</span>`;
                    }
                } else {
                    emailHtml = '<span class="text-muted">Not Found</span>';
                }
            }

            // Format phones list
            let phoneHtml = '<span class="text-light">Searching...</span>';
            if (contact.enriched) {
                if (contact.phones && contact.phones.length > 0) {
                    phoneHtml = contact.phones.map(p => `<code>${p}</code>`).join(', ');
                } else {
                    phoneHtml = '<span class="text-muted">Not Found</span>';
                }
            }

            // Format Verification Status
            let verificationHtml = '<span class="text-light">Pending...</span>';
            if (contact.enriched) {
                if (contact.verification) {
                    let vClass = 'scraped';
                    if (contact.verification.status === 'Deliverable') vClass = 'verified';
                    if (contact.verification.status.includes('Blocked') || contact.verification.status.includes('timeout')) vClass = 'scraped';
                    if (contact.verification.status === 'Undeliverable') vClass = 'undeliverable';
                    
                    verificationHtml = `<span class="status-badge ${vClass}">${contact.verification.status}</span>`;
                } else {
                    verificationHtml = '<span class="status-badge undeliverable">Not Verified</span>';
                }
            }

            tr.innerHTML = `
                <td><strong>${contact.name}</strong></td>
                <td>${contact.title}</td>
                <td>
                    <a href="${contact.linkedin}" target="_blank" class="linkedin-badge-link">
                        🔗 Profile
                    </a>
                </td>
                <td>${emailHtml}</td>
                <td>${phoneHtml}</td>
                <td>${verificationHtml}</td>
                <td>
                    <button class="btn btn-secondary btn-view-detail" style="margin: 0; padding: 6px 12px; font-size: 0.8rem;" data-index="${index}">
                        🔍 View
                    </button>
                </td>
            `;

            // Row click event to show details
            tr.querySelector('.btn-view-detail').addEventListener('click', (e) => {
                e.stopPropagation();
                openDetailsModal(index);
            });

            resultsTbody.appendChild(tr);
        });
    }

    // Filter results table dynamically
    tableSearch.addEventListener('input', () => {
        const query = tableSearch.value.toLowerCase();
        const filtered = searchResults.filter(c => 
            c.name.toLowerCase().includes(query) || 
            c.title.toLowerCase().includes(query) || 
            (c.emails && c.emails.some(e => e.toLowerCase().includes(query)))
        );
        renderResultsTable(filtered);
    });

    // --- Search & Enrichment Pipeline ---
    searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const company = companyNameInput.value.trim();
        const domain = companyDomainInput.value.trim();
        const location = locationInput.value.trim();
        const pages = parseInt(searchPagesSelect.value, 10);
        const apolloApiKey = apolloApiKeyInput.value.trim();
        const searchMethod = searchMethodSelect.value;

        if (apolloApiKey) localStorage.setItem('apollo_api_key', apolloApiKey);
        else localStorage.removeItem('apollo_api_key');
        clearLogs();
        resultsPanel.classList.add('hidden');
        searchResults = [];
        
        log(`Initializing Search & Lead Finder pipeline...`, 'system');
        log(`Target Company: ${company}`, 'system');
        if (domain) log(`Target Domain: ${domain}`, 'system');
        log(`Target Job Titles: ${activeTags.join(', ')}`, 'system');
        if (location) log(`Location filter: ${location}`, 'system');
        log(`Search Depth: ${pages} pages of search engine indexing`, 'system');

        setSearchingState(true, 'Searching');
        updateProgressBar(10, 'Searching LinkedIn profiles on DuckDuckGo...');

        try {
            const seniority = Array.from(document.querySelectorAll('input[name="seniority"]:checked')).map(cb => cb.value);
            const department = Array.from(document.querySelectorAll('input[name="department"]:checked')).map(cb => cb.value);
            const geographic = document.getElementById('location-preset').value;

            // Step 1: Query LinkedIn profiles
            const searchResponse = await fetch('/api/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    company, 
                    domain, 
                    titles: activeTags, 
                    location, 
                    pages, 
                    apolloApiKey,
                    seniority,
                    department,
                    geographic,
                    searchMethod
                })
            });

            if (!searchResponse.ok) {
                let errorMsg = 'Failed to search profiles';
                try {
                    const errData = await searchResponse.json();
                    errorMsg = errData.error || errorMsg;
                } catch (e) {
                    const text = await searchResponse.text();
                    errorMsg = text.trim().substring(0, 150) || `HTTP Error ${searchResponse.status}`;
                }
                throw new Error(errorMsg);
            }

            const searchData = await searchResponse.json();
            const profiles = searchData.results;
            
            log(`Search finished. Found ${profiles.length} LinkedIn profiles.`, 'success');
            
            if (profiles.length === 0) {
                log(`No profiles matched the criteria. Please try broadening your job title filters or company search query.`, 'error');
                setSearchingState(false);
                updateProgressBar(100, 'Done. No profiles found.');
                return;
            }

            // Initialize results state
            searchResults = profiles.map(p => ({
                ...p,
                enriched: false,
                emails: [],
                phones: [],
                verification: null
            }));

            // Display table and panel
            resultsCount.textContent = `Found ${profiles.length} profiles. Starting contact enrichment...`;
            renderResultsTable(searchResults);
            resultsPanel.classList.remove('hidden');

            terminalStatus.textContent = 'Enriching';
            terminalStatus.className = 'status-indicator enriching';

            // Step 2: Sequential Enrichment Queue (to prevent DDG blocking and show real-time updates)
            for (let i = 0; i < searchResults.length; i++) {
                const contact = searchResults[i];
                const percent = Math.round(10 + ((i / searchResults.length) * 85));
                
                updateProgressBar(percent, `Enriching contact ${i + 1}/${searchResults.length}: ${contact.name}`);
                log(`[Enrich ${i+1}/${searchResults.length}] Scrape contact details for ${contact.name} (${contact.title})`, 'enrich');

                try {
                    const enrichResponse = await fetch('/api/enrich', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: contact.name,
                            company: contact.company,
                            domain: domain || null,
                            email: contact.email || null,
                            phone: contact.phone || null
                        })
                    });

                    if (!enrichResponse.ok) {
                        throw new Error('Enrichment call failed');
                    }

                    const enrichedData = await enrichResponse.json();
                    
                    // Update state
                    searchResults[i] = {
                        ...contact,
                        enriched: true,
                        emails: enrichedData.emails,
                        phones: enrichedData.phones,
                        verification: enrichedData.verification,
                        isGuessed: enrichedData.isGuessed,
                        enrichReason: enrichedData.enrichReason,
                        domain: enrichedData.domain
                    };

                    // Log details
                    if (enrichedData.emails.length > 0) {
                        log(`[Enrich] Found Email: ${enrichedData.emails[0]} (${enrichedData.verification.status})`, 'success');
                    }
                    if (enrichedData.phones.length > 0) {
                        log(`[Enrich] Found Phone: ${enrichedData.phones.join(', ')}`, 'success');
                    }
                    if (enrichedData.emails.length === 0 && enrichedData.phones.length === 0) {
                        log(`[Enrich] No public email/phone located for ${contact.name}`, 'system');
                    }

                    // Re-render table row
                    renderResultsTable(searchResults);

                } catch (enrichErr) {
                    log(`[Enrich Error] Failed to enrich details for ${contact.name}: ${enrichErr.message}`, 'error');
                    searchResults[i].enriched = true;
                    searchResults[i].verification = { status: 'Failed', reason: enrichErr.message };
                    renderResultsTable(searchResults);
                }

                // Add small delay to throttle requests and look cool/natural
                if (i < searchResults.length - 1) {
                    await new Promise(r => setTimeout(r, 600));
                }
            }

            // Finished Pipeline
            log(`=======================================================`, 'system');
            log(`[System] Lead finder process completed successfully!`, 'success');
            log(`[System] Processed ${searchResults.length} leads.`, 'success');
            log(`=======================================================`, 'system');

            updateProgressBar(100, 'Done! Lead enrichment complete.');
            setSearchingState(false);
            resultsCount.textContent = `Enriched ${searchResults.length} profiles. Export your B2B leads list below.`;

        } catch (err) {
            log(`[Fatal Error] Pipeline aborted: ${err.message}`, 'error');
            setSearchingState(false);
            updateProgressBar(100, 'Pipeline failed.');
        }
    });

    // --- Modal Logic ---
    function openDetailsModal(index) {
        const contact = searchResults[index];
        if (!contact) return;

        modalPersonName.textContent = contact.name;
        modalPersonTitle.textContent = contact.title;
        modalPersonCompany.textContent = contact.company;
        modalPersonLinkedin.href = contact.linkedin;

        // Render emails
        modalEmailList.innerHTML = '';
        if (contact.emails && contact.emails.length > 0) {
            contact.emails.forEach(email => {
                const item = document.createElement('div');
                item.className = 'contact-item';
                
                let vStatus = 'Guessed format';
                if (contact.verification && contact.verification.status === 'Deliverable') {
                    vStatus = 'SMTP Verified Deliverable';
                } else if (contact.verification) {
                    vStatus = contact.verification.status;
                }

                item.innerHTML = `
                    <span class="contact-value">${email}</span>
                    <span class="status-badge ${contact.verification && contact.verification.status === 'Deliverable' ? 'verified' : (contact.isGuessed ? 'guessed' : 'scraped')}">${vStatus}</span>
                `;
                modalEmailList.appendChild(item);
            });
        } else {
            modalEmailList.innerHTML = '<p class="text-light">No emails discovered for this contact.</p>';
        }

        // Render phones
        modalPhoneList.innerHTML = '';
        if (contact.phones && contact.phones.length > 0) {
            contact.phones.forEach(phone => {
                const item = document.createElement('div');
                item.className = 'contact-item';
                item.innerHTML = `
                    <span class="contact-value">${phone}</span>
                    <span class="status-badge verified">Scraped</span>
                `;
                modalPhoneList.appendChild(item);
            });
        } else {
            modalPhoneList.innerHTML = '<p class="text-light">No phone numbers discovered for this contact.</p>';
        }

        // Render intelligence notes
        if (contact.enrichReason) {
            modalEnrichNotes.innerHTML = `<p>${contact.enrichReason}</p>`;
        } else if (contact.isGuessed) {
            modalEnrichNotes.innerHTML = `<p>Email was generated using standard B2B patterns for <strong>${contact.domain}</strong> based on the person's name details. SMTP socket handshake tests were run to check availability.</p>`;
        } else {
            modalEnrichNotes.innerHTML = `<p>Email was extracted directly from public search engine indexing index snippets for this person's name and company domain query.</p>`;
        }

        // Copy button within modal
        btnModalCopyAll.onclick = () => {
            const emailStr = contact.emails.join(', ') || 'None';
            const phoneStr = contact.phones.join(', ') || 'None';
            const info = `Name: ${contact.name}\nTitle: ${contact.title}\nCompany: ${contact.company}\nLinkedIn: ${contact.linkedin}\nEmails: ${emailStr}\nPhones: ${phoneStr}`;
            navigator.clipboard.writeText(info).then(() => {
                alert('Contact information copied to clipboard!');
            });
        };

        detailModal.classList.remove('hidden');
    }

    modalCloseBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden');
    });

    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
            detailModal.classList.add('hidden');
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !detailModal.classList.contains('hidden')) {
            detailModal.classList.add('hidden');
        }
    });

    // --- Export Actions ---
    btnCopyEmails.addEventListener('click', () => {
        const emails = [];
        searchResults.forEach(c => {
            if (c.emails && c.emails.length > 0) {
                emails.push(c.emails[0]);
            }
        });

        if (emails.length === 0) {
            alert('No emails found in this search result to copy.');
            return;
        }

        const uniqueEmails = [...new Set(emails)].join(', ');
        navigator.clipboard.writeText(uniqueEmails).then(() => {
            alert(`Copied ${emails.length} emails to clipboard!`);
        });
    });

    btnExportCsv.addEventListener('click', () => {
        if (searchResults.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,";
        // Header
        csvContent += "Name,Job Title,Company,LinkedIn URL,Primary Email,All Emails,Phone Numbers,Verification Status,Verification Details\n";

        searchResults.forEach(c => {
            const name = `"${c.name.replace(/"/g, '""')}"`;
            const title = `"${c.title.replace(/"/g, '""')}"`;
            const company = `"${c.company.replace(/"/g, '""')}"`;
            const linkedin = `"${c.linkedin}"`;
            const primaryEmail = c.emails && c.emails.length > 0 ? `"${c.emails[0]}"` : '""';
            const allEmails = c.emails && c.emails.length > 0 ? `"${c.emails.join('; ')}"` : '""';
            const phones = c.phones && c.phones.length > 0 ? `"${c.phones.join('; ')}"` : '""';
            const status = c.verification ? `"${c.verification.status}"` : '"Pending"';
            const reason = c.verification ? `"${c.verification.reason.replace(/"/g, '""')}"` : '""';

            csvContent += `${name},${title},${company},${linkedin},${primaryEmail},${allEmails},${phones},${status},${reason}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        
        const filename = `b2b_leads_${searchResults[0].company.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
    });

    btnExportJson.addEventListener('click', () => {
        if (searchResults.length === 0) return;

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(searchResults, null, 2));
        const link = document.createElement("a");
        link.setAttribute("href", dataStr);
        
        const filename = `b2b_leads_${searchResults[0].company.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        
        link.click();
        document.body.removeChild(link);
    });

    // Expose for testing
    window.renderResultsTable = renderResultsTable;
    Object.defineProperty(window, 'searchResults', {
        get: () => searchResults,
        set: (val) => { searchResults = val; }
    });
});
